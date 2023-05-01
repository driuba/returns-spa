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
                        :required="productTypeSelected === productType.NEW.value"
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
                        clearable
                        icon="search"
                        item-text="Name"
                        item-value="Id"
                        label="Product"
                        no-filter
                    >
                        <template #item="{ item: { Id, Name } }">
                            <span class="text-truncate">
                                {{ Id }} - {{ Name }}
                            </span>
                        </template>
                    </AutocompleteField>
                </v-col>

                <v-col>
                    <TextField
                        :value="filter.search"
                        @input="handleFilterSearchInput"
                        clearable
                        icon="search"
                        label="Search"
                    ></TextField>
                </v-col>
            </v-row>

            <v-row>
                <v-col>
                    <v-data-table
                        :footer-props="{
                            'show-current-page': true,
                            'show-first-last-page': true
                        }"
                        :headers="table.headers"
                        :items="tableItems"
                        :items-per-page.sync="table.pageSize"
                        :loading="loading"
                        :page.sync="table.page"
                        :server-items-length="serverItemsLength"
                        @update:items-per-page="handleReload"
                        @update:page="load"
                        show-select
                    >
                        <template #header.data-table-select>
                            <v-simple-checkbox
                                :disabled="productTypeSelected === productType.SERVICED.value"
                                :value="tableHeaderChecked"
                                @input="handleInvoiceLineSelectAll"
                            />
                        </template>

                        <template #item.data-table-select="{ item }">
                            <v-simple-checkbox
                                v-if="item.isSelectable"
                                :value="invoiceLineIdsSelected.has(item.Id)"
                                @input="handleInvoiceLineSelect(item)"
                                color="primary"
                            />

                            <v-tooltip v-else right>
                                <template #activator="{ on }">
                                    <v-icon
                                        v-on="on"
                                        color="error"
                                    >
                                        error_outline
                                    </v-icon>
                                </template>

                                <template>
                                    <div v-if="item.ByOrderOnly">Product was purchased by order and cannot be returned</div>
                                    <div v-if="item.Serviceable">Product must be serviced and cannot be returned under warranty</div>
                                    <div v-if="item.quantityAvailable <= 0">Invoice product is not available for return</div>
                                </template>
                            </v-tooltip>
                        </template>

                        <template #item.InvoiceDate="{ item: { InvoiceDate } }">
                            {{ InvoiceDate | dateTimeFormat('yyyy-MM-dd') }}
                        </template>

                        <template #item.InvoiceNumber="{ item: { InvoiceNumber } }">
                            <span class="text-uppercase">{{ InvoiceNumber }}</span>
                        </template>

                        <template #item.ProductId="{ item: { ProductId } }">
                            <span class="text-uppercase">{{ ProductId }}</span>
                        </template>

                        <template #item.SerialNumber="{ item: { SerialNumber } }">
                            <span class="text-uppercase">{{ SerialNumber }}</span>
                        </template>

                        <template #item.ProductName="{ item: { ProductName } }">
                            <td class="text-center">
                                <v-tooltip top>
                                    <template #activator="{ on }">
                                        <span
                                            v-on="on"
                                            class="d-inline-block text-truncate"
                                        >
                                            {{ ProductName }}
                                        </span>
                                    </template>

                                    <template>{{ ProductName }}</template>
                                </v-tooltip>
                            </td>
                        </template>

                        <template #item.PriceUnit="{ item: { PriceUnit } }">
                            <span class="text-no-wrap">{{ PriceUnit | numberFormat(2) }} €</span>
                        </template>

                        <template #footer.page-text="{ pageStart, pageStop }">
                            {{ pageStart }} - {{ pageStop }}
                        </template>
                    </v-data-table>
                </v-col>
            </v-row>
        </v-container>
    </DetailViewSection>
</template>

<script>
    import { DetailViewSection } from '@/components/detailViews';
    import { AutocompleteField, DateField, TextField } from '@/components/inputs';
    import { productType } from '@/enums/return';
    import { formatters } from '@/mixins';

    export default {
        name: 'RegistrationInvoiceLineTable',
        components: { AutocompleteField, DateField, DetailViewSection, TextField },
        mixins: [formatters],
        model: {
            event: 'update:invoiceLinesSelected',
            prop: 'invoiceLinesSelected'
        },
        props: {
            deliveryPointIdSelected: {
                default: null,
                type: String
            },
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
                filter: {
                    from: null,
                    productId: null,
                    productIdSearchInput: null,
                    productIdSearchTimeout: null,
                    search: null,
                    searchTimeout: null,
                    to: null
                },
                table: {
                    headers: [
                        {
                            align: 'center',
                            text: 'Invoice date',
                            value: 'InvoiceDate'
                        },
                        {
                            align: 'center',
                            text: 'Invoice number',
                            value: 'InvoiceNumber'
                        },
                        {
                            align: 'center',
                            text: 'Product identifier',
                            value: 'ProductId'
                        },
                        {
                            align: 'center',
                            text: 'Serial number',
                            value: 'SerialNumber'
                        },
                        {
                            align: 'center',
                            text: 'Product name',
                            value: 'ProductName'
                        },
                        {
                            align: 'center',
                            text: 'Unit price',
                            value: 'PriceUnit'
                        },
                        {
                            align: 'center',
                            text: 'Available quantity',
                            value: 'quantityAvailable'
                        }
                    ],
                    page: 1,
                    pageSize: 10,
                    timeout: null
                }
            };
        },
        computed: {
            actions() {
                return [
                    {
                        handleClick: this.load,
                        label: 'Refresh'
                    },
                    {
                        disabled: !this.invoiceLinesSelected.length,
                        handleClick: this.handleInvoiceLinesSelectedClear,
                        label: 'Clear selection'
                    }
                ];
            },
            invoiceLineIdsSelected() {
                return new Set(
                    this.invoiceLinesSelected.map(({ Id }) => Id)
                );
            },
            loadRequest() {
                return {
                    DeliveryPointId: this.deliveryPointIdSelected,
                    From: this.filter.from,
                    ProductId: this.filter.productId,
                    Search: this.filter.search,
                    Skip: this.table.pageSize === -1 ? null : (this.table.page - 1) * this.table.pageSize,
                    To: this.filter.to,
                    Top: this.table.pageSize === -1 ? null : this.table.pageSize + 1
                };
            },
            productType() {
                return productType;
            },
            tableHeaderChecked() {
                return (
                    !!this.tableItems.length &&
                    this.tableItems.every((tableItem) => (
                        !tableItem.isSelectable ||
                        this.invoiceLineIdsSelected.has(tableItem.Id)
                    ))
                );
            },
            tableItems() {
                let tableItems = this.invoiceLines.map((invoiceLine) => ({
                    ...invoiceLine,
                    isSelectable: (
                        !(
                            invoiceLine.ByOrderOnly ||
                            (
                                this.productTypeSelected === productType.UNDER_WARRANTY.value &&
                                invoiceLine.Serviceable
                            )
                        ) &&
                        invoiceLine.QuantityInvoiced > invoiceLine.QuantityReturned
                    ),
                    quantityAvailable: invoiceLine.QuantityInvoiced - invoiceLine.QuantityReturned
                }));

                if (this.table.pageSize !== -1) {
                    tableItems = tableItems.slice(0, this.table.pageSize);
                }

                return tableItems;
            },
            serverItemsLength() {
                if (this.table.pageSize === -1) {
                    return this.tableItems.length;
                }

                return (this.table.page - 1) * this.table.pageSize + this.invoiceLines.length;
            }
        },
        created() {
            this.reset();
        },
        methods: {
            handleFilterProductIdSearch(productIdSearchInput) {
                clearTimeout(this.filter.productIdSearchTimeout);

                this.filter.productIdSearchTimeout = setTimeout(
                    () => {
                        if (productIdSearchInput && productIdSearchInput.length > 2 && this.filter.productIdSearchInput !== productIdSearchInput) {
                            this.filter.productIdSearchInput = productIdSearchInput;

                            this.$emit('load:products', productIdSearchInput);
                        }
                    },
                    500
                );
            },
            handleFilterSearchInput(input) {
                clearTimeout(this.filter.searchTimeout);

                this.filter.searchTimeout = setTimeout(
                    () => {
                        if (this.filter.search !== input) {
                            this.filter.search = input;

                            this.handleReload();
                        }
                    },
                    500
                );
            },
            handleInvoiceLineSelect(invoiceLine) {
                if (this.invoiceLineIdsSelected.has(invoiceLine.Id)) {
                    this.$emit(
                        'update:invoiceLinesSelected',
                        this.invoiceLinesSelected.filter(({ Id }) => Id !== invoiceLine.Id)
                    );
                } else {
                    this.$emit(
                        'update:invoiceLinesSelected',
                        this.productTypeSelected === productType.SERVICED.value ? [invoiceLine] : [...this.invoiceLinesSelected, invoiceLine]
                    );
                }
            },
            handleInvoiceLineSelectAll() {
                if (this.tableHeaderChecked) {
                    const tableItemIds = new Set(
                        this.tableItems
                            .filter(({ Id }) => this.invoiceLineIdsSelected.has(Id))
                            .map(({ Id }) => Id)
                    );

                    this.$emit(
                        'update:invoiceLinesSelected',
                        this.invoiceLinesSelected.filter(({ Id }) => !tableItemIds.has(Id))
                    );
                } else if (this.productTypeSelected !== productType.SERVICED.value) {
                    this.$emit(
                        'update:invoiceLinesSelected',
                        [
                            ...this.invoiceLinesSelected,
                            ...this.tableItems.filter((tableItem) => tableItem.isSelectable && !this.invoiceLineIdsSelected.has(tableItem.Id))
                        ]
                    );
                }
            },
            handleInvoiceLinesSelectedClear() {
                this.$emit('update:invoiceLinesSelected', []);
            },
            handleReload() {
                this.table.page = 1;

                this.load();
            },
            load() {
                clearTimeout(this.table.timeout);

                this.table.timeout = setTimeout(() => {
                    this.$emit('load:invoiceLines', this.loadRequest);
                });
            },
            reset() {
                this.filter.from = this.returnAvailability && this.productTypeSelected === productType.NEW.value
                    ? this.returnAvailability
                    : null;
                this.filter.productId = null;
                this.filter.search = null;
                this.filter.to = null;

                this.handleInvoiceLinesSelectedClear();

                this.handleReload();
            }
        }
    };
</script>

<style lang="scss" scoped>
    td {
        max-width: 0;

        .text-truncate {
            width: 100%;
        }
    }
</style>
