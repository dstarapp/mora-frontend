module.exports = {
    root: true,
    env: {
        node: true,
        es2020: true,
    },
    extends: ['plugin:vue/vue3-essential', 'eslint:recommended', '@vue/typescript/recommended'],
    parserOptions: {
        ecmaVersion: 2020,
    },
    settings: {
        'import/resolver': {
            alias: {
                map: [['@', 'frontend']],
                extensions: ['.tsx', '.ts', '.jsx', '.js'],
            },
        },
    },
};
