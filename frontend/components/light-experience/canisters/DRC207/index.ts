import { Actor, Agent, HttpAgent, HttpAgentOptions } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";
import { parseHex } from "../common";

import { idlFactory } from "./DRC207.did";
import { _SERVICE } from "./DRC207.did.d";

export const createDRC207Actor = (
    canisterId: string | Principal,
    options?: { agentOptions?: HttpAgentOptions; actorOptions?: { agent: Agent } },
): _SERVICE => {
    const agent = new HttpAgent({
        host: "https://icp0.io/",
        ...options?.agentOptions,
    });
    return Actor.createActor(idlFactory, {
        agent,
        canisterId,
        ...options?.actorOptions,
    });
};

export const getModuleHashByDRC207 = async (
    canister_id: Principal,
): Promise<string | undefined> => {
    const actor = createDRC207Actor(canister_id);
    try {
        const r = await actor.canister_status();
        if (!r.module_hash.length) {
            console.error(
                "module hash: " +
                    canister_id.toText(),
            );
            return "";
        }
        return parseHex(r.module_hash[0] as any);
    } catch (e) {
        console.error("error" + canister_id.toText());
        console.error("error", e);
        return undefined;
    }
};
