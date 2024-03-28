import {
    CandidType,
    RecordCandidType,
    TupleCandidType,
    getEmptyTupleCandidType,
} from '@mora-light/core/types/candid';
import { Transform, findTransformToCandidType } from '@mora-light/core/types/transform';

export type CombinedAction = {
    id: string;
    name: string;

    type: 'combined';

    arg: CombinedActionArgTuple;
    transform: Transform;
    result: CombinedActionResultTuple;
};

// ================== CombinedAction ==================

export type CombinedActionArgForce = {
    type: CandidType;

    id: string;
    name: string;
};

export type CombinedActionArgTuple = {
    type: TupleCandidType;

    subitems: CombinedActionArgForce[];
};

// ================== CombinedAction ==================

export type CombinedActionResult =
    | CombinedActionResultForce
    | CombinedActionResultRecord
    | CombinedActionResultTuple;

type Exported = {
    id: string;
    name: string;

    transform?: Transform;
};

export type CombinedActionResultForce = {
    type: CandidType;

    exported: Exported;
    subitems?: undefined;
};

export type CombinedActionResultRecord = {
    type: RecordCandidType;

    exported?: Exported;
    subitems?: CombinedActionResult[];
};

export type CombinedActionResultTuple = {
    type: TupleCandidType;

    exported?: Exported;
    subitems?: CombinedActionResult[];
};

export const getInitialCombinedActionValue = (id: string, name: string): CombinedAction => {
    return {
        id,
        name,

        type: 'combined',

        arg: { type: getEmptyTupleCandidType(), subitems: [] },
        transform: {
            from: getEmptyTupleCandidType(),
            transform: {
                type: 'function',
                code: 'result = false;',
            },
            to: { type: 'tuple', subitems: [{ key: `_0_`, type: { type: 'bool' } }] },
        },
        result: {
            type: { type: 'tuple', subitems: [{ key: `_0_`, type: { type: 'bool' } }] },
            subitems: [{ type: { type: 'bool' }, exported: { id: '', name: '' } }],
        },
    };
};

export const hasCombinedActionResult = (
    name: string,
    id: string,
    result: CombinedActionResultTuple,
): boolean => {
    const hasResult = (result: CombinedActionResult): boolean => {
        if (
            result.exported?.name &&
            result.exported.name === name &&
            (!id || id !== result.exported.id)
        ) {
            return true;
        }
        if (result.subitems !== undefined) {
            for (let i = 0; i < result.subitems.length; i++) {
                if (hasResult(result.subitems[i])) return true;
            }
        }
        return false;
    };
    return hasResult(result);
};

export const findCombinedActionValue = (
    id: string,
    result: CombinedActionResult,
): { type: CandidType; name: string } | undefined => {
    const findResult = (
        result: CombinedActionResult,
    ): { type: CandidType; name: string } | undefined => {
        if (result.exported?.name && result.exported.id && result.exported.id === id) {
            return {
                type: findTransformToCandidType(result.exported.transform) ?? result.type,
                name: result.exported.name,
            };
        }
        if (result.subitems !== undefined) {
            for (let i = 0; i < result.subitems.length; i++) {
                const r = findResult(result.subitems[i]);
                if (r) return r;
            }
        }
        return undefined;
    };
    return findResult(result);
};
