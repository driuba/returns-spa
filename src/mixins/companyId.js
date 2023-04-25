export default {
    computed: {
        companyId() {
            return this.$route.params.companyId && this.$route.params.companyId;
        }
    }
};
