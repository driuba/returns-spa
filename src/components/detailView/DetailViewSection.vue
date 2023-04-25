<template>
    <v-container class="pa-0" fluid>
        <v-row v-show="title || actions.length" no-gutters>
            <v-col>
                <v-toolbar color="secondary" dark dense flat>
                    <v-toolbar-title class="text-body-1">{{ title }}</v-toolbar-title>

                    <v-spacer></v-spacer>

                    <v-toolbar-items class="py-2">
                        <template v-for="action, index in actions">
                            <v-btn
                                v-show="!action.hidden"
                                :disabled="loading || action.disabled"
                                :key="index"
                                :loading="loading"
                                @click="action.handleClick"
                                class="mx-2"
                                color="primary"
                                small
                            >
                                {{ action.label }}
                            </v-btn>
                        </template>
                    </v-toolbar-items>
                </v-toolbar>
            </v-col>
        </v-row>

        <v-row no-gutters>
            <v-col>
                <v-card flat>
                    <slot></slot>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
    export default {
        name: 'DetailViewSection',
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
            title: {
                default: '',
                type: String
            }
        }
    };
</script>
