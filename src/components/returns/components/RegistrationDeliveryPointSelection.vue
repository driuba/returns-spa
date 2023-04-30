<template>
    <DetailViewSection
        :loading="loading"
        title="Delivery point"
    >
        <v-container fluid>
            <v-row>
                <v-col>
                    <AutocompleteField
                        :disabled="disabled"
                        :items="deliveryPoints"
                        :loading="loadingDeliveryPoints"
                        :rules="rules"
                        :value="deliveryPointId"
                        @change="handleChange"
                        @update:search-input="handleSearch"
                        item-text="Name"
                        item-value="Id"
                        label="Delivery point"
                        no-filter
                        return-object
                    >
                        <template #item="{ item: { Id, Name } }">
                            {{ Id }} - {{ Name }}
                        </template>
                    </AutocompleteField>
                </v-col>
            </v-row>
        </v-container>
    </DetailViewSection>
</template>

<script>
    import { AutocompleteField } from '@/components/inputs';
    import { DetailViewSection } from '@/components/detailViews';
    import validator from '@/utils/validator';

    export default {
        name: 'DeliveryPointSelection',
        components: { AutocompleteField, DetailViewSection },
        model: {
            event: 'update:deliveryPointId',
            prop: 'deliveryPointId'
        },
        props: {
            deliveryPoints: {
                required: true,
                type: Array
            },
            deliveryPointId: {
                type: String
            },
            disabled: {
                default: false,
                type: Boolean
            },
            loading: {
                default: false,
                type: Boolean
            },
            loadingDeliveryPoints: {
                default: false,
                type: Boolean
            }
        },
        data() {
            return {
                rules: [validator.requiredString('Delivery point')]
            };
        },
        methods: {
            handleChange(deliveryPoint) {
                this.$emit('update:deliveryPointId', deliveryPoint && deliveryPoint.Id);
            },
            handleSearch(input) {
                this.$emit('search:deliveryPoints', input);
            }
        }
    };
</script>
