module.exports = {
  env: {
    browser: true,
    es6: true,
  },
  parserOptions: {
    ecmaFeatures: {
      experimentalObjectRestSpread: true,
      jsx: true,
    },
    sourceType: 'module',
  },
  extends: ['eslint:recommended', 'airbnb', 'plugin:react-hooks/recommended', 'prettier'],
  overrides: [
    // Override for test files to support jest syntax
    {
      files: ['**/*.test.js', '**/*.test.jsx'],
      env: { jest: true },
      plugins: ['jest'],
    },
  ],
  rules: {
    'react/prop-types': 'warn',
    'jsx-a11y/label-has-for': 'off', // this rule was deprecated.
    'react/jsx-props-no-spreading': 'off',
    'react/jsx-filename-extension': ['error', { extensions: ['.jsx', '.tsx'] }],
    'max-len': 'warn',
    'react-hooks/exhaustive-deps': 'warn',
    'react/jsx-indent': 'off', // prettier handles
    'react/jsx-wrap-multilines': 'off', // prettier handles
  },
};
