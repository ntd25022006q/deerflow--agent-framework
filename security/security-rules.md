# DEERFLOW SECURITY ENFORCEMENT v1.0

## Comprehensive Security Policy and Enforcement Framework

---

## Table of Contents

1. [Zero-Trust Security Model](#1-zero-trust-security-model)
2. [Pre-Commit Security Checks](#2-pre-commit-security-checks)
3. [Dependency Security](#3-dependency-security)
4. [Code Security Patterns](#4-code-security-patterns)
5. [OWASP Top 10 Enforcement](#5-owasp-top-10-enforcement)
6. [API Security](#6-api-security)
7. [Data Security](#7-data-security)
8. [Infrastructure Security](#8-infrastructure-security)
9. [Security Testing](#9-security-testing)
10. [Incident Response](#10-incident-response)

---

## 1. Zero-Trust Security Model

The Deerflow Agent Framework operates under a strict zero-trust security philosophy. Every input, every dependency, every network request, and every data source is treated as potentially hostile. Trust is never assumed; it is continuously verified through multiple layers of defense.

### Core Principles

**Never Trust Any Input**

All data entering the system — whether from user forms, API payloads, file uploads, environment variables, database records, or third-party webhooks — must be validated, sanitized, and typed before processing. There are no exceptions. Internal data that has been persisted and re-read is treated with the same suspicion as external input.

```
// VIOLATION: Trusting external input
function getUser(id: string) {
  return db.query(`SELECT * FROM users WHERE id = '${id}'`);
}

// COMPLIANT: Parameterized query with validation
function getUser(id: string): Promise<User> {
  const userId = UserId.validate(id);
  return db.query('SELECT * FROM users WHERE id = $1', [userId.value]);
}
```

**Verify Everything**

Every assumption about the system's state must be explicitly checked. Type assertions are forbidden; use type guards. Return values from external services must be validated against expected schemas. Database constraints are a safety net, not a primary validation mechanism.

**Least Privilege Principle**

Every process, service, user account, and API key must have the minimum permissions necessary to perform its function. Database users should only have access to the tables they need. Kubernetes pods should run with non-root users. CI/CD pipelines should have scoped, time-limited tokens.

**Defense in Depth**

No single security control is sufficient. Every critical operation must be protected by multiple independent layers: input validation at the boundary, business rule validation in the application layer, database constraints at the persistence layer, and monitoring at the operations layer. If one layer fails, the next must still protect the system.

### Trust Boundaries

The framework defines explicit trust boundaries at every integration point:

| Boundary | Entry Point | Validation Required |
|----------|------------|-------------------|
| User Interface | Form submissions, file uploads | Schema validation, file type checks, size limits |
| API Gateway | REST/GraphQL endpoints | Authentication, rate limiting, input sanitization |
| Internal Services | Inter-service communication | mTLS, service-to-service auth, message validation |
| Database | ORM/Query layer | Parameterized queries, row-level security |
| External APIs | Outbound HTTP requests | Response schema validation, timeout enforcement |
| File System | File read/write operations | Path traversal prevention, permission checks |
| Environment | Config and secrets | Encryption at rest, access logging, rotation policies |

---

## 2. Pre-Commit Security Checks

Pre-commit hooks serve as the last automated line of defense before code enters the version control system. The Deerflow framework requires a comprehensive set of pre-commit security checks that run on every commit attempt.

### Hook 1: No Secrets in Code (gitleaks Integration)

All committed code is scanned by gitleaks before being accepted. The configuration is defined in `security/.gitleaks.toml` and covers:

- API keys and tokens (AWS, GitHub, Stripe, SendGrid, Twilio, etc.)
- Database connection strings and credentials
- Private keys (SSH, RSA, PGP)
- OAuth tokens and refresh tokens
- JWT signing secrets
- Encrypted values that appear to be hardcoded

**Detection Method**: Regular expression pattern matching combined with entropy analysis to identify high-entropy strings that may be secrets even if they do not match known patterns.

**Action on Detection**: The commit is blocked. The developer must remove the secret, rotate the compromised credential, and use environment variables or a secret manager instead.

### Hook 2: No Hardcoded Credentials

Beyond what gitleaks detects, a custom script scans for patterns that indicate credential usage even when the actual value is not present:

```typescript
// BLOCKED: Hardcoded credential patterns
const dbPassword = "admin123";
const apiKey = process.env.API_KEY || "fallback-key-12345";
const connection = new Connection({ username: "admin", password: "password" });

// REQUIRED: Environment-based configuration with validation
const dbPassword = Config.require('DB_PASSWORD');
```

### Hook 3: No Debug Endpoints in Production

Any code that introduces debug or diagnostic endpoints must be wrapped in environment guards:

```typescript
// BLOCKED: Unconditional debug endpoint
app.get('/debug/state', (req, res) => res.json(appState));

// REQUIRED: Environment-garded debug endpoint
if (Config.isDevelopment) {
  app.get('/debug/state', (req, res) => res.json(appState));
}
```

### Hook 4: No eval() or Similar Functions

The following functions are absolutely prohibited in all environments:

- `eval()`, `new Function()`
- `setTimeout(string)`, `setInterval(string)`
- `innerHTML`, `outerHTML` (without sanitization)
- `document.write()`
- `window.execScript()`

**Detection Method**: AST-based static analysis that detects these function calls regardless of how they are referenced (direct call, aliased, or destructured).

### Hook 5: No innerHTML Without Sanitization

DOM manipulation using `innerHTML` is only permitted when the value is passed through a recognized sanitization library:

```typescript
// BLOCKED: Direct innerHTML assignment
element.innerHTML = userInput;

// REQUIRED: Sanitized innerHTML
import { sanitize } from 'dompurify';
element.innerHTML = sanitize(userInput);

// PREFERRED: Use textContent or a framework's templating
element.textContent = userInput;
```

---

## 3. Dependency Security

### npm Audit on Every Install

Every `npm install` command triggers a full security audit. The audit checks the resolved dependency tree against the npm Advisory Database and reports vulnerabilities categorized by severity.

**Enforcement**:
- Critical and High severity vulnerabilities block the installation
- Medium severity vulnerabilities generate a warning but allow installation with explicit acknowledgment
- Low severity vulnerabilities are logged for review

### Snyk Integration for Continuous Monitoring

Snyk provides continuous vulnerability monitoring beyond the initial npm audit:

- **Continuous Scanning**: The dependency tree is re-scanned daily and after every deployment
- **License Compliance**: Snyk flags dependencies with restrictive or incompatible licenses
- **Base Image Scanning**: Docker base images are scanned for OS-level vulnerabilities
- **PR Checks**: Every pull request triggers a Snyk test, and new vulnerabilities introduced by dependency changes are reported as PR comments

### Lock File Integrity Verification

The `package-lock.json` file is the single source of truth for dependency versions. The framework enforces:

- `npm ci` must be used in CI/CD environments (never `npm install`)
- The lock file must be committed alongside `package.json`
- Any discrepancy between `package.json` and `package-lock.json` triggers a build failure
- Lock file changes in pull requests are highlighted for manual review

### License Compliance Checking

All dependencies must have compatible licenses. The framework maintains a whitelist of approved licenses:

- **Approved**: MIT, Apache-2.0, BSD-2-Clause, BSD-3-Clause, ISC, 0BSD, Unlicense, CC0-1.0
- **Review Required**: LGPL-2.1, LGPL-3.0, MPL-2.0, EPL-1.0
- **Prohibited**: GPL-2.0, GPL-3.0, AGPL-3.0, SSPL-1.0 (copyleft licenses that would require the project to adopt the same license)

### Known Vulnerability Blocking

Dependencies with known CVEs are blocked at installation time. The blocking policy is:

| Severity | Action | SLA |
|----------|--------|-----|
| Critical | Block installation immediately | Fix within 24 hours |
| High | Block installation, allow override with `--force` | Fix within 72 hours |
| Medium | Warn, allow installation | Fix within 2 weeks |
| Low | Log only | Fix in next scheduled update |

---

## 4. Code Security Patterns

### Input Validation Patterns

All user-facing inputs must be validated using a schema-based validation library (Zod, Joi, or Yup):

```typescript
import { z } from 'zod';

const CreateUserSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(12).max(128),
  name: z.string().min(1).max(100).regex(/^[a-zA-Z\s'-]+$/),
  age: z.number().int().min(0).max(150).optional(),
}).strict();

// Usage in a controller
async function createUser(req: Request, res: Response): Promise<void> {
  const result = CreateUserSchema.safeParse(req.body);
  if (!result.success) {
    throw new ValidationError('Invalid user data', result.error.issues);
  }
  // Proceed with validated data
}
```

### Output Encoding Patterns

All data rendered in HTML templates must be properly encoded to prevent XSS:

```typescript
// Use framework-provided escaping (React, Vue, etc.) — default in most modern frameworks
// For server-side rendering:
import { escapeHtml } from '@/utils/security';

const safeOutput = escapeHtml(userInput);
```

### Authentication Patterns

Authentication must follow these patterns:

1. **Password Hashing**: Use bcrypt with a minimum cost factor of 12. Never implement custom hashing.
2. **Token-Based Auth**: Use JWT with RS256 signing for service-to-service, HS256 with a minimum 256-bit secret for user sessions.
3. **Multi-Factor**: Critical operations require MFA verification.
4. **Session Management**: Use short-lived access tokens (15 minutes) with longer-lived refresh tokens (7 days) stored in HTTP-only, Secure, SameSite=Strict cookies.

```typescript
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

async function hashPassword(plainText: string): Promise<string> {
  return bcrypt.hash(plainText, SALT_ROUNDS);
}

async function verifyPassword(plainText: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plainText, hash);
}
```

### Authorization Patterns

Authorization checks must be performed at the route level and at the resource level:

```typescript
// Route-level authorization
router.delete('/users/:id', 
  authenticate,
  authorize('admin'),
  async (req, res) => { /* ... */ }
);

// Resource-level authorization
async function deleteUser(requester: User, targetId: string): Promise<void> {
  const target = await userRepository.findById(targetId);
  if (!target) throw new NotFoundError('User not found');
  
  // Resource-level check: admin can delete anyone, users can delete themselves
  if (requester.role !== 'admin' && requester.id !== target.id) {
    throw new ForbiddenError('Cannot delete another user');
  }
  
  await userRepository.delete(targetId);
}
```

### Data Encryption Patterns

- **At Rest**: AES-256-GCM for all sensitive data stored in databases. Column-level encryption for PII fields.
- **In Transit**: TLS 1.3 for all network communication. No exceptions, including internal service-to-service calls.
- **Key Management**: Encryption keys must be stored in a dedicated secret manager (HashiCorp Vault, AWS KMS, GCP Cloud KMS). Keys must be rotated at least annually.

### Secure Session Management

```typescript
const sessionConfig = {
  cookieName: 'deerflow.session',
  secret: Config.require('SESSION_SECRET'), // Minimum 32 characters
  duration: 15 * 60 * 1000, // 15 minutes
  activeDuration: 5 * 60 * 1000, // Extend by 5 minutes on activity
  cookie: {
    httpOnly: true,
    secure: Config.isProduction,
    sameSite: 'strict' as const,
    path: '/',
    maxAge: 7 * 24 * 60 * 60, // 7 days for refresh token
  },
};
```

---

## 5. OWASP Top 10 Enforcement

### A01: Broken Access Control

**Description**: Users acting outside their intended permissions, including horizontal and vertical privilege escalation.

**Detection Method**: AST analysis for missing authorization checks on routes handling sensitive data. Dynamic analysis using automated penetration testing tools.

**Prevention Code Pattern**:
```typescript
// Every route must have authorization middleware
router.get('/admin/users', authenticate, authorize('admin'), handler);
router.get('/users/:id', authenticate, authorizeOrSelf('user'), handler);
```

**Automated Check**: The deerflow-linter rule `deerflow/require-authorization` flags any route handler that does not include an authorization middleware call in its middleware chain.

**Severity Rating**: Critical

---

### A02: Cryptographic Failures

**Description**: Failures related to cryptography, including use of weak algorithms, improper key management, and transmission of sensitive data in cleartext.

**Detection Method**: Pattern matching for weak algorithms (MD5, SHA1, DES, RC4), hardcoded encryption keys, and non-HTTPS endpoints.

**Prevention Code Pattern**:
```typescript
import crypto from 'crypto';

// CORRECT: AES-256-GCM with proper IV
function encrypt(plaintext: string, key: Buffer): { ciphertext: string; iv: string } {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  let ciphertext = cipher.update(plaintext, 'utf8', 'hex');
  ciphertext += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return { ciphertext, iv: iv.toString('hex') };
}
```

**Automated Check**: `deerflow-linter` flags usage of deprecated crypto functions.

**Severity Rating**: Critical

---

### A03: Injection

**Description**: Untrusted data sent to an interpreter as part of a command or query, including SQL, NoSQL, OS command, and LDAP injection.

**Detection Method**: AST pattern matching for string concatenation in queries and command execution functions.

**Prevention Code Pattern**:
```typescript
// ALWAYS: Parameterized queries
const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);

// ALWAYS: Use command libraries that handle escaping
import { execFile } from 'child_process';
execFile('convert', ['-resize', '200x200', inputPath, outputPath]);
```

**Automated Check**: `deerflow-linter` flags template literal and string concatenation usage in `db.query()`, `child_process.exec()`, and similar functions.

**Severity Rating**: Critical

---

### A04: Insecure Design

**Description**: Missing or ineffective security controls, often resulting from a lack of threat modeling during the design phase.

**Detection Method**: Manual review against threat model checklists during code review. Automated checks for missing rate limiting, input validation, and error handling.

**Prevention Pattern**: Every new feature must have a threat model document that identifies potential threats and the controls implemented to mitigate them.

**Automated Check**: `deerflow-architecture` validates that new modules include input validation, error handling, and authorization checks.

**Severity Rating**: High

---

### A05: Security Misconfiguration

**Description**: Insecure default configurations, incomplete configurations, open cloud storage, misconfigured HTTP headers, or verbose error messages containing sensitive information.

**Detection Method**: Configuration file analysis for default credentials, open CORS, missing security headers, and debug mode enabled in production.

**Prevention Code Pattern**:
```typescript
// Helmet.js with strict configuration
import helmet from 'helmet';
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameSrc: ["'none'"],
    },
  },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
}));
```

**Automated Check**: `deerflow-enforcer` flags Express/Koa/Fastify apps that do not include Helmet or equivalent security middleware.

**Severity Rating**: High

---

### A06: Vulnerable and Outdated Components

**Description**: Use of components (libraries, frameworks) with known vulnerabilities.

**Detection Method**: `npm audit`, Snyk scanning, Dependabot alerts.

**Prevention Pattern**: Automated dependency updates via Dependabot or Renovate, with CI/CD pipeline blocking on critical vulnerabilities.

**Automated Check**: `deerflow-dependency-guard` runs on every install and blocks vulnerable packages.

**Severity Rating**: High

---

### A07: Identification and Authentication Failures

**Description**: Weak password policies, session fixation, missing multi-factor authentication, credential stuffing.

**Detection Method**: Configuration analysis for authentication settings, password policy enforcement.

**Prevention Code Pattern**:
```typescript
const PasswordPolicy = z.object({
  password: z.string()
    .min(12, 'Password must be at least 12 characters')
    .max(128, 'Password must be at most 128 characters')
    .regex(/[A-Z]/, 'Must contain an uppercase letter')
    .regex(/[a-z]/, 'Must contain a lowercase letter')
    .regex(/[0-9]/, 'Must contain a number')
    .regex(/[^A-Za-z0-9]/, 'Must contain a special character'),
});
```

**Automated Check**: `deerflow-linter` validates that authentication endpoints enforce password policies and use secure hashing.

**Severity Rating**: Critical

---

### A08: Software and Data Integrity Failures

**Description**: Code and infrastructure that does not protect against integrity violations, including insecure CI/CD pipelines, auto-update without verification, and deserialization of untrusted data.

**Detection Method**: Pipeline configuration analysis for unsigned artifacts, insecure deserialization patterns.

**Prevention Pattern**: Sign all release artifacts with GPG. Verify artifact signatures before deployment. Never deserialize untrusted data using `JSON.parse` with revivers that execute code.

**Automated Check**: `deerflow-dependency-guard` verifies npm package integrity using `npm verify`.

**Severity Rating**: High

---

### A09: Security Logging and Monitoring Failures

**Description**: Insufficient logging, ineffective monitoring, missing or ineffective incident response.

**Detection Method**: Analysis of logging configuration for completeness and security.

**Prevention Code Pattern**:
```typescript
const securityLogger = logger.child({ component: 'security' });

// Log all authentication events
securityLogger.info('Login attempt', {
  userId: user.id,
  ip: req.ip,
  userAgent: req.headers['user-agent'],
  success: true,
  timestamp: new Date().toISOString(),
});

// Log all authorization failures
securityLogger.warn('Authorization denied', {
  userId: requester.id,
  resource: 'user',
  resourceId: targetId,
  action: 'delete',
  reason: 'insufficient_permissions',
});
```

**Automated Check**: `deerflow-linter` verifies that authentication and authorization code paths include security logging.

**Severity Rating**: Medium

---

### A10: Server-Side Request Forgery (SSRF)

**Description**: Application fetches a remote resource without validating the user-supplied URL, allowing the attacker to make requests to internal services.

**Detection Method**: AST analysis for URL fetching functions (`fetch`, `axios.get`, `http.request`) that accept user-supplied URLs without validation.

**Prevention Code Pattern**:
```typescript
const ALLOWED_HOSTS = new Set(['api.example.com', 'cdn.example.com']);

function validateUrl(userUrl: string): URL {
  const url = new URL(userUrl);
  if (!['https:'].includes(url.protocol)) {
    throw new ValidationError('Only HTTPS URLs are allowed');
  }
  if (!ALLOWED_HOSTS.has(url.hostname)) {
    throw new ValidationError(`Host ${url.hostname} is not allowed`);
  }
  if (url.hostname === 'localhost' || url.hostname.startsWith('192.168.') || url.hostname.startsWith('10.')) {
    throw new ValidationError('Private network URLs are not allowed');
  }
  return url;
}
```

**Automated Check**: `deerflow-linter` flags `fetch` and `axios` calls that use request-provided URLs without going through a validation function.

**Severity Rating**: Critical

---

## 6. API Security

### Rate Limiting Configuration

All public API endpoints must have rate limiting configured:

```typescript
import rateLimit from 'express-rate-limit';

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again later.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 login attempts per 15 minutes
  skipSuccessfulRequests: true, // Reset on successful login
});

app.use('/api/', globalLimiter);
app.use('/api/auth/login', authLimiter);
```

### Input Validation Middleware

Centralized input validation middleware ensures consistent validation across all endpoints:

```typescript
function validateBody(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: result.error.issues,
      });
      return;
    }
    req.body = result.data;
    next();
  };
}
```

### Response Sanitization

API responses must never include sensitive fields. Use a response sanitizer:

```typescript
const PUBLIC_USER_FIELDS = ['id', 'name', 'email', 'createdAt'] as const;
type PublicUser = Pick<User, typeof PUBLIC_USER_FIELDS[number]>;

function sanitizeUser(user: User): PublicUser {
  return Object.fromEntries(
    PUBLIC_USER_FIELDS.map(field => [field, user[field]])
  ) as PublicUser;
}
```

### CORS Configuration

```typescript
import cors from 'cors';

app.use(cors({
  origin: Config.require('ALLOWED_ORIGINS').split(','),
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  exposedHeaders: ['X-Request-ID'],
  credentials: true,
  maxAge: 86400, // 24 hours preflight cache
}));
```

### API Key Management

- API keys must be rotated every 90 days
- Keys must be at least 32 characters with high entropy
- Keys must be scoped to specific permissions and resources
- Expired keys must be revoked, not reused
- All key usage must be logged with the request ID and timestamp

---

## 7. Data Security

### PII Handling Rules

Personally Identifiable Information must be classified and handled according to its sensitivity:

| Data Classification | Examples | Storage | Logging | Access |
|--------------------|----------|---------|---------|--------|
| Public | Username, avatar URL | Encrypted | Allowed | All authenticated users |
| Internal | Email, phone number | Encrypted | Hashed/masked | Owner + authorized roles |
| Confidential | SSN, credit card, health data | AES-256-GCM encrypted | Never logged | Owner only + explicit consent |
| Restricted | Passwords, biometric data | Salted bcrypt hash | Never stored | System only (no human access) |

### Data Encryption at Rest

All sensitive data must be encrypted before storage:

```typescript
import crypto from 'crypto';

class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  
  constructor(private readonly key: Buffer) {
    if (key.length !== 32) throw new Error('Key must be 32 bytes');
  }
  
  encrypt(plaintext: string): EncryptedData {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
    const encrypted = Buffer.concat([
      cipher.update(plaintext, 'utf8'),
      cipher.final(),
    ]);
    const authTag = cipher.getAuthTag();
    return {
      ciphertext: encrypted.toString('base64'),
      iv: iv.toString('base64'),
      authTag: authTag.toString('base64'),
    };
  }
  
  decrypt(data: EncryptedData): string {
    const decipher = crypto.createDecipheriv(
      this.algorithm,
      this.key,
      Buffer.from(data.iv, 'base64'),
    );
    decipher.setAuthTag(Buffer.from(data.authTag, 'base64'));
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(data.ciphertext, 'base64')),
      decipher.final(),
    ]);
    return decrypted.toString('utf8');
  }
}
```

### Data Encryption in Transit

- TLS 1.3 must be used for all network communication
- Certificate pinning must be enabled for mobile applications
- HSTS must be enabled with a minimum max-age of one year
- All internal service-to-service communication must use mTLS

### Data Retention Policies

| Data Type | Retention Period | Deletion Method |
|-----------|-----------------|-----------------|
| User account data | Duration of account + 30 days | Hard delete from all systems |
| Session data | 7 days (inactivity) | Automatic expiration + purge |
| Audit logs | 2 years | Secure deletion after retention period |
| Application logs | 90 days | Automatic rotation and deletion |
| PII in backups | 90 days | Backup rotation with secure deletion |
| Analytics data | 1 year | Anonymization after 90 days, deletion after 1 year |

### Secure Deletion Procedures

When data is deleted, it must be purged from all storage locations:

1. **Primary Database**: Hard delete (not soft delete) with a confirmation query verifying the record no longer exists
2. **Read Replicas**: Propagation verification within the replication lag window
3. **Search Indexes**: Explicit removal from all search engine indexes (Elasticsearch, Algolia)
4. **Cache Layers**: Invalidation across all cache instances (Redis, CDN)
5. **Backups**: Marked for exclusion from future restores; physically deleted at next backup rotation
6. **Audit Trail**: A deletion event is logged (without including the deleted PII)

---

## 8. Infrastructure Security

### Docker Security Best Practices

```dockerfile
# Multi-stage build to minimize attack surface
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM node:20-alpine AS runtime
# Run as non-root user
RUN addgroup -g 1001 -S appgroup && adduser -S appuser -u 1001
WORKDIR /app
COPY --from=builder --chown=appuser:appgroup /app/dist ./dist
COPY --from=builder --chown=appuser:appgroup /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:appgroup /app/package.json ./
USER appuser
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1
CMD ["node", "dist/main.js"]
```

**Dockerfile Rules**:
- Always use multi-stage builds
- Always run as a non-root user
- Always pin base image versions (never use `latest`)
- Always include a HEALTHCHECK instruction
- Never include secrets in the image
- Use `.dockerignore` to exclude unnecessary files

### Environment Variable Management

- All secrets must be stored in a secret manager (Vault, AWS Secrets Manager, GCP Secret Manager)
- Environment variables must be typed and validated at application startup
- Missing required configuration must cause immediate application failure (fail-fast)
- No default values for secrets (configuration errors are better than security vulnerabilities)

```typescript
class Config {
  static require(key: string): string {
    const value = process.env[key];
    if (!value) {
      throw new Error(`Required environment variable ${key} is not set`);
    }
    return value;
  }
  
  static optional(key: string, defaultValue: string): string {
    return process.env[key] ?? defaultValue;
  }
  
  static number(key: string): number {
    const value = this.require(key);
    const parsed = parseInt(value, 10);
    if (isNaN(parsed)) throw new Error(`${key} must be a number`);
    return parsed;
  }
}
```

### Secret Management (Vault Integration)

```
Secret Hierarchy:
secret/deerflow/<environment>/
  ├── database/
  │   ├── host
  │   ├── port
  │   ├── username
  │   └── password
  ├── api/
  │   ├── jwt-secret
  │   ├── jwt-refresh-secret
  │   └── api-keys
  ├── external/
  │   ├── stripe-key
  │   ├── sendgrid-key
  │   └── twilio-key
  └── encryption/
      └── data-encryption-key
```

**Vault Rules**:
- All secrets have a maximum TTL of 72 hours
- Secrets are automatically rotated by Vault's dynamic secret engine where supported
- Application instances re-authenticate and fetch new secrets on each startup
- Audit logging is enabled for all Vault access

### Network Security

- All inter-service communication uses mTLS
- Database connections use TLS with certificate verification
- Network policies in Kubernetes restrict pod-to-pod communication to explicitly allowed paths
- Ingress controllers enforce TLS termination and rate limiting
- Egress traffic is restricted to allowlisted external services only

### Container Security Scanning

Every container image is scanned before it can be deployed:

- **Trivy**: Scans for OS package vulnerabilities and misconfigurations
- **Snyk Container**: Scans for application dependency vulnerabilities
- **Dockle**: Checks for Dockerfile best practices violations
- Images with Critical or High vulnerabilities are blocked from deployment

---

## 9. Security Testing

### SAST (Static Application Security Testing)

Static analysis runs on every pull request and every commit to the main branch:

| Tool | Purpose | When |
|------|---------|------|
| ESLint + security plugin | JavaScript/TypeScript security rules | Every commit |
| TypeScript strict mode | Type safety enforcement | Every commit |
| Semgrep | Cross-language security pattern detection | Every PR |
| Zod schema validation | Runtime schema enforcement | Build time |

### DAST (Dynamic Application Security Testing)

Dynamic analysis runs against deployed staging environments:

| Tool | Purpose | Frequency |
|------|---------|-----------|
| OWASP ZAP | Automated vulnerability scanning | Weekly |
| Burp Suite | Manual penetration testing | Monthly |
| Nuclei | Template-based vulnerability scanning | Weekly |

### Dependency Scanning

- **npm audit**: Runs on every install and every CI build
- **Snyk test**: Runs on every PR and daily
- **Dependabot**: Automated PR creation for dependency updates
- **Socket.dev**: Analyzes dependencies for supply chain risks

### Container Scanning

- **Trivy**: Runs on every Docker build in CI/CD
- **Snyk Container**: Runs on every push to container registry
- **Dockle**: Runs on every Docker build for best practice violations

### Penetration Testing Checklist

- [ ] Authentication bypass attempts
- [ ] Authorization boundary testing
- [ ] SQL/NoSQL injection testing
- [ ] XSS testing (reflected, stored, DOM-based)
- [ ] CSRF testing
- [ ] SSRF testing
- [ ] File upload vulnerability testing
- [ ] Business logic abuse testing
- [ ] API rate limiting verification
- [ ] Session management testing
- [ ] Password policy verification
- [ ] Error handling information disclosure testing

---

## 10. Incident Response

### Security Incident Classification

| Level | Name | Description | Response Time | Notification |
|-------|------|-------------|---------------|--------------|
| SEV-1 | Critical | Active data breach, system compromise, data exfiltration | 15 minutes | Security team, CTO, legal, affected users within 72 hours |
| SEV-2 | High | Vulnerability actively exploited, unauthorized access detected | 1 hour | Security team, engineering lead, affected users if needed |
| SEV-3 | Medium | Vulnerability discovered but not exploited, potential risk identified | 4 hours | Security team, relevant engineering team |
| SEV-4 | Low | Security policy violation, minor misconfiguration, theoretical risk | 24 hours | Security team |

### Response Procedures

1. **Detection**: Identify the incident through monitoring, alerts, or external reports
2. **Triage**: Classify the incident severity and assign an incident commander
3. **Containment**: Isolate affected systems to prevent further damage
4. **Eradication**: Remove the threat from all affected systems
5. **Recovery**: Restore systems to normal operation with additional monitoring
6. **Post-Mortem**: Conduct a blameless post-mortem within 5 business days

### Communication Protocols

- **Internal Communication**: Use a dedicated incident channel (e.g., `#security-incident-2025-001`)
- **Stakeholder Updates**: Every 30 minutes for SEV-1, every 2 hours for SEV-2
- **User Notification**: Within 72 hours for incidents involving user data (GDPR requirement)
- **Public Disclosure**: After the root cause is identified and the fix is deployed, prepare a public disclosure if the incident affected users

### Post-Mortem Process

Every security incident requires a post-mortem document containing:

1. **Incident Summary**: What happened, when, and what was the impact
2. **Timeline**: Detailed chronological timeline of events
3. **Root Cause Analysis**: The fundamental cause(s) of the incident
4. **Contributing Factors**: Conditions that allowed or exacerbated the incident
5. **Action Items**: Specific, assigned, dated tasks to prevent recurrence
6. **Lessons Learned**: What the team learned and what processes need to change
7. **Metrics**: Detection time, response time, resolution time, blast radius

The post-mortem is blameless — its purpose is to improve systems, not to assign blame to individuals.

---

*This document is part of the Deerflow Agent Framework. For the complete rule set, see `core/rules/master-rules.md`. For MCP tool configuration, see `mcp-tools/config.json`.*
