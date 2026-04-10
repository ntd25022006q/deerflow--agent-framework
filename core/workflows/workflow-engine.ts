/**
 * DEERFLOW WORKFLOW ENGINE v1.0
 * =============================================================================
 *
 * This file defines the workflow state machine that AI agents MUST follow.
 * Agents MUST NOT skip phases or operate out of order.
 *
 * Usage:
 *   Import this file and follow the phase transitions strictly.
 *   Every phase transition must pass through a quality gate.
 *
 * Architecture:
 *   - WorkflowPhase: Enum defining all 8 phases (Phase 0 through Phase 7)
 *   - PhaseStatus: Current status of a phase (pending, in-progress, passed, failed)
 *   - QualityGate: Gate between phases with pass/fail criteria
 *   - WorkflowEngine: State machine managing phase transitions
 *   - TaskManager: Manages implementation tasks and their dependencies
 *   - ComplexityScorer: Scores task complexity to determine approach
 *
 * Compliance: IEEE 830, ISO/IEC 25010, Clean Code Principles
 * =============================================================================
 */

// =============================================================================
// ENUMS
// =============================================================================

/**
 * The 8 workflow phases that agents MUST follow in strict order.
 * Each phase has specific entry criteria, activities, and exit criteria.
 */
export enum WorkflowPhase {
  CONTEXT_ACQUISITION = 'PHASE_0_CONTEXT',
  REQUIREMENT_ANALYSIS = 'PHASE_1_REQUIREMENTS',
  ARCHITECTURE_DESIGN = 'PHASE_2_ARCHITECTURE',
  IMPLEMENTATION_PLANNING = 'PHASE_3_PLANNING',
  CODE_IMPLEMENTATION = 'PHASE_4_IMPLEMENTATION',
  VERIFICATION_TESTING = 'PHASE_5_VERIFICATION',
  INTEGRATION_CHECK = 'PHASE_6_INTEGRATION',
  DOCUMENTATION = 'PHASE_7_DOCUMENTATION',
}

/**
 * The status of a workflow phase or quality gate.
 */
export enum PhaseStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  PASSED_GATE = 'PASSED',
  FAILED_GATE = 'FAILED',
  ROLLED_BACK = 'ROLLED_BACK',
}

/**
 * Severity levels for quality gate criteria.
 */
export type GateSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM';

/**
 * Complexity levels for task scoring.
 */
export type ComplexityLevel = 'TRIVIAL' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

// =============================================================================
// INTERFACES
// =============================================================================

/**
 * A single criterion within a quality gate.
 */
export interface GateCriterion {
  /** Unique identifier (e.g., "G01-001") */
  id: string;
  /** Human-readable description of what must be verified */
  description: string;
  /** Severity level — CRITICAL failures always block progression */
  severity: GateSeverity;
  /** Synchronous check function — returns true if the criterion passes */
  check: () => boolean;
  /** Optional explanation when the check fails */
  failureMessage?: string;
}

/**
 * A quality gate between two workflow phases.
 * All CRITICAL criteria must pass for the gate to open.
 */
export interface QualityGate {
  /** The phase this gate guards (transition INTO this phase) */
  phase: WorkflowPhase;
  /** The phase this gate originates from (transition FROM this phase) */
  fromPhase: WorkflowPhase;
  /** Individual criteria that must be checked */
  criteria: GateCriterion[];
  /** Current status of this gate */
  status: PhaseStatus;
  /** Whether progression is blocked */
  blocked: boolean;
  /** If blocked, the reason for the blockage */
  failureReasons: string[];
  /** Timestamp when the gate was last evaluated */
  evaluatedAt?: Date;
}

/**
 * A single implementation task within Phase 4.
 */
export interface ImplementationTask {
  /** Unique task identifier (e.g., "TASK-001") */
  id: string;
  /** Human-readable task title */
  title: string;
  /** Detailed description of what this task accomplishes */
  description: string;
  /** Task type */
  type: 'CREATE' | 'MODIFY' | 'DELETE' | 'CONFIG' | 'TEST' | 'DOC';
  /** Files affected by this task */
  files: string[];
  /** Task IDs that must complete before this task can start */
  dependencies: string[];
  /** Estimated complexity level */
  complexity: ComplexityLevel;
  /** Verification criteria specific to this task */
  verificationCriteria: string[];
  /** Current status */
  status: PhaseStatus;
  /** Known risks associated with this task */
  risks: string[];
  /** How to undo this task if something goes wrong */
  rollbackStrategy: string;
}

/**
 * A formal requirement (functional or non-functional).
 */
export interface Requirement {
  /** Unique identifier (e.g., "FR-001" or "NFR-001") */
  id: string;
  /** Requirement title */
  title: string;
  /** Detailed description */
  description: string;
  /** MoSCoW priority */
  priority: 'MUST' | 'SHOULD' | 'COULD' | 'WONT';
  /** How this requirement will be verified */
  verificationMethod: string;
  /** Associated acceptance criteria */
  acceptanceCriteria: string[];
}

/**
 * An architecture decision record.
 */
export interface ArchitectureDecision {
  /** Unique identifier */
  id: string;
  /** Short title of the decision */
  title: string;
  /** What problem does this decision address */
  context: string;
  /** What alternatives were considered */
  alternatives: string[];
  /** What was decided */
  decision: string;
  /** Why this decision was made */
  rationale: string;
  /** What are the consequences of this decision */
  consequences: string[];
}

/**
 * A verification report produced at the end of Phase 5.
 */
export interface VerificationReport {
  /** Whether the overall verification passed */
  passed: boolean;
  /** TypeScript compilation result */
  typescriptCompilation: CheckResult;
  /** ESLint result */
  lintResult: CheckResult;
  /** Test suite result */
  testResult: CheckResult;
  /** Circular dependency check */
  circularDependencyCheck: CheckResult;
  /** Security audit result */
  securityAudit: CheckResult;
  /** Bundle size analysis (if applicable) */
  bundleSizeAnalysis?: CheckResult;
  /** Timestamp of the report */
  timestamp: Date;
}

/**
 * Result of a single verification check.
 */
export interface CheckResult {
  /** Whether the check passed */
  passed: boolean;
  /** Human-readable summary */
  summary: string;
  /** Detailed output or error messages */
  details: string;
  /** Duration of the check in milliseconds */
  durationMs: number;
}

/**
 * A checkpoint created before each phase for rollback purposes.
 */
export interface PhaseCheckpoint {
  /** The phase that was about to start */
  phase: WorkflowPhase;
  /** Git commit hash or stash reference */
  gitRef: string;
  /** Description of the checkpoint */
  description: string;
  /** Timestamp when the checkpoint was created */
  createdAt: Date;
}

// =============================================================================
// WORKFLOW ENGINE
// =============================================================================

/**
 * The main workflow engine that manages phase transitions and quality gates.
 *
 * Agents MUST use this engine to track their progress through the workflow.
 * The engine enforces strict phase ordering and quality gate compliance.
 */
export class WorkflowEngine {
  private phases: Map<WorkflowPhase, PhaseStatus>;
  private gates: Map<string, QualityGate>;
  private tasks: Map<string, ImplementationTask>;
  private requirements: Requirement[];
  private architectureDecisions: ArchitectureDecision[];
  private checkpoints: PhaseCheckpoint[];
  private currentPhase: WorkflowPhase;
  private phaseStartTime: Date | null;
  private errors: string[];

  constructor() {
    this.phases = new Map<WorkflowPhase, PhaseStatus>();
    this.gates = new Map<string, QualityGate>();
    this.tasks = new Map<string, ImplementationTask>();
    this.requirements = [];
    this.architectureDecisions = [];
    this.checkpoints = [];
    this.errors = [];
    this.currentPhase = WorkflowPhase.CONTEXT_ACQUISITION;
    this.phaseStartTime = null;

    // Initialize all phases as PENDING
    const allPhases = Object.values(WorkflowPhase);
    for (const phase of allPhases) {
      this.phases.set(phase, PhaseStatus.PENDING);
    }

    // Initialize quality gates
    this.initializeGates();
  }

  // ---------------------------------------------------------------------------
  // PHASE MANAGEMENT
  // ---------------------------------------------------------------------------

  /**
   * Start a workflow phase. The phase must be the current phase or the next
   * sequential phase (after passing the quality gate).
   *
   * @param phase - The phase to start
   * @throws Error if the phase transition is invalid
   */
  startPhase(phase: WorkflowPhase): void {
    const phaseOrder = this.getPhaseOrder();
    const currentIndex = phaseOrder.indexOf(this.currentPhase);
    const targetIndex = phaseOrder.indexOf(phase);

    if (targetIndex < currentIndex) {
      throw new WorkflowError(
        `Cannot go backwards from ${this.currentPhase} to ${phase}. ` +
        `Use rollback() if you need to revert.`
      );
    }

    if (targetIndex > currentIndex + 1) {
      throw new WorkflowError(
        `Cannot skip phases. Current: ${this.currentPhase}, ` +
        `Target: ${phase}. Must pass through ${phaseOrder[currentIndex + 1]} first.`
      );
    }

    // If advancing to the next phase, the quality gate must pass first
    if (targetIndex === currentIndex + 1) {
      const gate = this.getGateForPhase(phase);
      if (gate.status !== PhaseStatus.PASSED_GATE) {
        throw new WorkflowError(
          `Quality gate for ${phase} has not passed. ` +
          `Evaluate the gate first using evaluateGate("${phase}"). ` +
          `Failure reasons: ${gate.failureReasons.join('; ')}`
        );
      }
    }

    this.currentPhase = phase;
    this.phases.set(phase, PhaseStatus.IN_PROGRESS);
    this.phaseStartTime = new Date();
  }

  /**
   * Complete the current phase and mark it as PASSED.
   */
  completePhase(): void {
    this.phases.set(this.currentPhase, PhaseStatus.PASSED_GATE);
    this.phaseStartTime = null;
  }

  /**
   * Get the current active phase.
   */
  getCurrentPhase(): WorkflowPhase {
    return this.currentPhase;
  }

  /**
   * Get the status of a specific phase.
   */
  getPhaseStatus(phase: WorkflowPhase): PhaseStatus {
    return this.phases.get(phase) ?? PhaseStatus.PENDING;
  }

  /**
   * Get an overview of all phase statuses.
   */
  getPhaseOverview(): Array<{ phase: WorkflowPhase; status: PhaseStatus }> {
    const order = this.getPhaseOrder();
    return order.map((phase) => ({
      phase,
      status: this.phases.get(phase) ?? PhaseStatus.PENDING,
    }));
  }

  // ---------------------------------------------------------------------------
  // QUALITY GATE MANAGEMENT
  // ---------------------------------------------------------------------------

  /**
   * Evaluate a quality gate. All CRITICAL criteria must pass for the gate to open.
   *
   * @param targetPhase - The phase whose gate to evaluate
   * @returns The updated QualityGate with evaluation results
   */
  evaluateGate(targetPhase: WorkflowPhase): QualityGate {
    const gate = this.getGateForPhase(targetPhase);
    gate.evaluatedAt = new Date();
    gate.failureReasons = [];

    for (const criterion of gate.criteria) {
      try {
        const passed = criterion.check();
        if (!passed) {
          const message = criterion.failureMessage ?? 
            `${criterion.id} FAILED: ${criterion.description}`;
          gate.failureReasons.push(message);

          if (criterion.severity === 'CRITICAL') {
            gate.status = PhaseStatus.FAILED_GATE;
            gate.blocked = true;
          }
        }
      } catch (error) {
        const errorMsg = `${criterion.id} ERROR: Check threw an exception — ` +
          `${error instanceof Error ? error.message : String(error)}`;
        gate.failureReasons.push(errorMsg);
        gate.status = PhaseStatus.FAILED_GATE;
        gate.blocked = true;
      }
    }

    // If no CRITICAL failures, the gate passes
    if (gate.status !== PhaseStatus.FAILED_GATE) {
      gate.status = PhaseStatus.PASSED_GATE;
      gate.blocked = false;
    }

    return gate;
  }

  /**
   * Add a custom criterion to a quality gate.
   */
  addCriterion(
    targetPhase: WorkflowPhase,
    criterion: GateCriterion
  ): void {
    const gate = this.getGateForPhase(targetPhase);
    gate.criteria.push(criterion);
  }

  /**
   * Get a quality gate by its target phase.
   */
  getGateForPhase(targetPhase: WorkflowPhase): QualityGate {
    const key = targetPhase;
    const gate = this.gates.get(key);
    if (!gate) {
      throw new WorkflowError(`No quality gate defined for phase: ${targetPhase}`);
    }
    return gate;
  }

  // ---------------------------------------------------------------------------
  // TASK MANAGEMENT
  // ---------------------------------------------------------------------------

  /**
   * Add an implementation task to the task list.
   */
  addTask(task: ImplementationTask): void {
    if (this.tasks.has(task.id)) {
      throw new WorkflowError(`Task ${task.id} already exists`);
    }

    // Validate dependencies exist
    for (const depId of task.dependencies) {
      if (!this.tasks.has(depId) && depId !== task.id) {
        // Dependencies may not be added yet — defer validation
        // Will be validated in validateTaskDependencies()
      }
    }

    this.tasks.set(task.id, task);
  }

  /**
   * Get a task by its ID.
   */
  getTask(taskId: string): ImplementationTask | undefined {
    return this.tasks.get(taskId);
  }

  /**
   * Get all tasks in dependency order (topological sort).
   * Returns tasks that are ready to be executed first.
   */
  getTasksInOrder(): ImplementationTask[] {
    const tasks = Array.from(this.tasks.values());
    const visited = new Set<string>();
    const result: ImplementationTask[] = [];

    const visit = (taskId: string): void => {
      if (visited.has(taskId)) return;
      visited.add(taskId);

      const task = this.tasks.get(taskId);
      if (!task) return;

      // Visit dependencies first
      for (const depId of task.dependencies) {
        visit(depId);
      }

      result.push(task);
    };

    for (const task of tasks) {
      visit(task.id);
    }

    return result;
  }

  /**
   * Get tasks that are ready to execute (all dependencies completed).
   */
  getReadyTasks(): ImplementationTask[] {
    return Array.from(this.tasks.values()).filter((task) => {
      if (task.status !== PhaseStatus.PENDING) return false;

      return task.dependencies.every((depId) => {
        const dep = this.tasks.get(depId);
        return dep?.status === PhaseStatus.PASSED_GATE;
      });
    });
  }

  /**
   * Complete a task by marking it as passed.
   */
  completeTask(taskId: string): void {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new WorkflowError(`Task ${taskId} not found`);
    }

    // Check all dependencies are complete
    for (const depId of task.dependencies) {
      const dep = this.tasks.get(depId);
      if (dep && dep.status !== PhaseStatus.PASSED_GATE) {
        throw new WorkflowError(
          `Cannot complete ${taskId}: dependency ${depId} is not complete`
        );
      }
    }

    task.status = PhaseStatus.PASSED_GATE;
  }

  /**
   * Validate that all task dependencies form a valid DAG (no cycles).
   */
  validateTaskDependencies(): { valid: boolean; cycles: string[][] } {
    const cycles: string[][] = [];
    const visiting = new Set<string>();
    const visited = new Set<string>();
    const path: string[] = [];

    const dfs = (taskId: string): boolean => {
      if (visited.has(taskId)) return false;
      if (visiting.has(taskId)) {
        // Found a cycle — extract it
        const cycleStart = path.indexOf(taskId);
        cycles.push([...path.slice(cycleStart), taskId]);
        return true;
      }

      visiting.add(taskId);
      path.push(taskId);

      const task = this.tasks.get(taskId);
      if (task) {
        for (const depId of task.dependencies) {
          dfs(depId);
        }
      }

      path.pop();
      visiting.delete(taskId);
      visited.add(taskId);
      return false;
    };

    for (const taskId of this.tasks.keys()) {
      dfs(taskId);
    }

    return { valid: cycles.length === 0, cycles };
  }

  // ---------------------------------------------------------------------------
  // REQUIREMENT MANAGEMENT
  // ---------------------------------------------------------------------------

  /**
   * Add a formal requirement.
   */
  addRequirement(requirement: Requirement): void {
    const existing = this.requirements.find((r) => r.id === requirement.id);
    if (existing) {
      throw new WorkflowError(`Requirement ${requirement.id} already exists`);
    }
    this.requirements.push(requirement);
  }

  /**
   * Get all requirements.
   */
  getRequirements(): Requirement[] {
    return [...this.requirements];
  }

  /**
   * Get requirements filtered by type (functional or non-functional).
   */
  getRequirementsByType(type: 'functional' | 'non-functional'): Requirement[] {
    const prefix = type === 'functional' ? 'FR-' : 'NFR-';
    return this.requirements.filter((r) => r.id.startsWith(prefix));
  }

  // ---------------------------------------------------------------------------
  // ARCHITECTURE DECISION MANAGEMENT
  // ---------------------------------------------------------------------------

  /**
   * Add an architecture decision record.
   */
  addArchitectureDecision(decision: ArchitectureDecision): void {
    this.architectureDecisions.push(decision);
  }

  /**
   * Get all architecture decisions.
   */
  getArchitectureDecisions(): ArchitectureDecision[] {
    return [...this.architectureDecisions];
  }

  // ---------------------------------------------------------------------------
  // CHECKPOINT / ROLLBACK
  // ---------------------------------------------------------------------------

  /**
   * Create a checkpoint before starting a phase.
   * This enables rollback to this point if something goes wrong.
   */
  createCheckpoint(gitRef: string, description: string): PhaseCheckpoint {
    const checkpoint: PhaseCheckpoint = {
      phase: this.currentPhase,
      gitRef,
      description,
      createdAt: new Date(),
    };
    this.checkpoints.push(checkpoint);
    return checkpoint;
  }

  /**
   * Get all checkpoints.
   */
  getCheckpoints(): PhaseCheckpoint[] {
    return [...this.checkpoints];
  }

  /**
   * Roll back to a specific checkpoint.
   * This sets all phases after the checkpoint phase back to PENDING
   * and resets the current phase to the checkpoint's phase.
   */
  rollback(checkpointIndex: number): void {
    if (checkpointIndex < 0 || checkpointIndex >= this.checkpoints.length) {
      throw new WorkflowError(
        `Invalid checkpoint index: ${checkpointIndex}. ` +
        `Valid range: 0-${this.checkpoints.length - 1}`
      );
    }

    const checkpoint = this.checkpoints[checkpointIndex];
    const phaseOrder = this.getPhaseOrder();
    const checkpointIndexInOrder = phaseOrder.indexOf(checkpoint.phase);

    // Reset all phases after the checkpoint
    for (let i = checkpointIndexInOrder; i < phaseOrder.length; i++) {
      this.phases.set(phaseOrder[i], PhaseStatus.PENDING);
    }

    // Reset all quality gates after the checkpoint
    for (const [key, gate] of this.gates.entries()) {
      const gateIndexInOrder = phaseOrder.indexOf(gate.phase);
      if (gateIndexInOrder >= checkpointIndexInOrder) {
        gate.status = PhaseStatus.PENDING;
        gate.blocked = false;
        gate.failureReasons = [];
      }
    }

    // Reset all tasks
    for (const task of this.tasks.values()) {
      task.status = PhaseStatus.PENDING;
    }

    // Set current phase
    this.currentPhase = checkpoint.phase;
    this.phaseStartTime = null;

    this.errors.push(
      `Rolled back to checkpoint ${checkpointIndex}: ${checkpoint.description}`
    );
  }

  // ---------------------------------------------------------------------------
  // ERROR TRACKING
  // ---------------------------------------------------------------------------

  /**
   * Record an error that occurred during the workflow.
   */
  recordError(message: string): void {
    this.errors.push(`[${new Date().toISOString()}] ${message}`);
  }

  /**
   * Get all recorded errors.
   */
  getErrors(): string[] {
    return [...this.errors];
  }

  /**
   * Clear all recorded errors.
   */
  clearErrors(): void {
    this.errors = [];
  }

  // ---------------------------------------------------------------------------
  // COMPLEXITY SCORING
  // ---------------------------------------------------------------------------

  /**
   * Score the complexity of a task based on multiple factors.
   * Returns a complexity level and a numeric score (0-100).
   */
  scoreTaskComplexity(task: ImplementationTask): {
    level: ComplexityLevel;
    score: number;
    factors: string[];
  } {
    let score = 0;
    const factors: string[] = [];

    // Factor 1: Number of files affected
    if (task.files.length >= 10) {
      score += 25;
      factors.push(`High file count: ${task.files.length} files`);
    } else if (task.files.length >= 5) {
      score += 15;
      factors.push(`Medium file count: ${task.files.length} files`);
    } else if (task.files.length >= 2) {
      score += 5;
      factors.push(`Low file count: ${task.files.length} files`);
    }

    // Factor 2: Number of dependencies
    if (task.dependencies.length >= 5) {
      score += 20;
      factors.push(`High dependency count: ${task.dependencies.length} dependencies`);
    } else if (task.dependencies.length >= 3) {
      score += 10;
      factors.push(`Medium dependency count: ${task.dependencies.length} dependencies`);
    }

    // Factor 3: Task type
    if (task.type === 'DELETE') {
      score += 15;
      factors.push('Deletion task (higher risk of breaking consumers)');
    } else if (task.type === 'MODIFY') {
      score += 10;
      factors.push('Modification task (risk of regressions)');
    }

    // Factor 4: Risk count
    if (task.risks.length >= 5) {
      score += 20;
      factors.push(`High risk count: ${task.risks.length} identified risks`);
    } else if (task.risks.length >= 3) {
      score += 10;
      factors.push(`Medium risk count: ${task.risks.length} identified risks`);
    }

    // Factor 5: Verification criteria complexity
    if (task.verificationCriteria.length >= 8) {
      score += 10;
      factors.push(`Complex verification: ${task.verificationCriteria.length} criteria`);
    }

    // Clamp score
    score = Math.min(100, Math.max(0, score));

    // Determine complexity level
    let level: ComplexityLevel;
    if (score >= 60) {
      level = 'CRITICAL';
    } else if (score >= 40) {
      level = 'HIGH';
    } else if (score >= 20) {
      level = 'MEDIUM';
    } else if (score >= 5) {
      level = 'LOW';
    } else {
      level = 'TRIVIAL';
    }

    return { level, score, factors };
  }

  // ---------------------------------------------------------------------------
  // VERIFICATION REPORT
  // ---------------------------------------------------------------------------

  /**
   * Generate a verification report for Phase 5.
   * Agents should call this after running all verification commands.
   */
  generateVerificationReport(results: {
    typescriptCompilation?: CheckResult;
    lintResult?: CheckResult;
    testResult?: CheckResult;
    circularDependencyCheck?: CheckResult;
    securityAudit?: CheckResult;
    bundleSizeAnalysis?: CheckResult;
  }): VerificationReport {
    const report: VerificationReport = {
      passed: true,
      timestamp: new Date(),
      typescriptCompilation: results.typescriptCompilation ?? {
        passed: false,
        summary: 'NOT CHECKED',
        details: 'TypeScript compilation was not verified',
        durationMs: 0,
      },
      lintResult: results.lintResult ?? {
        passed: false,
        summary: 'NOT CHECKED',
        details: 'ESLint was not run',
        durationMs: 0,
      },
      testResult: results.testResult ?? {
        passed: false,
        summary: 'NOT CHECKED',
        details: 'Tests were not run',
        durationMs: 0,
      },
      circularDependencyCheck: results.circularDependencyCheck ?? {
        passed: false,
        summary: 'NOT CHECKED',
        details: 'Circular dependency check was not performed',
        durationMs: 0,
      },
      securityAudit: results.securityAudit ?? {
        passed: false,
        summary: 'NOT CHECKED',
        details: 'Security audit was not performed',
        durationMs: 0,
      },
      bundleSizeAnalysis: results.bundleSizeAnalysis,
    };

    // Overall pass requires all mandatory checks to pass
    const mandatoryChecks = [
      report.typescriptCompilation,
      report.lintResult,
      report.testResult,
      report.circularDependencyCheck,
      report.securityAudit,
    ];

    report.passed = mandatoryChecks.every((check) => check.passed);

    return report;
  }

  // ---------------------------------------------------------------------------
  // SERIALIZATION
  // ---------------------------------------------------------------------------

  /**
   * Serialize the workflow engine state to JSON.
   * Useful for persisting state across sessions.
   */
  serialize(): string {
    return JSON.stringify({
      currentPhase: this.currentPhase,
      phases: Object.fromEntries(this.phases),
      tasks: Object.fromEntries(this.tasks),
      requirements: this.requirements,
      architectureDecisions: this.architectureDecisions,
      checkpoints: this.checkpoints,
      errors: this.errors,
    }, null, 2);
  }

  // ---------------------------------------------------------------------------
  // PRIVATE HELPERS
  // ---------------------------------------------------------------------------

  private getPhaseOrder(): WorkflowPhase[] {
    return [
      WorkflowPhase.CONTEXT_ACQUISITION,
      WorkflowPhase.REQUIREMENT_ANALYSIS,
      WorkflowPhase.ARCHITECTURE_DESIGN,
      WorkflowPhase.IMPLEMENTATION_PLANNING,
      WorkflowPhase.CODE_IMPLEMENTATION,
      WorkflowPhase.VERIFICATION_TESTING,
      WorkflowPhase.INTEGRATION_CHECK,
      WorkflowPhase.DOCUMENTATION,
    ];
  }

  private initializeGates(): void {
    const phaseOrder = this.getPhaseOrder();

    // Create a gate for each phase transition (from phase N to phase N+1)
    for (let i = 1; i < phaseOrder.length; i++) {
      const fromPhase = phaseOrder[i - 1];
      const toPhase = phaseOrder[i];

      const gate: QualityGate = {
        phase: toPhase,
        fromPhase: fromPhase,
        criteria: this.getGateCriteriaForPhase(toPhase),
        status: PhaseStatus.PENDING,
        blocked: false,
        failureReasons: [],
      };

      this.gates.set(toPhase, gate);
    }
  }

  private getGateCriteriaForPhase(phase: WorkflowPhase): GateCriterion[] {
    // These are default criteria — agents should add project-specific criteria
    switch (phase) {
      case WorkflowPhase.CONTEXT_ACQUISITION:
        return [];

      case WorkflowPhase.REQUIREMENT_ANALYSIS:
        return [
          {
            id: 'G01-001',
            description: 'Project file tree has been mapped',
            severity: 'CRITICAL',
            check: () => false, // Agent must override
            failureMessage: 'Project structure has not been explored',
          },
          {
            id: 'G01-002',
            description: 'package.json dependencies have been analyzed',
            severity: 'CRITICAL',
            check: () => false, // Agent must override
            failureMessage: 'Dependencies have not been analyzed',
          },
        ];

      case WorkflowPhase.ARCHITECTURE_DESIGN:
        return [
          {
            id: 'G12-001',
            description: 'All functional requirements are specified (FR-NNN)',
            severity: 'CRITICAL',
            check: () => {
              const functionalReqs = this.getRequirementsByType('functional');
              return functionalReqs.length > 0;
            },
            failureMessage: 'No functional requirements have been defined',
          },
          {
            id: 'G12-002',
            description: 'Non-functional requirements are defined (NFR-NNN)',
            severity: 'CRITICAL',
            check: () => {
              const nonFunctionalReqs = this.getRequirementsByType('non-functional');
              return nonFunctionalReqs.length > 0;
            },
            failureMessage: 'No non-functional requirements have been defined',
          },
          {
            id: 'G12-003',
            description: 'Acceptance criteria exist for each functional requirement',
            severity: 'HIGH',
            check: () => {
              const functionalReqs = this.getRequirementsByType('functional');
              return functionalReqs.every(
                (r) => r.acceptanceCriteria && r.acceptanceCriteria.length > 0
              );
            },
            failureMessage: 'Not all functional requirements have acceptance criteria',
          },
        ];

      case WorkflowPhase.IMPLEMENTATION_PLANNING:
        return [
          {
            id: 'G23-001',
            description: 'Component architecture is defined',
            severity: 'CRITICAL',
            check: () => this.architectureDecisions.length > 0,
            failureMessage: 'No architecture decisions have been documented',
          },
          {
            id: 'G23-002',
            description: 'Interfaces and contracts are defined',
            severity: 'CRITICAL',
            check: () => false, // Agent must override
            failureMessage: 'No interfaces have been designed',
          },
        ];

      case WorkflowPhase.CODE_IMPLEMENTATION:
        return [
          {
            id: 'G34-001',
            description: 'Tasks have been decomposed and are atomic',
            severity: 'CRITICAL',
            check: () => this.tasks.size > 0,
            failureMessage: 'No implementation tasks have been defined',
          },
          {
            id: 'G34-002',
            description: 'Task dependency graph has no cycles',
            severity: 'CRITICAL',
            check: () => {
              const { valid } = this.validateTaskDependencies();
              return valid;
            },
            failureMessage: 'Task dependency graph contains cycles',
          },
          {
            id: 'G34-003',
            description: 'Each task has verification criteria',
            severity: 'HIGH',
            check: () => {
              for (const task of this.tasks.values()) {
                if (task.verificationCriteria.length === 0) return false;
              }
              return true;
            },
            failureMessage: 'Some tasks lack verification criteria',
          },
        ];

      case WorkflowPhase.VERIFICATION_TESTING:
        return [
          {
            id: 'G45-001',
            description: 'TypeScript compilation succeeds',
            severity: 'CRITICAL',
            check: () => false, // Agent must run tsc and override
            failureMessage: 'TypeScript compilation failed',
          },
          {
            id: 'G45-002',
            description: 'ESLint passes with zero warnings',
            severity: 'CRITICAL',
            check: () => false, // Agent must run eslint and override
            failureMessage: 'ESLint reported errors or warnings',
          },
          {
            id: 'G45-003',
            description: 'All new tests pass',
            severity: 'CRITICAL',
            check: () => false, // Agent must run tests and override
            failureMessage: 'Some tests failed',
          },
          {
            id: 'G45-004',
            description: 'No existing tests were broken (no regressions)',
            severity: 'CRITICAL',
            check: () => false, // Agent must run full test suite and override
            failureMessage: 'Regression detected — existing tests are failing',
          },
        ];

      case WorkflowPhase.INTEGRATION_CHECK:
        return [
          {
            id: 'G56-001',
            description: 'Full test suite passes',
            severity: 'CRITICAL',
            check: () => false, // Agent must run full test suite and override
            failureMessage: 'Full test suite has failures',
          },
          {
            id: 'G56-002',
            description: 'No circular dependencies detected',
            severity: 'HIGH',
            check: () => false, // Agent must run madge and override
            failureMessage: 'Circular dependencies detected',
          },
          {
            id: 'G56-003',
            description: 'No critical security vulnerabilities',
            severity: 'HIGH',
            check: () => false, // Agent must run npm audit and override
            failureMessage: 'Critical security vulnerabilities detected',
          },
        ];

      case WorkflowPhase.DOCUMENTATION:
        return [
          {
            id: 'G67-001',
            description: 'All imports resolve correctly',
            severity: 'CRITICAL',
            check: () => false, // Agent must verify and override
            failureMessage: 'Broken imports detected',
          },
          {
            id: 'G67-002',
            description: 'No orphaned files exist',
            severity: 'HIGH',
            check: () => false, // Agent must verify and override
            failureMessage: 'Orphaned files detected',
          },
          {
            id: 'G67-003',
            description: 'Cross-component integration verified',
            severity: 'HIGH',
            check: () => false, // Agent must verify and override
            failureMessage: 'Cross-component integration issues detected',
          },
        ];

      default:
        return [];
    }
  }
}

// =============================================================================
// CUSTOM ERROR CLASS
// =============================================================================

/**
 * Error thrown when a workflow violation occurs.
 */
export class WorkflowError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WorkflowError';
  }
}

// =============================================================================
// COMPLEXITY SCORER (Standalone Utility)
// =============================================================================

/**
 * Standalone complexity scorer for tasks outside the engine.
 */
export class ComplexityScorer {
  /**
   * Score a task description's complexity based on text analysis.
   * Useful for pre-planning estimation.
   */
  static scoreDescription(description: string): {
    level: ComplexityLevel;
    score: number;
    indicators: string[];
  } {
    let score = 0;
    const indicators: string[] = [];
    const lowerDesc = description.toLowerCase();

    // Complexity indicators
    const highIndicators = [
      'refactor', 'migration', 'rewrite', 'architecture',
      'database', 'schema change', 'breaking change',
      'authentication', 'authorization', 'payment',
      'real-time', 'websocket', 'microservice',
    ];

    const mediumIndicators = [
      'component', 'service', 'api', 'endpoint',
      'integration', 'optimization', 'performance',
      'state management', 'form', 'validation',
      'error handling', 'middleware',
    ];

    const lowIndicators = [
      'style', 'css', 'layout', 'typography',
      'color', 'spacing', 'icon', 'image',
      'rename', 'move', 'formatting', 'comment',
      'documentation', 'readme', 'changelog',
    ];

    for (const indicator of highIndicators) {
      if (lowerDesc.includes(indicator)) {
        score += 15;
        indicators.push(`High complexity indicator: "${indicator}"`);
      }
    }

    for (const indicator of mediumIndicators) {
      if (lowerDesc.includes(indicator)) {
        score += 8;
        indicators.push(`Medium complexity indicator: "${indicator}"`);
      }
    }

    for (const indicator of lowIndicators) {
      if (lowerDesc.includes(indicator)) {
        score += 3;
        indicators.push(`Low complexity indicator: "${indicator}"`);
      }

    // Word count factor
    const wordCount = description.split(/\s+/).length;
    if (wordCount > 100) {
      score += 10;
      indicators.push('Long description suggests complex task');
    } else if (wordCount > 50) {
      score += 5;
      indicators.push('Moderate description length');
    }

    // Multiple file references
    const fileMentions = (description.match(/\.\w{1,4}/g) ?? []).length;
    if (fileMentions > 5) {
      score += 10;
      indicators.push(`Multiple file references: ${fileMentions}`);
    }

    score = Math.min(100, Math.max(0, score));

    let level: ComplexityLevel;
    if (score >= 60) level = 'CRITICAL';
    else if (score >= 40) level = 'HIGH';
    else if (score >= 20) level = 'MEDIUM';
    else if (score >= 5) level = 'LOW';
    else level = 'TRIVIAL';

    return { level, score, indicators };
  }
}

// =============================================================================
// WORKFLOW TEMPLATES
// =============================================================================

/**
 * Pre-defined workflow templates for common task types.
 * Each template provides a set of default requirements and task structure.
 */
export const WorkflowTemplates = {
  newFeature: {
    name: 'New Feature Development',
    description: 'Template for developing a completely new feature',
    defaultPhases: [
      WorkflowPhase.CONTEXT_ACQUISITION,
      WorkflowPhase.REQUIREMENT_ANALYSIS,
      WorkflowPhase.ARCHITECTURE_DESIGN,
      WorkflowPhase.IMPLEMENTATION_PLANNING,
      WorkflowPhase.CODE_IMPLEMENTATION,
      WorkflowPhase.VERIFICATION_TESTING,
      WorkflowPhase.INTEGRATION_CHECK,
      WorkflowPhase.DOCUMENTATION,
    ],
    suggestedTaskTypes: ['CREATE', 'TEST', 'DOC'] as ImplementationTask['type'][],
    defaultRequirements: [
      'Define functional requirements (FR-NNN)',
      'Define non-functional requirements (NFR-NNN)',
      'Create acceptance criteria for each FR',
      'Identify edge cases and error scenarios',
    ],
  },

  bugFix: {
    name: 'Bug Fix',
    description: 'Template for fixing an existing bug',
    defaultPhases: [
      WorkflowPhase.CONTEXT_ACQUISITION,
      WorkflowPhase.REQUIREMENT_ANALYSIS,
      WorkflowPhase.ARCHITECTURE_DESIGN,
      WorkflowPhase.IMPLEMENTATION_PLANNING,
      WorkflowPhase.CODE_IMPLEMENTATION,
      WorkflowPhase.VERIFICATION_TESTING,
      WorkflowPhase.INTEGRATION_CHECK,
      WorkflowPhase.DOCUMENTATION,
    ],
    suggestedTaskTypes: ['MODIFY', 'TEST', 'DOC'] as ImplementationTask['type'][],
    defaultRequirements: [
      'Reproduce the bug and document steps',
      'Identify root cause',
      'Write regression test that fails before fix (RED)',
      'Apply minimal fix (GREEN)',
      'Verify no regressions',
    ],
  },

  refactoring: {
    name: 'Refactoring',
    description: 'Template for improving code structure without changing behavior',
    defaultPhases: [
      WorkflowPhase.CONTEXT_ACQUISITION,
      WorkflowPhase.REQUIREMENT_ANALYSIS,
      WorkflowPhase.ARCHITECTURE_DESIGN,
      WorkflowPhase.IMPLEMENTATION_PLANNING,
      WorkflowPhase.CODE_IMPLEMENTATION,
      WorkflowPhase.VERIFICATION_TESTING,
      WorkflowPhase.INTEGRATION_CHECK,
      WorkflowPhase.DOCUMENTATION,
    ],
    suggestedTaskTypes: ['MODIFY', 'DELETE', 'CREATE', 'TEST', 'DOC'] as ImplementationTask['type'][],
    defaultRequirements: [
      'Run existing tests and establish baseline',
      'Identify code smells and refactoring targets',
      'Ensure behavior remains identical after refactoring',
      'Test coverage must not decrease',
    ],
  },

  apiEndpoint: {
    name: 'API Endpoint Creation',
    description: 'Template for creating a new API endpoint',
    defaultPhases: [
      WorkflowPhase.CONTEXT_ACQUISITION,
      WorkflowPhase.REQUIREMENT_ANALYSIS,
      WorkflowPhase.ARCHITECTURE_DESIGN,
      WorkflowPhase.IMPLEMENTATION_PLANNING,
      WorkflowPhase.CODE_IMPLEMENTATION,
      WorkflowPhase.VERIFICATION_TESTING,
      WorkflowPhase.INTEGRATION_CHECK,
      WorkflowPhase.DOCUMENTATION,
    ],
    suggestedTaskTypes: ['CREATE', 'MODIFY', 'TEST', 'DOC'] as ImplementationTask['type'][],
    defaultRequirements: [
      'Define request schema with validation',
      'Define response schema (success and error)',
      'Implement authentication and authorization',
      'Add rate limiting',
      'Write API tests with mocked dependencies',
    ],
  },

  componentCreation: {
    name: 'Component Creation',
    description: 'Template for creating a new UI component',
    defaultPhases: [
      WorkflowPhase.CONTEXT_ACQUISITION,
      WorkflowPhase.REQUIREMENT_ANALYSIS,
      WorkflowPhase.ARCHITECTURE_DESIGN,
      WorkflowPhase.IMPLEMENTATION_PLANNING,
      WorkflowPhase.CODE_IMPLEMENTATION,
      WorkflowPhase.VERIFICATION_TESTING,
      WorkflowPhase.INTEGRATION_CHECK,
      WorkflowPhase.DOCUMENTATION,
    ],
    suggestedTaskTypes: ['CREATE', 'TEST', 'DOC'] as ImplementationTask['type'][],
    defaultRequirements: [
      'Define props interface',
      'Handle all prop combinations',
      'Add accessibility attributes (ARIA)',
      'Verify responsive design',
      'Write component tests with all prop variants',
    ],
  },
} as const;

// =============================================================================
// EXPORTS
// =============================================================================

export type {
  GateCriterion,
  QualityGate,
  ImplementationTask,
  Requirement,
  ArchitectureDecision,
  VerificationReport,
  CheckResult,
  PhaseCheckpoint,
};
