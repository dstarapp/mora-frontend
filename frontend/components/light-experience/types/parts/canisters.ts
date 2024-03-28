import {
    CanisterCandid,
    CanisterIdSource,
    CanisterInfo,
    CanisterMethod,
} from '@mora-light/core/types/source';
import {
    CandidType,
    OptCandidType,
    RecordCandidType,
    TupleCandidType,
    VariantCandidType,
    MainRecCandidType,
    VecCandidType,
    getEmptyTupleCandidType,
    RecItem,
    findRecType,
} from '@mora-light/core/types/candid';
import { deepClone } from '@mora-light/core/types/common';
import { Transform, findTransformToCandidType } from '@mora-light/core/types/transform';

export type CanisterActionCanister = {
    canister_id:
    | CanisterIdSource
    | {
        fixed: false;
        value?: undefined;
        source?: undefined;
        id: string;
    };
    info: CanisterInfo;
    candid: CanisterCandid;
    method: CanisterMethod;
};

export type CanisterAction = {
    id: string;
    name: string;

    type: 'canister';

    canister: CanisterActionCanister;
    arg: CanisterActionArgTuple;
    result: CanisterActionResultTuple;
    identity: CanisterActionIdentity;
};

// ================== CanisterAction  ==================

export type CanisterActionArg =
    | CanisterActionArgForce
    | CanisterActionArgVec
    | CanisterActionArgOpt
    | CanisterActionArgRecord
    | CanisterActionArgVariant
    | CanisterActionArgTuple
    | CanisterActionArgMainRec;

export type CanisterActionArgForce = {
    type: CandidType;
    id: string;
    constant?: undefined;
    subitems?: undefined;
    value?: undefined;
    using?: undefined;
};

export type CanisterActionArgVec =
    | {
        type: VecCandidType;
        id?: undefined;
        constant: 0;
        subitems?: undefined;
        value?: undefined;
        using?: undefined;
    }
    | {
        type: VecCandidType;
        id?: undefined;
        constant: number;
        subitems: CanisterActionArg[];
        value?: undefined;
        using: string;
    };

export type CanisterActionArgOpt =

    | {
        type: OptCandidType;
        id?: undefined;
        constant: 0;
        subitems?: undefined;
        value?: undefined;
        using?: undefined;
    }

    | {
        type: OptCandidType;
        id?: undefined;
        constant: 1;
        subitems?: undefined;
        value: CanisterActionArg;
    };

export type CanisterActionArgRecord = {
    type: RecordCandidType;
    id?: undefined;
    constant?: undefined;
    subitems: CanisterActionArg[];
    value?: undefined;
    using?: undefined;
};

export type CanisterActionArgVariant = {
    type: VariantCandidType;
    id?: undefined;
    constant: string;
    subitems?: undefined;
    value: CanisterActionArg;
    using?: undefined;
};

export type CanisterActionArgTuple = {
    type: TupleCandidType;
    id?: undefined;
    constant?: undefined;
    subitems: CanisterActionArg[];
    value?: undefined;
    using?: undefined;
};

export type CanisterActionArgMainRec = {
    type: MainRecCandidType;
    id?: undefined;
    constant?: undefined;
    subitems?: undefined;
    value: CanisterActionArg;
};

// ================== CanisterAction ==================

export type CanisterActionResult =
    | CanisterActionResultForce
    | CanisterActionResultRecord
    | CanisterActionResultTuple;

type Exported = {
    id: string;
    name: string;

    transform?: Transform;
};

export type CanisterActionResultForce = {
    type: CandidType;

    exported: Exported;
    subitems?: undefined;
};

export type CanisterActionResultRecord = {
    type: RecordCandidType;

    exported?: Exported;
    subitems?: CanisterActionResult[];
};

export type CanisterActionResultTuple = {
    type: TupleCandidType;

    exported?: Exported;
    subitems?: CanisterActionResult[];
};

// ================== CanisterAction ==================

export type CanisterActionIdentity =
    | CanisterActionIdentityAnonymous
    | CanisterActionIdentityMoraLogin
    | CanisterActionIdentityInner;

export type CanisterActionIdentityAnonymous = {
    from: 'anonymous';
    id?: undefined;
    name?: undefined;
};

export type CanisterActionIdentityMoraLogin = {
    from: 'host-login';

    id: string;
    name: string;
};

export type CanisterActionIdentityInner = {
    from: 'inner';
    id: string;
    name?: undefined;
};

export const getInitialCanisterActionArg = (
    arg: CandidType,
    recItems: RecItem[],
    force?: boolean,
): CanisterActionArg => {
    if (force) {
        return {
            type: deepClone(arg),
            id: '',
        };
    }
    let actionArg: CanisterActionArg;
    switch (arg.type) {
        case 'vec':
            const vecArg: CanisterActionArgVec = {
                type: deepClone(arg),
                constant: 0,
            };
            actionArg = vecArg;
            break;
        case 'opt':
            const optArg: CanisterActionArgOpt = {
                type: deepClone(arg),
                constant: 0,
            };
            actionArg = optArg;
            break;
        case 'record':
            const recordArg: CanisterActionArgRecord = {
                type: deepClone(arg),
                subitems: arg.subitems.map((subitem) =>
                    getInitialCanisterActionArg(subitem.type, recItems),
                ),
            };
            actionArg = recordArg;
            break;
        case 'variant':
            if (arg.subitems.length) {
                const variantArg: CanisterActionArgVariant = {
                    type: deepClone(arg),
                    constant: arg.subitems[0].key,
                    value: getInitialCanisterActionArg(arg.subitems[0].type, recItems),
                };
                actionArg = variantArg;
            } else {
                const forceArg: CanisterActionArgForce = {
                    type: deepClone(arg),
                    id: '',
                };
                actionArg = forceArg;
            }
            break;
        case 'tuple':
            const tupleArg: CanisterActionArgTuple = {
                type: deepClone(arg),
                subitems: arg.subitems.map((subitem) =>
                    getInitialCanisterActionArg(subitem.type, recItems),
                ),
            };
            actionArg = tupleArg;
            break;
        case 'rec':
            if (arg.subtype !== undefined) {
                const mainRecArg: CanisterActionArgMainRec = {
                    type: deepClone(arg),
                    value: getInitialCanisterActionArg(arg.subtype, recItems),
                };
                actionArg = mainRecArg;
            } else {
                const mainRecType = findRecType(recItems, arg.id);
                if (mainRecType === undefined) {
                    throw new Error(`can not find rec type ${arg.id}`);
                }
                const mainRecArg: CanisterActionArgMainRec = {
                    type: deepClone(mainRecType),
                    value: getInitialCanisterActionArg(mainRecType.subtype, recItems),
                };
                actionArg = mainRecArg;
            }
            break;
        default:
            const forceArg: CanisterActionArgForce = {
                type: deepClone(arg),
                id: '',
            };
            actionArg = forceArg;
            break;
    }
    return actionArg;
};

export const getInitialCanisterActionValue = (id: string, name: string): CanisterAction => {
    return {
        id,
        name,
        type: 'canister',
        canister: {

            canister_id: {
                fixed: true,
                // value: 'dkroc-xyaaa-aaaai-qozbq-cai',
                // value: 'ipcaz-wiaaa-aaaai-qoy4q-cai',
                // value: 'bf4dr-oaaaa-aaaai-qogiq-cai',
                value: '',
            },
            info: {
                module_hash: '',
                updated: 0,
            },
            candid: {
                custom: false,
                did: '',
                javascript: '',
            },
            method: {
                name: '',
                arg: getEmptyTupleCandidType(),
                result: getEmptyTupleCandidType(),
            },
        },
        arg: { type: getEmptyTupleCandidType(), subitems: [] },
        result: { type: getEmptyTupleCandidType(), subitems: [] },
        identity: { from: 'anonymous' },
    };
};

export const hasCanisterActionResult = (
    name: string,
    id: string,
    result: CanisterActionResultTuple,
): boolean => {
    const hasResult = (result: CanisterActionResult): boolean => {
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

export const findCanisterActionValue = (
    id: string,
    result: CanisterActionResult,
): { type: CandidType; name: string } | undefined => {
    const findResult = (
        result: CanisterActionResult,
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
