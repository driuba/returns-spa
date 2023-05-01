<template>
    <DetailView
        :loading="!!loading"
        title="Returns">
        <DetailViewSection
            :actions="actions"
            :loading="!!loading"
            title="Return list"
        >
            <v-container fluid>
                <v-row>
                    <v-col>
                        <DateField
                            :value="filter.from"
                            @change="handleFilterFromChange"
                            clearable
                            label="From"
                        ></DateField>
                    </v-col>

                    <v-col>
                        <DateField
                            v-model="filter.to"
                            :min="filter.from"
                            @change="handleReload"
                            clearable
                            label="To"
                        ></DateField>
                    </v-col>

                    <v-col>
                        <SelectField
                            v-model="filter.state"
                            :items="states"
                            @change="handleReload"
                            clearable
                            item-text="label"
                            item-value="value"
                            label="State"
                        ></SelectField>
                    </v-col>

                    <v-col>
                        <TextField
                            :value="filter.search"
                            @input="handleFilterSearchInput"
                            clearable
                            label="Search"
                        ></TextField>
                    </v-col>
                </v-row>

                <v-row>
                    <v-col>
                        <v-data-table
                            :headers="table.headers"
                            :items="tableItems"
                            :items-per-page.sync="table.pageSize"
                            :loading="!!loading"
                            :page.sync="table.page"
                            :server-items-length="table.serverItemsLength"
                            :sort-by.sync="table.sortBy"
                            :sort-desc.sync="table.sortDesc"
                            @update:items-per-page="load"
                            @update:page="load"
                            @update:sort-by="load"
                            @update:sort-desc="load"
                        >
                            <template #item.Id="{ item: { Id } }">
                                <router-link :to="{ name: 'Return', params: { returnId: Id } }">
                                    {{ Id }}
                                </router-link>
                            </template>

                            <template #item.Number="{ item: { Id , Number } }">
                                <router-link :to="{ name: 'Return', params: { returnId: Id } }">
                                    {{ Number }}
                                </router-link>
                            </template>

                            <!-- CustomerId -->

                            <!-- DeliveryPointId -->

                            <!-- LabelCount -->

                            <template #item.Fees="{ item }">
                                <div
                                    v-show="!!item.feeTotal"
                                    class="text-no-wrap"
                                >
                                    <span>{{ item.feeTotal | numberFormat(2) }} €</span>

                                    <v-tooltip right>
                                        <template #activator="{ on }">
                                            <v-icon
                                                v-on="on"
                                                class="vertical-align-text-bottom"
                                                dense
                                            >
                                                info_outline
                                            </v-icon>
                                        </template>

                                        <template>
                                            <div
                                                v-for="(fee, index) in item.Fees"
                                                :key="index"
                                            >
                                                {{ fee.Name }}: {{ fee.Value | numberFormat(2) }} €
                                            </div>
                                        </template>
                                    </v-tooltip>
                                </div>
                            </template>

                            <!-- State -->

                            <template #item.Created="{ item: { Created } }">
                                {{ Created | dateTimeFormat('yyyy-MM-dd') }}
                            </template>

                            <!-- UserCreated -->
                        </v-data-table>
                    </v-col>
                </v-row>
            </v-container>
        </DetailViewSection>
    </DetailView>
</template>

<script>
    import { createAxios, type as apiType } from '@/api';
    import { DetailView, DetailViewSection } from '@/components/detailViews';
    import { DateField, SelectField, TextField } from '@/components/inputs';
    import { state } from '@/enums/return';
    import { formatters } from '@/mixins';
    import { DateTime } from 'luxon';

    export default {
        name: 'Returns',
        components: {
            DateField,
            DetailView,
            DetailViewSection,
            SelectField,
            TextField
        },
        mixins: [formatters],
        data() {
            return {
                actions: [
                    {
                        handleClick: this.handleReload,
                        label: 'Refresh'
                    },
                    {
                        label: 'Create',
                        route: { name: 'ReturnRegistration' }
                    }
                ],
                apiMock: null,
                apiReturns: null,
                feeConfigurationGroups: [],
                filter: {
                    from: null,
                    search: null,
                    searchTimeout: null,
                    state: null,
                    to: null
                },
                loading: 0,
                returns: [],
                table: {
                    headers: [
                        {
                            align: 'center',
                            text: '#',
                            value: 'Id'
                        },
                        {
                            align: 'center',
                            cellClass: 'text-uppercase',
                            text: 'Return number',
                            value: 'Number'
                        },
                        {
                            align: 'center',
                            cellClass: 'text-uppercase',
                            text: 'Customer',
                            value: 'CustomerId'
                        },
                        {
                            align: 'center',
                            cellClass: 'text-uppercase',
                            text: 'Delivery point',
                            value: 'DeliveryPointId'
                        },
                        {
                            align: 'center',
                            text: 'Label count',
                            value: 'LabelCount'
                        },
                        {
                            align: 'center',
                            text: 'Fees',
                            value: 'Fees'
                        },
                        {
                            align: 'center',
                            text: 'State',
                            value: 'State'
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
                    page: 1,
                    pageSize: 10,
                    serverItemsLength: 0,
                    sortBy: ['Id'],
                    sortDesc: [true],
                    timeout: null
                }
            };
        },
        computed: {
            feeConfigurationGroupsById() {
                return this.feeConfigurationGroups.reduce(
                    (accumulator, feeConfigurationGroup) => ({
                        ...accumulator,
                        [feeConfigurationGroup.Id]: feeConfigurationGroup
                    }),
                    {}
                );
            },
            query() {
                const filters = [];

                if (this.filter.from) {
                    filters.push(`date(Created) ge ${this.filter.from}`);
                }

                if (this.filter.search) {
                    filters.push(
                        `(contains(Number, '${this.filter.search}') or contains(UserCreated, '${this.filter.search}'))`
                    );
                }

                if (this.filter.state) {
                    filters.push(`State eq '${this.filter.state}'`);
                }

                if (this.filter.to) {
                    filters.push(`date(Created) le ${this.filter.to}`);
                }

                const query = {
                    $count: true,
                    $expand: 'Fees($expand=Configuration($select=FeeConfigurationGroupId);$filter=Value gt 0;$select=Configuration,Value)',
                    $skip: this.table.pageSize === -1 ? null : (this.table.page - 1) * this.table.pageSize,
                    $top: this.table.pageSize === -1 ? null : this.table.pageSize + 1
                };

                if (filters.length) {
                    query.$filter = filters.join(' and ');
                }

                if (this.table.sortBy && this.table.sortBy.length) {
                    query.$orderby = `${this.table.sortBy[0]} ${this.table.sortDesc[0] ? 'desc' : 'asc'}`;
                }

                return query;
            },
            states() {
                return Object
                    .values(state)
                    .sort((a, b) => a.order - b.order);
            },
            tableItems() {
                return this.returns.map((returnEntry) => ({
                    ...returnEntry,
                    Fees: Object
                        .entries(
                            returnEntry.Fees.reduce(
                                (accumulator, fee) => ({
                                    ...accumulator,
                                    [fee.Configuration.FeeConfigurationGroupId]: (
                                        (accumulator[fee.Configuration.FeeConfigurationGroupId] || 0) + fee.Value
                                    )
                                }),
                                {}
                            )
                        )
                        .map(([key, value]) => ({
                            ...this.feeConfigurationGroupsById[key],
                            Value: value
                        }))
                        .sort((a, b) => (
                            a.Type.localeCompare(b.Type) ||
                            (a.Order - b.Order)
                        )),
                    feeTotal: returnEntry.Fees.reduce((accumulator, { Value }) => accumulator + Value, 0)
                }));
            }
        },
        async created() {
            this.apiMock = createAxios(apiType.MOCK);

            this.apiReturns = createAxios(apiType.RETURNS, this.$root.companyId);

            await this.loadFeeConfigurationGroups();

            this.load();
        },
        methods: {
            handleFilterFromChange(value) {
                if (this.filter.to && value) {
                    const from = DateTime.fromISO(value);

                    const to = DateTime.fromISO(this.filter.to);

                    if (from > to) {
                        this.filter.to = value;
                    }
                }

                this.filter.from = value;

                this.handleReload();
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
            handleReload() {
                this.table.page = 1;

                this.load();
            },
            load() {
                const load = async () => {
                    try {
                        this.loading++;

                        const { data: { '@odata.count': count, value: returns } } = await this.apiReturns.get(
                            'returns',
                            { params: this.query }
                        );

                        this.returns = returns;
                        this.table.serverItemsLength = count;
                    } catch (error) {
                        this.$root.handleError(error);
                    } finally {
                        this.loading--;
                    }
                };

                clearTimeout(this.table.timeout);

                this.table.timeout = setTimeout(load);
            },
            async loadFeeConfigurationGroups() {
                try {
                    this.loading++;

                    const { data: { value: feeConfigurationGroups } } = await this.apiReturns.get(
                        'feeConfigurationGroups',
                        {
                            params: {
                                $select: 'Id,Name,Order,Type'
                            }
                        }
                    );

                    this.feeConfigurationGroups = feeConfigurationGroups;
                } catch (error) {
                    this.$root.handleError(error);
                } finally {
                    this.loading--;
                }
            }
        }
    };
</script>

<style lang="scss" scoped>
    .vertical-align-text-bottom {
        vertical-align: text-bottom;
    }
</style>
