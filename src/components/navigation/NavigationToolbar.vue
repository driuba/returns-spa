<template>
    <v-navigation-drawer
        :class="['toolbar', collapsed ? '' : 'expanded']"
        :mini-variant="collapsed"
        @click.native="handleClick"
        app
        hide-overlay
        light
        mini-variant-width="80"
        permanent
        stateless
    >
        <v-list class="pa-0">
            <v-list-item
                v-if="isAuthenticated"
                :ripple="false"
            >
                <v-tooltip bottom>
                    <span>Signed in as: {{ user.name }}, Company: {{ companyId }}</span>

                    <template #activator="{ on }">
                        <v-list-item-avatar
                            v-on="on"
                            class="toolbar-item-avatar justify-center"
                            color="#cccccc"
                        >
                            <span class="white--text headline">{{ user.name.charAt(0) }}</span>
                        </v-list-item-avatar>
                    </template>
                </v-tooltip>

                <v-list-item-content class="toolbar-action-title ml-4">
                    <v-list-item-title>Returns</v-list-item-title>
                </v-list-item-content>

                <v-list-item-action>
                    <v-btn
                        @click.stop="handleClick"
                        icon
                    >
                        <v-icon>chevron_left</v-icon>
                    </v-btn>
                </v-list-item-action>
            </v-list-item>

            <v-list-item
                v-else
                :ripple="false"
                @click.stop="authenticate"
            >
                <v-list-item-action class="toolbar-item-action">
                    <v-icon>lock</v-icon>
                </v-list-item-action>

                <v-list-item-content class="toolbar-item-title">
                    <v-list-item-title>Login</v-list-item-title>
                </v-list-item-content>
            </v-list-item>
        </v-list>

        <v-list class="pa-0">
            <!--suppress JSValidateTypes -->
            <component
                v-for="(navigationItem, index) in navigationItems"
                v-bind="navigationItem"
                :is="navigationItem.component"
                :key="index"
            />
        </v-list>
    </v-navigation-drawer>
</template>

<script>
    import role from '@/enums/role';
    import { mapActions, mapGetters } from 'vuex';
    import NavigationToolbarItem from './components/NavigationToolbarItem';
    import NavigationToolbarItemGroup from './components/NavigationToolbarItemGroup';

    // noinspection JSAnnotator
    export default {
        name: 'NavigationToolbar',
        components: { NavigationToolbarItem, NavigationToolbarItemGroup },
        data() {
            return {
                collapsed: true
            };
        },
        computed: {
            ...mapGetters(
                'oidcStore',
                {
                    isAuthenticated: 'oidcIsAuthenticated',
                    user: 'oidcUser'
                }
            ),
            companyId() {
                return this.$route.params.companyId && this.$route.params.companyId;
            },
            navigationItems() {
                const navigationItems = [
                    {
                        icon: 'home',
                        route: {
                            name: 'HomeCompany',
                            params: {
                                companyId: this.companyId
                            }
                        },
                        show: {
                            keyRequired: 'companyId'
                        },
                        title: 'Home'
                    },
                    {
                        icon: 'home',
                        route: {
                            name: 'Home'
                        },
                        show: {
                            keyMissing: 'companyId'
                        },
                        title: 'Home'
                    },
                    {
                        icon: 'price_check',
                        route: {
                            name: 'FeeConfigurations',
                            params: {
                                companyId: this.$root.companyId
                            }
                        },
                        show: {
                            keyRequired: 'companyId',
                            roles: [role.ADMIN]
                        },
                        title: 'Fees'
                    },
                    {
                        icon: 'production_quantity_limits',
                        route: {
                            name: 'Returns',
                            params: {
                                companyId: this.$root.companyId
                            }
                        },
                        show: {
                            keyRequired: 'companyId'
                        },
                        title: 'Returns'
                    }
                ];

                return navigationItems
                    .filter((navigationItem) => {
                        if (!this.isAuthenticated) {
                            return navigationItem.show && navigationItem.show.isPublic;
                        }

                        if (!navigationItem.show) {
                            return true;
                        }

                        if (
                            (
                                navigationItem.show.keyRequired &&
                                !this.isKeyPresent(navigationItem.show.keyRequired)
                            ) ||
                            (
                                navigationItem.show.keyMissing &&
                                this.isKeyPresent(navigationItem.show.keyMissing)
                            )
                        ) {
                            return false;
                        }

                        return (
                            navigationItem.show.isPublic ||
                            !navigationItem.show.roles ||
                            navigationItem.show.roles.some((role) => this.userRoles.has(role))
                        );
                    })
                    .map((navigationItem) => ({
                        ...navigationItem,
                        component: navigationItem.navigationItems && navigationItem.navigationItems.length
                            ? NavigationToolbarItemGroup
                            : NavigationToolbarItem
                    }));
            },
            userRoles() {
                const roles = (this.user && this.user.roles) || [];

                return new Set(Array.isArray(roles) ? roles : [roles]);
            }
        },
        methods: {
            ...mapActions(
                'oidcStore',
                {
                    authenticate: 'authenticateOidc'
                }
            ),
            handleClick() {
                this.collapsed = !this.collapsed;
            },
            isKeyPresent(key) {
                return this.$route.params[key];
            }
        }
    };
</script>

<style>
    .toolbar {
        -ms-overflow-style: none;
        overflow-y: auto;
        padding-top: 8px;
        scrollbar-width: none;
    }

    .toolbar::-webkit-scrollbar {
        display: none;
    }

    .toolbar-item-action,
    .toolbar-item-avatar {
        justify-content: center;
        min-width: 40px;
        width: 40px;
    }

    .toolbar-item-title {
        margin-left: 8px;
    }
</style>