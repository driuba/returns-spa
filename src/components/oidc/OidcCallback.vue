<template>
    <div></div>
</template>

<script>
    import { mapActions } from 'vuex';

    // noinspection JSAnnotator
    export default {
        name: 'OidcCallback',
        mounted() {
            this
                .oidcSignInCallback()
                .then((redirectPath) => {
                    // noinspection JSCheckFunctionSignatures
                    return this.$router.push(redirectPath);
                })
                .catch((error) => {
                    console.error(error);

                    return this.$router.push('/oidc-callback-error');
                });
        },
        methods: {
            ...mapActions('oidcStore', ['oidcSignInCallback'])
        }
    };
</script>
