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
            title="Register return"
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

                <v-tab :disabled="!model.deliveryPointId">
                    Invoice lines
                </v-tab>

                <v-tab :disabled="!model.returnLines.length">
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
                            :invoiceLines="invoiceLines"
                            :loading="!!loading"
                            :loadingProducts="productSearch.loading"
                            :products="productSearch.items"
                            :productTypeSelected="model.productType"
                            :returnAvailability="returnAvailability.value"
                            @load:invoiceLinea="handleInvoiceLinesLoad"
                            @load:products="handleProductsLoad"
                            ref="invoiceLinesTable"
                        />
                    </v-tab-item>

                    <v-tab-item>
                        <RegistrationReturnLineTable
                            v-model="model.returnLines"
                            :loading="!!loading"
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
                invoiceLines: [],
                loading: 0,
                model: {
                    deliveryPointId: null,
                    estimated: false,
                    invoiceLines: [],
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

            if (this.returnId) {
                await this.loadReturn();
            }

            if (this.model.deliveryPointId) {
                await this.loadAvailability(this.model.deliveryPointId);
            }
        },
        methods: {
            async handleDeliveryPointIdUpdate(deliveryPointId) {
                if (deliveryPointId && this.returnAvailability.deliveryPointId !== deliveryPointId) {
                    this.returnAvailability.deliveryPointId = deliveryPointId;

                    await this.loadAvailability(deliveryPointId);
                }
            },
            handleInvoiceLinesLoad(filter) {

            },
            handleProductsLoad(searchInput) {
            },
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
            async handleTabChange(tab) {
                if (this.tabDisplayed > 1 && this.tabDisplayed > tab) {
                    await this.$nextTick();

                    this.tabSelected = this.tabDisplayed;

                    this.dialogConfirmation.handler = () => {
                        this.tabDisplayed = this.tabSelected = tab;

                        this.dialogConfirmation.visible = false;
                    };

                    this.dialogConfirmation.visible = true;
                } else {
                    if (tab === 2) {
                        if (this.$refs.invoiceLinesTable) {
                            await this.$refs.invoiceLinesTable.reset();
                        }
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
            async loadReturn() {
                try {
                    this.loading++;

                    const { data: { DeliveryPointId, Lines } } = await this.apiReturns.get(
                        `returns(${this.returnId})`,
                        {
                            params: {
                                $expand: 'Lines($select=ProductType)',
                                $select: 'DeliveryPointId,Lines'
                            }
                        }
                    );

                    this.model.deliveryPointId = DeliveryPointId || null;

                // TODO
                } catch (error) {
                    if (error.response && error.response.status === 404) {
                        this.$root.handleError(new Error(`Return ${this.returnId} was not found.`));

                        await this.$router.replace({
                            name: 'Returns',
                            params: {
                                companyId: this.$root.companyId
                            }
                        });
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
