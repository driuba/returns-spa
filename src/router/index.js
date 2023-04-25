import FeeConfigurations from '@/components/feeConfigurations';
import Home from '@/components/Home';
import OidcCallback from '@/components/oidc/OidcCallback';
import OidcCallbackError from '@/components/oidc/OidcCallbackError';
import role from '@/enums/role';
import store from '@/store';
import Vue from 'vue';
import VueRouter from 'vue-router';
import { oidcAuthorize } from './auth';

Vue.use(VueRouter);

const router = new VueRouter({
    base: process.env.BASE_URL,
    mode: 'history',
    routes: [
        {
            component: Home,
            name: 'Home',
            path: '/'
        },
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
            component: Home,
            name: 'HomeCompany',
            path: '/:companyId'
        },
        {
            component: FeeConfigurations,
            name: 'FeeConfigurations',
            meta: {
                roles: [role.ADMIN]
            },
            path: '/:companyId/feeConfigurations'
        },
        {
            path: '*',
            redirect: '/'
        }
    ]
});

router.beforeEach(oidcAuthorize(store, 'oidcStore'));

export default router;
