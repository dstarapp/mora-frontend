import { Actor, Agent, HttpAgent, HttpAgentOptions } from "@dfinity/agent";
// import { Principal } from "@dfinity/principal";

import { idlFactory } from "./candidUI.did";
import { _SERVICE } from "./candidUI.did.d";

export const createCandidUIActor = (
    // canisterId: string | Principal,
    canisterId: "a4gq6-oaaaa-aaaab-qaa4q-cai", 
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
