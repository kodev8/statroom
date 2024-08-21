import eslint from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import eslintConfigPrettier from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';
import importPlugin from 'eslint-plugin-import';
import tsParser from '@typescript-eslint/parser';
import globals from 'globals';

export default [
    {
        ignores: [
            '/lib/**/*',
            'node_modules/',
            '**/*.json',
            'dist/',
            'build/',
            '**/*.md',
            '**/*.yml',
            'boot/init.ts',
        ],
    },
    eslint.configs.recommended,
    {
        plugins: {
            import: importPlugin,
            prettier: prettierPlugin,
            '@typescript-eslint': tseslint,
        },
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            parser: tsParser,
            parserOptions: {
                project: ['./tsconfig.json'],
                tsconfigRootDir: '.',
            },
        },
        settings: {
            'import/parsers': {
                '@typescript-eslint/parser': ['.ts', '.tsx'],
            },
            'import/resolver': {
                typescript: {
                    alwaysTryTypes: true,
                    project: './tsconfig.json',
                },
                node: {
                    extensions: ['.js', '.jsx', '.ts', '.tsx'],
                    moduleDirectory: ['node_modules', '.'],
                },
            },
        },
        rules: {
            'no-unused-expressions': ['error', { allowTernary: true }],
            semi: 'error',
            'no-useless-concat': 'error',
            'no-useless-return': 'error',
            'import/no-unresolved': 'error',
            'import/no-named-as-default-member': 'off',
            ...importPlugin.configs.recommended.rules,
            ...prettierPlugin.configs.recommended.rules,
            ...eslintConfigPrettier.rules,
        },
    },
    {
        files: ['**/*.ts'],
        plugins: {
            '@typescript-eslint': tseslint,
        },
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                project: ['./tsconfig.json'],
                sourceType: 'module',
                tsconfigRootDir: '.',
            },
            globals: {
                ...globals.node,
            },
        },
        rules: {
            ...tseslint.configs.recommended.rules,
            ...tseslint.configs.strict.rules,
            'import/no-named-as-default-member': 'off',
            '@typescript-eslint/interface-name-prefix': 'off',
            '@typescript-eslint/explicit-function-return-type': 'error',
            '@typescript-eslint/explicit-module-boundary-types': 'off',
            '@typescript-eslint/no-unused-vars': [
                'warn',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                    caughtErrorsIgnorePattern: '^_',
                },
            ],
            '@typescript-eslint/no-explicit-any': 'off',
            'no-console': 'warn',
            'no-restricted-syntax': [
                'error',
                'ForInStatement',
                'LabeledStatement',
                'WithStatement',
            ],
        },
    },
];
