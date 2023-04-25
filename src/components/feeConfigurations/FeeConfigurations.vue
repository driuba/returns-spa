<template>
    <div>
        <Dialog
            :actions="dialog.actions"
            :loading="loading"
            :visible="dialog.visible"
            :title="dialog.model.Id.value ? 'Edit' : 'Create'"
            max-width="960"
            persistent
        >
            <v-form ref="form">
                <v-container fluid>
                    <v-row>
                        <v-col md="6" sm="12">
                            <AutocompleteField
                                v-model="dialog.model.RegionId.value"
                                v-show="!dialog.customerConfiguration"
                                :disabled="!!dialog.model.Id.value"
                                :items="regions"
                                :readonly="!!dialog.model.Id.value"
                                :rules="dialog.model.RegionId.rules"
                                item-text="Name"
                                item-value="Id"
                                label="Region"
                            ></AutocompleteField>

                            <AutocompleteField
                                v-model="dialog.model.CustomerId.value"
                                v-show="dialog.customerConfiguration"
                                :disabled="!!dialog.model.Id.value"
                                :items="dialog.model.CustomerId.items"
                                :loading="dialog.model.CustomerId.loading"
                                :readonly="!!dialog.model.Id.value"
                                :rules="dialog.model.CustomerId.rules"
                                :search-input="dialog.model.CustomerId.searchInput"
                                @update:search-input="handleCustomerSearch"
                                item-text="Name"
                                item-value="CustomerId"
                                label="Customer"
                                no-filter
                            >
                                <template #item="{ item }">
                                    {{ item.CustomerId }} - {{ item.Name }}
                                </template>
                            </AutocompleteField>
                        </v-col>

                        <v-col md="6" sm="12">
                            <SelectField
                                v-model="dialog.model.FeeConfigurationGroupId.value"
                                :disabled="!!dialog.model.Id.value"
                                :items="feeConfigurationGroups"
                                :readonly="!!dialog.model.Id.value"
                                :rules="dialog.model.FeeConfigurationGroupId.rules"
                                item-text="Name"
                                item-value="Id"
                                label="Fee group"
                            />
                        </v-col>
                    </v-row>

                    <v-row v-show="!dialog.customerConfiguration">
                        <v-col md="6" sm="12">
                            <NumberField
                                v-show="dialog.model.ValueType.value === valueTypes.FIXED.value"
                                v-model="dialog.model.Value.value"
                                :rules="dialog.model.Value.rules"
                                label="Value"
                            />

                            <PercentageField
                                v-show="dialog.model.ValueType.value === valueTypes.PERCENT.value"
                                v-model="dialog.model.Value.value"
                                :rules="dialog.model.Value.rules"
                                label="Value"
                            />
                        </v-col>

                        <v-col md="6" sm="12">
                            <SelectField
                                v-model="dialog.model.ValueType.value"
                                :items="Object.values(valueTypes)"
                                @change="handleValueTypeChange"
                                item-text="label"
                                item-value="value"
                            />
                        </v-col>
                    </v-row>
                    <v-row v-show="!dialog.customerConfiguration">
                        <v-col md="6" sm="12">
                            <NumberField
                                v-show="dialog.model.ValueType.value === valueTypes.PERCENT.value"
                                v-model="dialog.model.ValueMinimum.value"
                                :rules="dialog.model.ValueMinimum.rules"
                                label="Minimum value, €"
                            />
                        </v-col>
                    </v-row>
                </v-container>
            </v-form>
        </Dialog>

        <DialogConfirmation
            :loading="loading"
            :visible="!!feeConfigurationIdToDelete"
            @cancel="handleDeleteCancel"
            @confirm="handleDeleteConfirm"
            content="Are you sure you want to delete this return fee configuration?"
        ></DialogConfirmation>

        <DetailView
            :loading="loading"
            title="Fees"
        >
            <v-tabs>
                <template v-for="[index, tab] of tabs.entries()">
                    <v-tab :key="index">{{ tab.title }}</v-tab>
                </template>

                <template v-if="initialized">
                    <template v-for="[index, tab] of tabs.entries()">
                        <v-tab-item
                            :key="index"
                        >
                            <component
                                :data="tab.data"
                                :feeConfigurationGroups="feeConfigurationGroups"
                                :regions="regions"
                                :is="tab.component"
                                :loading="loading"
                                @create="handleDialogOpen(tab.customerConfiguration, ...arguments)"
                                @delete="handleDelete"
                                @edit="handleDialogOpen(tab.customerConfiguration, ...arguments)"
                                @load="loadFeeConfigurations(index, ...arguments)"
                                @load:customers="loadCustomers"
                            />
                        </v-tab-item>
                    </template>
                </template>
            </v-tabs>
        </DetailView>
    </div>
</template>

<script>
    import { createAxios, type as apiType } from '@/api';
    import { DetailView } from '@/components/detailView';
    import { Dialog, DialogConfirmation } from '@/components/dialogs';
    import { AutocompleteField, NumberField, PercentageField, SelectField } from '@/components/inputs';
    import { valueTypes } from '@/enums/feeConfiguration';
    import { formatters } from '@/mixins';
    import validator from '@/utils/validator';
    import { FeeConfigurationsRegion, FeeConfigurationsCustomer } from './components';

    export default {
        name: 'FeeConfigurations',
        components: {
            AutocompleteField,
            DetailView,
            Dialog,
            DialogConfirmation,
            FeeConfigurationsCustomer,
            FeeConfigurationsRegion,
            NumberField,
            PercentageField,
            SelectField
        },
        mixins: [formatters],
        data() {
            return {
                apiMock: null,
                apiReturns: null,
                callback: null,
                customers: [],
                dialog: {
                    actions: [
                        {
                            handleClick: this.handleDialogClose,
                            label: 'Cancel'
                        },
                        {
                            handleClick: this.handleDialogSave,
                            label: 'Save'
                        }
                    ],
                    model: {
                        CustomerId: {
                            items: [],
                            loading: false,
                            rules: [this.validateCustomerId],
                            searchInput: null,
                            searchTimeout: null,
                            value: null
                        },
                        Id: {
                            value: 0
                        },
                        FeeConfigurationGroupId: {
                            rules: [validator.requiredString('Fee group')],
                            value: null
                        },
                        RegionId: {
                            rules: [this.validateRegionId],
                            value: null
                        },
                        Value: {
                            rules: [validator.requiredNonNegativeNumber('Value')],
                            value: null
                        },
                        ValueMinimum: {
                            rules: [validator.optionalNonNegativeNumber('Minimum value')],
                            value: null
                        },
                        ValueType: {
                            value: valueTypes.PERCENT.value
                        }
                    },
                    customerConfiguration: false,
                    visible: false
                },
                feeConfigurationGroups: [],
                feeConfigurationIdToDelete: 0,
                feeConfigurations: [],
                initialized: false,
                loading: false,
                regions: [],
                tabs: [
                    {
                        component: FeeConfigurationsRegion,
                        customerConfiguration: false,
                        data: [],
                        title: 'Countries and regions'
                    },
                    {
                        component: FeeConfigurationsCustomer,
                        customerConfiguration: true,
                        data: [],
                        title: 'Customers'
                    }
                ]
            };
        },
        computed: {
            customerNames() {
                return this.customers.reduce((accumulator, customer) => ({
                    ...accumulator,
                    [customer.CustomerId]: customer.Name
                }), {});
            },
            feeConfigurationGroupDetails() {
                return this.feeConfigurationGroups.reduce((accumulator, feeConfigurationGroup) => ({
                    ...accumulator,
                    [feeConfigurationGroup.Id]: feeConfigurationGroup
                }), {});
            },
            regionNames() {
                return this.regions.reduce((accumulator, region) => ({
                    ...accumulator,
                    [region.Id]: region.Name
                }), {});
            },
            valueTypes() {
                return valueTypes;
            }
        },
        async created() {
            this.apiMock = createAxios(apiType.MOCK);

            this.apiReturns = createAxios(apiType.RETURNS, this.$root.companyId);

            await this.load();

            this.initialized = true;
        },
        methods: {
            handleCustomerSearch(searchInput) {
                if (searchInput !== this.dialog.model.CustomerId.searchInput) {
                    this.dialog.model.CustomerId.searchInput = searchInput;

                    clearTimeout(this.dialog.model.CustomerId.searchTimeout);

                    if (searchInput && searchInput.length > 2) {
                        this.dialog.model.CustomerId.searchTimeout = setTimeout(
                            () => {
                                this.dialog.model.CustomerId.loading = true;

                                this.loadCustomers(
                                    searchInput,
                                    (customers) => {
                                        if (customers) {
                                            this.dialog.model.CustomerId.items = customers;
                                        }

                                        this.dialog.model.CustomerId.loading = false;
                                    }
                                );
                            },
                            500
                        );
                    }
                }
            },
            handleDelete(id, callback) {
                this.callback = callback;
                this.feeConfigurationIdToDelete = id;
            },
            handleDeleteCancel() {
                this.callback = null;
                this.feeConfigurationIdToDelete = 0;
            },
            async handleDeleteConfirm() {
                try {
                    this.loading = true;

                    await this.apiReturns.delete(`feeConfigurations/${this.feeConfigurationIdToDelete}`);

                    if (typeof this.callback === 'function') {
                        this.callback();
                    }

                    this.callback = null;
                    this.feeConfigurationIdToDelete = 0;
                } catch (error) {
                    this.$root.handleError(error);
                } finally {
                    this.loading = false;
                }
            },
            handleDialogClose() {
                this.dialog.visible = false;

                this.$refs.form.resetValidation();

                this.resetDialogModel();
            },
            handleDialogOpen(customerConfiguration, feeConfiguration, callback) {
                if (feeConfiguration) {
                    Object
                        .keys(this.dialog.model)
                        .filter((key) => key in feeConfiguration)
                        .forEach((key) => this.dialog.model[key].value = feeConfiguration[key]);
                }

                this.callback = callback;
                this.dialog.customerConfiguration = customerConfiguration;
                this.dialog.visible = true;
            },
            async handleDialogSave() {
                if (this.$refs.form.validate()) {
                    try {
                        this.loading = true;

                        const { Id, ...model } = Object
                            .entries(this.dialog.model)
                            .reduce((accumulator, [key, value]) => ({
                                ...accumulator,
                                [key]: value.value
                            }), {});

                        if (Id) {
                            await this.apiReturns.patch(`feeConfigurations/${Id}`, {
                                Value: model.Value,
                                ValueMinimum: model.ValueMinimum,
                                ValueType: model.ValueType
                            });
                        } else {
                            await this.apiReturns.post('feeConfigurations', model);
                        }

                        if (typeof this.callback === 'function') {
                            this.callback();
                        }

                        this.handleDialogClose();
                    } catch (error) {
                        this.$root.handleError(error);
                    } finally {
                        this.loading = false;
                    }
                }
            },
            handleValueTypeChange(valueType) {
                if (valueType === valueTypes.FIXED.value) {
                    this.dialog.model.ValueMinimum.value = null;
                }
            },
            async load() {
                try {
                    this.loading = true;

                    const [responseFeeConfigurationGroups, responseRegions] = await Promise.all([
                        this.apiReturns.get(
                            'feeConfigurationGroups',
                            {
                                params: {
                                    $orderby: 'Type,Order',
                                    $select: 'Description,Id,Name'
                                }
                            }
                        ),
                        this.apiMock.get('regions')
                    ]);

                    this.feeConfigurationGroups = responseFeeConfigurationGroups.data.value;
                    this.regions = responseRegions.data;
                } catch (error) {
                    this.$root.handleError(error);
                } finally {
                    this.loading = false;
                }
            },
            async loadCustomers(searchInput, callback) {
                try {
                    const { data: customers } = await this.apiMock.get(
                        'customers',
                        {
                            companyId: this.$root.companyId,
                            search: searchInput
                        }
                    );

                    if (typeof callback === 'function') {
                        callback(
                            customers.map((customer) => ({
                                ...customer,
                                CustomerId: customer.CustomerId.toLowerCase()
                            }))
                        );
                    }
                } catch (error) {
                    this.$root.handleError(error);

                    if (typeof callback === 'function') {
                        callback();
                    }
                }
            },
            async loadFeeConfigurations(index, query) {
                try {
                    this.loading = true;

                    const { data: { value: feeConfigurations } } = await this.apiReturns.get(
                        'feeConfigurations',
                        { params: query }
                    );

                    const customerIds = new Set(
                        feeConfigurations
                            .filter((feeConfiguration) => feeConfiguration.CustomerId)
                            .map((feeConfiguration) => feeConfiguration.CustomerId.toLowerCase())
                            .filter((customerId) => !this.customerNames[customerId])
                    );

                    if (customerIds.size) {
                        const { data: { value: customers } } = await this.apiMock.post(
                            'customers/filter',
                            {
                                CustomerIds: [...customerIds]
                            }
                        );

                        this.customers = this.customers.concat(
                            customers.map((customer) => ({
                                ...customer,
                                CustomerId: customer.CustomerId.toLowerCase()
                            }))
                        );
                    }

                    const page = feeConfigurations.map((feeConfiguration) => ({
                        ...feeConfiguration,
                        CustomerName: feeConfiguration.CustomerId && this.customerNames[feeConfiguration.CustomerId.toLowerCase()],
                        FeeConfigurationGroupDescription: this.feeConfigurationGroupDetails[feeConfiguration.FeeConfigurationGroupId].Description,
                        FeeConfigurationGroupName: this.feeConfigurationGroupDetails[feeConfiguration.FeeConfigurationGroupId].Name,
                        RegionName: feeConfiguration.RegionId && this.regionNames[feeConfiguration.RegionId]
                    }));

                    if (query.$skip) {
                        this.tabs[index].data = this.tabs[index].data.concat(page);
                    } else {
                        this.tabs[index].data = page;
                    }
                } catch (error) {
                    this.$root.handleError(error);
                } finally {
                    this.loading = false;
                }
            },
            resetDialogModel() {
                clearTimeout(this.dialog.model.CustomerId.searchTimeout);

                this.dialog.model.CustomerId.value = null;
                this.dialog.model.CustomerId.items = [];
                this.dialog.model.CustomerId.searchInput = null;
                this.dialog.model.Id.value = 0;
                this.dialog.model.FeeConfigurationGroupId.value = null;
                this.dialog.model.RegionId.value = null;
                this.dialog.model.Value.value = null;
                this.dialog.model.ValueMinimum.value = null;
                this.dialog.model.ValueType.value = valueTypes.PERCENT.value;
            },
            validateCustomerId(value) {
                return (
                    !!value ||
                    !this.dialog.customerConfiguration ||
                    'Customer is required'
                );
            },
            validateRegionId(value) {
                return (
                    !!value ||
                    this.dialog.customerConfiguration ||
                    !!this.dialog.model.Id.value ||
                    'Region is required'
                );
            }
        }
    };
</script>
