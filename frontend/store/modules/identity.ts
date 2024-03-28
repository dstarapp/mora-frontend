export const GET_LOADING = 'getLoading';
export const SET_LOADING = 'setLoading';

export class IdentityState {
    loading: boolean = false;
}

export default {
    namespaced: true,
    state: () => new IdentityState(),
    mutations: {
        setLoading: (state: IdentityState, loading: boolean) => (state.loading = loading),
    },
    actions: {
        setLoading: ({ commit }, loading: boolean) => commit(SET_LOADING, loading),
    },
    getters: {
        getLoading: (state: IdentityState): boolean => state.loading,
    },
};
