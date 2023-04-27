<template>
    <DetailViewSection
        :loading="loading"
        title="Product type"
    >
        <v-container fluid>
            <v-row>
                <v-col>
                    <v-radio-group
                        :disabled="disabled"
                        :rules="rules"
                        :value="productType"
                        @change="handleChange"
                        column>
                        <v-radio
                            v-for="type in productTypes"
                            :key="type.value"
                            :label="type.label"
                            :value="type.value"
                        ></v-radio>
                    </v-radio-group>
                </v-col>
            </v-row>
        </v-container>
    </DetailViewSection>
</template>

<script>
    import { DetailViewSection } from '@/components/detailViews';
    import { productType } from '@/enums/return';
    import validator from '@/utils/validator';

    export default {
        name: 'ProductTypeSelection',
        components: { DetailViewSection },
        model: {
            event: 'update:productType',
            prop: 'productType'
        },
        props: {
            disabled: {
                default: false,
                type: Boolean
            },
            loading: {
                default: false,
                type: Boolean
            },
            productType: {
                type: String
            }
        },
        data() {
            return {
                rules: [validator.requiredString('Product type')]
            };
        },
        computed: {
            productTypes() {
                return Object.values(productType);
            }
        },
        methods: {
            handleChange(productType) {
                this.$emit('update:productType', productType);
            }
        }
    };
</script>
