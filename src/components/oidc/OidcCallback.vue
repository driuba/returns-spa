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
                    this.$router.push(redirectPath);
                })
                .catch((error) => {
                    console.error(error);

                    this.$router.push('/oidc-callback-error');
                });
        },
        methods: {
            ...mapActions('oidcStore', ['oidcSignInCallback'])
        }
    };
</script>
