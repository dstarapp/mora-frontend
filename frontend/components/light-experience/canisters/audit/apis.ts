import { Agent, Identity } from '@dfinity/agent';
import { AUDIT_CANISTER_ID } from '../config';
import { createAuditActor } from './index';
import { Principal } from '@dfinity/principal';
import { UserDataResult, TransformedAuditCodeWithStatus } from './audit.did.d';

const getActor = (identity?: Identity) => {
    return createAuditActor(
        AUDIT_CANISTER_ID,
        identity ? { agentOptions: { identity } } : undefined,
    );
};

const getActorByAgent = (agent: Agent) => {
    return createAuditActor(AUDIT_CANISTER_ID, {
        actorOptions: { agent },
    });
};

export const codesGenerateByPermission = async (
    agent: Agent,
    generateNumber: number,
    userPrincipalId: Principal,
): Promise<string[]> => {
    try {
        const actor = getActorByAgent(agent);
        const r: string[] = await actor.codes_generate_by_permission(
            generateNumber,
            userPrincipalId,
        );
        return r;
    } catch {
        return [];
    }
};

export const codesQueryByUser = async (agent: Agent): Promise<TransformedAuditCodeWithStatus[]> => {
    try {
        const actor = getActorByAgent(agent);
        const r: UserDataResult = await actor.codes_query_by_user();
        return r.owned;
    } catch {
        return [];
    }
};
