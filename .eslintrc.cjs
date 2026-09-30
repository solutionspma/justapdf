module.exports = {
  env: { es2022: true, node: true, browser: true, jest: false },
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  ignorePatterns: [
    'node_modules/**', 'tools/**', 'docs/**', 'PDF4QT-master/**', 'pdfium-binaries-master/**',
    'pdf-power-editor/**', 'public/editor/**', 'public/assets/**', 'dist/**', 'var/**'
  ],
  rules: {
    'no-undef': 'error',
    'no-unused-vars': ['warn', { args: 'none', ignoreRestSiblings: true }],
    'no-console': 'off'
  }
};
