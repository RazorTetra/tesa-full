// .eslintrc.js
module.exports = {
    extends: ['next/core-web-vitals'],
    ignorePatterns: ['node_modules/', '.next/'],
    rules: {
      '@next/next/no-html-link-for-pages': 'off',
    }
  }