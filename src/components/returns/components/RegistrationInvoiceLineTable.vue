<template>
    <DetailViewSection
        :actions="actions"
        :loading="loading"
        title="Invoice lines">
        <v-container fluid>
            <v-row>
                <v-col>
                    <DateField
                        v-model="filter.from"
                        :clearable="productTypeSelected !== productType.NEW.value"
                        :min="productTypeSelected === productType.NEW.value ? returnAvailability : null"
                        @change="handleReload"
                        icon="event"
                        label="From"
                    />
                </v-col>

                <v-col>
                    <DateField
                        v-model="filter.to"
                        :min="productTypeSelected === productType.NEW.value ? returnAvailability : null"
                        @change="handleReload"
                        clearable
                        icon="event"
                        label="To"
                    />
                </v-col>

                <v-col>
                    <AutocompleteField
                        v-model="filter.productId"
                        :items="products"
                        :loading="loadingProducts"
                        @change="handleReload"
                        @update:search-input="handleFilterProductIdSearch"
                        icon="search"
                        item-text="Name"
                        item-value="Id"
                        label="Product"
                        no-filter
                    ></AutocompleteField>
                </v-col>

                <v-col>
                    <TextField
                        :value="filter.invoiceNumber"
                        @change="handleFilterInvoiceNumberChange"
                        icon="search"
                        label="Invoice number"
                    ></TextField>
                </v-col>
            </v-row>

            <v-row>
                <v-col>
                    <v-data-table></v-data-table>
                </v-col>
            </v-row>
        </v-container>
    </DetailViewSection>
</template>

<script>
    import { DetailViewSection } from '@/components/detailViews';
    import { AutocompleteField, DateField, TextField } from '@/components/inputs';
    import { productType } from '@/enums/return';
    import { DateTime } from 'luxon';

    export default {
        name: 'RegistrationInvoiceLineTable',
        components: { AutocompleteField, DateField, DetailViewSection, TextField },
        model: {
            event: 'update:invoiceLinesSelected',
            prop: 'invoiceLinesSelected'
        },
        props: {
            invoiceLines: {
                required: true,
                type: Array
            },
            invoiceLinesSelected: {
                required: true,
                type: Array
            },
            loading: {
                default: false,
                type: Boolean
            },
            loadingProducts: {
                default: false,
                type: Boolean
            },
            products: {
                default: () => [],
                type: Array
            },
            productTypeSelected: {
                default: null,
                type: String
            },
            returnAvailability: {
                default: null,
                type: String
            }
        },
        data() {
            return {
                actions: [
                    {
                        handleClick: this.handleReload,
                        label: 'Refresh'
                    },
                    {
                        handleClick: this.handleInvoiceLinesSelectedClear,
                        label: 'Clear selection'
                    }
                ],
                filter: {
                    from: null,
                    invoiceNumber: null,
                    invoiceNumberTimeout: null,
                    productId: null,
                    productIdSearchInput: null,
                    productIdSearchTimeout: null,
                    to: null
                },
                table: {
                    page: 0,
                    timeout: null
                }
            };
        },
        computed: {
            productType() {
                return productType;
            }
        },
        created() {
            this.reset();
        },
        methods: {
            handleFilterInvoiceNumberChange(input) {
                clearTimeout(this.filter.invoiceNumberTimeout);

                this.filter.invoiceNumberTimeout = setTimeout(
                    () => {
                        if (this.filter.invoiceNumber !== input) {
                            this.filter.invoiceNumber = input;

                            this.handleReload();
                        }
                    },
                    500
                );
            },
            handleFilterProductIdSearch(productIdSearchInput) {
                clearTimeout(this.filter.productIdSearchTimeout);

                this.filter.productIdSearchTimeout = setTimeout(
                    () => {
                        if (productIdSearchInput && productIdSearchInput > 2 && this.filter.productIdSearchInput !== productIdSearchInput) {
                            this.filter.productIdSearchInput = productIdSearchInput;

                            this.$emit('load:products', productIdSearchInput);
                        }
                    },
                    500
                );
            },
            handleInvoiceLinesSelectedClear() {
                this.$emit('update:invoiceLinesSelected', []);
            },
            handleReload() {
                clearTimeout(this.table.timeout);

                this.table.timeout = setTimeout(() => {
                    this.table.page = 0;

                    this.load();
                });
            },
            load() {
                // TODO
            },
            reset() {
                if (this.returnAvailability && this.productTypeSelected === productType.NEW.value) {
                    this.filter.from = this.returnAvailability;
                }

                this.filter.invoiceNumber = null;
                this.filter.productId = null;
                this.filter.to = null;

                this.handleInvoiceLinesSelectedClear();

                this.handleReload();
            }
        }
    };
</script>
