import { TriggerMode } from '@mora-light/core/types/trigger';
import { CanisterAction } from './parts/canisters';
import { ConstantValue } from './parts/constants';
import { PropValue } from './parts/props';
import { InputValue } from './parts/inputs';
import { CombinedAction } from './parts/combined';
import { DataShow } from './parts/show';
import { LightExperienceRunnablePlanet } from '../canisters/experience_worker/experience_worker.did.d';

export type SupportedAction = CanisterAction | CombinedAction;

export type LightBasicInfo = {
    name: string;
    cover: string;
    thumbnail: string;
    categories: string[];
    tags: string[];
    runnable_planet: LightExperienceRunnablePlanet;
    instruction: string;
};

export type LightExperience = {
    version: string;

    constants: ConstantValue[];
    props: PropValue[];
    inputs: InputValue[];
    actions: SupportedAction[];
    trigger: TriggerMode;
    shows: DataShow[];
};

export const initialBasicInfo = (): LightBasicInfo => {
    return {
        name: '',
        cover: '',
        thumbnail: '',
        categories: [],
        tags: [],
        runnable_planet: { All: null },
        instruction: '',
    };
};
export const initialLightExperience = (): LightExperience => {
    return {
        version: '0.0.1',
        constants: [],
        props: [],
        inputs: [],
        actions: [],
        trigger: { type: 'loading' },
        shows: [],
    };
};
