import typescriptEslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import importPlugin from 'eslint-plugin-import';

export default [
  ...typescriptEslint.configs.recommended,
  {
    ignores: [
      'build/**', 
      '.react-router/**', 
      'public/**', 
      'app/components/ui/**',
      'node_modules/**',
      '*.config.js',
      '*.config.ts',
      '*.config.mjs',
      '*.config.cjs',
    ],
  },
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      react,
      'react-hooks': reactHooks,
      import: importPlugin,
    },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off', // React 17+ doesn't need this
      "@typescript-eslint/no-unused-vars": [
      "warn",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^_",
        destructuredArrayIgnorePattern: "^_",
      },
      ],
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    languageOptions: {
      parser: typescriptEslint.parser,
      parserOptions: {
        project: './tsconfig.json',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
  },
];
