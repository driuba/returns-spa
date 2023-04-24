import { oidcAuthorize } from './auth';
import OidcCallback from '@/components/oidc/OidcCallback';
import OidcCallbackError from '@/components/oidc/OidcCallbackError';
import store from '@/store';
import Vue from 'vue';
import VueRouter from 'vue-router';

Vue.use(VueRouter);

const router = new VueRouter({
    base: process.env.BASE_URL,
    mode: 'history',
    routes: [
        {
            component: OidcCallback,
            meta: {
                isPublic: true
            },
            name: 'OidcCallback',
            path: '/oidc-callback'
        },
        {
            component: OidcCallbackError,
            meta: {
                isPublic: true
            },
            name: 'OidcCallbackError',
            path: '/oidc-callback-error'
        },
        {
            path: '*',
            redirect: '/'
        }
    ]
});

router.beforeEach(oidcAuthorize(store, 'oidcStore'));

export default router;
