<template>
    <div>
        <DetailView
            :loading="loading"
            title="Returns">
            <DetailViewSection
                :actions="actions"
                :loading="loading"
                title="Return list"
            >
                <!-- TODO -->
            </DetailViewSection>
        </DetailView>
    </div>
</template>

<script>
    import { createAxios, type as apiType } from '@/api';
    import { DetailView, DetailViewSection } from '@/components/detailViews';

    export default {
        name: 'Returns',
        components: { DetailView, DetailViewSection },
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
                loading: false,
                table: {
                    page: 0
                }
            };
        },
        computed: {},
        async created() {
            this.apiMock = createAxios(apiType.MOCK);

            this.apiReturns = createAxios(apiType.RETURNS, this.$root.companyId);

            await this.load();
        },
        methods: {
            async handleReload() {
                this.table.page = 0;

                await this.load();
            },
            async load() {
                try {
                    this.loading = true;

                    // TODO
                } catch (error) {
                    this.$root.handleError(error);
                } finally {
                    this.loading = false;
                }
            }
        }
    };
</script>
