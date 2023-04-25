import { type } from '@/enums/message';
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
                    } else if (!to.meta || to.meta.isPublic || !to.meta.roles) {
                        authorize = true;
                    } else {
                        const user = store.getters['oidcStore/oidcUser'];

                        let roles = (user && user.roles) || [];

                        roles = new Set(Array.isArray(roles) ? roles : [roles]);

                        authorize = to.meta.roles.some((role) => roles.has(role));
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
