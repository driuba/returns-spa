<template>
    <v-app>
        <Notification/>

        <NavigationToolbar/>

        <v-main>
            <router-view v-if="hasAccess"/>
        </v-main>
    </v-app>
</template>

<script>
    import NavigationToolbar from '@/components/navigationToolbar';
    import Notification from '@/components/Notification';
    import { mapGetters } from 'vuex';

    // noinspection JSAnnotator
    export default {
        name: 'App',
        components: { NavigationToolbar, Notification },
        computed: {
            ...mapGetters(
                'oidcStore',
                {
                    isAuthenticated: 'oidcIsAuthenticated'
                }
            ),
            hasAccess() {
                // noinspection JSUnresolvedReference
                return this.isAuthenticated || this.$route.meta.isPublic;
            }
        }
    };
</script>

<style>
    .readonly-input *:after {
        border-color: rgba(0, 0, 0, 0.1) !important;
    }

    .readonly-input *:before {
        border-color: rgba(0, 0, 0, 0.1) !important;
    }
</style>
