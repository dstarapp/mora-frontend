import { idlFactory as userAllotFactory } from '@/request/canister/user_allot.did';
import { idlFactory as usersFactory } from '@/request/canister/users.did';
import { idlFactory as planetFactory } from '@/request/canister/planet.did';
import { createActor } from '@/request/agent';
import CONFIG from '@/assets/config';
import debug from '@/utils/debug';
import store from '@/store';

const getAvatar = async (pid) => {
    if (!pid) {
        return false;
    }
    if (store.state.avatar_cache[pid]) {
        return store.state.avatar_cache[pid];
    }

    try {
        let keyplanActor = await createActor(CONFIG.keyplanId, userAllotFactory);
        let cid: any = await keyplanActor.search_canister(pid);
        if (!cid || !cid.length) {
            return false;
        }
        let userActor = await createActor(cid.toString(), usersFactory);
        let avatar = await userActor.get_avatar([pid]);
        store.commit('ADD_AVATAR_CACHE', {
            pid: pid.toString(),
            avatar: avatar,
        });
        return avatar;
    } catch (err) {
        // console.log(err);
        debug('error', err);
        return false;
    }
};

const getUserData = async (cid) => {
    try {
        if (!cid) {
            return;
        }
        let planetActor = await createActor(cid, planetFactory);
        let userData: any = await planetActor.getPlanetBase();
        return userData;
    } catch (err) {
        debug('error', cid);
        return false;
    }
};

export { getAvatar, getUserData };
