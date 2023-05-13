<template>
    <v-list-item
        :ripple="false"
        :to="route"
        @click.stop
        class="justify-start"
        exact-path
    >
        <v-list-item-action class="toolbar-item-action">
            <v-icon>{{ icon }}</v-icon>
        </v-list-item-action>

        <v-list-item-content class="toolbar-item-title">
            <v-list-item-title>{{ title }}</v-list-item-title>
        </v-list-item-content>
    </v-list-item>
</template>

<script>
    export default {
        name: 'NavigationToolbarItem',
        props: {
            icon: {
                required: true,
                type: String
            },
            route: {
                required: true,
                type: [Object, String]
            },
            title: {
                required: true,
                type: String
            }
        }
    };
</script>
