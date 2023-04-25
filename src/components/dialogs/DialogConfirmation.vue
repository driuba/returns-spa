<template>
    <Dialog
        v-bind="$attrs"
        :actions="actions"
        :loading="loading"
        :max-width="maxWidth"
        :visible="visible"
        persistent
        title="Confirm"
    >
        <slot>
            {{ content }}
        </slot>
    </Dialog>
</template>

<script>
    import Dialog from './Dialog';

    export default {
        name: 'DialogConfirmation',
        components: { Dialog },
        props: {
            content: {
                default: '',
                type: String
            },
            loading: {
                default: false,
                type: Boolean
            },
            maxWidth: {
                default: 290,
                type: [Number, String]
            },
            visible: {
                required: true,
                type: Boolean
            }
        },
        data() {
            return {
                actions: [
                    {
                        handleClick: this.handleCancel,
                        label: 'Cancel'
                    },
                    {
                        handleClick: this.handleConfirm,
                        label: 'Confirm'
                    }
                ]
            };
        },
        methods: {
            handleCancel() {
                this.$emit('cancel');
            },
            handleConfirm() {
                this.$emit('confirm');
            }
        }
    };
</script>
