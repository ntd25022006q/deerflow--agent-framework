/**
 * DEERFLOW SKILL REGISTRY v1.0
 * Manages and verifies agent skills.
 *
 * This module provides the core data structures and operations for the
 * Deerflow Agent Framework skill system. It handles skill registration,
 * verification, gating, auditing, and proficiency scoring.
 *
 * @module core/skills/skill-registry
 * @version 1.0.0
 */

// ============================================================================
// ENUMERATIONS
// ============================================================================

/**
 * Skill tiers represent increasing levels of complexity and responsibility.
 * Higher tiers require verified proficiency in all lower tiers.
 */
export enum SkillTier {
  FOUNDATION = 1,
  INTERMEDIATE = 2,
  ADVANCED = 3,
  EXPERT = 4,
  MASTER = 5,
}

/**
 * Represents the current verification status of an agent's proficiency
 * in a particular skill.
 */
export enum SkillStatus {
  UNVERIFIED = 'UNVERIFIED',
  LEARNING = 'LEARNING',
  PRACTITIONER = 'PRACTITIONER',
  PROFICIENT = 'PROFICIENT',
  EXPERT = 'EXPERT',
}

/**
 * Minimum proficiency levels required per tier.
 * Higher tiers have lower thresholds due to inherent complexity.
 */
const TIER_MINIMUM_SCORE: Record<SkillTier, number> = {
  [SkillTier.FOUNDATION]: 90,
  [SkillTier.INTERMEDIATE]: 80,
  [SkillTier.ADVANCED]: 70,
  [SkillTier.EXPERT]: 60,
  [SkillTier.MASTER]: 50,
};

/**
 * Human-readable labels for skill tiers.
 */
const TIER_LABELS: Record<SkillTier, string> = {
  [SkillTier.FOUNDATION]: 'Tier 1 — Foundation',
  [SkillTier.INTERMEDIATE]: 'Tier 2 — Intermediate',
  [SkillTier.ADVANCED]: 'Tier 3 — Advanced',
  [SkillTier.EXPERT]: 'Tier 4 — Expert',
  [SkillTier.MASTER]: 'Tier 5 — Master',
};

/**
 * Validity period in days for each verification method.
 */
const VERIFICATION_VALIDITY_DAYS: Record<string, number> = {
  automated_test: 14,
  code_review: 30,
  manual_audit: 90,
  architecture_review: 180,
};

// ============================================================================
// INTERFACES
// ============================================================================

/**
 * Represents a single skill with its metadata and verification state.
 */
export interface AgentSkill {
  id: string;
  name: string;
  tier: SkillTier;
  category: string;
  description: string;
  prerequisites: string[];
  verificationCriteria: string[];
  status: SkillStatus;
  lastVerified?: Date;
  verificationScore?: number;
  verificationMethod?: string;
  degradationFlag?: boolean;
  auditCount?: number;
  lastAuditDate?: Date;
}

/**
 * Defines skill requirements for a specific task.
 */
export interface TaskSkillRequirements {
  taskId: string;
  requiredSkills: {
    skillId: string;
    minimumStatus: SkillStatus;
  }[];
  optionalSkills: string[];
  estimatedComplexity: 'low' | 'medium' | 'high' | 'critical';
  riskLevel: 'low' | 'medium' | 'high';
}

/**
 * Result of a skill verification attempt.
 */
export interface VerificationResult {
  skillId: string;
  passed: boolean;
  score: number;
  method: string;
  verifiedAt: Date;
  details: string[];
  recommendations: string[];
}

/**
 * Result of a skill gating check.
 */
export interface GatingResult {
  allowed: boolean;
  missingSkills: string[];
  insufficientSkills: { skillId: string; required: SkillStatus; current: SkillStatus }[];
  warnings: string[];
}

/**
 * Represents an audit record for skill re-verification.
 */
export interface SkillAudit {
  auditId: string;
  skillId: string;
  auditedAt: Date;
  result: 'pass' | 'fail';
  score: number;
  notes: string[];
}

/**
 * Learning path recommendation for an agent.
 */
export interface LearningPath {
  currentFocus: { skillId: string; reason: string }[];
  nextSteps: { skillId: string; reason: string }[];
  strengths: { skillId: string; mentoringOpportunities: string[] }[];
  gaps: { skillId: string; demand: 'high' | 'medium' | 'low' }[];
}

// ============================================================================
// SKILL STATUS COMPARISON
// ============================================================================

/**
 * Returns the numeric weight of a skill status for comparison purposes.
 * Higher numbers indicate greater proficiency.
 */
export function statusWeight(status: SkillStatus): number {
  const weights: Record<SkillStatus, number> = {
    [SkillStatus.UNVERIFIED]: 0,
    [SkillStatus.LEARNING]: 1,
    [SkillStatus.PRACTITIONER]: 2,
    [SkillStatus.PROFICIENT]: 3,
    [SkillStatus.EXPERT]: 4,
  };
  return weights[status];
}

/**
 * Checks whether a given status meets or exceeds the minimum requirement.
 */
export function meetsMinimumStatus(
  current: SkillStatus,
  minimum: SkillStatus,
): boolean {
  return statusWeight(current) >= statusWeight(minimum);
}

// ============================================================================
// SKILL REGISTRY CLASS
// ============================================================================

/**
 * Central registry for managing and verifying agent skills.
 * Provides methods for registration, verification, gating, auditing,
 * proficiency scoring, and learning path generation.
 */
export class SkillRegistry {
  private skills: Map<string, AgentSkill> = new Map();
  private audits: Map<string, SkillAudit[]> = new Map();

  // -----------------------------------------------------------------------
  // REGISTRATION
  // -----------------------------------------------------------------------

  /**
   * Registers a new skill or updates an existing one.
   * Prerequisites are validated to prevent circular dependencies.
   */
  registerSkill(skill: AgentSkill): void {
    // Validate tier is a valid enum value
    if (!Object.values(SkillTier).includes(skill.tier)) {
      throw new Error(`Invalid skill tier: ${skill.tier}`);
    }

    // Validate status is a valid enum value
    if (!Object.values(SkillStatus).includes(skill.status)) {
      throw new Error(`Invalid skill status: ${skill.status}`);
    }

    // Check for circular prerequisites
    if (this.hasCircularPrerequisite(skill.id, skill.prerequisites)) {
      throw new Error(
        `Circular prerequisite detected for skill ${skill.id}: ${skill.prerequisites.join(', ')}`,
      );
    }

    // Validate that all prerequisites are already registered or being registered
    for (const prereqId of skill.prerequisites) {
      if (!this.skills.has(prereqId) && prereqId !== skill.id) {
        throw new Error(
          `Prerequisite skill ${prereqId} is not registered. Register prerequisites before dependents.`,
        );
      }
    }

    this.skills.set(skill.id, { ...skill });
  }

  /**
   * Registers multiple skills at once, handling dependency ordering.
   * Skills are registered in topological order to satisfy prerequisite constraints.
   */
  registerSkills(skills: AgentSkill[]): void {
    const skillMap = new Map(skills.map((s) => [s.id, s]));
    const registered = new Set<string>();

    const registerRecursive = (skillId: string): void => {
      if (registered.has(skillId) || !skillMap.has(skillId)) return;

      const skill = skillMap.get(skillId)!;
      for (const prereq of skill.prerequisites) {
        if (skillMap.has(prereq)) {
          registerRecursive(prereq);
        }
      }

      this.registerSkill(skill);
      registered.add(skillId);
    };

    for (const skill of skills) {
      registerRecursive(skill.id);
    }
  }

  /**
   * Removes a skill from the registry.
   * Cannot remove skills that are prerequisites for other skills.
   */
  removeSkill(skillId: string): boolean {
    const skill = this.skills.get(skillId);
    if (!skill) return false;

    // Check if any other skill depends on this one
    for (const [id, other] of this.skills) {
      if (id !== skillId && other.prerequisites.includes(skillId)) {
        throw new Error(
          `Cannot remove skill ${skillId}: it is a prerequisite for ${id}`,
        );
      }
    }

    this.skills.delete(skillId);
    this.audits.delete(skillId);
    return true;
  }

  // -----------------------------------------------------------------------
  // QUERIES
  // -----------------------------------------------------------------------

  /** Retrieves a skill by ID. Returns undefined if not found. */
  getSkill(skillId: string): AgentSkill | undefined {
    return this.skills.get(skillId);
  }

  /** Returns all registered skills. */
  getAllSkills(): AgentSkill[] {
    return Array.from(this.skills.values());
  }

  /** Returns all skills at a given tier. */
  getSkillsByTier(tier: SkillTier): AgentSkill[] {
    return this.getAllSkills().filter((s) => s.tier === tier);
  }

  /** Returns all skills in a given category. */
  getSkillsByCategory(category: string): AgentSkill[] {
    return this.getAllSkills().filter((s) => s.category === category);
  }

  /** Returns all skills with a specific status. */
  getSkillsByStatus(status: SkillStatus): AgentSkill[] {
    return this.getAllSkills().filter((s) => s.status === status);
  }

  /** Returns the total number of registered skills. */
  get skillCount(): number {
    return this.skills.size;
  }

  // -----------------------------------------------------------------------
  // VERIFICATION
  // -----------------------------------------------------------------------

  /**
   * Verifies an agent's proficiency in a skill.
   * Updates the skill status based on the verification score.
   */
  verifySkill(
    skillId: string,
    score: number,
    method: string,
    details: string[] = [],
  ): VerificationResult {
    const skill = this.skills.get(skillId);
    if (!skill) {
      throw new Error(`Skill ${skillId} not found in registry`);
    }

    const minScore = TIER_MINIMUM_SCORE[skill.tier];
    const passed = score >= minScore;
    const verifiedAt = new Date();

    // Determine new status based on score
    let newStatus: SkillStatus;
    if (score >= 90) {
      newStatus = SkillStatus.EXPERT;
    } else if (score >= 75) {
      newStatus = SkillStatus.PROFICIENT;
    } else if (score >= 60) {
      newStatus = SkillStatus.PRACTITIONER;
    } else if (score >= 40) {
      newStatus = SkillStatus.LEARNING;
    } else {
      newStatus = SkillStatus.UNVERIFIED;
    }

    // Update skill
    const updatedSkill: AgentSkill = {
      ...skill,
      status: passed ? newStatus : SkillStatus.LEARNING,
      lastVerified: verifiedAt,
      verificationScore: score,
      verificationMethod: method,
      degradationFlag: false,
    };
    this.skills.set(skillId, updatedSkill);

    // Generate recommendations
    const recommendations: string[] = [];
    if (!passed) {
      recommendations.push(
        `Score ${score} is below the minimum ${minScore} for ${TIER_LABELS[skill.tier]}`,
      );
      recommendations.push(
        'Review the verification criteria and focus on weak areas',
      );
      if (skill.prerequisites.length > 0) {
        recommendations.push(
          `Ensure prerequisite skills are proficient: ${skill.prerequisites.join(', ')}`,
        );
      }
    } else if (score < 80) {
      recommendations.push(
        'Consider additional practice to strengthen this skill',
      );
    }

    return {
      skillId,
      passed,
      score,
      method,
      verifiedAt,
      details,
      recommendations,
    };
  }

  /**
   * Checks if a skill verification is still valid based on the method used
   * and the time elapsed since verification.
   */
  isVerificationValid(skillId: string): boolean {
    const skill = this.skills.get(skillId);
    if (!skill || !skill.lastVerified || !skill.verificationMethod) {
      return false;
    }

    const validityDays =
      VERIFICATION_VALIDITY_DAYS[skill.verificationMethod] ?? 30;
    const elapsedMs = Date.now() - skill.lastVerified.getTime();
    const elapsedDays = elapsedMs / (1000 * 60 * 60 * 24);

    return elapsedDays <= validityDays;
  }

  // -----------------------------------------------------------------------
  // SKILL GATING
  // -----------------------------------------------------------------------

  /**
   * Checks whether an agent meets all required skills for a given task.
   * Returns a GatingResult with pass/fail status and detailed information.
   */
  checkGating(requirements: TaskSkillRequirements): GatingResult {
    const missingSkills: string[] = [];
    const insufficientSkills: {
      skillId: string;
      required: SkillStatus;
      current: SkillStatus;
    }[] = [];
    const warnings: string[] = [];

    // Check required skills
    for (const req of requirements.requiredSkills) {
      const skill = this.skills.get(req.skillId);

      if (!skill) {
        missingSkills.push(req.skillId);
        continue;
      }

      if (!meetsMinimumStatus(skill.status, req.minimumStatus)) {
        insufficientSkills.push({
          skillId: req.skillId,
          required: req.minimumStatus,
          current: skill.status,
        });
      }

      // Check verification validity
      if (!this.isVerificationValid(req.skillId)) {
        warnings.push(
          `Skill ${req.skillId} verification has expired and should be renewed`,
        );
      }

      // Check degradation flag
      if (skill.degradationFlag) {
        warnings.push(
          `Skill ${req.skillId} has been flagged for degradation`,
        );
      }
    }

    // Check tier gates for high-complexity/risk tasks
    if (
      requirements.estimatedComplexity === 'high' ||
      requirements.estimatedComplexity === 'critical'
    ) {
      const hasAdvancedSkill = this.getAllSkills().some(
        (s) => s.tier >= SkillTier.ADVANCED && s.status !== SkillStatus.UNVERIFIED,
      );
      if (!hasAdvancedSkill) {
        warnings.push(
          'High-complexity tasks require at least one verified Tier 3+ skill',
        );
      }
    }

    if (requirements.riskLevel === 'high') {
      const hasExpertSkill = this.getAllSkills().some(
        (s) => s.tier >= SkillTier.EXPERT && s.status !== SkillStatus.UNVERIFIED,
      );
      if (!hasExpertSkill) {
        warnings.push(
          'High-risk tasks require at least one verified Tier 4+ skill',
        );
      }
    }

    // Check optional skills and generate awareness warnings
    for (const optId of requirements.optionalSkills) {
      const skill = this.skills.get(optId);
      if (!skill || skill.status === SkillStatus.UNVERIFIED) {
        warnings.push(
          `Optional skill ${optId} is not verified — extra care is recommended`,
        );
      }
    }

    return {
      allowed: missingSkills.length === 0 && insufficientSkills.length === 0,
      missingSkills,
      insufficientSkills,
      warnings,
    };
  }

  // -----------------------------------------------------------------------
  // AUDIT SYSTEM
  // -----------------------------------------------------------------------

  /**
   * Records an audit for a skill. Audits are independent of verification
   * and serve as ongoing quality checks.
   */
  recordAudit(audit: SkillAudit): void {
    const existing = this.audits.get(audit.skillId) ?? [];
    existing.push(audit);
    this.audits.set(audit.skillId, existing);

    // Update audit count on the skill
    const skill = this.skills.get(audit.skillId);
    if (skill) {
      skill.auditCount = existing.length;
      skill.lastAuditDate = audit.auditedAt;

      // If audit failed, flag for degradation
      if (audit.result === 'fail') {
        skill.degradationFlag = true;
      }
    }
  }

  /**
   * Performs a random audit by selecting skills to re-verify.
   * Returns the selected skill IDs and suggested verification methods.
   */
  performRandomAudit(
    auditRate: number = 0.05,
  ): { skillId: string; suggestedMethod: string }[] {
    const allSkills = this.getAllSkills().filter(
      (s) => s.status !== SkillStatus.UNVERIFIED,
    );
    const sampleSize = Math.max(1, Math.floor(allSkills.length * auditRate));
    const selected: { skillId: string; suggestedMethod: string }[] = [];

    // Shuffle and pick
    const shuffled = [...allSkills].sort(() => Math.random() - 0.5);
    for (let i = 0; i < sampleSize && i < shuffled.length; i++) {
      const skill = shuffled[i];
      const method = skill.tier <= SkillTier.INTERMEDIATE
        ? 'automated_test'
        : 'code_review';
      selected.push({ skillId: skill.id, suggestedMethod: method });
    }

    return selected;
  }

  /** Returns all audit records for a specific skill. */
  getAudits(skillId: string): SkillAudit[] {
    return this.audits.get(skillId) ?? [];
  }

  // -----------------------------------------------------------------------
  // PROFICIENCY SCORING
  // -----------------------------------------------------------------------

  /**
   * Calculates an overall proficiency score for the agent across all skills.
   * The score is a weighted average based on tier importance.
   */
  calculateOverallProficiency(): number {
    const tierWeights: Record<SkillTier, number> = {
      [SkillTier.FOUNDATION]: 1.0,
      [SkillTier.INTERMEDIATE]: 1.2,
      [SkillTier.ADVANCED]: 1.5,
      [SkillTier.EXPERT]: 2.0,
      [SkillTier.MASTER]: 2.5,
    };

    const allSkills = this.getAllSkills();
    if (allSkills.length === 0) return 0;

    let totalWeightedScore = 0;
    let totalWeight = 0;

    for (const skill of allSkills) {
      const weight = tierWeights[skill.tier];
      const score = skill.verificationScore ?? 0;
      totalWeightedScore += score * weight;
      totalWeight += weight;
    }

    return totalWeight > 0 ? Math.round((totalWeightedScore / totalWeight) * 100) / 100 : 0;
  }

  /**
   * Calculates the proficiency score for a specific tier.
   * Returns the average verification score of all skills in the tier.
   */
  calculateTierProficiency(tier: SkillTier): number {
    const tierSkills = this.getSkillsByTier(tier);
    if (tierSkills.length === 0) return 0;

    const totalScore = tierSkills.reduce(
      (sum, s) => sum + (s.verificationScore ?? 0),
      0,
    );
    return Math.round((totalScore / tierSkills.length) * 100) / 100;
  }

  /**
   * Returns a summary of the agent's current proficiency across all tiers.
   */
  getProficiencyReport(): {
    overall: number;
    byTier: Record<SkillTier, number>;
    skillCount: number;
    verifiedCount: number;
    degradedCount: number;
  } {
    const allSkills = this.getAllSkills();
    return {
      overall: this.calculateOverallProficiency(),
      byTier: {
        [SkillTier.FOUNDATION]: this.calculateTierProficiency(SkillTier.FOUNDATION),
        [SkillTier.INTERMEDIATE]: this.calculateTierProficiency(SkillTier.INTERMEDIATE),
        [SkillTier.ADVANCED]: this.calculateTierProficiency(SkillTier.ADVANCED),
        [SkillTier.EXPERT]: this.calculateTierProficiency(SkillTier.EXPERT),
        [SkillTier.MASTER]: this.calculateTierProficiency(SkillTier.MASTER),
      },
      skillCount: allSkills.length,
      verifiedCount: allSkills.filter((s) => s.status !== SkillStatus.UNVERIFIED).length,
      degradedCount: allSkills.filter((s) => s.degradationFlag).length,
    };
  }

  // -----------------------------------------------------------------------
  // DEGRADATION DETECTION
  // -----------------------------------------------------------------------

  /**
   * Scans all skills and flags those that may have degraded.
   * A skill is flagged if:
   *   - It has not been verified in 90+ days
   *   - It has a recent failed audit
   *   - Its verification method has expired
   */
  detectDegradation(): { skillId: string; reason: string }[] {
    const degraded: { skillId: string; reason: string }[] = [];
    const now = Date.now();

    for (const [id, skill] of this.skills) {
      // Check time since last verification
      if (skill.lastVerified) {
        const daysSince = (now - skill.lastVerified.getTime()) / (1000 * 60 * 60 * 24);
        if (daysSince > 90) {
          degraded.push({
            skillId: id,
            reason: `Not verified in ${Math.round(daysSince)} days (threshold: 90)`,
          });
        }
      }

      // Check for failed audits
      const skillAudits = this.audits.get(id) ?? [];
      const recentFails = skillAudits.filter(
        (a) => a.result === 'fail' && (now - a.auditedAt.getTime()) < 30 * 24 * 60 * 60 * 1000,
      );
      if (recentFails.length > 0) {
        degraded.push({
          skillId: id,
          reason: `${recentFails.length} failed audit(s) in the last 30 days`,
        });
      }

      // Check verification validity
      if (!this.isVerificationValid(id) && skill.status !== SkillStatus.UNVERIFIED) {
        degraded.push({
          skillId: id,
          reason: `Verification via ${skill.verificationMethod} has expired`,
        });
      }
    }

    return degraded;
  }

  // -----------------------------------------------------------------------
  // LEARNING PATH GENERATION
  // -----------------------------------------------------------------------

  /**
   * Generates a personalized learning path based on the agent's current
   * skill status and the given demand map.
   */
  generateLearningPath(
    demand: Record<string, 'high' | 'medium' | 'low'>,
  ): LearningPath {
    const currentFocus: { skillId: string; reason: string }[] = [];
    const nextSteps: { skillId: string; reason: string }[] = [];
    const strengths: { skillId: string; mentoringOpportunities: string[] }[] = [];
    const gaps: { skillId: string; demand: 'high' | 'medium' | 'low' }[] = [];

    for (const [id, skill] of this.skills) {
      const demandLevel = demand[id] ?? 'medium';

      if (skill.status === SkillStatus.UNVERIFIED) {
        if (demandLevel === 'high') {
          currentFocus.push({
            skillId: id,
            reason: `Unverified skill with high demand`,
          });
        } else {
          nextSteps.push({
            skillId: id,
            reason: `Unverified skill with ${demandLevel} demand`,
          });
        }
      } else if (
        skill.status === SkillStatus.LEARNING ||
        skill.degradationFlag
      ) {
        currentFocus.push({
          skillId: id,
          reason: skill.degradationFlag
            ? `Degraded skill needs re-verification`
            : `Currently in learning status`,
        });
      } else if (skill.status === SkillStatus.EXPERT && skill.verificationScore && skill.verificationScore >= 85) {
        // Find skills that list this as a prerequisite
        const mentoringOpps = this.getAllSkills()
          .filter((s) => s.prerequisites.includes(id) && s.status !== SkillStatus.EXPERT)
          .map((s) => s.id);
        if (mentoringOpps.length > 0) {
          strengths.push({
            skillId: id,
            mentoringOpportunities: mentoringOpps,
          });
        }
      }

      // High-demand gaps
      if (
        demandLevel === 'high' &&
        (skill.status === SkillStatus.UNVERIFIED ||
          skill.status === SkillStatus.LEARNING)
      ) {
        gaps.push({ skillId: id, demand: demandLevel });
      }
    }

    // Sort currentFocus by tier (lower tiers first — foundation first)
    currentFocus.sort((a, b) => {
      const tierA = this.skills.get(a.skillId)?.tier ?? 5;
      const tierB = this.skills.get(b.skillId)?.tier ?? 5;
      return tierA - tierB;
    });

    return { currentFocus, nextSteps, strengths, gaps };
  }

  // -----------------------------------------------------------------------
  // PRIVATE HELPERS
  // -----------------------------------------------------------------------

  /**
   * Detects circular prerequisite dependencies using DFS.
   */
  private hasCircularPrerequisite(
    skillId: string,
    prerequisites: string[],
    visited: Set<string> = new Set(),
  ): boolean {
    if (visited.has(skillId)) return true;
    visited.add(skillId);

    for (const prereq of prerequisites) {
      const prereqSkill = this.skills.get(prereq);
      if (prereqSkill) {
        if (
          this.hasCircularPrerequisite(prereq, prereqSkill.prerequisites, new Set(visited))
        ) {
          return true;
        }
      }
    }

    return false;
  }
}

// ============================================================================
// BUILT-IN SKILL DEFINITIONS
// ============================================================================

/**
 * Pre-defined foundation skills (Tier 1) that are required for all agents.
 * These can be registered directly into a new SkillRegistry instance.
 */
export const FOUNDATION_SKILLS: AgentSkill[] = [
  {
    id: 'SK-001',
    name: 'File System Safety',
    tier: SkillTier.FOUNDATION,
    category: 'Operations Safety',
    description: 'Safe file operations with confirmation, backup, and scope enforcement',
    prerequisites: [],
    verificationCriteria: [
      'Zero unconfirmed deletions in a 50-operation sample',
      'Zero writes to non-existent directories without prior creation',
      '100% backup compliance on critical file modifications',
      'Zero project scope violations in a 50-operation sample',
      'All file writes pass post-write verification',
    ],
    status: SkillStatus.UNVERIFIED,
  },
  {
    id: 'SK-002',
    name: 'Dependency Management',
    tier: SkillTier.FOUNDATION,
    category: 'Project Integrity',
    description: 'Compatibility checking, version locking, security auditing, and conflict detection',
    prerequisites: [],
    verificationCriteria: [
      'Zero incompatible installations in a 20-install sample',
      'Lock files always consistent with package.json',
      'Security audit run after every install with documented results',
      'Every dependency addition includes justification documentation',
      'Zero unresolved version conflicts at project build time',
    ],
    status: SkillStatus.UNVERIFIED,
  },
  {
    id: 'SK-003',
    name: 'Error Prevention',
    tier: SkillTier.FOUNDATION,
    category: 'Code Quality',
    description: 'Input validation, strict typing, error boundaries, and proper error handling',
    prerequisites: [],
    verificationCriteria: [
      'Zero unvalidated external inputs in a 50-function sample',
      'Zero any type usage in non-test code',
      'Error boundaries present at all isolation points',
      'Zero empty catch blocks in the entire codebase',
      'Result/option pattern used for all expected failure modes',
    ],
    status: SkillStatus.UNVERIFIED,
  },
  {
    id: 'SK-004',
    name: 'Code Verification',
    tier: SkillTier.FOUNDATION,
    category: 'Build Integrity',
    description: 'Compile checks, linting, testing cadence, and import validation',
    prerequisites: ['SK-001', 'SK-002'],
    verificationCriteria: [
      'Compilation check passed after 100% of changes',
      'Lint check passed after 100% of changes',
      'Tests run at minimum every 5 changes with documented results',
      'Zero unresolved import errors in the codebase',
      'TypeScript strict mode enabled with zero errors',
    ],
    status: SkillStatus.UNVERIFIED,
  },
];

/**
 * Creates a new SkillRegistry pre-loaded with all foundation skills.
 */
export function createDefaultRegistry(): SkillRegistry {
  const registry = new SkillRegistry();
  registry.registerSkills(FOUNDATION_SKILLS);
  return registry;
}
