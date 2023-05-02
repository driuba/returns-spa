<template>
    <div>
        <DialogConfirmation
            :visible="dialogConfirmation.visible"
            @cancel="dialogConfirmation.visible = false"
            @confirm="dialogConfirmation.handler()"
        >
            Are you sure you want to go back to a previous step?
            Your current progress will be lost.

        </DialogConfirmation>

        <DetailView
            :loading="!!loading"
            title="Return products"
        >
            <v-tabs
                v-model="tabSelected"
                @change="handleTabChange"
            >
                <v-tab @click.stop.prevent.self>
                    Product type
                </v-tab>

                <v-tab :disabled="!model.productType">
                    Delivery point
                </v-tab>

                <v-tab :disabled="!(model.deliveryPointId && model.productType)">
                    Invoice lines
                </v-tab>

                <v-tab :disabled="!model.invoiceLines.length">
                    Return lines
                </v-tab>

                <v-tabs-items :value="tabDisplayed">
                    <v-tab-item>
                        <RegistrationProductTypeSelection
                            v-model="model.productType"
                            :loading="!!loading"
                            :disabled="!!returnId"
                        />
                    </v-tab-item>

                    <v-tab-item>
                        <RegistrationDeliveryPointSelection
                            v-model="model.deliveryPointId"
                            :deliveryPoints="deliveryPointSearch.items"
                            :disabled="!!returnId"
                            :loading="!!loading"
                            :loadingDeliveryPoints="deliveryPointSearch.loading"
                            @search:deliveryPoints="handleDeliveryPointsSearch"
                            @update:deliveryPointId="handleDeliveryPointIdUpdate"
                        />
                    </v-tab-item>

                    <v-tab-item>
                        <RegistrationInvoiceLineTable
                            v-model="model.invoiceLines"
                            :deliveryPointIdSelected="model.deliveryPointId"
                            :invoiceLines="invoiceLines"
                            :loading="!!loading"
                            :loadingProducts="productSearch.loading"
                            :products="productSearch.items"
                            :productTypeSelected="model.productType"
                            :returnAvailability="returnAvailability.value"
                            @load:invoiceLines="handleInvoiceLinesLoad"
                            @load:products="handleProductsLoad"
                            ref="invoiceLinesTable"
                        />
                    </v-tab-item>

                    <v-tab-item>
                        <RegistrationReturnLineTable
                            v-model="model.returnLines"
                            :estimated="model.estimated"
                            :feeConfigurationGroups="feeConfigurationGroups"
                            :labelCount.sync="model.labelCount"
                            :labelCountDisabled="!!returnId"
                            :loading="!!loading"
                            :returnEstimated="returnEstimated"
                            @estimate="handleEstimate"
                            @register="handleRegister"
                            @update:returnLines="model.estimated = false"
                        />
                    </v-tab-item>
                </v-tabs-items>
            </v-tabs>
        </DetailView>
    </div>
</template>

<script>
    import { createAxios, type as apiType } from '@/api';
    import { DetailView } from '@/components/detailViews';
    import { DialogConfirmation } from '@/components/dialogs';
    import { productType } from '@/enums/return';
    import { DateTime } from 'luxon';
    import {
        RegistrationDeliveryPointSelection,
        RegistrationInvoiceLineTable,
        RegistrationProductTypeSelection,
        RegistrationReturnLineTable
    } from './components';

    export default {
        name: 'ReturnRegistration',
        components: {
            DetailView,
            DialogConfirmation,
            RegistrationDeliveryPointSelection,
            RegistrationInvoiceLineTable,
            RegistrationProductTypeSelection,
            RegistrationReturnLineTable
        },
        data() {
            return {
                apiMock: null,
                apiReturns: null,
                deliveryPointSearch: {
                    input: null,
                    items: [],
                    loading: false,
                    timeout: null
                },
                dialogConfirmation: {
                    handler: () => {},
                    visible: false
                },
                feeConfigurationGroups: [],
                invoiceLines: [],
                loading: 0,
                model: {
                    deliveryPointId: null,
                    estimated: false,
                    invoiceLines: [],
                    labelCount: 0,
                    productType: null,
                    returnLines: []
                },
                productSearch: {
                    items: [],
                    loading: false
                },
                returnAvailability: {
                    deliveryPointId: null,
                    value: null
                },
                returnEstimated: null,
                tabDisplayed: 0,
                tabSelected: 0
            };
        },
        computed: {
            productType() {
                return productType;
            },
            returnId() {
                const returnId = parseInt(this.$route.params.returnId);

                return isNaN(returnId) ? 0 : returnId;
            }
        },
        async created() {
            this.apiMock = createAxios(apiType.MOCK);

            this.apiReturns = createAxios(apiType.RETURNS, this.$root.companyId);

            await this.loadFeeConfigurationGroups();

            if (this.returnId) {
                await this.loadReturn();
            }

            if (this.model.deliveryPointId) {
                await this.loadAvailability(this.model.deliveryPointId);
            }
        },
        methods: {
            handleDeliveryPointsSearch(input) {
                clearTimeout(this.deliveryPointSearch.timeout);

                this.deliveryPointSearch.timeout = setTimeout(
                    async () => {
                        if (input && input.length > 2 && this.deliveryPointSearch.input !== input) {
                            this.deliveryPointSearch.input = input;
                            this.deliveryPointSearch.loading = true;

                            const deliveryPoints = await this.loadDeliveryPoints(input);

                            if (deliveryPoints) {
                                this.deliveryPointSearch.items = deliveryPoints;
                            }

                            this.deliveryPointSearch.loading = false;
                        }
                    },
                    500
                );
            },
            async handleDeliveryPointIdUpdate(deliveryPointId) {
                if (deliveryPointId && this.returnAvailability.deliveryPointId !== deliveryPointId) {
                    this.returnAvailability.deliveryPointId = deliveryPointId;

                    await this.loadAvailability(deliveryPointId);
                }
            },
            async handleEstimate() {
                try {
                    this.loading++;

                    const { data: returnEstimated } = await this.apiReturns.post(
                        'returns/estimate',
                        {
                            DeliveryPointId: this.model.deliveryPointId,
                            LabelCount: this.model.labelCount,
                            Lines: this.model.returnLines.map((returnLine) => ({
                                FeeConfigurationGroupIdDamagePackage: returnLine.FeeConfigurationGroupIdDamagePackage,
                                FeeConfigurationGroupIdDamageProduct: returnLine.FeeConfigurationGroupIdDamageProduct,
                                InvoiceNumber: returnLine.InvoiceNumber,
                                Note: returnLine.Note,
                                ProductId: returnLine.ProductId,
                                ProductType: returnLine.ProductType,
                                Quantity: returnLine.Quantity,
                                Reference: returnLine.Reference,
                                SerialNumber: returnLine.SerialNumber
                            }))
                        }
                    );

                    this.returnEstimated = returnEstimated;

                    this.model.estimated = (
                        !returnEstimated.Messages.length &&
                        returnEstimated.Lines.every((line) => !line.Messages.length)
                    );
                } catch (error) {
                    this.$root.handleError(error);
                } finally {
                    this.loading--;
                }
            },
            async handleInvoiceLinesLoad(request) {
                try {
                    this.loading++;

                    const { data: { value: invoiceLines } } = await this.apiReturns.post('filterInvoiceLines', request);

                    this.invoiceLines = invoiceLines;
                } catch (error) {
                    this.$root.handleError(error);
                } finally {
                    this.loading--;
                }
            },
            async handleProductsLoad(searchInput) {
                try {
                    this.productSearch.loading = true;

                    const { data: products } = await this.apiMock.get(
                        'products',
                        {
                            params: {
                                search: searchInput
                            }
                        }
                    );

                    this.productSearch.items = products.map((product) => ({
                        ...product,
                        Id: product.Id.toLowerCase()
                    }));
                } catch (error) {
                    this.$root.handleError(error);
                } finally {
                    this.productSearch.loading = false;
                }
            },
            async handleRegister() {
                try {
                    this.loading++;

                    if (this.returnId) {
                        await this.apiReturns.post(
                            `returns(${this.returnId})/lines`,
                            {
                                Lines: this.model.returnLines.map((returnLine) => ({
                                    FeeConfigurationGroupIdDamagePackage: returnLine.FeeConfigurationGroupIdDamagePackage,
                                    FeeConfigurationGroupIdDamageProduct: returnLine.FeeConfigurationGroupIdDamageProduct,
                                    InvoiceNumber: returnLine.InvoiceNumber,
                                    Note: returnLine.Note,
                                    ProductId: returnLine.ProductId,
                                    ProductType: returnLine.ProductType,
                                    Quantity: returnLine.Quantity,
                                    Reference: returnLine.Reference,
                                    SerialNumber: returnLine.SerialNumber
                                }))
                            }
                        );

                        await this.$router.push({
                            name: 'Return',
                            params: {
                                returnId: this.returnId
                            }
                        });
                    } else {
                        const { data: { Id } } = await this.apiReturns.post(
                            'returns',
                            {
                                DeliveryPointId: this.model.deliveryPointId,
                                LabelCount: this.model.labelCount,
                                Lines: this.model.returnLines.map((returnLine) => ({
                                    FeeConfigurationGroupIdDamagePackage: returnLine.FeeConfigurationGroupIdDamagePackage,
                                    FeeConfigurationGroupIdDamageProduct: returnLine.FeeConfigurationGroupIdDamageProduct,
                                    InvoiceNumber: returnLine.InvoiceNumber,
                                    Note: returnLine.Note,
                                    ProductId: returnLine.ProductId,
                                    ProductType: returnLine.ProductType,
                                    Quantity: returnLine.Quantity,
                                    Reference: returnLine.Reference,
                                    SerialNumber: returnLine.SerialNumber
                                }))
                            }
                        );

                        await this.$router.push({
                            name: 'Return',
                            params: {
                                returnId: Id
                            }
                        });
                    }
                } catch (error) {
                    this.$root.handleError(error);
                } finally {
                    this.loading--;
                }
            },
            async handleTabChange(tab) {
                if (this.tabDisplayed > 1 && this.tabDisplayed > tab) {
                    await this.$nextTick();

                    this.tabSelected = this.tabDisplayed;

                    this.dialogConfirmation.handler = () => {
                        if (this.tabDisplayed === 3) {
                            this.model.estimated = false;
                            this.model.returnLines = [];
                            this.returnEstimated = null;
                        }

                        if (this.tabDisplayed >= 2 && tab < 2) {
                            this.model.invoiceLines = [];
                        }

                        this.tabDisplayed = this.tabSelected = tab;

                        this.dialogConfirmation.visible = false;
                    };

                    this.dialogConfirmation.visible = true;
                } else {
                    if (tab === 2) {
                        if (this.$refs.invoiceLinesTable) {
                            await this.$refs.invoiceLinesTable.reset();
                        }
                    } else if (tab === 3) {
                        this.model.returnLines = this.model.invoiceLines.map((invoiceLine) => ({
                            FeeConfigurationGroupIdDamagePackage: null,
                            FeeConfigurationGroupIdDamageProduct: null,
                            InvoiceDate: invoiceLine.InvoiceDate,
                            InvoiceLineId: invoiceLine.Id,
                            InvoiceNumber: invoiceLine.InvoiceNumber,
                            Note: null,
                            PriceUnit: invoiceLine.PriceUnit,
                            ProductId: invoiceLine.ProductId,
                            ProductName: invoiceLine.ProductName,
                            Quantity: this.model.productType === productType.SERVICED.value
                                ? 1
                                : invoiceLine.QuantityInvoiced - invoiceLine.QuantityReturned,
                            QuantityAvailable: this.model.productType === productType.SERVICED.value
                                ? 1
                                : invoiceLine.QuantityInvoiced - invoiceLine.QuantityReturned,
                            Reference: crypto.randomUUID(),
                            ProductType: this.model.productType,
                            SerialNumber: invoiceLine.SerialNumber
                        }));
                    }

                    this.tabDisplayed = tab;
                    this.tabSelected = tab;
                }
            },
            async loadAvailability(deliveryPointId) {
                try {
                    this.loading++;

                    const { data: { Days } } = await this.apiReturns.get(
                        `returnAvailabilities/filter(deliveryPointId='${deliveryPointId}')`,
                        {
                            params: {
                                $select: 'Days'
                            }
                        }
                    );

                    this.returnAvailability.value = DateTime
                        .now()
                        .startOf('days')
                        .plus({ days: -Days })
                        .toISODate();
                } catch (error) {
                    this.$root.handleError(error);
                } finally {
                    this.loading--;
                }
            },
            async loadDeliveryPoints(searchInput) {
                try {
                    const { data: deliveryPoints } = await this.apiMock.get(
                        `${this.$root.companyId}/customers`,
                        {
                            params: {
                                search: searchInput
                            }
                        }
                    );

                    return deliveryPoints.map((deliveryPoint) => ({
                        ...deliveryPoint,
                        Id: deliveryPoint.Id.toLowerCase(),
                        ParentId: deliveryPoint.ParentId && deliveryPoint.ParentId.toLowerCase()
                    }));
                } catch (error) {
                    this.$root.handleError(error);

                    return null;
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
            async loadReturn() {
                try {
                    this.loading++;

                    const { data: { DeliveryPointId, LabelCount, Lines } } = await this.apiReturns.get(
                        `returns(${this.returnId})`,
                        {
                            params: {
                                $expand: 'Lines($select=ProductType)',
                                $select: 'DeliveryPointId,LabelCount,Lines'
                            }
                        }
                    );

                    if (Lines.some(({ ProductType }) => ProductType === productType.UNDER_WARRANTY.value)) {
                        this.$root.handleError(new Error('Only a single serviced product may be registered within a single return document.'));

                        await this.$router.replace({ name: 'Returns' });
                    }

                    this.model.deliveryPointId = DeliveryPointId;
                    this.model.labelCount = LabelCount;

                    this.deliveryPointSearch.items = await this.loadDeliveryPoints(DeliveryPointId);
                } catch (error) {
                    if (error.response && error.response.status === 404) {
                        this.$root.handleError(new Error(`Return ${this.returnId} was not found.`));

                        await this.$router.replace({ name: 'Returns' });
                    } else {
                        this.$root.handleError(error);
                    }
                } finally {
                    this.loading--;
                }
            }
        }
    };
</script>
