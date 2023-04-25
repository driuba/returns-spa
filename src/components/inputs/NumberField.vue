<template>
    <v-text-field
        v-bind="$attrs"
        :class="readonly ? 'readonly-input' : ''"
        :clearable="clearable && !readonly"
        :color="readonly ? 'rgba(0,0,0,0.54)' : 'primary'"
        :prepend-icon="icon"
        :readonly="readonly"
        :value="number"
        @change="handleChange"
        @click:clear="handleClear"
        @input="handleInput"
        ref="input"
    ></v-text-field>
</template>

<script>
    export default {
        name: 'NumberField',
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
                default: null,
                type: Number
            }
        },
        data() {
            return {
                number: ''
            };
        },
        watch: {
            value() {
                if (typeof this.value === 'number') {
                    this.number = this.value.toString();
                } else {
                    this.number = null;
                }
            }
        },
        created() {
            if (this.value || this.value === 0) {
                this.number = this.value.toString();
            } else {
                this.number = null;
            }
        },
        methods: {
            handleChange() {
                this.$emit('change', this.number ? +this.number : null);
            },
            handleClear() {
                this.$emit('change', null);
            },
            handleInput(value) {
                const numberPrevious = this.number;

                this.number = value || '';

                this.$nextTick(() => {
                    const result = (value || '').replace(',', '.').match(/^-?(\d+\.?\d*)?$/g);

                    this.number = result ? result[0] : numberPrevious;
                });
            },
            validate() {
                return this.$refs.input.validate();
            }
        }
    };
</script>
