<template>
    <v-snackbar
        v-model="visible"
        :color="type"
        :timeout="10000"
        multi-line
        top
    >
        <template #action>
            <v-btn
                @click="visible = false"
                color="white"
                icon
            >
                <v-icon>close</v-icon>
            </v-btn>
        </template>

        <v-row align="center" justify="center" no-gutters>
            <v-col cols="1">
                <v-icon dark>{{ icon }}</v-icon>
            </v-col>

            <v-col class="ml-1">
                <span class="message">{{ message }}</span>
            </v-col>
        </v-row>
    </v-snackbar>
</template>

<script>
    import { type as messageType } from '@/enums/message';

    export default {
        name: 'Notification',
        data() {
            return {
                icon: null,
                message: null,
                type: null,
                visible: false
            };
        },
        created() {
            this.$root.$on('showMessage', this.handleShowMessage);
        },
        methods: {
            handleShowMessage(message, type) {
                this.message = message;
                this.visible = true;
                this.type = type || messageType.INFO;

                switch (this.type) {
                    case messageType.ERROR: {
                        this.icon = 'cancel';

                        break;
                    }
                    case messageType.SUCCESS: {
                        this.icon = 'check_circle';

                        break;
                    }
                    case messageType.INFO:
                    default: {
                        this.icon = 'info';

                        break;
                    }
                }
            }
        }
    };
</script>

<style scoped>
.message {
    word-break: break-word;
}
</style>
