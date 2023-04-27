<template>
    <DetailViewSection
        :loading="loading"
        title="Invoice lines">
        <v-container fluid>
            <v-row>
                <v-col>
                    
                </v-col>
            </v-row>
        </v-container>
    </DetailViewSection>
</template>

<script>
    import { DetailViewSection } from '@/components/detailViews';

    export default {
        name: 'RegistrationInvoiceLineTable',
        components: { DetailViewSection },
        model: {
            event: 'update:invoiceLinesSelected',
            prop: 'invoiceLinesSelected'
        },
        props: {
            invoiceLines: {
                required: true,
                type: Array
            },
            invoiceLinesSelected: {
                required: true,
                type: Array
            },
            loading: {
                default: false,
                type: Boolean
            }
        }
    };
</script>
