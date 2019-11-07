module.exports = {
    env: {
        node: true,
        es6: true,
    },
    extends: [
        'eslint:recommended'
    ],
    parserOptions: {
        ecmaVersion: 2018,
        sourceType: 'module',
    },
    rules: {
        'linebreak-style': ['error', 'unix'],
        semi: ['error', 'always'],
        quotes: ['error', 'single'],
        'comma-dangle': ['error', 'always-multiline'],
        'no-prototype-builtins': 'off',
    },
};
