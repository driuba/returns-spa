<template>
    <Dialog
        :actions="actions"
        :title="title"
        :visible="visible"
        @close="handleClose"
        scrollable
    >
        <v-data-table
            :items="messages"
            :items-per-page="-1"
            hide-default-footer
            hide-default-header
        >
            <template #item="{ item }">
                <tr>
                    <td>{{ item }}</td>
                </tr>
            </template>
        </v-data-table>
    </Dialog>
</template>

<script>
    import { Dialog } from '@/components/dialogs';

    export default {
        name: 'NotificationList',
        components: { Dialog },
        data() {
            return {
                actions: [
                    {
                        handleClick: this.handleClose,
                        label: 'Close'
                    }
                ],
                messages: [],
                title: '',
                visible: false
            };
        },
        created() {
            this.$root.$on('showMessages', this.handleShow);
        },
        methods: {
            handleClose() {
                this.messages = [];
                this.title = '';
                this.visible = false;
            },
            handleShow(messages, title) {
                this.messages = messages;
                this.title = title;
                this.visible = true;
            }
        }
    };
</script>
