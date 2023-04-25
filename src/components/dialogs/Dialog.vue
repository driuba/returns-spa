<template>
    <v-dialog
        v-bind="$attrs"
        :max-width="maxWidth"
        :value="visible"
        @input="handleClose"
        @keydown.esc="handleClose"
    >
        <v-card>
            <v-card-title v-show="!!title" class="headline">{{ title }}</v-card-title>

            <v-card-text>
                <slot></slot>
            </v-card-text>

            <v-card-actions>
                <v-spacer></v-spacer>

                <template v-for="action, index in actions">
                    <v-btn
                        :key="index"
                        :loading="loading"
                        @click="action.handleClick"
                        color="primary"
                        text
                        tile
                    >
                        {{ action.label }}
                    </v-btn>
                </template>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
    export default {
        name: 'Dialog',
        props: {
            actions: {
                default: () => [],
                type: Array,
                validator: (actions) => actions.every((action) => action.label && typeof action.handleClick === 'function')
            },
            loading: {
                default: false,
                type: Boolean
            },
            maxWidth: {
                default: 600,
                type: [Number, String]
            },
            title: {
                default: '',
                type: String
            },
            visible: {
                required: true,
                type: Boolean
            }
        },
        methods: {
            handleClose() {
                this.$emit('close');
            }
        }
    };
</script>
