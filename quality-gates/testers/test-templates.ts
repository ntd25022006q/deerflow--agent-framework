/**
 * =============================================================================
 * DEERFLOW TEST TEMPLATES v1.0
 * =============================================================================
 *
 * Use these templates as the foundation for ALL tests in the Deerflow Agent
 * Framework. Every test file should follow these patterns for consistency,
 * readability, and comprehensive coverage.
 *
 * Coverage Requirements:
 *   - Unit Tests:       80% line/branch/function/statement coverage
 *   - Integration Tests: 60% line coverage minimum
 *   - E2E Tests:         All critical user journeys covered
 *   - Mutation Tests:    70% mutation score minimum
 *
 * Naming Convention:
 *   - Files: {module-name}.test.ts or {module-name}.spec.ts
 *   - Describe blocks: PascalCase — describe('UserService', ...)
 *   - Test cases: descriptive sentences — it('should create a user with valid input', ...)
 *
 * =============================================================================
 */

import { describe, it, expect, beforeEach, afterEach, vi, type Mock } from 'vitest';

// =============================================================================
// TEMPLATE 1: Unit Test Template
// =============================================================================
// Use for testing individual functions, classes, or methods in isolation.
// Mock all external dependencies at the module boundary.
// =============================================================================
describe('[TemplateName]', () => {
  // ---------------------------------------------------------------------------
  // 1a. System Under Test (SUT) setup
  // ---------------------------------------------------------------------------
  let sut: InstanceType<typeof ImportName>;

  // ---------------------------------------------------------------------------
  // 1b. Mock declarations
  // ---------------------------------------------------------------------------
  const mockDependency = vi.fn();

  // ---------------------------------------------------------------------------
  // 1c. Setup & Teardown
  // ---------------------------------------------------------------------------
  beforeEach(() => {
    vi.clearAllMocks();
    sut = new ImportName(mockDependency as unknown as never);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ---------------------------------------------------------------------------
  // 1d. Constructor / Initialization tests
  // ---------------------------------------------------------------------------
  describe('constructor', () => {
    it('should create an instance with valid parameters', () => {
      // Arrange
      const params = { /* valid params */ };

      // Act
      const result = new ImportName(params);

      // Assert
      expect(result).toBeInstanceOf(ImportName);
    });

    it('should throw InvalidInputError when parameters are invalid', () => {
      // Arrange
      const invalidParams = { /* invalid params */ };

      // Act & Assert
      expect(() => new ImportName(invalidParams)).toThrow(InvalidInputError);
    });
  });

  // ---------------------------------------------------------------------------
  // 1e. Happy path tests
  // ---------------------------------------------------------------------------
  describe('execute (happy path)', () => {
    it('should return expected result when given valid input', () => {
      // Arrange
      const input = { /* valid input */ };
      mockDependency.mockResolvedValue({ /* mock data */ });

      // Act
      const result = sut.execute(input);

      // Assert
      expect(result).toEqual({ /* expected result */ });
    });

    it('should call dependency with correct parameters', () => {
      // Arrange
      const input = { id: '123', name: 'test' };

      // Act
      sut.execute(input);

      // Assert
      expect(mockDependency).toHaveBeenCalledWith(input);
    });
  });

  // ---------------------------------------------------------------------------
  // 1f. Sad path / error handling tests
  // ---------------------------------------------------------------------------
  describe('execute (error handling)', () => {
    it('should throw DomainError when input is null or undefined', () => {
      expect(() => sut.execute(null as unknown as never)).toThrow(DomainError);
    });

    it('should throw ValidationError when required fields are missing', () => {
      const incompleteInput = { /* missing required field */ };
      expect(() => sut.execute(incompleteInput)).toThrow(ValidationError);
    });

    it('should handle and re-throw unexpected errors with context', () => {
      // Arrange
      mockDependency.mockImplementation(() => {
        throw new Error('Unexpected failure');
      });

      // Act & Assert
      expect(() => sut.execute({ /* input */ })).toThrow(/Unexpected failure/);
    });
  });

  // ---------------------------------------------------------------------------
  // 1g. Edge case tests
  // ---------------------------------------------------------------------------
  describe('execute (edge cases)', () => {
    it('should handle empty input gracefully', () => {
      expect(sut.execute({ /* empty */ })).toEqual({ /* default result */ });
    });

    it('should handle boundary values correctly', () => {
      const boundaryInput = { value: Number.MAX_SAFE_INTEGER };
      expect(() => sut.execute(boundaryInput)).not.toThrow();
    });

    it('should handle concurrent calls safely', async () => {
      const inputs = Array.from({ length: 10 }, (_, i) => ({ id: i }));
      const results = await Promise.all(inputs.map((input) => sut.execute(input)));
      expect(results).toHaveLength(10);
    });
  });
});

// =============================================================================
// TEMPLATE 2: Integration Test Template
// =============================================================================
// Use for testing interactions between multiple modules/components.
// Only mock external services (API, database, file system).
// =============================================================================
describe('[TemplateName] Integration', () => {
  let sut: SystemUnderTestType;
  let testDb: TestDatabase;
  let testContainer: TestContainer;

  beforeAll(async () => {
    // Spin up test infrastructure (database, services)
    testDb = await createTestDatabase();
    testContainer = await createTestContainer();
  });

  beforeEach(async () => {
    // Reset database state between tests
    await testDb.reset();
    sut = createSystemUnderTest(testDb.connectionString);
  });

  afterAll(async () => {
    // Clean up test infrastructure
    await testDb.teardown();
    await testContainer.stop();
  });

  describe('end-to-end workflow', () => {
    it('should process a complete user registration flow', async () => {
      // Step 1: Register
      const user = await sut.register({ email: 'test@example.com', password: 'SecurePass123!' });
      expect(user.id).toBeDefined();
      expect(user.email).toBe('test@example.com');

      // Step 2: Verify email
      const verified = await sut.verifyEmail(user.id, user.verificationToken);
      expect(verified.isEmailVerified).toBe(true);

      // Step 3: Fetch profile
      const profile = await sut.getProfile(user.id);
      expect(profile.email).toBe('test@example.com');
      expect(profile.isEmailVerified).toBe(true);
    });

    it('should maintain data consistency across service boundaries', async () => {
      const orderId = await sut.createOrder({ items: [{ productId: 'p1', qty: 2 }] });
      const inventory = await sut.getInventory('p1');
      expect(inventory.reserved).toBe(2);

      await sut.cancelOrder(orderId);
      const updatedInventory = await sut.getInventory('p1');
      expect(updatedInventory.reserved).toBe(0);
    });
  });
});

// =============================================================================
// TEMPLATE 3: E2E Test Template
// =============================================================================
// Use for testing complete user journeys from the outside in.
// No mocking — test against real (or containerized) services.
// =============================================================================
describe('[TemplateName] E2E', () => {
  let app: Application;
  let request: SuperTest;

  beforeAll(async () => {
    app = await createTestApplication();
    request = supertest(app);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('API endpoint: POST /api/v1/resource', () => {
    it('should return 201 with created resource', async () => {
      const response = await request
        .post('/api/v1/resource')
        .send({ name: 'Test Resource', type: 'standard' })
        .set('Authorization', `Bearer ${getTestToken()}`)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body.id).toBeDefined();
      expect(response.body.name).toBe('Test Resource');
    });

    it('should return 401 when not authenticated', async () => {
      await request.post('/api/v1/resource').send({ name: 'Test' }).expect(401);
    });

    it('should return 422 with validation error details', async () => {
      const response = await request
        .post('/api/v1/resource')
        .send({}) // Missing required fields
        .set('Authorization', `Bearer ${getTestToken()}`)
        .expect(422);

      expect(response.body.errors).toBeInstanceOf(Array);
    });

    it('should return 409 for duplicate resources', async () => {
      const payload = { name: 'Unique', type: 'standard' };

      await request
        .post('/api/v1/resource')
        .send(payload)
        .set('Authorization', `Bearer ${getTestToken()}`)
        .expect(201);

      await request
        .post('/api/v1/resource')
        .send(payload)
        .set('Authorization', `Bearer ${getTestToken()}`)
        .expect(409);
    });
  });
});

// =============================================================================
// TEMPLATE 4: Component Test Template
// =============================================================================
// Use for testing React components with Rendering, Interaction, and State.
// =============================================================================
describe('[ComponentName]', () => {
  const defaultProps = {
    title: 'Test Title',
    onAction: vi.fn(),
    isLoading: false,
  };

  const renderComponent = (props?: Partial<typeof defaultProps>) => {
    return render(<ComponentName {...defaultProps} {...props} />);
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // -------------------------------------------------------------------------
  // 4a. Rendering tests
  // -------------------------------------------------------------------------
  describe('rendering', () => {
    it('should render without crashing', () => {
      const { container } = renderComponent();
      expect(container).toBeInTheDocument();
    });

    it('should display the title when provided', () => {
      renderComponent({ title: 'Hello World' });
      expect(screen.getByText('Hello World')).toBeInTheDocument();
    });

    it('should render all required sections', () => {
      renderComponent();
      expect(screen.getByRole('heading', { name: /test title/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /action/i })).toBeInTheDocument();
    });

    it('should match snapshot', () => {
      const { container } = renderComponent();
      expect(container).toMatchSnapshot();
    });
  });

  // -------------------------------------------------------------------------
  // 4b. Interaction tests
  // -------------------------------------------------------------------------
  describe('interactions', () => {
    it('should call onAction when button is clicked', async () => {
      renderComponent();
      const button = screen.getByRole('button', { name: /action/i });

      await userEvent.click(button);

      expect(defaultProps.onAction).toHaveBeenCalledOnce();
    });

    it('should be disabled when isLoading is true', () => {
      renderComponent({ isLoading: true });
      const button = screen.getByRole('button', { name: /action/i });
      expect(button).toBeDisabled();
    });

    it('should update state when input value changes', async () => {
      renderComponent();
      const input = screen.getByLabelText(/search/i);

      await userEvent.type(input, 'hello world');

      expect(input).toHaveValue('hello world');
    });

    it('should call callback with correct arguments', async () => {
      const onAction = vi.fn();
      renderComponent({ onAction });
      await userEvent.click(screen.getByRole('button'));

      expect(onAction).toHaveBeenCalledWith(expect.any(Object));
    });
  });

  // -------------------------------------------------------------------------
  // 4c. Conditional rendering tests
  // -------------------------------------------------------------------------
  describe('conditional rendering', () => {
    it('should show loading spinner when isLoading is true', () => {
      renderComponent({ isLoading: true });
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('should show error message when error is provided', () => {
      renderComponent({ error: 'Something went wrong' });
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });

    it('should show empty state when items array is empty', () => {
      renderComponent({ items: [] });
      expect(screen.getByText(/no items/i)).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // 4d. Accessibility tests
  // -------------------------------------------------------------------------
  describe('accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = renderComponent();
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should be keyboard navigable', async () => {
      renderComponent();
      const button = screen.getByRole('button');

      await userEvent.tab();
      expect(button).toHaveFocus();
    });
  });
});

// =============================================================================
// TEMPLATE 5: API Test Template
// =============================================================================
// Use for testing API routes, middleware, request/response handling.
// =============================================================================
describe('[API Route] /api/v1/[resource]', () => {
  let app: Express.Application;

  beforeAll(() => {
    app = createTestApp();
  });

  describe('GET /api/v1/[resource]', () => {
    it('should return 200 with paginated results', async () => {
      const response = await request(app)
        .get('/api/v1/resource')
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.meta.page).toBe(1);
      expect(response.body.meta.total).toBeDefined();
    });

    it('should return 400 when query params are invalid', async () => {
      const response = await request(app)
        .get('/api/v1/resource')
        .query({ page: 'invalid' })
        .expect(400);

      expect(response.body.errors).toBeDefined();
    });

    it('should return 404 when resource does not exist', async () => {
      await request(app).get('/api/v1/resource/nonexistent-id').expect(404);
    });
  });

  describe('POST /api/v1/[resource]', () => {
    const validPayload = { name: 'Test', description: 'A test resource' };

    it('should return 201 with created resource', async () => {
      const response = await request(app)
        .post('/api/v1/resource')
        .send(validPayload)
        .expect(201);

      expect(response.body.id).toBeDefined();
    });

    it('should sanitize input before processing', async () => {
      const maliciousPayload = { name: '<script>alert("xss")</script>' };
      const response = await request(app)
        .post('/api/v1/resource')
        .send(maliciousPayload)
        .expect(201);

      expect(response.body.name).not.toContain('<script>');
    });

    it('should rate-limit excessive requests', async () => {
      const promises = Array.from({ length: 110 }, () =>
        request(app).post('/api/v1/resource').send(validPayload),
      );
      const responses = await Promise.allSettled(promises);
      const rateLimited = responses.filter(
        (r) => r.status === 'fulfilled' && r.value.status === 429,
      );
      expect(rateLimited.length).toBeGreaterThan(0);
    });
  });
});

// =============================================================================
// TEMPLATE 6: Hook Test Template
// =============================================================================
// Use for testing custom React hooks.
// =============================================================================
describe('use[HookName]', () => {
  const renderHook = createHookRenderer();

  it('should return initial state', () => {
    const { result } = renderHook(() => useCustomHook());
    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeNull();
  });

  it('should update state when data is fetched', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useCustomHook('test-id'));

    await waitForNextUpdate();

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toEqual({ id: 'test-id' });
  });

  it('should handle errors gracefully', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useCustomHook('error-id'));

    await waitForNextUpdate();

    expect(result.current.error).toBeDefined();
    expect(result.current.isLoading).toBe(false);
  });

  it('should clean up on unmount', () => {
    const cleanupSpy = vi.fn();
    const { unmount } = renderHook(() => {
      const hook = useCustomHook();
      hook.cleanup = cleanupSpy;
      return hook;
    });

    unmount();
    expect(cleanupSpy).toHaveBeenCalled();
  });

  it('should refetch when dependencies change', async () => {
    const { result, rerender, waitForNextUpdate } = renderHook(
      ({ id }) => useCustomHook(id),
      { initialProps: { id: '1' } },
    );

    await waitForNextUpdate();
    expect(result.current.data?.id).toBe('1');

    rerender({ id: '2' });
    await waitForNextUpdate();
    expect(result.current.data?.id).toBe('2');
  });
});

// =============================================================================
// TEMPLATE 7: Utility Function Test Template
// =============================================================================
// Use for testing pure utility/helper functions.
// =============================================================================
describe('[utilityFunction]', () => {
  // -------------------------------------------------------------------------
  // 7a. Type preservation tests
  // -------------------------------------------------------------------------
  describe('type safety', () => {
    it('should return correct type', () => {
      const result = utilityFunction('input');
      expect(typeof result).toBe('string');
    });
  });

  // -------------------------------------------------------------------------
  // 7b. Core logic tests
  // -------------------------------------------------------------------------
  describe('core behavior', () => {
    it.each([
      { input: 'hello', expected: 'HELLO' },
      { input: 'WORLD', expected: 'WORLD' },
      { input: '', expected: '' },
      { input: '123', expected: '123' },
    ])('should transform "$input" to "$expected"', ({ input, expected }) => {
      expect(utilityFunction(input)).toBe(expected);
    });
  });

  // -------------------------------------------------------------------------
  // 7c. Edge case tests
  // -------------------------------------------------------------------------
  describe('edge cases', () => {
    it('should handle null/undefined input without throwing', () => {
      expect(() => utilityFunction(null as unknown as string)).not.toThrow();
    });

    it('should handle very large inputs', () => {
      const largeInput = 'a'.repeat(10_000);
      expect(() => utilityFunction(largeInput)).not.toThrow();
    });

    it('should handle unicode characters correctly', () => {
      expect(utilityFunction('café')).toBe('CAFÉ');
    });
  });

  // -------------------------------------------------------------------------
  // 7d. Performance tests (only for hot-path utilities)
  // -------------------------------------------------------------------------
  describe('performance', () => {
    it('should complete within time budget', () => {
      const start = performance.now();
      for (let i = 0; i < 10_000; i++) {
        utilityFunction('test');
      }
      const elapsed = performance.now() - start;
      expect(elapsed).toBeLessThan(100); // 100ms for 10k iterations
    });
  });
});

// =============================================================================
// TEMPLATE 8: Error Scenario Test Template
// =============================================================================
// Use for testing error boundaries, error handling middleware, and failure modes.
// =============================================================================
describe('[System] Error Handling', () => {
  const errorScenarios = [
    {
      name: 'network timeout',
      error: new TimeoutError('Request timed out'),
      expectedStatus: 504,
      expectedMessage: 'Service temporarily unavailable',
    },
    {
      name: 'invalid input',
      error: new ValidationError('Invalid field: email'),
      expectedStatus: 422,
      expectedMessage: 'Invalid field: email',
    },
    {
      name: 'not found',
      error: new NotFoundError('Resource not found'),
      expectedStatus: 404,
      expectedMessage: 'Resource not found',
    },
    {
      name: 'unauthorized',
      error: new AuthenticationError('Invalid token'),
      expectedStatus: 401,
      expectedMessage: 'Invalid token',
    },
    {
      name: 'forbidden',
      error: new AuthorizationError('Insufficient permissions'),
      expectedStatus: 403,
      expectedMessage: 'Insufficient permissions',
    },
  ];

  errorScenarios.forEach(({ name, error, expectedStatus, expectedMessage }) => {
    describe(`when ${name} occurs`, () => {
      it(`should return ${expectedStatus} status`, async () => {
        mockService.mockRejectedValue(error);
        const response = await sut.execute({ /* input */ });
        expect(response.status).toBe(expectedStatus);
      });

      it('should not leak stack traces in production', async () => {
        mockService.mockRejectedValue(error);
        const response = await sut.execute({ /* input */ });
        expect(response.body.stack).toBeUndefined();
        expect(response.body.message).toBe(expectedMessage);
      });

      it('should log the error with structured metadata', async () => {
        mockService.mockRejectedValue(error);
        await sut.execute({ /* input */ });
        expect(mockLogger.error).toHaveBeenCalledWith(
          expect.objectContaining({
            message: expectedMessage,
            statusCode: expectedStatus,
            timestamp: expect.any(String),
          }),
        );
      });
    });
  });
});

// =============================================================================
// TEMPLATE 9: Edge Case Test Template
// =============================================================================
// Use for boundary value analysis and corner cases.
// =============================================================================
describe('[System] Edge Cases', () => {
  const boundaryValues = {
    string: ['', ' ', 'a'.repeat(255), 'a'.repeat(256), '   trim   ', '\t\n', 'null'],
    number: [0, -1, Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, 0.1 + 0.2],
    date: [new Date(0), new Date('9999-12-31'), new Date('0001-01-01')],
    array: [[], [1], Array(1000).fill(null), [null, undefined]],
    object: [{}, { nested: { deep: { value: true } } }],
  };

  describe('string boundary values', () => {
    it.each(boundaryValues.string)('should handle input: "%s"', (input) => {
      expect(() => sut.execute(input)).not.toThrow();
    });
  });

  describe('numeric boundary values', () => {
    it.each(boundaryValues.number)('should handle input: %s', (input) => {
      expect(() => sut.execute(input as never)).not.toThrow();
    });
  });

  describe('concurrent access', () => {
    it('should handle 100 simultaneous requests', async () => {
      const promises = Array.from({ length: 100 }, (_, i) =>
        sut.execute({ id: String(i) }),
      );
      const results = await Promise.allSettled(promises);
      const failures = results.filter((r) => r.status === 'rejected');
      expect(failures).toHaveLength(0);
    });
  });

  describe('race conditions', () => {
    it('should not produce duplicate side effects on rapid calls', async () => {
      await Promise.all([
        sut.execute({ id: 'shared' }),
        sut.execute({ id: 'shared' }),
        sut.execute({ id: 'shared' }),
      ]);
      expect(mockSideEffect).toHaveBeenCalledTimes(1);
    });
  });
});

// =============================================================================
// TEMPLATE 10: Security Test Template
// =============================================================================
// Use for testing security-sensitive functionality.
// =============================================================================
describe('[System] Security', () => {
  describe('input validation', () => {
    it('should reject SQL injection attempts', () => {
      const maliciousInput = "'; DROP TABLE users; --";
      expect(() => sut.processInput(maliciousInput)).toThrow(ValidationError);
    });

    it('should reject XSS payloads', () => {
      const xssPayload = '<script>window.location="http://evil.com"</script>';
      const result = sut.sanitize(xssPayload);
      expect(result).not.toContain('<script>');
    });

    it('should reject path traversal attempts', () => {
      const traversal = '../../../etc/passwd';
      expect(() => sut.readFile(traversal)).toThrow(ValidationError);
    });

    it('should reject command injection attempts', () => {
      const injection = '; rm -rf /';
      expect(() => sut.executeCommand(injection)).toThrow(ValidationError);
    });
  });

  describe('authentication & authorization', () => {
    it('should reject requests with expired tokens', async () => {
      const expiredToken = generateToken({ exp: Date.now() - 1000 });
      await expect(sut.authenticate(expiredToken)).rejects.toThrow(AuthenticationError);
    });

    it('should reject requests with tampered tokens', async () => {
      const token = generateToken({ role: 'admin' });
      const tampered = token.slice(0, -10) + 'tampered';
      await expect(sut.authenticate(tampered)).rejects.toThrow(AuthenticationError);
    });

    it('should enforce role-based access control', async () => {
      const userToken = generateToken({ role: 'user' });
      await expect(sut.adminAction(userToken)).rejects.toThrow(AuthorizationError);
    });
  });

  describe('data protection', () => {
    it('should hash passwords before storage', async () => {
      const plainPassword = 'MySecurePassword123!';
      await sut.register({ email: 'test@example.com', password: plainPassword });

      const stored = await sut.getStoredPassword('test@example.com');
      expect(stored).not.toBe(plainPassword);
    });

    it('should not log sensitive data', () => {
      sut.processSensitiveData({ ssn: '123-45-6789', email: 'user@example.com' });
      expect(mockLogger.info).not.toHaveBeenCalledWith(expect.stringContaining('123-45-6789'));
    });
  });
});

// =============================================================================
// MOCK PATTERNS — Reusable mock factories
// =============================================================================
// Use these patterns to create consistent, type-safe mocks across all test files.
// =============================================================================

/**
 * Creates a mock for a repository that implements CRUD operations.
 */
function createMockRepository<T extends { id: string }>() {
  return {
    findById: vi.fn<Promise<T | null>, [string]>(),
    findAll: vi.fn<Promise<T[]], []>(),
    create: vi.fn<Promise<T>, [Partial<T>]>(),
    update: vi.fn<Promise<T>, [string, Partial<T>]>(),
    delete: vi.fn<Promise<void>, [string]>(),
    exists: vi.fn<Promise<boolean>, [string]>(),
    count: vi.fn<Promise<number>, []>(),
  };
}

/**
 * Creates a mock for an external service with retry logic.
 */
function createMockExternalService() {
  return {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    healthCheck: vi.fn().mockResolvedValue({ status: 'ok' }),
  };
}

/**
 * Creates a mock logger that tracks all calls for assertion.
 */
function createMockLogger() {
  return {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    child: vi.fn().mockReturnThis(),
  };
}
