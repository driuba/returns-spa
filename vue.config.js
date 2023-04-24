const { defineConfig } = require('@vue/cli-service');

module.exports = defineConfig({
    pages: {
        app: {
            entry: 'src/main.js',
            excludeChunks: ['silent-renew-oidc'],
            filename: 'index.html',
            template: 'public/index.html'
        },
        silentRenewOidc: {
            entry: 'src/silent-renew-oidc.js',
            excludeChunks: ['app'],
            filename: 'silent-renew-oidc.html',
            template: 'public/silent-renew-oidc.html'
        }
    },
    transpileDependencies: ['vuetify'],
    lintOnSave: false
});
