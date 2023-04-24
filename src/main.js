import Vue from 'vue';
import App from '@/components/App';
import router from '@/router';
import store from '@/store';
import vuetify from '@/plugins/vuetify';

Vue.config.productionTip = false;

export default new Vue({
    render: (h) => h(App),
    router,
    store,
    vuetify
}).$mount('#app');
