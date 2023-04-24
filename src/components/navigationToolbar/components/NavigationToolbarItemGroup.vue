<template>
    <v-list-group
        :ripple="false"
        :value="expanded"
        color="secondary"
        @click.stop
    >
        <template #activator>
            <v-list class="pa-0">
                <v-list-item :ripple="false" class="pa-0">
                    <v-list-item-action class="toolbar-item-action">
                        <v-icon>{{ icon }}</v-icon>
                    </v-list-item-action>

                    <v-list-item-content class="toolbar-item-title">
                        <v-list-item-title>{{ title }}</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
            </v-list>
        </template>

        <v-list class="group pa-0">
            <component
                v-for="(navigationComponent, index) in navigationComponents"
                v-bind="navigationComponent"
                :is="navigationComponent.component"
                :key="index"
            />
        </v-list>
    </v-list-group>
</template>

<script>
    import NavigationToolbarItem from './NavigationToolbarItem';
    import NavigationToolbarItemGroup from './NavigationToolbarItemGroup';

    export default {
        name: 'NavigationToolbarItemGroup',
        components: { NavigationToolbarItem, NavigationToolbarItemGroup },
        props: {
            collapsed: {
                default: false,
                type: Boolean
            },
            icon: {
                default: '',
                type: String
            },
            navigationItems: {
                required: true,
                type: Array
            },
            title: {
                required: true,
                type: String
            }
        },
        data() {
            return {
                expanded: false
            };
        },
        computed: {
            navigationComponents() {
                return this.navigationItems.map((navigationItem) => ({
                    ...navigationItem,
                    component: navigationItem.navigationItems && navigationItem.navigationItems.length
                        ? NavigationToolbarItemGroup
                        : NavigationToolbarItem
                }));
            }
        },
        watch: {
            collapsed(value) {
                this.expanded = !value;
            }
        },
        created() {
            this.expanded = !this.collapsed;
        }
    };
</script>
