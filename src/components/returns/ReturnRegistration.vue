<template>
    <div>
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
                            :invoiceLines="invoiceLineFilter.items"
                            :loading="!!loading"
                            :loadingProducts="productSearch.loading"
                            :products="productSearch.items"
                            :returnAvailability="model.productType === productType.NEW.value ? returnAvailability.value : null"
                            @filter:invoiceLinea="handleInvoiceLinesFilter"
                            @search:producta="handleProductsSearch"
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
                invoiceLineFilter: {
                    from: null,
                    items: [],
                    productId: null,
                    search: null,
                    to: null
                },
                loading: 0,
                model: {
                    deliveryPointId: null,
                    invoiceLines: [],
                    productType: null,
                    returnLines: []
                },
                productSearch: {
                    input: null,
                    items: [],
                    loading: false,
                    timeout: null
                },
                returnAvailability: {
                    deliveryPointId: null,
                    timeout: null,
                    value: null
                },
                tabDisplayed: null,
                tabSelected: null
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
            handleDeliveryPointIdUpdate(deliveryPointId) {
                clearTimeout(this.returnAvailability.timeout);

                if (deliveryPointId) {
                    this.returnAvailability.timeout = setTimeout(
                        () => this.loadAvailability(deliveryPointId),
                        500
                    );
                }
            },
            handleInvoiceLinesFilter() {},
            handleProductsSearch() {},
            handleDeliveryPointsSearch(input) {
                if (input !== this.deliveryPointSearch.input) {
                    this.deliveryPointSearch.input = input;

                    clearTimeout(this.deliveryPointSearch.timeout);

                    if (input && input.length > 2) {
                        this.deliveryPointSearch.timeout = setTimeout(
                            async () => {
                                this.deliveryPointSearch.loading = true;

                                const deliveryPoints = await this.loadDeliveryPoints(input);

                                if (deliveryPoints) {
                                    this.deliveryPointSearch.items = deliveryPoints;
                                }

                                this.deliveryPointSearch.loading = false;
                            },
                            500
                        );
                    }
                }
            },
            async handleTabChange(tab) {
                if (this.tabDisplayed > tab) {
                    await this.$nextTick();

                    this.tabSelected = this.tabDisplayed;
                } else {
                    this.tabDisplayed = tab;
                    this.tabSelected = tab;
                }
            },
            async loadAvailability(deliveryPointId) {
                try {
                    this.loading++;

                    if (this.returnAvailability.deliveryPointId !== deliveryPointId) {
                        const { data: { Days } } = await this.apiReturns.get(
                            `returnAvailabilities/filter(deliveryPointId='${deliveryPointId}')`,
                            {
                                params: {
                                    $select: 'Days'
                                }
                            }
                        );

                        this.returnAvailability.deliveryPointId = deliveryPointId;

                        this.returnAvailability.value = DateTime
                            .now()
                            .plus({ days: -Days })
                            .startOf('day')
                            .toJSON();
                    }
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
