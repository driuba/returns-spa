<template>
    <v-container fluid>
        <v-row align="center" justify="center">
            <v-col cols="2">
                <SelectField
                    v-model="companyId"
                    :items="companyIds"
                    :loading="loading"
                    icon="home"
                    label="Company"
                />
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
    import { createAxios, type } from '@/api';
    import { SelectField } from '@/components/inputs';

    export default {
        name: 'Home',
        components: { SelectField },
        data() {
            return {
                api: null,
                companyIds: [],
                loading: false
            };
        },
        computed: {
            companyId: {
                get() {
                    return this.$root.companyId && this.$root.companyId.toLowerCase();
                },
                set(value) {
                    this.$router.push({
                        name: 'HomeCompany',
                        params: {
                            companyId: value
                        }
                    });
                }
            }
        },
        created() {
            this.api = createAxios(type.MOCK);

            this.loadCompanies();
        },
        methods: {
            async loadCompanies() {
                try {
                    this.loading = true;

                    const { data: companies } = await this.api.get('companies');

                    this.companyIds = companies.map((company) => company.Id);

                    if (!this.companyId && this.companyIds.length) {
                        this.companyId = this.companyIds[0];
                    }
                } catch (error) {
                    this.$root.handleError(error);
                } finally {
                    this.loading = false;
                }
            }
        }
    };
</script>
