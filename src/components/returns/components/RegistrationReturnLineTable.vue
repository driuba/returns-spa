<template>
    <div>
        <ReturnLineDialog
            :feeConfigurationGroups="feeConfigurationGroups"
            :returnLine="returnLineToEdit"
            @cancel="handleReturnLineEditCancel"
            @confirm="handleReturnLineEditConfirm"
        ></ReturnLineDialog>

        <DetailViewSection
            :loading="loading"
            :actions="actions"
        >
            <template #title>
                <div>
                    <span>Return information</span>

                    <v-icon
                        v-show="!!errorsReturn.length"
                        class="vertical-align-text-bottom"
                        color="error"
                    >
                        error
                    </v-icon>

                    <v-icon
                        v-show="estimated"
                        class="vertical-align-text-bottom"
                        color="success"
                    >
                        check_circle
                    </v-icon>
                </div>
            </template>

            <v-container fluid>
                <v-row>
                    <v-col>
                        <NumberField
                            :min="0"
                            :rules="labelCountRules"
                            :value="labelCount"
                            @change="handleLabelCountChange"
                            label="Lable count"
                            type="number"
                        ></NumberField>
                    </v-col>

                    <v-col>
                        <v-list
                            v-show="!!this.feesReturn.length"
                            dense
                        >
                            <v-subheader>Preliminary fees:</v-subheader>

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

                    <v-col>
                        <v-list
                            v-show="!!this.errorsReturn.length"
                            dense
                        >
                            <v-subheader>Errors:</v-subheader>

                            <v-list-item
                                v-for="(error, index) in errorsReturn"
                                :key="index"
                            >
                                {{ error }}
                            </v-list-item>
                        </v-list>
                    </v-col>
                </v-row>
            </v-container>
        </DetailViewSection>

        <DetailViewSection
            :loading="loading"
            title="Return lines"
        >
            <v-container fluid>
                <v-row>
                    <v-col>
                        <v-data-table
                            :headers="tableHeaders"
                            :items="returnLines"
                            :loading="loading"
                            :sort-by="['InvoiceLineId', 'index']"
                            multi-sort
                        >
                            <template #item.errors="{ item: { Reference } }">
                                <v-tooltip right>
                                    <template #activator="{ on }">
                                        <v-icon
                                            v-on="on"
                                            v-show="!!(errorsReturnLine[Reference] && errorsReturnLine[Reference].length)"
                                            color="error"
                                        >
                                            error_outline
                                        </v-icon>
                                    </template>

                                    <template>
                                        <div
                                            v-for="(error, index) in (errorsReturnLine[Reference] || [])"
                                            :key="index"
                                        >
                                            {{ error }}
                                        </div>
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
                                <td class="text-center text-truncate">
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

                            <!-- QuantityAvailable -->

                            <!-- Quantity -->

                            <template #item.Note="{ item: { Note } }">
                                <td class="text-center text-truncate">
                                    <v-tooltip top>
                                        <template #activator="{ on }">
                                            <span
                                                v-on="on"
                                                v-show="!!Note"
                                                class="d-inline-block text-truncate"
                                            >
                                                {{ Note }}
                                            </span>
                                        </template>

                                        <div class="text-pre-line">{{ Note }}</div>
                                    </v-tooltip>
                                </td>
                            </template>

                            <template #item.FeeConfigurationGroupIdDamagePackage="{ item: {FeeConfigurationGroupIdDamagePackage} }">
                                <v-tooltip top>
                                    <template #activator="{ on }">
                                        <span v-on="on">
                                            {{
                                                (
                                                    FeeConfigurationGroupIdDamagePackage &&
                                                    feeConfigurationGroupsById[FeeConfigurationGroupIdDamagePackage].Name
                                                )
                                            }}
                                        </span>
                                    </template>

                                    <template>
                                        {{
                                            (
                                                FeeConfigurationGroupIdDamagePackage &&
                                                feeConfigurationGroupsById[FeeConfigurationGroupIdDamagePackage].Description
                                            )
                                        }}
                                    </template>
                                </v-tooltip>
                            </template>

                            <template #item.FeeConfigurationGroupIdDamageProduct="{ item: { FeeConfigurationGroupIdDamageProduct } }">
                                <v-tooltip top>
                                    <template #activator="{ on }">
                                        <span v-on="on">
                                            {{
                                                (
                                                    FeeConfigurationGroupIdDamageProduct &&
                                                    feeConfigurationGroupsById[FeeConfigurationGroupIdDamageProduct].Name
                                                )
                                            }}
                                        </span>
                                    </template>

                                    <template>
                                        {{
                                            (
                                                FeeConfigurationGroupIdDamageProduct &&
                                                feeConfigurationGroupsById[FeeConfigurationGroupIdDamageProduct].Description
                                            )
                                        }}
                                    </template>
                                </v-tooltip>
                            </template>

                            <template #item.fees="{ item: { Reference } }">
                                <div
                                    v-show="!!(feesReturnLine[Reference] && feesReturnLine[Reference].length)"
                                    class="text-no-wrap"
                                >
                                    <span>{{ feeTotalReturnLine[Reference] | numberFormat(2) }} €</span>

                                    <v-tooltip top>
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
                                                v-for="(fee, index) in feesReturnLine[Reference]"
                                                :key="index"
                                            >
                                                {{ fee.Name }}: {{ fee.Value | numberFormat(2) }} €
                                            </div>
                                        </template>
                                    </v-tooltip>
                                </div>
                            </template>

                            <template #item.actions="{ item }">
                                <v-tooltip top>
                                    <template #activator="{ on }">
                                        <v-btn
                                            v-on="on"
                                            :loading="loading"
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
                                            :disabled="item.Quantity === 1"
                                            :loading="loading"
                                            @click="handleReturnLineSplit(item)"
                                            color="primary"
                                            icon
                                            x-small
                                        >
                                            <v-icon>horizontal_split</v-icon>
                                        </v-btn>
                                    </template>

                                    <template>Split</template>
                                </v-tooltip>

                                <v-tooltip top>
                                    <template #activator="{ on }">
                                        <v-btn
                                            v-on="on"
                                            :disabled="returnLines.length === 1"
                                            :loading="loading"
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
    </div>
</template>

<script>
    import { DetailViewSection } from '@/components/detailViews';
    import { NumberField } from '@/components/inputs';
    import { formatters } from '@/mixins';
    import ReturnLineDialog from './ReturnLineDialog';

    export default {
        name: 'RegistrationReturnLineTable',
        components: { DetailViewSection, NumberField, ReturnLineDialog },
        mixins: [formatters],
        model: {
            event: 'update:returnLines',
            prop: 'returnLines'
        },
        props: {
            estimated: {
                default: false,
                type: Boolean
            },
            feeConfigurationGroups: {
                default: () => [],
                type: Array
            },
            labelCount: {
                required: true,
                type: Number
            },
            loading: {
                default: false,
                type: Boolean
            },
            returnEstimated: {
                default: null,
                type: Object
            },
            returnLines: {
                required: true,
                type: Array
            }
        },
        data() {
            return {
                labelCountRules: [
                    this.validateLabelCountInteger,
                    this.validateLabelCountMin
                ],
                returnLineToEdit: null,
                tableHeaders: [
                    {
                        align: 'center',
                        sortable: false,
                        value: 'errors'
                    },
                    {
                        align: 'center',
                        sortable: false,
                        text: 'Invoice date',
                        value: 'InvoiceDate'
                    },
                    {
                        align: 'center',
                        sortable: false,
                        text: 'Invoice number',
                        value: 'InvoiceNumber'
                    },
                    {
                        align: 'center',
                        sortable: false,
                        text: 'Product identifier',
                        value: 'ProductId'
                    },
                    {
                        align: 'center',
                        sortable: false,
                        text: 'Serial number',
                        value: 'SerialNumber'
                    },
                    {
                        align: 'center',
                        sortable: false,
                        text: 'Product name',
                        value: 'ProductName'
                    },
                    {
                        align: 'center',
                        sortable: false,
                        text: 'Unit price',
                        value: 'PriceUnit'
                    },
                    {
                        align: 'center',
                        sortable: false,
                        text: 'Available quantity',
                        value: 'QuantityAvailable'
                    },
                    {
                        align: 'center',
                        sortable: false,
                        text: 'Quantity',
                        value: 'Quantity'
                    },
                    {
                        align: 'center',
                        sortable: false,
                        text: 'Note',
                        value: 'Note'
                    },
                    {
                        align: 'center',
                        sortable: false,
                        text: 'Package damage',
                        value: 'FeeConfigurationGroupIdDamagePackage'
                    },
                    {
                        align: 'center',
                        sortable: false,
                        text: 'Product damage',
                        value: 'FeeConfigurationGroupIdDamageProduct'
                    },
                    {
                        align: 'center',
                        sortable: false,
                        text: 'Preliminary fees',
                        value: 'fees'
                    },
                    {
                        align: 'center',
                        sortable: false,
                        value: 'actions'
                    }
                ]
            };
        },
        computed: {
            actions() {
                return [
                    {
                        color: 'info',
                        handleClick: this.estimate,
                        label: 'Estimate'
                    },
                    {
                        disabled: !this.estimated,
                        handleClick: this.register,
                        label: 'Register'
                    }
                ];
            },
            errorsReturn() {
                return (
                    (
                        this.returnEstimated &&
                        this.returnEstimated.Messages
                    ) ||
                    []
                );
            },
            errorsReturnLine() {
                return (
                    (
                        this.returnEstimated &&
                        this.returnEstimated.Lines.reduce(
                            (accumulator, line) => ({
                                ...accumulator,
                                [line.Reference]: line.Messages
                            }),
                            {}
                        )
                    ) ||
                    {}
                );
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
                        this.returnEstimated &&
                        Object
                            .entries(
                                this.returnEstimated.Lines
                                    .flatMap((line) => line.Fees)
                                    .concat(this.returnEstimated.Fees)
                                    .reduce(
                                        (accumulator, fee) => ({
                                            ...accumulator,
                                            [fee.FeeConfigurationGroupId]: (accumulator[fee.FeeConfigurationGroupId] || 0) + fee.Value
                                        }),
                                        {}
                                    )
                            )
                            // eslint-disable-next-line no-unused-vars
                            .filter(([_, value]) => value)
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
            feesReturnLine() {
                return (
                    (
                        this.returnEstimated &&
                        this.returnEstimated.Lines.reduce(
                            (accumulator, line) => ({
                                ...accumulator,
                                [line.Reference]: Object
                                    .entries(
                                        line.Fees.reduce(
                                            (accumulator, fee) => ({
                                                ...accumulator,
                                                [fee.FeeConfigurationGroupId]: (accumulator[fee.FeeConfigurationGroupId] || 0) + fee.Value
                                            }),
                                            {}
                                        )
                                    )
                                    // eslint-disable-next-line no-unused-vars
                                    .filter(([_, value]) => value)
                                    .map(([key, value]) => ({
                                        ...this.feeConfigurationGroupsById[key],
                                        Value: value
                                    }))
                                    .sort((a, b) => (
                                        a.Type.localeCompare(b.Type) ||
                                        (a.Order - b.Order)
                                    ))
                            }),
                            {}
                        )
                    ) ||
                    {}
                );
            },
            feeTotalReturn() {
                return this.feesReturn.reduce((accumulator, { Value }) => accumulator + Value, 0);
            },
            feeTotalReturnLine() {
                return Object
                    .entries(this.feesReturnLine)
                    .reduce(
                        (accumulator, [key, value]) => ({
                            ...accumulator,
                            [key]: value.reduce((accumulator, { Value }) => accumulator + Value, 0)
                        }),
                        {}
                    );
            }
        },
        methods: {
            estimate() {
                this.$emit('estimate');
            },
            handleLabelCountChange(labelCount) {
                this.$emit('update:labelCount', labelCount);
            },
            handleReturnLineEdit(returnLine) {
                this.returnLineToEdit = returnLine;
            },
            handleReturnLineEditCancel() {
                this.returnLineToEdit = null;
            },
            handleReturnLineEditConfirm(returnLineUpdate) {
                const returnLineUpdated = {
                    ...this.returnLineToEdit,
                    ...returnLineUpdate
                };

                this.$emit(
                    'update:returnLines',
                    [
                        ...this.returnLines.filter((returnLine) => returnLine.Reference !== returnLineUpdated.Reference),
                        returnLineUpdated
                    ]
                );

                this.returnLineToEdit = null;
            },
            handleReturnLineRemove(returnLineToRemove) {
                this.$emit(
                    'update:returnLines',
                    this.returnLines.filter((returnLine) => returnLine.Reference !== returnLineToRemove.Reference)
                );
            },
            handleReturnLineSplit(returnLineToSplit) {
                const returnLineExisting = {
                    ...returnLineToSplit,
                    index: returnLineToSplit.index || 0,
                    Quantity: returnLineToSplit.Quantity - 1
                };

                const returnLineNew = {
                    ...returnLineToSplit,
                    FeeConfigurationGroupIdDamagePackage: null,
                    FeeConfigurationGroupIdDamageProduct: null,
                    index: (returnLineToSplit.index + 1) || 1,
                    Note: null,
                    Quantity: 1,
                    Reference: crypto.randomUUID()
                };

                this.$emit(
                    'update:returnLines',
                    [
                        ...this.returnLines.filter((returnLine) => returnLine.Reference !== returnLineToSplit.Reference),
                        returnLineExisting,
                        returnLineNew
                    ]
                );
            },
            register() {
                this.$emit('register');
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
