import { type } from '@/enums/message';

export default {
    methods: {
        handleError(error) {
            if (error.response && error.response.data && error.response.data.Message) {
                this.$root.$emit('showMessage', error.response.data.Message, type.ERROR);

                if (error.response.data.Messages && error.response.data.Messages.length) {
                    this.$root.$emit('showMessages', error.response.data.Messages, 'Inner errors');
                }
            } else if (error.message) {
                this.$root.$emit('showMessage', error.message, type.ERROR);
            } else {
                this.$root.$emit('showMessage', error, type.ERROR);
            }
        }
    }
};
