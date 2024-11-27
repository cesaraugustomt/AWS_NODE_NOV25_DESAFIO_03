import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import parser from '@typescript-eslint/parser';
import prettier from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';
import jestPlugin from 'eslint-plugin-jest';

export default [
  {
    files: ['**/*.{js,mjs,cjs,ts}'],
    languageOptions: {
      parser: parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: globals.node,
      ...globals.jest,
    },
    plugins: {
      '@typescript-eslint': tseslint,
      prettier: prettier,
      jest: jestPlugin,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      ...jestPlugin.configs.recommended.rules,
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_' },
      ],
      'linebreak-style': ['error', 'unix'],
      'prettier/prettier': ['error', { endOfLine: 'auto' }],
    },
  },

  pluginJs.configs.recommended,

  prettierConfig,
];
