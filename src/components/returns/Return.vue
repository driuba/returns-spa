<template>
    <div>
        <DialogConfirmation
            :content="dialogConfirmation.message"
            :loading="!!loading"
            :visible="dialogConfirmation.visible"
            @cancel="handleDialogConfirmationCancel"
            @confirm="handleDialogConfirmationConfirm"
        ></DialogConfirmation>

        <ReturnLineDialog
            :feeConfigurationGroups="feeConfigurationGroups"
            :returnLine="returnLineToEdit"
            @cancel="handleReturnLineEditCancel"
            @confirm="handleReturnLineEditConfirm"
        ></ReturnLineDialog>

        <DetailView
            :actions="actionsReturn"
            :loading="!!loading"
            title="Return"
        >
            <DetailViewSection
                :loading="!!loading"
                title="Return "
            >
                <v-container fluid>
                    <v-row>
                        <v-col>
                            <NumberField
                                v-model="labelCount"
                                :loading="!!loading"
                                :readonly="!returnEntry || returnEntry.State !== state.NEW.value"
                                :rules="labelCountRules"
                                @change="handleLabelCountChange"
                                label="Label count"
                                ref="labelCount"
                                type="number"
                            ></NumberField>
                        </v-col>

                        <v-col>
                            <v-list dense>
                                <v-list-item>
                                    <v-list-item-content>
                                        <v-list-item-title>State</v-list-item-title>

                                        {{ returnEntry && returnEntry.State }}
                                    </v-list-item-content>
                                </v-list-item>

                                <v-list-item>
                                    <v-list-item-content>
                                        <v-list-item-title>Created</v-list-item-title>

                                        {{ returnEntry && returnEntry.Created | dateTimeFormat('yyyy-MM-dd') }}
                                    </v-list-item-content>
                                </v-list-item>

                                <v-list-item>
                                    <v-list-item-content>
                                        <v-list-item-title>Created by</v-list-item-title>

                                        {{ returnEntry && returnEntry.UserCreated }}
                                    </v-list-item-content>
                                </v-list-item>

                                <v-list-item v-show="!!(returnEntry && returnEntry.Modified && returnEntry.UserModified)">
                                    <v-list-item-content>
                                        <v-list-item-title>Modified</v-list-item-title>

                                        {{ returnEntry && returnEntry.Modified | dateTimeFormat('yyyy-MM-dd') }}
                                    </v-list-item-content>
                                </v-list-item>

                                <v-list-item v-show="!!(returnEntry && returnEntry.Modified && returnEntry.UserModified)">
                                    <v-list-item-content>
                                        <v-list-item-title>Modified by</v-list-item-title>

                                        {{ returnEntry && returnEntry.UserModified }}
                                    </v-list-item-content>
                                </v-list-item>
                            </v-list>
                        </v-col>

                        <v-col>
                            <v-list
                                v-show="!!this.feesReturn.length"
                                dense
                            >
                                <v-list-item>
                                    <v-list-item-title>Fees</v-list-item-title>
                                </v-list-item>

                                <v-list-item
                                    v-for="(fee, index) in feesReturn"
                                    :key="index"
                                >
                                    <v-tooltip right>
                                        <template #activator="{ on }">
                                            <span v-on="on">
                                                {{ fee.Name }}: {{ fee.Value | numberFormat(2) }} €
                                            </span>
                                        </template>

                                        <template>{{ fee.Description }}</template>
                                    </v-tooltip>
                                </v-list-item>

                                <v-divider/>

                                <v-list-item class="font-weight-bold">
                                    Total: {{ feeTotalReturn | numberFormat(2) }} €
                                </v-list-item>
                            </v-list>
                        </v-col>
                    </v-row>
                </v-container>
            </DetailViewSection>

            <DetailViewSection
                :loading="!!loading"
                title="Return lines"
            >
                <v-container fluid>
                    <v-row>
                        <v-col>
                            <v-data-table
                                :headers="tableHeaders"
                                :items="tableItems"
                                :items-per-page="-1"
                                :loading="!!loading"
                                disable-pagination
                                disable-sort
                                hide-default-footer
                                show-select
                            >
                                <!-- data-table-select -->

                                <!-- data-table-select -->

                                <!-- Id -->

                                <template #item.ProductType="{ item: { ProductType } }">
                                    {{ productTypeLabels[ProductType] }}
                                </template>

                                <!-- InvoiceNumberPurchase -->

                                <!-- InvoiceNumberReturn -->

                                <!-- ProductId -->

                                <!-- SerialNumber -->

                                <template #item.PriceUnit="{ item: { PriceUnit } }">
                                    <span class="text-no-wrap">
                                        {{ PriceUnit | numberFormat(2) }} €
                                    </span>
                                </template>

                                <!-- Quantity -->

                                <template #item.NoteReturn="{ item: { NoteReturn } }">
                                    <td class="text-center">
                                        <v-tooltip top>
                                            <template #activator="{ on }">
                                                <span
                                                    v-on="on"
                                                    v-show="!!NoteReturn"
                                                    class="d-inline-block text-truncate"
                                                >
                                                    {{ NoteReturn }}
                                                </span>
                                            </template>

                                            <div class="text-pre-line">{{ NoteReturn }}</div>
                                        </v-tooltip>
                                    </td>
                                </template>

                                <template #item.NoteResponse="{ item: { NoteResponse } }">
                                    <td class="text-center">
                                        <v-tooltip top>
                                            <template #activator="{ on }">
                                                <span
                                                    v-on="on"
                                                    v-show="!!NoteResponse"
                                                    class="d-inline-block text-truncate"
                                                >
                                                    {{ NoteResponse }}
                                                </span>
                                            </template>

                                            <div class="text-pre-line">{{ NoteResponse }}</div>
                                        </v-tooltip>
                                    </td>
                                </template>

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

                                <template #item.actions="{ item }">
                                    <v-tooltip top>
                                        <template #activator="{ on }">
                                            <v-btn
                                                v-on="on"
                                                v-show="false"
                                                :loading="!!loading"
                                                @click="handleReturnLineAttachments(item)"
                                                color="primary"
                                                icon
                                                x-small
                                            >
                                                <v-icon>attach_file</v-icon>
                                            </v-btn>
                                        </template>

                                        <template>Attachments</template>
                                    </v-tooltip>

                                    <v-tooltip top>
                                        <template #activator="{ on }">
                                            <v-btn
                                                v-on="on"
                                                :loading="!!loading"
                                                @click="handleReturnLineEdit(item)"
                                                color="primary"
                                                icon
                                                x-small
                                            >
                                                <v-icon>edit</v-icon>
                                            </v-btn>
                                        </template>

                                        <template>Edit</template>
                                    </v-tooltip>

                                    <v-tooltip top>
                                        <template #activator="{ on }">
                                            <v-btn
                                                v-on="on"
                                                :loading="!!loading"
                                                @click="handleReturnLineRemove(item)"
                                                color="primary"
                                                icon
                                                x-small
                                            >
                                                <v-icon>delete</v-icon>
                                            </v-btn>
                                        </template>

                                        <template>Delete</template>
                                    </v-tooltip>
                                </template>
                            </v-data-table>
                        </v-col>
                    </v-row>
                </v-container>
            </DetailViewSection>
        </DetailView>
    </div>
</template>

<script>
    import { createAxios, type as apiType } from '@/api';
    import { DetailView, DetailViewSection } from '@/components/detailViews';
    import { DialogConfirmation } from '@/components/dialogs';
    import { NumberField } from '@/components/inputs';
    import { type as feeConfigurationGroupType } from '@/enums/feeConfigurationGroup'
    import { productType, state } from '@/enums/return';
    import { ReturnLineDialog } from './components';
    import { formatters } from '@/mixins';
    import { mapGetters } from 'vuex';

    export default  {
        name: 'Return',
        components: { DetailView, DetailViewSection, DialogConfirmation, NumberField, ReturnLineDialog },
        mixins: [formatters],
        data() {
            return {
                apiMock: null,
                apiReturns: null,
                dialogConfirmation: {
                    handler: () => {
                    },
                    message: null,
                    visible: false
                },
                feeConfigurationGroups: [],
                loading: 0,
                labelCount: null,
                labelCountRules: [
                    this.validateLabelCountInteger,
                    this.validateLabelCountMin
                ],
                returnEntry: null,
                returnLineToEdit: null
            };
        },
        computed: {
            ...mapGetters(
                'oidcStore',
                {
                    user: 'oidcUser'
                }
            ),
            actionsReturn() {
                return [
                    {
                        handleClick: this.handleApprove,
                        hidden: !this.returnEntry || this.returnEntry.State !== state.NEW.value,
                        label: 'Approve'
                    },
                    {
                        handleClick: this.handleDelete,
                        hidden: !this.returnEntry || this.returnEntry.State !== state.NEW.value,
                        label: 'Delete'
                    }
                ];
            },
            feeConfigurationGroupsById() {
                return this.feeConfigurationGroups.reduce(
                    (accumulator, feeConfigurationGroup) => ({
                        ...accumulator,
                        [feeConfigurationGroup.Id]: feeConfigurationGroup
                    }),
                    {}
                );
            },
            feesReturn() {
                return (
                    (
                        this.returnEntry &&
                        Object
                            .entries(
                                this.returnEntry.Fees.reduce(
                                    (accumulator, fee) => ({
                                        ...accumulator,
                                        [fee.Configuration.FeeConfigurationGroupId]: (accumulator[fee.Configuration.FeeConfigurationGroupId] || 0) + fee.Value
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
                            ))
                    ) ||
                    []
                );
            },
            feeTotalReturn() {
                return this.feesReturn.reduce((accumulator, { Value }) => accumulator + Value, 0);
            },
            productTypeLabels() {
                return Object
                    .values(productType)
                    .reduce(
                        (accumulator, productType) => ({
                            ...accumulator,
                            [productType.value]: productType.label
                        }),
                        {}
                    );
            },
            returnId() {
                const returnId = parseInt(this.$route.params.returnId);

                return isNaN(returnId) ? 0 : returnId;
            },
            state() {
                return state;
            },
            tableHeaders() {
                const headers = [
                    {
                        align: 'center',
                        text: '#',
                        value: 'Id'
                    },
                    {
                        align: 'center',
                        text: 'Type',
                        value: 'ProductType'
                    },
                    {
                        align: 'center',
                        cellClass: 'text-uppercase',
                        text: 'Purchase invoice number',
                        value: 'InvoiceNumberPurchase'
                    },
                    {
                        align: 'center',
                        cellClass: 'text-uppercase',
                        hidden: !this.returnEntry || this.returnEntry.State === state.NEW.value,
                        text: 'Return invoice number',
                        value: 'InvoiceNumberReturn'
                    },
                    {
                        align: 'center',
                        cellClass: 'text-uppercase',
                        text: 'Product identifier',
                        value: 'ProductId'
                    },
                    {
                        align: 'center',
                        cellClass: 'text-uppercase',
                        text: 'Serial number',
                        value: 'SerialNumber'
                    },
                    {
                        align: 'center',
                        text: 'Unit price',
                        value: 'PriceUnit'
                    },
                    {
                        align: 'center',
                        text: 'Quantity',
                        value: 'Quantity'
                    },
                    {
                        align: 'center',
                        text: 'Note',
                        value: 'NoteReturn'
                    },
                    {
                        align: 'center',
                        hidden: !this.returnEntry || this.returnEntry.State === state.NEW.value,
                        text: 'Response',
                        value: 'NoteResponse'
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
                        value: 'actions'
                    }
                ];

                return headers.filter((header) => !header.hidden);
            },
            tableItems() {
                return (
                    (
                        this.returnEntry &&
                        this.returnEntry.Lines.map((line) => ({
                            ...line,
                            Fees: Object
                                .entries(
                                    line.Fees.reduce(
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
                            feeTotal: line.Fees.reduce((accumulator, { Value }) => accumulator + Value, 0)
                        }))
                    ) ||
                    []
                );
            }
        },
        async created() {
            this.apiMock = createAxios(apiType.MOCK);

            this.apiReturns = createAxios(apiType.RETURNS, this.$root.companyId);

            await this.loadFeeConfigurationGroups();

            await this.load();
        },
        methods: {
            handleApprove() {
                this.dialogConfirmation.handler = async () => {
                    try {
                        this.loading++;

                        await this.apiReturns.post(`returns(${this.returnEntry.Id})/approve`);
                    } catch (error) {
                        this.$root.handleError(error);
                    } finally {
                        await this.load();

                        this.loading--;
                    }
                };
                this.dialogConfirmation.message = 'Are you sure you want to approve the return, this operation is not reversible?';
                this.dialogConfirmation.visible = true;
            },
            handleDelete() {
                this.dialogConfirmation.handler = async () => {
                    try {
                        this.loading++;

                        await this.apiReturns.delete(`returns(${this.returnEntry.Id})`);

                        await this.$router.push({ name: 'Reutrns' });
                    } catch (error) {
                        this.$root.handleError(error);
                    } finally {
                        this.loading--;
                    }
                };
                this.dialogConfirmation.message = 'Are you sure you want to delete the return, this operation is not reversible?';
                this.dialogConfirmation.visible = true;
            },
            handleDialogConfirmationCancel() {
                this.dialogConfirmation.handler = () => {
                };
                this.dialogConfirmation.message = null;
                this.dialogConfirmation.visible = false;
            },
            async handleDialogConfirmationConfirm() {
                await this.dialogConfirmation.handler();

                this.dialogConfirmation.handler = () => {
                };
                this.dialogConfirmation.message = null;
                this.dialogConfirmation.visible = false;
            },
            async handleLabelCountChange() {
                if (this.$refs.labelCount.validate()) {
                    try {
                        this.loading++;

                        await this.apiReturns.patch(
                            `returns(${this.returnEntry.Id})`,
                            {
                                LabelCount: this.labelCount
                            }
                        );
                    } catch (error) {
                        this.$root.handleError(error);
                    } finally {
                        this.loading--;
                    }
                }
            },
            handleReturnLineAttachments(returnLine) {
                // TODO
            },
            handleReturnLineEdit(returnLine) {
                this.returnLineToEdit = {
                    ...returnLine,
                    FeeConfigurationGroupIdDamagePackage: (
                        returnLine.Fees.find((fee) => fee.Type === feeConfigurationGroupType.DAMAGE_PACKAGE) ||
                        { Id: null }
                    ).Id,
                    FeeConfigurationGroupIdDamageProduct: (
                        returnLine.Fees.find((fee) => fee.Type === feeConfigurationGroupType.DAMAGE_PRODUCT) ||
                        { Id: null }
                    ).Id,
                    Note: returnLine.NoteReturn
                };
            },
            handleReturnLineEditCancel() {
                this.returnLineToEdit = null;
            },
            async handleReturnLineEditConfirm(returnLineUpdate) {
                try {
                    this.loading++;

                    const returnLineUpdated = {
                        ...this.returnLineToEdit,
                        ...returnLineUpdate
                    };

                    await this.apiReturns.put(
                        `returns(${this.returnEntry.Id})/lines(${returnLineUpdated.Id})`,
                        {
                            FeeConfigurationGroupIdDamagePackage: returnLineUpdated.FeeConfigurationGroupIdDamagePackage,
                            FeeConfigurationGroupIdDamageProduct: returnLineUpdated.FeeConfigurationGroupIdDamageProduct,
                            InvoiceNumber: returnLineUpdated.InvoiceNumberPurchase,
                            Note: returnLineUpdated.Note,
                            ProductId: returnLineUpdated.ProductId,
                            ProductType: returnLineUpdated.ProductType,
                            Quantity: returnLineUpdated.Quantity,
                            Reference: returnLineUpdated.Id.toString(),
                            SerialNumber: returnLineUpdated.SerialNumber
                        }
                    );

                    this.returnLineToEdit = null;

                    await this.load();
                } catch (error) {
                    this.$root.handleError(error);
                } finally {
                    this.loading--;
                }
            },
            handleReturnLineRemove(returnLine) {
                this.dialogConfirmation.handler = async () => {
                    try {
                        this.loading++;

                        await this.apiReturns.delete(`returns(${this.returnEntry.Id})/lines(${returnLine.Id})`);

                        await this.load();
                    } catch (error) {
                        this.$root.handleError(error);
                    } finally {
                        this.loading--;
                    }
                };
                this.dialogConfirmation.message = 'Are you sure you want to delete the return line, this operation is not reversible?';
                this.dialogConfirmation.visible = true;
            },
            async load() {
                const redirect = async () => {
                    await this.$router.replace({
                        name: 'Returns'
                    });
                };

                try {
                    this.loading++;

                    if (this.returnId) {
                        const { data: returnEntry } = await this.apiReturns.get(
                            `returns(${this.returnId})`,
                            {
                                params: {
                                    $expand: (
                                        'Fees($expand=Configuration($select=FeeConfigurationGroupId);$filter=Value gt 0;$select=Configuration,Value),' +
                                        'Lines($expand=Fees($expand=Configuration($select=FeeConfigurationGroupId);$filter=Value gt 0;$select=Configuration,Value))'
                                    )
                                }
                            }
                        );

                        this.returnEntry = returnEntry;

                        this.labelCount = returnEntry.LabelCount;
                    } else {
                        await redirect();
                    }
                } catch (error) {
                    if (error.response && error.response.status === 404) {
                        await redirect();
                    } else {
                        this.$root.handleError(error);
                    }
                } finally {
                    this.loading--;
                }
            },
            async loadFeeConfigurationGroups() {
                try {
                    this.loading++;

                    const { data: { value: feeConfigurationGroups } } = await this.apiReturns.get(
                        'feeConfigurationGroups',
                        {
                            params: {
                                $select: 'Description,Id,Name,Order,Type'
                            }
                        }
                    );

                    this.feeConfigurationGroups = feeConfigurationGroups;
                } catch (error) {
                    this.$root.handleError(error);
                } finally {
                    this.loading--;
                }
            },
            validateLabelCountInteger(labelCount) {
                return (
                    Number.isInteger(+labelCount) ||
                    'Label count must be an integer'
                );
            },
            validateLabelCountMin(labelCount) {
                return (
                    +labelCount >= 0 ||
                    'Label count must be a non-negative integer'
                );
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

    .vertical-align-text-bottom {
        vertical-align: text-bottom;
    }
</style>
