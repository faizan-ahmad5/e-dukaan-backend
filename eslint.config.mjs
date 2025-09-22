import js from '@eslint/js';
import security from 'eslint-plugin-security';

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        // Node.js globals
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        global: 'readonly',
        require: 'readonly',
        module: 'readonly',
        exports: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
        
        // Testing globals
        jest: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        
        // MongoDB globals (for scripts)
        db: 'readonly',
        print: 'readonly'
      }
    },
    plugins: {
      security
    },
    rules: {
      // Relaxed rules for existing codebase
      'no-console': 'off', // Allow console statements
      'no-unused-vars': ['warn', { 
        'argsIgnorePattern': '^_|^req|^res|^next|^error|^err|^header|^page|^promise|^expectedStatus',
        'varsIgnorePattern': '^_|^testConfig|^userToken|^rateLimitedResponses|^paymentResult|^protect|^isAdmin|^resendVerificationEmail|^mockNext|^jwt|^bcryptjs'
      }],
      'no-undef': 'error',
      'no-underscore-dangle': 'off',
      'consistent-return': 'off',
      'no-param-reassign': ['error', { props: false }],
      'prefer-destructuring': 'off', // Disabled for existing code
      'class-methods-use-this': 'off',
      'no-await-in-loop': 'off',
      'no-useless-escape': 'warn',
      'no-dupe-keys': 'warn', // Warning instead of error
      
      // Security rules (mostly warnings to avoid breaking existing code)
      'security/detect-object-injection': 'off',
      'security/detect-non-literal-fs-filename': 'off',
      'security/detect-non-literal-require': 'off',
      'security/detect-child-process': 'off',
      'security/detect-eval-with-expression': 'error',
      'security/detect-unsafe-regex': 'warn',
      'security/detect-buffer-noassert': 'warn',
      'security/detect-disable-mustache-escape': 'warn',
      'security/detect-no-csrf-before-method-override': 'off',
      'security/detect-possible-timing-attacks': 'off',
      'security/detect-pseudoRandomBytes': 'warn'
    }
  },
  {
    files: ['scripts/mongo-init.js'],
    languageOptions: {
      globals: {
        // MongoDB shell globals
        db: 'writable',
        print: 'readonly'
      }
    },
    rules: {
      'no-global-assign': 'off',
      'no-implicit-globals': 'off'
    }
  },
  {
    files: ['tests/**/*.mjs', 'tests/**/*.js'],
    rules: {
      'no-console': 'off',
      'prefer-arrow-callback': 'off',
      'func-names': 'off',
      'no-unused-vars': 'off' // Very lenient for test files
    }
  },
  {
    files: ['server.mjs', 'scripts/**/*.mjs', 'config/**/*.mjs'],
    rules: {
      'no-console': 'off'
    }
  },
  {
    files: ['playwright.config.mjs'],
    rules: {
      'no-dupe-keys': 'off' // Allow duplicate keys in Playwright config
    }
  },
  {
    ignores: [
      'node_modules/',
      'coverage/',
      'test-results/',
      'playwright-report/',
      'dist/',
      'build/',
      'logs/',
      'uploads/',
      '.env*',
      '*.log'
    ]
  }
];