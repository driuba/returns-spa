<template>
    <v-dialog
        :value="visible"
        hide-overlay
        persistent
        width="300"
    >
        <v-card color="primary" dark tile>
            <v-container>
                <v-row>
                    <v-col>
                        <span>Please wait</span>
                    </v-col>
                </v-row>

                <v-row>
                    <v-col>
                        <v-progress-linear
                            :indeterminate="indeterminate"
                            :stream="!indeterminate"
                            :value="value"
                            color="white"
                        ></v-progress-linear>
                    </v-col>
                </v-row>
            </v-container>
        </v-card>
    </v-dialog>
</template>

<script>
    export default {
        name: 'ProgressBar',
        model: {
            event: 'change',
            prop: 'visible'
        },
        props: {
            visible: {
                default: false,
                type: Boolean
            },
            indeterminate: {
                default: true,
                type: Boolean
            },
            value: {
                default: 100,
                type: Number
            }
        }
    };
</script>
