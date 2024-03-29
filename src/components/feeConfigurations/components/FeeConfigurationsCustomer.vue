<template>
    <DetailViewSection
        :actions="actions"
        :loading="loading"
        title="Customer fee exclusions"
    >
        <v-container fluid>
            <v-row>
                <v-col md="6" sm="12">
                    <AutocompleteField
                        v-model="table.filters.customerId.value"
                        :items="table.filters.customerId.items"
                        :loading="table.filters.customerId.loading"
                        :search-input="table.filters.customerId.searchInput"
                        @change="handleReload"
                        @update:search-input="handleCustomerSearch"
                        clearable
                        icon="search"
                        item-text="Name"
                        item-value="Id"
                        label="Customer"
                        no-filter
                    >
                        <template #item="{ item: { Id, Name } }">
                            {{ Id }} - {{ Name }}
                        </template>
                    </AutocompleteField>
                </v-col>

                <v-col md="6" sm="12">
                    <SelectField
                        v-model="table.filters.feeConfigurationGroupId.value"
                        :items="feeConfigurationGroups"
                        @change="handleReload"
                        clearable
                        icon="search"
                        item-text="Name"
                        item-value="Id"
                        label="Fee group"
                    />
                </v-col>
            </v-row>

            <v-row>
                <v-col>
                    <v-data-table
                        :headers="table.headers"
                        :items="data"
                        :sort-by.sync="table.sortBy"
                        :sort-desc.sync="table.sortDesc"
                        @update:sort-by="handleReload"
                        @update:sort-desc="handleReload"
                        disable-pagination
                        hide-default-footer
                    >
                        <template #item="{ item }">
                            <tr>
                                <td class="text-center">
                                    <v-btn
                                        @click="handleDelete(item)"
                                        color="primary"
                                        icon
                                        x-small
                                    >
                                        <v-icon small>delete</v-icon>
                                    </v-btn>
                                </td>
                                <td class="text-center">{{ item.Id }}</td>
                                <td class="text-center">{{ item.CustomerId }} - {{ item.CustomerName }}</td>
                                <td class="text-center">
                                    <v-tooltip top>
                                        <template #activator="{ on }">
                                            <span v-on="on">{{ item.FeeConfigurationGroupName }}</span>
                                        </template>

                                        <span>{{ item.FeeConfigurationGroupDescription }}</span>
                                    </v-tooltip>
                                </td>
                                <td class="text-center">
                                    {{ item.Created | dateTimeFormat }}
                                </td>
                                <td class="text-center">
                                    {{ item.UserCreated }}
                                </td>
                            </tr>
                        </template>

                        <template #footer>
                            <v-container class="pa-0" fluid>
                                <v-row>
                                    <v-spacer></v-spacer>

                                    <v-col cols="auto">
                                        <v-btn
                                            v-show="!pageLast"
                                            :loading="loading"
                                            @click="handleNextPage"
                                            color="primary"
                                            text
                                            tile
                                        >
                                            Load more
                                        </v-btn>
                                    </v-col>
                                </v-row>
                            </v-container>
                        </template>
                    </v-data-table>
                </v-col>
            </v-row>
        </v-container>
    </DetailViewSection>
</template>

<script>
    import { DetailViewSection } from '@/components/detailViews';
    import { AutocompleteField, SelectField } from '@/components/inputs';
    import { valueTypes } from '@/enums/feeConfiguration';
    import { formatters } from '@/mixins';

    export default {
        name: 'FeeConfigurationsRegion',
        components: {
            AutocompleteField,
            DetailViewSection,
            SelectField
        },
        mixins: [formatters],
        props: {
            data: {
                required: true,
                type: Array
            },
            dataCount: {
                default: null,
                type: Number
            },
            feeConfigurationGroups: {
                required: true,
                type: Array
            },
            loading: {
                default: false,
                type: Boolean
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
                        handleClick: this.handleCreate,
                        label: 'Create'
                    }
                ],
                table: {
                    filters: {
                        customerId: {
                            items: [],
                            loading: false,
                            searchInput: null,
                            searchTimeout: null,
                            value: null
                        },
                        feeConfigurationGroupId: {
                            value: null
                        }
                    },
                    headers: [
                        {
                            align: 'center',
                            sortable: false,
                            text: 'Actions'
                        },
                        {
                            align: 'center',
                            text: '#',
                            value: 'Id'
                        },
                        {
                            align: 'center',
                            text: 'Customer',
                            value: 'CustomerId'
                        },
                        {
                            align: 'center',
                            text: 'Fee group',
                            value: 'FeeConfigurationGroupId'
                        },
                        {
                            align: 'center',
                            text: 'Created',
                            value: 'Created'
                        },
                        {
                            align: 'center',
                            text: 'Created by',
                            value: 'UserCreated'
                        }
                    ],
                    page: 0,
                    pageSize: 100,
                    sortBy: ['Id'],
                    sortDesc: [false]
                }
            };
        },
        computed: {
            pageLast() {
                return typeof this.dataCount === 'number'
                    ? this.data.length === this.dataCount
                    : this.data.length < ((this.table.page + 1) * this.table.pageSize);
            },
            query() {
                const filters = [
                    'CustomerId ne null',
                    'not Deleted',
                    'RegionId eq null'
                ];

                if (this.table.filters.customerId.value) {
                    filters.push(`CustomerId eq '${this.table.filters.customerId.value}'`);
                }

                if (this.table.filters.feeConfigurationGroupId.value) {
                    filters.push(`FeeConfigurationGroupId eq ${this.table.filters.feeConfigurationGroupId.value}`);
                }

                const query = {
                    $count: true,
                    $filter: filters.join(' and '),
                    $skip: this.table.page * this.table.pageSize,
                    $top: this.table.pageSize
                };

                if (this.table.sortBy && this.table.sortBy.length) {
                    switch (this.table.sortBy[0]) {
                        case ('FeeConfigurationGroupId'): {
                            query.$orderby = `Group/Type ${this.table.sortDesc[0] ? 'desc' : 'asc'},Group/Order ${this.table.sortDesc[0] ? 'desc' : 'asc'}`;

                            break;
                        }
                        default: {
                            query.$orderby = `${this.table.sortBy[0]} ${this.table.sortDesc[0] ? 'desc' : 'asc'}`;

                            break;
                        }
                    }
                }

                return query;
            }
        },
        created() {
            this.handleReload();
        },
        methods: {
            handleCreate() {
                this.$emit(
                    'create',
                    {
                        Value: 0,
                        ValueType: valueTypes.FIXED.value
                    },
                    this.handleReload
                );
            },
            handleCustomerSearch(searchInput) {
                clearTimeout(this.table.filters.customerId.searchTimeout);

                this.table.filters.customerId.searchTimeout = setTimeout(
                    () => {
                        if (searchInput && searchInput.length > 2 && this.table.filters.customerId.searchInput !== searchInput) {
                            this.table.filters.customerId.searchInput = searchInput;

                            this.loadCustomers();
                        }
                    },
                    500
                );
            },
            handleDelete(feeConfiguration) {
                this.$emit('delete', feeConfiguration.Id, this.handleReload);
            },
            handleNextPage() {
                this.table.page++;

                this.$emit('load', this.query);
            },
            handleReload() {
                clearTimeout(this.table.timeout);

                this.table.timeout = setTimeout(() => {
                    this.table.page = 0;

                    this.$emit('load', this.query);
                });
            },
            loadCustomers() {
                this.table.filters.customerId.loading = true;

                this.$emit(
                    'load:customers',
                    {
                        parent: true,
                        search: this.table.filters.customerId.searchInput
                    },
                    (customers) => {
                        this.table.filters.customerId.loading = false;

                        if (customers) {
                            this.table.filters.customerId.items = customers;
                        }
                    }
                );
            }
        }
    };
</script>
