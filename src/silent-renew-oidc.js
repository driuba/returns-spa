import oidcSettings from '@/config/oidc';
import 'core-js/es/promise';
import { vuexOidcProcessSilentSignInCallback } from 'vuex-oidc';

// noinspection JSIgnoredPromiseFromCall
vuexOidcProcessSilentSignInCallback(oidcSettings);
