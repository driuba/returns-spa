<template>
    <v-autocomplete
        v-bind="$attrs"
        v-on="$listeners"
        :class="readonly ? 'readonly-input' : ''"
        :clearable="clearable && !readonly"
        :color="readonly ? 'rgba(0,0,0,0.54)' : 'primary'"
        :prepend-icon="icon"
        :readonly="readonly"
        :value="value"
        @click:clear="handleChange($event.target.value)"
        ref="input"
    >
        <template v-for="(_, nameScoped) of $scopedSlots" #[nameScoped]="propsScoped">
            <slot v-bind="propsScoped" :name="nameScoped"></slot>
        </template>

        <template v-for="(_, name) of $slots" #[name]>
            <slot :name="name"></slot>
        </template>
    </v-autocomplete>
</template>

<script>
    export default {
        name: 'AutocompleteField',
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
