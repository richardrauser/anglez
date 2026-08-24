import mantine from 'eslint-config-mantine';
import tseslint from 'typescript-eslint';
import next from '@next/eslint-plugin-next';
import reactHooks from 'eslint-plugin-react-hooks';
import jest from 'eslint-plugin-jest';
import testingLibrary from 'eslint-plugin-testing-library';

export default tseslint.config(
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'contract/**',
      'next-env.d.ts',
      // Config files are plain CommonJS/ESM and are not part of the typed project.
      '**/*.cjs',
      '**/*.mjs',
      '**/*.js',
    ],
  },

  ...mantine,

  {
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        // Without this the project path resolves relative to eslint-config-mantine
        // rather than the repo root.
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  // Next.js rules. The plugin's flat config carries its own `plugins` entry, so it is
  // spread rather than registered by hand.
  next.configs['core-web-vitals'],

  reactHooks.configs.flat['recommended-latest'],

  {
    rules: {
      // The new JSX transform means React need not be in scope.
      'react/react-in-jsx-scope': 'off',
      // A symmetrical if/else-if chain reads better than a run of bare ifs, even when
      // every branch returns and the `else` is technically redundant.
      'no-else-return': 'off',
      // Function declarations hoist, so calling one defined lower in the file is fine and
      // is how the renderer in src/anglez.ts is laid out. Still enforced for variables.
      '@typescript-eslint/no-use-before-define': ['error', { functions: false }],
      // The app logs deliberately throughout; these are informational, not leftovers.
      'no-console': 'off',
      // Underscore-prefixed arguments are deliberately unused - route handlers have to
      // accept `request` positionally to reach `params`.
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      // New in eslint-plugin-react-hooks 7 and aimed at React Compiler readiness. It
      // fires on patterns that are correct here - the SSR hydration guard in
      // ConnectButton (see the comment there; getting it wrong caused a real bug) and
      // ordinary fetch-on-mount effects. Left visible as warnings rather than disabled,
      // but rewriting them is a refactor in its own right, not part of a lint upgrade.
      'react-hooks/set-state-in-effect': 'warn',
    },
  },

  {
    files: ['**/?(*.)+(spec|test).[jt]s?(x)'],
    ...jest.configs['flat/recommended'],
    ...testingLibrary.configs['flat/react'],
  }
);
