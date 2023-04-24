import Vue from 'vue';
import Vuetify from 'vuetify/lib/framework';

Vue.use(Vuetify);

export default new Vuetify({
    icons: {
        iconfont: 'md'
    },
    theme: {
        themes: {
            light: {
                accent: '#82B1FF',
                error: '#FF5252',
                info: '#2196F3',
                primary: '#B71C1C',
                secondary: '#757575',
                success: '#4CAF50',
                warning: '#FFC107'
            }
        }
    }
});
