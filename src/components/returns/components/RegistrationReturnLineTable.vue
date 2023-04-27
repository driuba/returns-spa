<template>
    <DetailViewSection
        :loading="loading"
        title="Return lines">
        <!-- TODO -->
    </DetailViewSection>
</template>

<script>
    import { DetailViewSection } from '@/components/detailViews';

    export default {
        name: 'RegistrationReturnLineTable',
        components: { DetailViewSection },
        props: {
            loading: {
                default: false,
                type: Boolean
            }
        }
    };
</script>
