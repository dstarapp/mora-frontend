import { Agent, Identity } from '@dfinity/agent';
import { createExperienceWorkerActor } from './index';
import {
    LightExperienceInfo,
    LightExperienceContent,
    LightExperienceWorker,
    TrimmedLightExperienceWorker,
    ExperienceQueryWrappedStatus,
    LightExperienceMessage,
    ExperienceUserCollection,
    DoneLightExperienceWorker,
} from './experience_worker.did.d';
import { MotokoResult, Option, Page, PageData } from '../common';
import { Principal } from '@dfinity/principal';

const getActor = (canister_id: string, identity?: Identity) => {
    return createExperienceWorkerActor(
        canister_id,
        identity ? { agentOptions: { identity } } : undefined,
    );
};

const getActorByAgent = (canister_id: string, agent: Agent) => {
    return createExperienceWorkerActor(canister_id, {
        actorOptions: { agent },
    });
};

export const queryExperience = async (
    canister_id: string,
    agent: Agent,
    id: string,
): Promise<LightExperienceWorker> => {
    const actor = getActorByAgent(canister_id, agent);
    const r: Option<LightExperienceWorker> = await actor.experience_query_experience(id);
    if (r.length === 0) {
        throw new Error(`not found: ${id}`);
    }
    return r[0];
};

export const updateExperience = async (
    canister_id: string,
    agent: Agent,
    id: string,
    info: LightExperienceInfo,
    content: LightExperienceContent,
) => {
    const actor = getActorByAgent(canister_id, agent);
    const r: MotokoResult<null> = await actor.experience_edit(id, info, content);
    if (r.err !== undefined) {
        throw new Error(r.err);
    }
};

export const queryExperiences = async (
    canister_id: string,
    agent: Agent,
    wrapped_status: ExperienceQueryWrappedStatus,
    page: Page,
): Promise<PageData<TrimmedLightExperienceWorker>> => {
    const actor = getActorByAgent(canister_id, agent);
    const r: PageData<TrimmedLightExperienceWorker> =
        await actor.experience_query_experiences_by_wrapped_status(wrapped_status, page);
    return r;
};

export const queryMessages = async (
    canister_id: string,
    agent: Agent,
    page: Page,
): Promise<PageData<LightExperienceMessage>> => {
    const actor = getActorByAgent(canister_id, agent);
    const r: PageData<LightExperienceMessage> = await actor.experience_query_messages(page);
    return r;
};

export const readMessage = async (
    canister_id: string,
    agent: Agent,
    index: number,
): Promise<void> => {
    const actor = getActorByAgent(canister_id, agent);
    const r: MotokoResult<null> = await actor.experience_read_message(index);
    if (r.err !== undefined) {
        throw new Error(r.err);
    }
};

export const queryCollections = async (
    canister_id: string,
    agent: Agent,
    page: Page,
): Promise<PageData<ExperienceUserCollection>> => {
    const actor = getActorByAgent(canister_id, agent);
    const r: PageData<ExperienceUserCollection> = await actor.experience_query_collections(page);
    return r;
};

export const queryCollection = async (
    canister_id: string,
    agent: Agent,
    lightId: string,
): Promise<Boolean> => {
    const actor = getActorByAgent(canister_id, agent);
    const r: Boolean = await actor.experience_query_collected(lightId);
    return r;
};

export const queryLightDetailsById = async (canister_id: string, lightId: string) => {
    const actor = getActor(canister_id);
    const r: DoneLightExperienceWorker[] = await actor.experience_query_experience_done_by_id(
        lightId,
    );
    return r;
};
