import App from '@/components/App';
import { companyId, errorHandler } from '@/mixins';
import vuetify from '@/plugins/vuetify';
import router from '@/router';
import store from '@/store';
import Vue from 'vue';

Vue.config.productionTip = false;

const app = new Vue({
    render: (h) => h(App),
    router,
    store,
    vuetify,
    mixins: [companyId, errorHandler]
}).$mount('#app');

export default app;
