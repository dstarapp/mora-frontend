import { CandidType, CandidValue } from '@mora-light/core/types/candid';

export type ConstantValueConstant = {
    result: CandidType;
    value: CandidValue;
};

export type ConstantValue = {
    id: string;
    name: string;

    type: 'constant';

    constant: ConstantValueConstant;
};
