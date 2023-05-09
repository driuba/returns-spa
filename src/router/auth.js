import { type } from '@/enums/message';
import role from '@/enums/role';
import app from '@/main';

export function oidcAuthorize(store, vuexNamespace) {
    return function (to, _, next) {
        store
            .dispatch(`${vuexNamespace ? `${vuexNamespace}/` : ''}oidcCheckAccess`, to)
            .then((hasAccess) => {
                if (hasAccess) {
                    let authorize;

                    const isAuthenticated = store.getters['oidcStore/oidcIsAuthenticated'];

                    if (!isAuthenticated) {
                        authorize = to.meta && to.meta.isPublic;
                    } else {
                        const user = store.getters['oidcStore/oidcUser'];

                        let rolesUser = (user && user.roles) || [];

                        rolesUser = Array.isArray(rolesUser) ? rolesUser : [rolesUser];

                        rolesUser = new Set(
                            rolesUser.filter((roleUser) => (
                                roleUser === role.ADMIN ||
                                roleUser === role.RESELLER
                            ))
                        );

                        if (!to.meta || to.meta.isPublic || !to.meta.roles) {
                            authorize = rolesUser.size;
                        } else {
                            authorize = to.meta.roles.some((rolePath) => rolesUser.has(rolePath));
                        }
                    }

                    if (authorize) {
                        next();
                    } else {
                        app.$emit('showMessage', 'Required permissions are missing to view this page.', type.ERROR);
                    }
                }
            });
    };
}
