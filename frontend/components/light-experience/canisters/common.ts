import store, { LIGHT } from '@/store';
import { findUserExperienceCanister } from './experience_manager/apis';
import { LightExperienceStatus } from './experience_worker/experience_worker.did.d';
import { GET_USER_EXPERIENCE_CANISTER, SET_USER_EXPERIENCE_CANISTER } from '@/store/modules/light';

export type MotokoResult<T> =
    | {
          ok: T;
          err?: undefined;
      }
    | {
          ok?: undefined;
          err: string;
      };

export type Option<T> = [] | [T];

export type Page = {
    page: number;
    size: number;
};

export type PageData<T> = {
    page: number;
    size: number;
    data: T[];
    all: number;
};

export const isExperienceEditing = (status: LightExperienceStatus): boolean =>
    status['Editing'] || status['DoneEditing'] || status['Rejected'] || status['DoneRejected'];
export const isExperienceAuditing = (status: LightExperienceStatus): boolean =>
    status['Auditing'] || status['DoneAuditing'];
export const isExperienceRejected = (status: LightExperienceStatus): boolean =>
    status['Rejected'] || status['DoneRejected'];
export const isExperienceDone = (status: LightExperienceStatus): boolean =>
    status['Done'] || status['DoneEditing'] || status['DoneAuditing'] || status['DoneRejected'];
export const isExperienceFrozen = (status: LightExperienceStatus): boolean => status['Frozen'];

export const initialUserExperienceCanister = async (
    current_user: string,
    callback?: (canister_id: string) => void,
): Promise<void> => {
    const user_canister = store.getters[`${LIGHT}/${GET_USER_EXPERIENCE_CANISTER}`][current_user];
    const canister_id = await findUserExperienceCanister(current_user);
    if (canister_id) {
        
        store.dispatch(`${LIGHT}/${SET_USER_EXPERIENCE_CANISTER}`, {
            userPrincipalId: current_user,
            canisterId: canister_id,
        });
        
        if (user_canister) {
            if (user_canister !== canister_id) {
                
                window.location.reload();
            }
        } else {
            
            window.location.reload();
        }
        
        if (callback) callback(canister_id);
    } else {
        
        console.info(`user: ${current_user} has no experience_canister`);
    }
};

export const parseHex = (data: Uint8Array): string => {
    let r = '';

    const parseSingle = (d: number): string => {
        const hex = (h: number): string => {
            let s = `${h}`;
            switch (h) {
                case 10:
                    s = 'a';
                    break;
                case 11:
                    s = 'b';
                    break;
                case 12:
                    s = 'c';
                    break;
                case 13:
                    s = 'd';
                    break;
                case 14:
                    s = 'e';
                    break;
                case 15:
                    s = 'f';
                    break;
            }
            return s;
        };

        const remain = d % 16;

        return hex((d - remain) / 16) + hex(remain);
    };

    for (let i = 0; i < data.length; i++) r += parseSingle(data[i]);

    return r;
};
