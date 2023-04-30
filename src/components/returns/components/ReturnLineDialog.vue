<template>
    <Dialog
        :actions="actions"
        :visible="!!returnLine"
        max-width="460"
        persistent
        title="Edit return line"
    >
        <v-form ref="form">
            <v-container fluid>
                <v-row>
                    <v-col>
                        <TextAreaField
                            v-model="model.Note.value"
                            :rules="model.Note.rules"
                            clearable
                            counter
                            label="Note"
                        ></TextAreaField>
                    </v-col>
                </v-row>

                <v-row v-show="productTypeSelected === productType.NEW.value">
                    <v-col>
                        <SelectField
                            v-model="model.FeeConfigurationGroupIdDamagePackage.value"
                            :items="feeConfigurationGroupsDamagePackage"
                            clearable
                            item-text="Name"
                            item-value="Id"
                            label="Package damage"
                        ></SelectField>
                    </v-col>
                </v-row>

                <v-row v-show="productTypeSelected === productType.NEW.value">
                    <v-col>
                        <SelectField
                            v-model="model.FeeConfigurationGroupIdDamageProduct.value"
                            :items="feeConfigurationGroupsDamageProduct"
                            clearable
                            item-text="Name"
                            item-value="Id"
                            label="Product damage"
                        ></SelectField>
                    </v-col>
                </v-row>

                <v-row>
                    <v-col>
                        <NumberField
                            v-model="model.Quantity.value"
                            :max="quantityAvailable"
                            :min="1"
                            :readonly="quantityAvailable === 1"
                            :rules="model.Quantity.rules"
                            label="Quantity"
                            type="number"
                        ></NumberField>
                    </v-col>
                </v-row>
            </v-container>
        </v-form>
    </Dialog>
</template>

<script>
    import { NumberField, SelectField, TextAreaField } from '@/components/inputs';
    import { Dialog } from '@/components/dialogs';
    import { productType } from '@/enums/return';
    import { type as feeConfigurationGroupType } from '@/enums/feeConfigurationGroup';

    export default {
        name: 'ReturnLineDialog',
        components: { Dialog, NumberField, SelectField, TextAreaField },
        model: {
            event: 'update:returnLine',
            prop: 'returnLine'
        },
        props: {
            feeConfigurationGroups: {
                required: true,
                type: Array
            },
            returnLine: {
                default: null,
                type: Object
            }
        },
        data() {
            return {
                actions: [
                    {
                        handleClick: this.handleCancel,
                        label: 'Cancel'
                    },
                    {
                        handleClick: this.handleConfirm,
                        label: 'Confirm'
                    }
                ],
                model: {
                    FeeConfigurationGroupIdDamagePackage: {
                        value: null
                    },
                    FeeConfigurationGroupIdDamageProduct: {
                        value: null
                    },
                    Note: {
                        rules: [this.validateReturnLineNoteLength],
                        value: null
                    },
                    Quantity: {
                        rules: [
                            this.validateReturnLineQuantityInteger,
                            this.validateReturnLineQuantityMax,
                            this.validateReturnLineQuantityMin
                        ],
                        value: null
                    }
                }
            };
        },
        computed: {
            feeConfigurationGroupsDamagePackage() {
                return this.feeConfigurationGroups
                    .filter((feeConfigurationGroup) => feeConfigurationGroup.Type === feeConfigurationGroupType.DAMAGE_PACKAGE)
                    .sort((a, b) => a.Order - b.Order);
            },
            feeConfigurationGroupsDamageProduct() {
                return this.feeConfigurationGroups
                    .filter((feeConfigurationGroup) => feeConfigurationGroup.Type === feeConfigurationGroupType.DAMAGE_PRODUCT)
                    .sort((a, b) => a.Order - b.Order);
            },
            productType() {
                return productType;
            },
            productTypeSelected() {
                return this.returnLine && this.returnLine.ProductType;
            },
            quantityAvailable() {
                return this.returnLine && this.returnLine.QuantityAvailable;
            }
        },
        watch: {
            returnLine(returnLine) {
                Object
                    .keys(this.model)
                    .forEach((key) => this.model[key].value = returnLine && returnLine[key]);
            }
        },
        methods: {
            handleCancel() {
                this.$emit('cancel');
            },
            handleConfirm() {
                if (this.$refs.form.validate()) {
                    this.$emit(
                        'confirm',
                        Object
                            .entries(this.model)
                            .reduce(
                                (accumulator, [key, value]) => ({
                                    ...accumulator,
                                    [key]: value.value
                                }),
                                {}
                            )
                    );
                }
            },
            validateReturnLineNoteLength(note) {
                return (
                    !note ||
                    note.length <= 500 ||
                    'Note length must be less than or equal to 500 characters'
                );
            },
            validateReturnLineQuantityInteger(quantity) {
                return (
                    Number.isInteger(+quantity) ||
                    'Quantity must be an integer'
                );
            },
            validateReturnLineQuantityMax(quantity) {
                return (
                    typeof this.quantityAvailable !== 'number' ||
                    +quantity <= this.quantityAvailable ||
                    `Quantity must be less than or equal to ${this.quantityAvailable}`
                );
            },
            validateReturnLineQuantityMin(quantity) {
                return (
                    +quantity >= 1 ||
                    'Quantity must be a positive integer'
                );
            }
        }
    };
</script>
