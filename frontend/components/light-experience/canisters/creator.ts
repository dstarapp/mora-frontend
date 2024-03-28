import { IDL } from "@dfinity/candid";
import { Actor, ActorSubclass, HttpAgent } from "@dfinity/agent";
import { IC } from "@astrox/sdk-web";

export type IdentitySource = "mora" | "anonymous" | "internet-identity" | "plug" | "astrox-me";

export type ActorIdentityRecord = {
    identity: ActorIdentity;
    records: {
        time: number; 
        arg: any; 
        result:
            | {
                  value: any;
                  error?: undefined;
              }
            | {
                  value?: undefined;
                  error: any;
              };
    }[];
};

export type ActorIdentity = {
    source: IdentitySource;
    principal: string;
    create: ActorCreator;
};

export type ActorCreator = <T>(
    idlFactory: IDL.InterfaceFactory,
    canisterId: string,
) => Promise<ActorSubclass<T>>;

export const getActorCreatorByAnonymous = (): ActorCreator => {
    const agent = new HttpAgent({
        host: "https://icp0.io/", 
    });
    return async (idlFactory: IDL.InterfaceFactory, canisterId: string) => {
        return Actor.createActor(idlFactory, { agent, canisterId });
    };
};

// Internet Identity agent
export const getActorCreatorByAgent = (agent: HttpAgent): ActorCreator => {
    return async (idlFactory: IDL.InterfaceFactory, canisterId: string) => {
        return Actor.createActor(idlFactory, { agent, canisterId });
    };
};

// Plug
export interface PlugInterface {
    isConnected: () => Promise<boolean>;
    requestConnect: (_?: {
        whitelist?: string[]; // ['canister-id'],
        host?: string; // 'https://network-address',
        onConnectionUpdate?: () => void;
        timeout?: number; 
    }) => Promise<void>;
    sessionManager: {
        sessionData: {
            principalId: string;
            accountId: string;
            agent: HttpAgent;
        };
        onConnectionUpdate: () => void;
    };

    principalId?: string;
    accountId?: string;
    agent?: HttpAgent;
    createActor: <T>(_: {
        canisterId: string;
        interfaceFactory: IDL.InterfaceFactory;
    }) => Promise<ActorSubclass<T>>;
}

// Plug 
export const getActorCreatorByPlug = (plug: PlugInterface): ActorCreator => {
    return async (idlFactory: IDL.InterfaceFactory, canisterId: string) => {
        return await plug.createActor({
            canisterId,
            interfaceFactory: idlFactory,
        });
    };
};

// Astrox ME 
export const getActorCreatorByIC = (ic: IC): ActorCreator => {
    const identity = ic.identity;
    const agent = new HttpAgent({
        host: "https://icp0.io/",
        identity: identity as any,
    });
    return async (idlFactory: IDL.InterfaceFactory, canisterId: string) => {
        return Actor.createActor(idlFactory, { agent, canisterId });
    };
    // return async (idlFactory: InterfaceFactory, canisterId: string) => {
    //     return await ic.createActor(idlFactory, canisterId);
    // };
};

// connect2ic 
export const getActorCreatorByActiveProvider = (activeProvider: any): ActorCreator => {
    return async (idlFactory: IDL.InterfaceFactory, canisterId: string) => {
        const { value: actor } = await activeProvider.createActor(canisterId, idlFactory);
        return actor;
    };
};
