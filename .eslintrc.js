module.exports = {
  env: {
    node: true,
    es2022: true,
    mocha: true
  },
  extends: [
    'standard'
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: {
    // Allow console.log for CLI output
    'no-console': 'off',
    
    // Prefer const/let over var
    'no-var': 'error',
    'prefer-const': 'error',
    
    // Modern syntax preferences
    'prefer-arrow-callback': 'error',
    'prefer-template': 'error',
    
    // Async/await preferences
    'prefer-promise-reject-errors': 'error',
    
    // Import/export
    'import/no-unresolved': 'off', // Node.js handles this
    
    // Semicolons (optional, based on preference)
    'semi': ['error', 'always'],
    
    // Spacing and formatting
    'space-before-function-paren': ['error', {
      'anonymous': 'always',
      'named': 'never',
      'asyncArrow': 'always'
    }]
  },
  overrides: [
    {
      files: ['test-es6/**/*.js'],
      env: {
        mocha: true
      },
      rules: {
        // Allow function expressions in tests
        'prefer-arrow-callback': 'off'
      }
    }
  ]
};