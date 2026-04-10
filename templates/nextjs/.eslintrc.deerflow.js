/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,

  parser: '@typescript-eslint/parser',

  parserOptions: {
    ecmaVersion: 'latest',
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
    'jsdoc',
    'security',
    'sonarjs',
    'boundaries',
    'prettier',
  ],

  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'plugin:jsdoc/recommended',
    'plugin:security/recommended',
    'plugin:sonarjs/recommended',
    'prettier',
  ],

  settings: {
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
      },
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
    'import/external-module-folders': ['node_modules'],
    boundaries: {
      elements: [
        {
          type: 'components',
          pattern: 'src/components/*',
          mode: 'file',
        },
        {
          type: 'pages',
          pattern: 'src/app/**/page.tsx',
          mode: 'file',
        },
        {
          type: 'layouts',
          pattern: 'src/components/layout/*',
          mode: 'file',
        },
        {
          type: 'hooks',
          pattern: 'src/lib/hooks/*',
          mode: 'file',
        },
        {
          type: 'services',
          pattern: 'src/services/*',
          mode: 'file',
        },
        {
          type: 'utils',
          pattern: 'src/lib/utils/*',
          mode: 'file',
        },
        {
          type: 'stores',
          pattern: 'src/stores/*',
          mode: 'file',
        },
      ],
    },
  },

  rules: {
    // ─── TypeScript Strict Rules ────────────────────────────────
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      },
    ],
    '@typescript-eslint/explicit-function-return-type': [
      'error',
      {
        allowExpressions: true,
        allowTypedFunctionExpressions: true,
        allowHigherOrderFunctions: true,
      },
    ],
    '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/no-misused-promises': 'error',
    '@typescript-eslint/await-thenable': 'error',
    '@typescript-eslint/prefer-nullish-coalescing': 'error',
    '@typescript-eslint/prefer-optional-chain': 'error',
    '@typescript-eslint/consistent-type-imports': [
      'error',
      { prefer: 'type-imports' },
    ],
    '@typescript-eslint/no-non-null-assertion': 'error',
    '@typescript-eslint/switch-exhaustiveness-check': 'error',
    '@typescript-eslint/naming-convention': [
      'error',
      {
        selector: 'interface',
        format: ['PascalCase'],
      },
      {
        selector: 'typeAlias',
        format: ['PascalCase'],
      },
      {
        selector: 'enum',
        format: ['PascalCase'],
      },
      {
        selector: 'enumMember',
        format: ['PascalCase'],
      },
      {
        selector: 'variable',
        format: ['camelCase', 'UPPER_CASE'],
        leadingUnderscore: 'allow',
      },
      {
        selector: 'function',
        format: ['camelCase'],
      },
      {
        selector: 'parameter',
        format: ['camelCase'],
        leadingUnderscore: 'allow',
      },
    ],

    // ─── Import Rules ───────────────────────────────────────────
    'import/no-cycle': 'error',
    'import/no-duplicates': 'error',
    'import/order': [
      'error',
      {
        groups: [
          'builtin',
          'external',
          'internal',
          ['parent', 'sibling'],
          'index',
          'type',
        ],
        'newlines-between': 'always',
        alphabetize: { order: 'asc', caseInsensitive: true },
      },
    ],
    'import/no-default-export': 'off', // Next.js requires default exports for pages
    'boundaries/element-types': [
      'error',
      {
        default: 'disallow',
        rules: [
          {
            from: 'pages',
            allow: ['components', 'layouts', 'hooks', 'services', 'utils', 'stores'],
          },
          {
            from: 'components',
            allow: ['components', 'hooks', 'utils', 'stores'],
            disallow: ['pages', 'services'],
          },
          {
            from: 'services',
            allow: ['utils'],
            disallow: ['components', 'pages', 'layouts', 'hooks', 'stores'],
          },
          {
            from: 'utils',
            allow: ['utils'],
            disallow: ['components', 'pages', 'layouts', 'hooks', 'services', 'stores'],
          },
          {
            from: 'hooks',
            allow: ['utils', 'services', 'stores'],
            disallow: ['pages'],
          },
        ],
      },
    ],

    // ─── Code Quality (SonarJS) ─────────────────────────────────
    'sonarjs/cognitive-complexity': ['error', 10],
    'sonarjs/no-identical-functions': 'error',
    'sonarjs/no-duplicated-branches': 'error',
    'sonarjs/no-collapsible-if': 'error',
    'sonarjs/no-useless-catch': 'error',
    'sonarjs/prefer-immediate-return': 'error',
    'sonarjs/no-redundant-boolean': 'error',
    'sonarjs/no-collection-size-mischeck': 'error',
    'sonarjs/no-inverted-boolean-check': 'error',

    // ─── Security ───────────────────────────────────────────────
    'security/detect-object-injection': 'warn',
    'security/detect-non-literal-fs-filename': 'warn',

    // ─── JSDoc ──────────────────────────────────────────────────
    'jsdoc/require-jsdoc': [
      'warn',
      {
        contexts: [
          'FunctionDeclaration',
          'MethodDefinition',
          'ClassDeclaration',
          'TSInterfaceDeclaration',
          'TSTypeAliasDeclaration',
          'TSEnumDeclaration',
        ],
        publicOnly: true,
      },
    ],
    'jsdoc/require-description': 'warn',
    'jsdoc/require-param': 'warn',
    'jsdoc/require-param-description': 'warn',
    'jsdoc/require-returns': 'warn',
    'jsdoc/require-returns-description': 'warn',
    'jsdoc/check-tag-names': 'warn',
    'jsdoc/no-types': 'off',

    // ─── Best Practices ─────────────────────────────────────────
    'no-console': ['error', { allow: ['warn', 'error'] }],
    'eqeqeq': ['error', 'always'],
    'curly': ['error', 'all'],
    'max-depth': ['error', { max: 4 }],
    'max-lines-per-function': ['error', { max: 50, skipBlankLines: true, skipComments: true }],
    'complexity': ['error', { max: 10 }],
    'no-nested-ternary': 'error',
    'no-var': 'error',
    'prefer-const': 'error',
    'prefer-arrow-callback': 'error',
    'no-param-reassign': 'error',
    'no-return-await': 'error',

    // ─── Prettier ───────────────────────────────────────────────
    'prettier/prettier': 'error',
  },

  overrides: [
    // ─── Next.js App Router Pages ───────────────────────────────
    {
      files: ['src/app/**/page.tsx', 'src/app/**/layout.tsx', 'src/app/**/loading.tsx'],
      rules: {
        'import/no-default-export': 'off',
      },
    },

    // ─── API Routes ─────────────────────────────────────────────
    {
      files: ['src/app/api/**/*.ts'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'error',
        'security/detect-object-injection': 'off',
      },
    },

    // ─── Test Files ─────────────────────────────────────────────
    {
      files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx'],
      env: {
        jest: true,
        'jest/globals': true,
      },
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        'sonarjs/no-identical-functions': 'off',
        'max-lines-per-function': 'off',
        'jsdoc/require-jsdoc': 'off',
      },
    },

    // ─── Configuration Files ────────────────────────────────────
    {
      files: [
        '*.config.js',
        '*.config.ts',
        '*.config.mjs',
        'tailwind.config.ts',
        'next.config.js',
        'next.config.mjs',
      ],
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
        'import/no-default-export': 'off',
      },
    },

    // ─── Public Directory ───────────────────────────────────────
    {
      files: ['public/**/*'],
      rules: {
        'no-restricted-imports': 'off',
      },
    },
  ],

  ignorePatterns: [
    'node_modules/',
    '.next/',
    'dist/',
    'build/',
    'out/',
    'coverage/',
    '.deerflow/',
    '*.config.js',
    '*.config.mjs',
    'tailwind.config.ts',
  ],
};
