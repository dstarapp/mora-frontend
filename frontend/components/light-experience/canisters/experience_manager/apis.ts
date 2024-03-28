import { Agent, Identity } from '@dfinity/agent';
import { EXPERIENCE_MANAGER_CANISTER_ID } from '../config';
import { createExperienceManagerActor } from './index';
import { Principal } from '@dfinity/principal';
import {
    ExperienceInsertResult,
    LightExperienceInfo,
    LightExperienceContent,
    LightCoreContent,
    DoneLightExperienceManager,
    LightExperienceManager,
    LightExperienceWorker,
} from './experience_manager.did.d';
import { MotokoResult, Option, Page, PageData } from '../common';
import { hashExperience } from '../hash';
import { LightCore, findUsedLights } from '@mora-light/core/types';
import { ExperienceQueryWrappedStatus } from '../experience_manager/experience_manager.did.d';

const getActor = (identity?: Identity) => {
    return createExperienceManagerActor(
        EXPERIENCE_MANAGER_CANISTER_ID,
        identity ? { agentOptions: { identity } } : undefined,
    );
};

const getActorByAgent = (agent: Agent) => {
    return createExperienceManagerActor(EXPERIENCE_MANAGER_CANISTER_ID, {
        actorOptions: { agent },
    });
};

export const findUserExperienceCanister = async (userPrincipalId: string): Promise<string> => {
    const actor = getActor();
    const canisterId: Option<Principal> = await actor.user_find(
        Principal.fromText(userPrincipalId),
    );
    return canisterId.length ? canisterId[0].toText() : '';
};

export const insertLightExperience = async (
    agent: Agent,
    info: LightExperienceInfo,
    content: LightExperienceContent,
): Promise<{ id: string; canister_id: string }> => {
    const actor = getActorByAgent(agent);
    const r: MotokoResult<ExperienceInsertResult> = await actor.experience_insert(info, content);
    if (r.err !== undefined) {
        throw new Error(r.err);
    }
    return { id: r.ok!.id, canister_id: r.ok!.canister_id.toText() };
};

export const permissionsHasAllPermissions = async (
    agent: Agent,
    principal: Principal,
): Promise<boolean> => {
    const actor = getActorByAgent(agent);
    const r: boolean = await actor.permissions_has_all_permissions(principal);
    return r;
};

export const experiencesQueryExperiencesByConditions = async (
    id_or_key_word: [] | [string],
    categories: [] | [string[]],
    tags: [] | [string[]],
    user: [] | [Principal],
    page: Page,
): Promise<PageData<DoneLightExperienceManager>> => {
    const actor = getActor();
    const r: PageData<DoneLightExperienceManager> =
        await actor.experiences_query_experiences_by_conditions(
            id_or_key_word,
            categories,
            tags,
            user,
            page,
        );
    return r;
};

export const findAuditingExperiences = async (
    agent: Agent,
    page: Page,
): Promise<PageData<LightExperienceManager>> => {
    const actor = getActorByAgent(agent);
    const r: PageData<LightExperienceManager> =
        await actor.experiences_find_experiences_by_wrapped_status({ Review: null }, page);
    return r;
};

export const lightExperienceEditing = async (
    agent: Agent,
    id: string,
    info_content: [] | [[LightExperienceInfo, LightExperienceContent]],
): Promise<void> => {
    const actor = getActorByAgent(agent);
    const r: MotokoResult<Principal> = await actor.experience_editing(id, info_content);
    if (r.err !== undefined) {
        throw new Error(r.err);
    }
};

export const lightExperienceRemoved = async (agent: Agent, text: string): Promise<Principal> => {
    const actor = getActorByAgent(agent);
    const r: MotokoResult<Principal> = await actor.experience_removed(text);
    if (r.err !== undefined) {
        throw new Error(r.err);
    }
    return r.ok;
};

export const findLightExperience = async (agent: Agent, pid: Principal, text: string) => {
    const actor = getActorByAgent(agent);
    const r: LightExperienceWorker[] = await actor.experience_find_experience(pid, text);
    return r;
};

export const lightExperienceAuditing = async (
    agent: Agent,
    id: string,
    content: LightCoreContent,
    code: string,
): Promise<Principal> => {
    const hash = hashExperience(
        content.id,
        content.info_json,
        content.experience_json,
        content.core_json,
    );
    const actor = getActorByAgent(agent);
    const r: MotokoResult<Principal> = await actor.experience_auditing(id, hash, code, {
        Free: null,
    });
    if (r.err !== undefined) {
        throw new Error(r.err);
    }
    return r.ok;
};

export const lightExperienceRejected = async (
    agent: Agent,
    id: string,
    // content: LightCoreContent,
    hash: string,
    reason: string,
): Promise<Principal> => {
    // const hash = hashExperience(
    //     content.id,
    //     content.info_json,
    //     content.experience_json,
    //     content.core_json,
    // );
    const actor = getActorByAgent(agent);
    const r: MotokoResult<Principal> = await actor.experience_rejected(id, hash, reason);
    if (r.err !== undefined) {
        throw new Error(r.err);
    }
    return r.ok;
};

export const lightExperienceDone = async (
    agent: Agent,
    id: string,
    content: LightCoreContent,
): Promise<Principal> => {
    const hash = hashExperience(
        content.id,
        content.info_json,
        content.experience_json,
        content.core_json,
    );
    console.error('calc hash', hash);
    const core: LightCore = JSON.parse(content.core_json);
    const used = findUsedLights(core);
    const actor = getActorByAgent(agent);
    const r: MotokoResult<Principal> = await actor.experience_done(id, hash, content, used);
    if (r.err !== undefined) {
        throw new Error(r.err);
    }
    return r.ok;
};

export const lightExperienceFrozen = async (
    agent: Agent,
    id: string,
    reason: string,
): Promise<Principal> => {
    const actor = getActorByAgent(agent);
    const r: MotokoResult<Principal> = await actor.experience_frozen(id, reason);
    if (r.err !== undefined) {
        throw new Error(r.err);
    }
    return r.ok;
};

export const lightExperienceFrozenByUser = async (
    agent: Agent,
    id: string,
    reason: string,
): Promise<Principal> => {
    const actor = getActorByAgent(agent);
    const r: MotokoResult<Principal> = await actor.experience_frozen_by_user(id, reason);
    if (r.err !== undefined) {
        throw new Error(r.err);
    }
    return r.ok;
};

export const lightExperienceCollect = async (agent: Agent, id: string): Promise<Principal> => {
    const actor = getActorByAgent(agent);
    const r: MotokoResult<Principal> = await actor.experience_collect(id);
    if (r.err !== undefined) {
        throw new Error(r.err);
    }
    return r.ok;
};

export const lightExperienceCollectDelete = async (
    agent: Agent,
    id: string,
): Promise<Principal> => {
    const actor = getActorByAgent(agent);
    const r: MotokoResult<Principal> = await actor.experience_collect_delete(id);
    if (r.err !== undefined) {
        throw new Error(r.err);
    }
    return r.ok;
};
