module.exports = {
  extends: ['mantine', 'plugin:@next/next/recommended', 'plugin:jest/recommended'],
  plugins: ['testing-library', 'jest'],
  overrides: [
    {
      files: ['**/?(*.)+(spec|test).[jt]s?(x)'],
      extends: ['plugin:testing-library/react'],
    },
  ],
  parserOptions: {
    project: './tsconfig.json',
  },
  rules: {
    'react/react-in-jsx-scope': 'off',
    'import/extensions': 'off',
    // An ES5-era airbnb rule about `var` hoisting. `no-var` already covers the same
    // declarations, and more usefully.
    'vars-on-top': 'off',
    // Require === everywhere except against null, where `x != null` is the idiomatic
    // way to test "neither null nor undefined" and is meant to be loose.
    eqeqeq: ['error', 'always', { null: 'ignore' }],
    // airbnb uses this to ban for..of on the grounds that it needs regenerator-runtime.
    // That reasoning is for ES5 build targets and does not apply here.
    'no-restricted-syntax': 'off',
    // Function declarations hoist, so calling one defined lower in the file is fine and
    // is how the renderer in src/anglez.ts is laid out. Still enforced for variables.
    '@typescript-eslint/no-use-before-define': ['error', { functions: false }],
    // `i++` as a for-loop afterthought is idiomatic; the rule is aimed at its use as an
    // expression, where the pre/post distinction is easy to misread.
    'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],
  },
};
