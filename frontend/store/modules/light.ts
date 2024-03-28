export const GET_USER_EXPERIENCE_CANISTER = 'getUserExperienceCanister';
export const SET_USER_EXPERIENCE_CANISTER = 'setUserExperienceCanister';

const read = (key: string): string | null => localStorage.getItem(key);
const write = (key: string, value: string) => localStorage.setItem(key, value);

const USER_EXPERIENCE_CANISTERS = '__light_user_experience_canisters__';
const readUserExperienceCanisters = (): Record<string, string> => {
    let data = read(USER_EXPERIENCE_CANISTERS);
    if (!data) {
        data = '{}';
        write(USER_EXPERIENCE_CANISTERS, data);
    }
    return JSON.parse(data);
};
const writeUserExperienceCanisters = (data: Record<string, string>) =>
    write(USER_EXPERIENCE_CANISTERS, JSON.stringify(data));

export class LightState {
    user_experience_canisters: Record<string, string>;
    constructor() {
        this.user_experience_canisters = readUserExperienceCanisters();
    }
    setUserExperienceCanister(userPrincipalId: string, canisterId: string) {
        this.user_experience_canisters[userPrincipalId] = canisterId;
        writeUserExperienceCanisters(this.user_experience_canisters);
    }
}
export default {
    namespaced: true,
    state: () => new LightState(),
    mutations: {
        setUserExperienceCanister: (
            state: LightState,
            item: {
                userPrincipalId: string;
                canisterId: string;
            },
        ) => state.setUserExperienceCanister(item.userPrincipalId, item.canisterId),
    },
    actions: {
        setUserExperienceCanister: (
            { commit },
            item: {
                userPrincipalId: string;
                canisterId: string;
            },
        ) => commit(SET_USER_EXPERIENCE_CANISTER, item),
    },
    getters: {
        getUserExperienceCanister: (state: LightState): Record<string, string> =>
            state.user_experience_canisters,
    },
};
