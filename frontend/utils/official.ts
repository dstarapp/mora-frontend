import { createActor } from '@/request/agent';
import { idlFactory as officialFactory } from '@/request/canister/official.did';
import CONFIG from '@/assets/config';
import { Principal } from '@dfinity/principal';
import debug from '@/utils/debug';
import store from '@/store';
import { ElMessage } from 'element-plus';
import { t } from '@/i18n';

const getOfficial = async (pid) => {
    return false;
};

const setOfficial = async (pid, name) => {
    try {
        const officialCanister = await createActor(
            CONFIG.officialCanister,
            officialFactory,
            store.state.agent,
        );

        let res: any = await officialCanister.set_official(
            typeof pid === 'object' ? pid : Principal.fromText(pid),
            name,
        );
        return true;
    } catch (err) {
        debug('failed', err);
        return false;
    }
};

const cancelOfficial = async (pid) => {
    try {
        const officialCanister = await createActor(
            CONFIG.officialCanister,
            officialFactory,
            store.state.agent,
        );

        let res: any = await officialCanister.cancel_official(
            typeof pid === 'object' ? pid : Principal.fromText(pid),
        );
        return true;
    } catch (err) {
        debug('error', err);
        return false;
    }
};

export { getOfficial, setOfficial, cancelOfficial };
