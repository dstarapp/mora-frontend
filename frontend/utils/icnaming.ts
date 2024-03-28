import { Principal } from '@dfinity/principal';
import { createActor } from '@/request/agent';
import { idlFactory as icnamingFactory } from '@/request/canister/icnaming.did';
import CONFIG from '@/assets/config';

const getCanisterAnonymous = () => {
    const icnamingCanisterAnonymous = createActor(CONFIG.icnamingId, icnamingFactory);
    return icnamingCanisterAnonymous;
};

const getIcnaming = async (pid) => {
    const res: any = await getCanisterAnonymous().reverse_resolve_principal(
        typeof pid === 'string' ? Principal.fromText(pid) : pid,
    );
    if (res.Ok.length) {
        return res.Ok[0];
    } else {
        return false;
    }
};

const getIcnamingArr = async (list) => {
    const res: any = await getCanisterAnonymous().batch_get_reverse_resolve_principal(list);

    if (res.Ok) {
        let obj = {};
        res.Ok.map((item) => {
            obj[item[0]] = item[1][0];
        });
        return obj;
    } else {
        return false;
    }
};

const getPid = async (url) => {
    let res: any = await getCanisterAnonymous().get_record_value(url.toLowerCase());
    if (res && res.Ok.length) {
        return res.Ok[0][1];
    } else {
        return false;
    }
};

export { getIcnaming, getIcnamingArr, getPid };
