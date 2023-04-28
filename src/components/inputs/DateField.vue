<template>
    <v-menu
        v-model="open"
        :close-on-content-click="false"
        :disabled="readonly"
        :nudge-right="40"
        min-width="290px"
        offset-y
        transition="scale-transition"
    >
        <template #activator="{ on }">
            <v-text-field
                v-on="on"
                :class="readonly ? 'readonly-input' : ''"
                :clearable="clearable && !readonly"
                :color="readonly ? 'rgba(0,0,0,0.54)' : 'primary'"
                :label="label"
                :prepend-icon="icon"
                :readonly="readonly"
                :rules="rules"
                :value="valueFormatted"
                @change="handleChange"
                @click:clear="handleChange($event.target.value)"
                ref="input"
            />
        </template>
        <v-date-picker
            :max="max"
            :min="min"
            :readonly="readonly"
            :value="valueFormatted"
            @change="handleChange"
            @input="handleClose"
        />
    </v-menu>
</template>

<script>
    import { DateTime } from 'luxon';

    export default {
        name: 'DateField',
        model: {
            event: 'change',
            prop: 'value'
        },
        props: {
            clearable: {
                default: false,
                type: Boolean
            },
            format: {
                default: 'yyyy-MM-dd',
                type: String
            },
            icon: {
                default: null,
                type: String
            },
            label: {
                required: true,
                type: String
            },
            max: {
                default: '',
                type: String
            },
            min: {
                default: '',
                type: String
            },
            readonly: {
                default: false,
                type: Boolean
            },
            rules: {
                default: () => [],
                type: Array
            },
            value: {
                default: null,
                type: String
            }
        },
        data() {
            return {
                open: false
            };
        },
        computed: {
            valueFormatted() {
                return this.value
                    ? DateTime
                        .fromISO(this.value)
                        .toFormat(this.format)
                    : null;
            }
        },
        methods: {
            handleChange(value) {
                this.$emit(
                    'change',
                    DateTime
                        .fromISO(value)
                        .toISODate()
                );
            },
            handleClose() {
                this.open = false;
            },
            validate() {
                this.$refs.input.validate();
            }
        }
    };
</script>
