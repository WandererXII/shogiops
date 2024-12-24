import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      'linebreak-style': ['error', 'unix'],
      eqeqeq: ['error', 'always'],
      'no-irregular-whitespace': 'off',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/consistent-type-exports': 'error',
      '@typescript-eslint/no-empty-function': 'error',
      '@typescript-eslint/no-unnecessary-condition': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/strict-boolean-expressions': [
        'error',
        { allowNullableBoolean: true, allowNumber: false },
      ],
    },
    files: ['src/**/*.ts', 'test/**/*.ts'],
  },
  {
    ignores: ['eslint.config.mjs', 'vitest.config.ts', 'test/vitest.d.ts', 'dist', 'docs'],
  }
);
