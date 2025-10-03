const { FlatCompat } = require('@eslint/eslintrc');

const compat = new FlatCompat();

module.exports = [
  ...compat.extends('next/core-web-vitals'), // Convierte configuraciones antiguas
  {
    files: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'],
    languageOptions: {
      ecmaVersion: 2021, // Especifica la versión de ECMAScript
      sourceType: 'module', // Indica que estás usando módulos ES
    },
    rules: {
      'react/react-in-jsx-scope': 'off', // No requiere importar React en Next.js
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-console': 'warn',
    },
  },
];
