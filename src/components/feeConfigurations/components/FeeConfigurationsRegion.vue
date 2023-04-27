<template>
    <DetailViewSection
        :actions="actions"
        :loading="loading"
        title="Country / region fee configurations"
    >
        <v-container fluid>
            <v-row>
                <v-col md="6" sm="12">
                    <AutocompleteField
                        v-model="table.filters.regionId"
                        :items="regions"
                        @change="handleReload"
                        clearable
                        icon="search"
                        item-text="Name"
                        item-value="Id"
                        label="Region"
                    ></AutocompleteField>
                </v-col>

                <v-col md="6" sm="12">
                    <SelectField
                        v-model="table.filters.feeConfigurationGroupId"
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
                        :items="tableItems"
                        :server-items-length="1"
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
                                        @click="handleEdit(item)"
                                        color="primary"
                                        icon
                                        x-small
                                    >
                                        <v-icon small>edit</v-icon>
                                    </v-btn>
                                    <v-btn
                                        :disabled="!item.RegionId"
                                        @click="handleDelete(item)"
                                        color="primary"
                                        icon
                                        x-small
                                    >
                                        <v-icon small>delete</v-icon>
                                    </v-btn>
                                </td>
                                <td class="text-center">{{ item.Id }}</td>
                                <td class="text-center">{{ item.RegionId && `${item.RegionId} - ${item.RegionName}` }}</td>
                                <td class="text-center">
                                    <v-tooltip top>
                                        <template #activator="{ on }">
                                            <span v-on="on">{{ item.FeeConfigurationGroupName }}</span>
                                        </template>

                                        <span>{{ item.FeeConfigurationGroupDescription }}</span>
                                    </v-tooltip>
                                </td>
                                <td class="text-center">
                                    {{ item | feeConfigurationValueFormat }}
                                </td>
                                <td class="text-center">
                                    {{ item | feeConfigurationValueMinimumFormat }}
                                </td>
                                <td class="text-center">
                                    {{ item.Created | dateTimeFormat }}
                                </td>
                                <td class="text-center">
                                    {{ item.UserCreated }}
                                </td>
                                <td class="text-center">
                                    {{ item.Modified | dateTimeFormat }}
                                </td>
                                <td class="text-center">
                                    {{ item.UserModified }}
                                </td>
                            </tr>
                        </template>

                        <template #footer>
                            <v-row>
                                <v-col align="right">
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
        filters: {
            feeConfigurationValueFormat(feeConfiguration) {
                switch (feeConfiguration.ValueType) {
                    case valueTypes.FIXED.value: {
                        return `${feeConfiguration.Value.toFixed(2)} ${valueTypes.FIXED.label}`;
                    }
                    case valueTypes.PERCENT.value: {
                        return `${(feeConfiguration.Value * 100).toFixed(2)} ${valueTypes.PERCENT.label}`;
                    }
                    default: {
                        return '';
                    }
                }
            },
            feeConfigurationValueMinimumFormat(feeConfiguration) {
                return typeof feeConfiguration.ValueMinimum === 'number' ? `${feeConfiguration.ValueMinimum.toFixed(2)} €` : '';
            }
        },
        mixins: [formatters],
        props: {
            data: {
                required: true,
                type: Array
            },
            feeConfigurationGroups: {
                required: true,
                type: Array
            },
            loading: {
                default: false,
                type: Boolean
            },
            regions: {
                required: true,
                type: Array
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
                        feeConfigurationGroupId: null,
                        regionId: null
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
                            text: 'Region',
                            value: 'RegionId'
                        },
                        {
                            align: 'center',
                            text: 'Fee group',
                            value: 'FeeConfigurationGroupId'
                        },
                        {
                            align: 'center',
                            sortable: false,
                            text: 'Value',
                            value: 'Value'
                        },
                        {
                            align: 'center',
                            text: 'Minimum value',
                            value: 'ValueMinimum'
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
                        },
                        {
                            align: 'center',
                            text: 'Modified',
                            value: 'Modified'
                        },
                        {
                            align: 'center',
                            text: 'Modified by',
                            value: 'UserModified'
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
                return this.data.length < this.table.pageSize;
            },
            query() {
                const filters = [
                    'CustomerId eq null',
                    'not Deleted'
                ];

                if (this.table.filters.regionId) {
                    filters.push(`RegionId eq ${this.table.filters.regionId}`);
                }

                if (this.table.filters.feeConfigurationGroupId) {
                    filters.push(`FeeConfigurationGroupId eq ${this.table.filters.feeConfigurationGroupId}`);
                }

                const query = {
                    $filter: filters.join(' and '),
                    $skip: this.table.page * this.table.pageSize,
                    $top: this.table.pageSize + 1
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
            },
            tableItems() {
                return this.data.slice(0, this.table.pageSize);
            }
        },
        created() {
            this.handleReload();
        },
        methods: {
            handleCreate() {
                this.$emit('create', null, this.handleReload);
            },
            handleDelete(feeConfiguration) {
                this.$emit('delete', feeConfiguration.Id, this.handleReload);
            },
            handleEdit(feeConfiguration) {
                this.$emit('edit', feeConfiguration, this.handleReload);
            },
            handleNextPage() {
                this.table.page++;

                this.$emit('load', this.query);
            },
            handleReload() {
                this.table.page = 0;

                this.$emit('load', this.query);
            }
        }
    };
</script>
