import { Actor, Agent, HttpAgent, HttpAgentOptions } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { parseHex } from '../common';

import { idlFactory } from './DRC207BlackHole.did';
import { _SERVICE } from './DRC207BlackHole.did.d';

export const createDRC207BlackHoleActor = (
    // canisterId: string | Principal,
    canisterId: '7hdtw-jqaaa-aaaak-aaccq-cai',
    options?: { agentOptions?: HttpAgentOptions; actorOptions?: { agent: Agent } },
): _SERVICE => {
    const agent = new HttpAgent({
        host: 'https://icp0.io/',
        ...options?.agentOptions,
    });
    return Actor.createActor(idlFactory, {
        agent,
        canisterId,
        ...options?.actorOptions,
    });
};

export const getModuleHashByDRC207BlackHole = async (
    canister_id: Principal,
): Promise<string | undefined> => {
    const actor = createDRC207BlackHoleActor('7hdtw-jqaaa-aaaak-aaccq-cai');
    try {
        const r = await actor.canister_status({ canister_id });
        if (!r.module_hash.length) {
            return '';
        }
        return parseHex(r.module_hash[0] as any);
    } catch (e) {
        console.error('error ' + canister_id.toText());
        console.error('error', e);
        return undefined;
    }
};
