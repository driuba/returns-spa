<template>
    <NumberField
        v-bind="$attrs"
        :value="percentage"
        @change="handleChange"
    />
</template>
<script>
    import NumberField from './NumberField';

    export default {
        name: 'PercentageField',
        components: { NumberField },
        model: {
            event: 'change',
            prop: 'value'
        },
        props: {
            value: {
                default: null,
                type: Number
            }
        },
        computed: {
            percentage() {
                return typeof this.value === 'number' ? Math.round(this.value * 10000) / 100 : null;
            }
        },
        methods: {
            handleChange(percentage) {
                this.$emit('change', typeof percentage === 'number' ? Math.round(percentage * 100) / 10000 : null);
            }
        }
    };
</script>
