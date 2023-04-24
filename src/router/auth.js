import { type } from '@/enums/message';
import app from '@/main';

export function oidcAuthorize(store, vuexNamespace) {
    return function (to, _, next) {
        store
            .dispatch(`${vuexNamespace ? `${vuexNamespace}/` : ''}oidcCheckAccess`, to)
            .then((hasAccess) => {
                if (hasAccess) {
                    let authorize;

                    if (to.meta && !to.meta.isPublic && to.meta.roles) {
                        const companyId = to.params.companyId && to.params.companyId.toLowerCase();

                        const rolesUser = (store.getters['oidcStore/oidcUser'].role || []).map((role) => role.toLowerCase());

                        const rolesPath = to.meta.roles.map((role) => role.toLowerCase());

                        authorize = rolesUser.some((roleUser) => rolesPath.includes(roleUser));
                    } else {
                        authorize = true;
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
