module.exports = {
    root: true,
    env: {
        node: true
    },
    extends: [
        'plugin:vue/essential',
        'eslint:recommended'
    ],
    parserOptions: {
        parser: '@babel/eslint-parser'
    },
    rules: {
        'comma-dangle': [
            'warn',
            'never'
        ],
        'no-unused-vars': 'warn',
        quotes: [
            'warn',
            'single',
            {
                avoidEscape: false
            }
        ],
        semi: 'warn',
        'vue/html-indent': [
            'warn',
            4,
            {
                baseIndent: 1
            }
        ],
        'vue/html-quotes': [
            'warn',
            'double',
            {
                avoidEscape: false
            }
        ],
        'vue/multi-word-component-names': [
            'warn',
            {
                ignores: ['Dialog', 'Home', 'Notification', 'Return', 'Returns']
            }
        ],
        'vue/no-unused-components': 'warn',
        'vue/script-indent': [
            'warn',
            4,
            {
                baseIndent: 1,
                switchCase: 1
            }
        ],
        'vue/valid-v-slot': [
            'error',
            {
                allowModifiers: true
            }
        ]
    }
};
