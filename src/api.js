import store from '@/store';
import axios from 'axios';

export function createAxios(apiType, companyId) {
    let url;

    switch (apiType) {
        case type.MOCK:
            url = process.env.VUE_APP_ENDPOINT_MOCK;

            break;
        default:
            url = `${process.env.VUE_APP_ENDPOINT_RETURNS}/api/${companyId}`;

            break;
    }

    const client = axios.create({
        baseURL: url
    });

    client.interceptors.request.use((config) => {
        const token = store.state.oidcStore.access_token;

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    });

    return client;
}

export const type = {
    MOCK: 'MOCK',
    RETURNS: 'RETURNS'
};
