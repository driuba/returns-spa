<template>
    <div>
        <ProgressBar :visible="loading"/>

        <v-container fluid>
            <v-row v-show="title || actions.length" no-gutters>
                <v-col>
                    <v-toolbar flat>
                        <v-toolbar-title>{{ title }}</v-toolbar-title>

                        <v-spacer></v-spacer>

                        <v-toolbar-items>
                            <template v-for="(action, index) in actions">
                                <v-btn
                                    v-on="action.handleClick ? { click: action.handleClick } : {}"
                                    v-show="!action.hidden"
                                    :key="index"
                                    :disabled="loading || action.disabled"
                                    :loading="loading"
                                    :to="action.route"
                                    color="primary"
                                    text
                                    tile
                                >
                                    {{ action.label }}
                                </v-btn>
                            </template>
                        </v-toolbar-items>
                    </v-toolbar>

                    <v-divider/>
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
    </div>
</template>

<script>
    import ProgressBar from '@/components/ProgressBar';

    export default {
        name: 'DetailView',
        components: { ProgressBar },
        props: {
            actions: {
                default: () => [],
                type: Array,
                validator: (actions) => actions.every((action) => (
                    action.label &&
                    (
                        typeof action.handleClick === 'function' ||
                        typeof action.route === 'object'
                    ) &&
                    !(
                        typeof action.handleClick === 'function' &&
                        typeof action.route === 'object'
                    )
                ))
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
