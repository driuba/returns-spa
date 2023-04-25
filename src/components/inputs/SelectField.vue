<template>
    <v-select
        v-bind="$attrs"
        :class="readonly ? 'readonly-input' : ''"
        :clearable="clearable && !readonly"
        :color="readonly ? 'rgba(0,0,0,0.54)' : 'primary'"
        :prepend-icon="icon"
        :readonly="readonly"
        :value="value"
        @change="handleChange"
        @click:clear="handleChange($event.target.value)"
        ref="input"
    ></v-select>
</template>

<script>
    export default {
        name: 'SelectField',
        model: {
            event: 'change',
            prop: 'value'
        },
        props: {
            clearable: {
                default: false,
                type: Boolean
            },
            icon: {
                default: null,
                type: String
            },
            readonly: {
                default: false,
                type: Boolean
            },
            value: {
                required: true
            }
        },
        methods: {
            handleChange(value) {
                this.$emit('change', value);
            },
            validate() {
                this.$refs.input.validate();
            }
        }
    };
</script>
