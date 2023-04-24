import oidcSettings from '@/config/oidc';
import Vue from 'vue';
import Vuex from 'vuex';
import { vuexOidcCreateStoreModule } from 'vuex-oidc';

Vue.use(Vuex);

export default new Vuex.Store({
    modules: {
        oidcStore: vuexOidcCreateStoreModule(oidcSettings, {
            namespaced: true
        })
    }
});
