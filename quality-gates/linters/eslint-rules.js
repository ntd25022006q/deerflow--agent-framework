// =============================================================================
// DEERFLOW ESLint Configuration v1.0
// =============================================================================
// Zero-tolerance linting rules for the Deerflow Agent Framework.
// This configuration enforces the highest code quality standards.
//
// Usage:
//   npx eslint . --config quality-gates/linters/eslint-rules.js --ext .ts,.tsx
//
// Quality Gate Thresholds:
//   - Max Warnings: 0
//   - Max Errors: 0
//   - Any violation blocks the CI/CD pipeline
// =============================================================================

/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  plugins: [
    '@typescript-eslint',
    'import',
    'react',
    'react-hooks',
    'jsx-a11y',
    'security',
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'plugin:security/recommended',
    'prettier',
  ],
  settings: {
    react: {
      version: 'detect',
    },
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
      },
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
  },
  env: {
    browser: true,
    node: true,
    es2022: true,
    jest: true,
  },
  rules: {
    // =========================================================================
    // ZERO TOLERANCE RULES — These MUST never be violated
    // =========================================================================
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unsafe-assignment': 'error',
    '@typescript-eslint/no-unsafe-call': 'error',
    '@typescript-eslint/no-unsafe-member-access': 'error',
    '@typescript-eslint/no-unsafe-return': 'error',
    '@typescript-eslint/no-unsafe-argument': 'error',
    '@typescript-eslint/no-unsafe-enum-comparison': 'error',
    '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/no-misused-promises': 'error',
    '@typescript-eslint/await-thenable': 'error',
    '@typescript-eslint/no-for-in-array': 'error',
    'no-console': 'error', // Use proper structured logging (winston/pino)
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-new-func': 'error',
    'no-new-wrappers': 'error',
    'no-var': 'error',
    'prefer-const': ['error', { destructuring: 'all' }],
    'no-duplicate-imports': 'error',
    'no-unused-expressions': ['error', { allowShortCircuit: true, allowTernary: true, allowTaggedTemplates: true }],
    'no-unused-vars': 'off', // Handled by TypeScript
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    'no-shadow': 'off', // Handled by TypeScript
    '@typescript-eslint/no-shadow': ['error', { hoist: 'all' }],
    'no-throw-literal': 'error',
    'no-return-await': 'error',
    'no-async-promise-executor': 'error',
    'no-promise-executor-return': 'error',

    // =========================================================================
    // IMPORT RULES — Enforce clean dependency graph
    // =========================================================================
    'import/no-cycle': ['error', { maxDepth: Infinity }],
    'import/no-duplicates': 'error',
    'import/no-self-import': 'error',
    'import/no-useless-path-segments': ['error', { noUselessIndex: true }],
    'import/no-deprecated': 'warn',
    'import/export': 'error',
    'import/first': 'error',
    'import/newline-after-import': ['error', { count: 1 }],
    'import/no-absolute-path': 'error',
    'import/no-dynamic-require': 'error',
    'import/no-webpack-loader-syntax': 'error',
    'import/no-amd': 'error',
    'import/no-commonjs': 'error',
    'import/order': [
      'error',
      {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'type'],
        'newlines-between': 'always',
        alphabetize: { order: 'asc', caseInsensitive: true },
        distinctGroup: false,
      },
    ],
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx', '**/tests/**', '**/__tests__/**'],
        optionalDependencies: false,
      },
    ],
    'import/prefer-default-export': 'off',

    // =========================================================================
    // REACT RULES — Enforce best practices for React components
    // =========================================================================
    'react/prop-types': 'off', // Use TypeScript for prop types
    'react/display-name': ['error', { ignoreTranspilerName: false }],
    'react-hooks/exhaustive-deps': 'error',
    'react-hooks/rules-of-hooks': 'error',
    'react/jsx-uses-react': 'off',
    'react/react-in-jsx-scope': 'off',
    'react/jsx-no-useless-fragment': ['error', { allowExpressions: true }],
    'react/jsx-curly-brace-presence': ['error', { props: 'never', children: 'never', propElementValues: 'always' }],
    'react/jsx-fragments': ['error', 'syntax'],
    'react/no-array-index-key': 'warn',
    'react/no-danger': 'error',
    'react/no-unescaped-entities': 'error',
    'react/prefer-read-only-props': 'error',

    // =========================================================================
    // SECURITY RULES — Prevent common security vulnerabilities
    // =========================================================================
    'security/detect-object-injection': 'warn',
    'security/detect-non-literal-fs-filename': 'error',
    'security/detect-unsafe-regex': 'error',
    'security/detect-no-csrf-before-method-override': 'error',
    'security/detect-possible-timing-attacks': 'error',
    'security/detect-buffer-noassert': 'error',
    'security/detect-child-process': 'error',
    'security/detect-disable-mustache-escape': 'error',
    'security/detect-eval-with-expression': 'error',
    'security/detect-new-buffer': 'error',
    'security/detect-non-literal-regexp': 'error',
    'security/detect-non-literal-require': 'error',
    'security/detect-pseudoRandomBytes': 'warn',
    'security/detect-unsafe-regex': 'error',

    // =========================================================================
    // CODE COMPLEXITY — Keep code simple and maintainable
    // =========================================================================
    'max-lines': ['error', { max: 300, skipBlankLines: true, skipComments: true }],
    'max-lines-per-function': ['error', { max: 50, skipBlankLines: true, skipComments: true }],
    'complexity': ['error', { max: 10 }],
    'max-depth': ['error', { max: 4 }],
    'max-nested-callbacks': ['error', { max: 3 }],
    'max-params': ['error', { max: 5 }],
    'max-classes-per-file': ['error', { max: 1 }],
    'max-statements': ['error', { max: 30 }],
    'max-statements-per-line': ['error', { max: 1 }],

    // =========================================================================
    // NAMING CONVENTIONS — Consistent and descriptive naming
    // =========================================================================
    '@typescript-eslint/naming-convention': [
      'error',
      {
        selector: 'default',
        format: ['camelCase'],
        leadingUnderscore: 'allow',
        trailingUnderscore: 'forbid',
      },
      {
        selector: 'typeLike',
        format: ['PascalCase'],
      },
      {
        selector: 'variable',
        format: ['camelCase', 'UPPER_CASE'],
        leadingUnderscore: 'allow',
      },
      {
        selector: 'memberLike',
        format: ['camelCase'],
        leadingUnderscore: 'allow',
      },
      {
        selector: 'memberLike',
        modifiers: ['private'],
        format: ['camelCase'],
        leadingUnderscore: 'require',
      },
      {
        selector: 'function',
        format: ['camelCase'],
      },
      {
        selector: 'enumMember',
        format: ['UPPER_CASE', 'PascalCase'],
      },
      {
        selector: 'interface',
        format: ['PascalCase'],
        prefix: ['I'],
      },
      {
        selector: 'typeParameter',
        format: ['PascalCase'],
        prefix: ['T'],
      },
    ],

    // =========================================================================
    // BEST PRACTICES — Enforce modern JavaScript/TypeScript patterns
    // =========================================================================
    'eqeqeq': ['error', 'always', { null: 'ignore' }],
    'curly': ['error', 'all'],
    'no-else-return': ['error', { allowElseIf: false }],
    'no-nested-ternary': 'error',
    'prefer-template': 'error',
    'prefer-arrow-callback': 'error',
    'prefer-destructuring': ['error', { object: true, array: false }],
    'prefer-object-spread': 'error',
    'prefer-nullish-coalescing': 'error',
    'prefer-optional-chaining': 'error',
    'prefer-exponentiation-operator': 'error',
    'prefer-numeric-literals': 'error',
    'prefer-spread': 'error',
    'prefer-rest-params': 'error',
    'prefer-object-has-own': 'error',
    'require-await': 'error',
    'no-return-assign': ['error', 'except-parens'],
    'no-extend-native': 'error',
    'no-extra-bind': 'error',
    'no-extra-label': 'error',
    'no-labels': 'error',
    'no-lone-blocks': 'error',
    'no-multi-str': 'error',
    'no-new': 'error',
    'no-proto': 'error',
    'no-redeclare': 'off', // Handled by TypeScript
    'no-sequences': 'error',
    'no-script-url': 'error',
    'no-self-compare': 'error',
    'no-void': 'error',
    'yoda': ['error', 'never', { exceptRange: true }],
    'radix': 'error',
    'spaced-comment': ['error', 'always', { markers: ['/'] }],
    'no-template-curly-in-string': 'error',
    'no-unneeded-ternary': 'error',
    'no-warning-comments': ['warn', { terms: ['TODO', 'FIXME', 'HACK', 'XXX'], location: 'start' }],

    // =========================================================================
    // TYPESCRIPT-SPECIFIC BEST PRACTICES
    // =========================================================================
    '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
    '@typescript-eslint/consistent-type-exports': ['error', { fixMixedExportsWithInlineTypeSpecifier: false }],
    '@typescript-eslint/explicit-function-return-type': ['error', { allowExpressions: true, allowTypedFunctionExpressions: true }],
    '@typescript-eslint/explicit-module-boundary-types': 'error',
    '@typescript-eslint/consistent-type-assertions': ['error', { assertionStyle: 'as', objectLiteralTypeAssertions: 'allow' }],
    '@typescript-eslint/no-array-constructor': 'error',
    '@typescript-eslint/no-empty-interface': 'error',
    '@typescript-eslint/no-extra-non-null-assertion': 'error',
    '@typescript-eslint/no-inferrable-types': 'error',
    '@typescript-eslint/no-misused-new': 'error',
    '@typescript-eslint/no-non-null-asserted-optional-chain': 'error',
    '@typescript-eslint/no-non-null-assertion': 'error',
    '@typescript-eslint/no-this-alias': 'error',
    '@typescript-eslint/no-unnecessary-type-assertion': 'error',
    '@typescript-eslint/no-unnecessary-type-constraint': 'error',
    '@typescript-eslint/prefer-as-const': 'error',
    '@typescript-eslint/prefer-enum-keytypes': 'error',
    '@typescript-eslint/prefer-for-of': 'error',
    '@typescript-eslint/prefer-function-type': 'error',
    '@typescript-eslint/prefer-includes': 'error',
    '@typescript-eslint/prefer-namespace-keyword': 'error',
    '@typescript-eslint/prefer-nullish-coalescing': 'error',
    '@typescript-eslint/prefer-optional-chain': 'error',
    '@typescript-eslint/prefer-readonly': 'error',
    '@typescript-eslint/prefer-reduce-type-parameter': 'error',
    '@typescript-eslint/prefer-string-starts-ends-with': 'error',
    '@typescript-eslint/prefer-ts-expect-error': 'error',
    '@typescript-eslint/require-array-sort-compare': 'error',
    '@typescript-eslint/switch-exhaustiveness-check': 'error',
    '@typescript-eslint/use-unknown-in-catch-callback-variable': 'error',

    // =========================================================================
    // ACCESSIBILITY RULES — WCAG 2.1 AA compliance
    // =========================================================================
    'jsx-a11y/alt-text': 'error',
    'jsx-a11y/anchor-has-content': 'error',
    'jsx-a11y/anchor-is-valid': 'error',
    'jsx-a11y/aria-activedescendant-has-tabindex': 'error',
    'jsx-a11y/aria-props': 'error',
    'jsx-a11y/aria-proptypes': 'error',
    'jsx-a11y/aria-role': 'error',
    'jsx-a11y/aria-unsupported-elements': 'error',
    'jsx-a11y/click-events-have-key-events': 'error',
    'jsx-a11y/control-has-associated-label': ['error', { ignoreElements: ['audio', 'video'] }],
    'jsx-a11y/heading-has-content': 'error',
    'jsx-a11y/html-has-lang': 'error',
    'jsx-a11y/img-redundant-alt': 'error',
    'jsx-a11y/interactive-supports-focus': 'error',
    'jsx-a11y/label-has-associated-control': 'error',
    'jsx-a11y/lang': 'error',
    'jsx-a11y/media-has-caption': 'error',
    'jsx-a11y/mouse-events-have-key-events': 'error',
    'jsx-a11y/no-access-key': 'error',
    'jsx-a11y/no-autofocus': 'error',
    'jsx-a11y/no-distracting-elements': 'error',
    'jsx-a11y/no-interactive-element-to-noninteractive-role': 'error',
    'jsx-a11y/no-noninteractive-element-to-interactive-role': 'error',
    'jsx-a11y/no-noninteractive-tabindex': 'error',
    'jsx-a11y/no-redundant-roles': 'error',
    'jsx-a11y/role-has-required-aria-props': 'error',
    'jsx-a11y/role-supports-aria-props': 'error',
    'jsx-a11y/scope': 'error',
    'jsx-a11y/tabindex-no-positive': 'error',
  },

  // ===========================================================================
  // OVERRIDES — Relaxed rules for specific file types
  // ===========================================================================
  overrides: [
    {
      // Test files — relax complexity and length rules
      files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx'],
      rules: {
        'max-lines-per-function': 'off',
        'max-lines': 'off',
        'max-depth': 'off',
        'max-nested-callbacks': 'off',
        'max-statements': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
        'no-console': 'off',
      },
    },
    {
      // Configuration files — relax import and complexity rules
      files: [
        '*.config.js',
        '*.config.ts',
        '*.config.mjs',
        '.eslintrc.js',
        'jest.config.ts',
        'vitest.config.ts',
      ],
      rules: {
        'max-lines': 'off',
        'max-lines-per-function': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
      },
    },
    {
      // Story files
      files: ['**/*.stories.tsx', '**/*.story.tsx'],
      rules: {
        'max-lines': 'off',
        'max-lines-per-function': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
      },
    },
    {
      // Migration files
      files: ['**/migrations/**'],
      rules: {
        'max-lines': 'off',
        'max-lines-per-function': 'off',
        'complexity': 'off',
        'no-console': 'warn',
      },
    },
    {
      // Type declaration files
      files: ['**/*.d.ts'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        'max-lines': 'off',
      },
    },
  ],

  // ===========================================================================
  // IGNORE PATTERNS
  // ===========================================================================
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'build/',
    '.next/',
    '.nuxt/',
    'coverage/',
    '*.min.js',
    '*.bundle.js',
    'vendor/',
    'public/',
    'scripts/',
  ],
};
