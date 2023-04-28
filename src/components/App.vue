<template>
    <v-app>
        <Notification/>

        <NotificationList/>

        <NavigationToolbar/>

        <v-main>
            <router-view v-if="hasAccess"/>
        </v-main>
    </v-app>
</template>

<script>
    import NavigationToolbar from '@/components/navigation';
    import { Notification, NotificationList } from '@/components/notifications';
    import { mapGetters } from 'vuex';

    // noinspection JSAnnotator
    export default {
        name: 'App',
        components: { NavigationToolbar, Notification, NotificationList },
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
