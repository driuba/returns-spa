const { defineConfig } = require('@vue/cli-service');

module.exports = defineConfig({
    devServer: {
        server: {
            type: 'https'
        }
    },
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
    transpileDependencies: ['vuetify']
});
