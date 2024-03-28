import { CandidType } from '@mora-light/core/types/candid';

export type PropValueProp = {
    label?: string;
    tip?: string;
    result: CandidType;
};

export type PropValue = {
    id: string;
    name: string;

    type: 'prop';

    prop: PropValueProp;
};
