import { Actor, Agent, HttpAgent, HttpAgentOptions } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";

import { idlFactory } from "./hack.did";
import { _SERVICE } from "./hack.did.d";

export const createHackActor = (
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
