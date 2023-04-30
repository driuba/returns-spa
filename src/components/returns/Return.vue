<template>
    <div>
        <DetailView
            :loading="loading"
            title="Return"
        >
            <!-- TODO -->
        </DetailView>
    </div>
</template>

<script>
    import { DetailView } from '@/components/detailViews';

    export default {
        name: 'Return',
        components: { DetailView },
        data() {
            return {
                loading: false
            };
        },
        computed: {
            returnId() {
                const returnId = parseInt(this.$route.params.returnId);

                return isNaN(returnId) ? 0 : returnId;
            }
        },
        async created() {
        },
        methods: {
            async load() {
                const redirect = async () => {
                    await this.$router.replace({
                        name: 'Returns'
                    });
                };

                try {
                    this.loading = true;

                    if (this.returnId) {
                        // TODO
                    } else {
                        await redirect();
                    }
                } catch (error) {
                    if (error.response && error.response.status === 404) {
                        this.$root.handleError(new Error(`Return ${this.returnId} was not found.`));

                        await redirect();
                    } else {
                        this.$root.handleError(error);
                    }
                } finally {
                    this.loading = false;
                }
            }
        }
    };
</script>
