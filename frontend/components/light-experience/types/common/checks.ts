import { LightExperience, SupportedAction } from '../core';
import {
    CanisterAction,
    CanisterActionArg,
    CanisterActionArgForce,
    CanisterActionArgMainRec,
    CanisterActionArgOpt,
    CanisterActionArgRecord,
    CanisterActionArgTuple,
    CanisterActionArgVariant,
    CanisterActionArgVec,
    CanisterActionResult,
    findCanisterActionValue,
} from '../parts/canisters';
import {
    CombinedAction,
    CombinedActionArgTuple,
    CombinedActionResult,
    findCombinedActionValue,
} from '../parts/combined';
import { ConstantValue } from '../parts/constants';
import { PropValue } from '../parts/props';
import { InputValue } from '../parts/inputs';
import { ActionValues } from './value';
import { DataShow } from '../parts/show';
import { CandidType, isCanisterId, isSameCandidType } from '@mora-light/core/types/candid';
import { parseLightCore } from './parses';
import { findTransformToCandidType } from '@mora-light/core/types/transform';
import { findDataSourceType } from '@mora-light/core/types/source';
import { StringResult } from '@mora-light/core/types/common';
import { doesSupportedType } from '../parts/shows';

export const checkCanisterActionId = (name: string, values: ActionValues): string => {
    for (let i = 0; i < values.props.length; i++) {
        let p = values.props[i];
        if (p.name === name) {
            if (!isSameCandidType({ type: 'principal' }, p.prop.result)) {
                return `name is same with prop #${i}`;
            }
        }
    }

    return '';
};

export const checkCanisterActionArgs = (
    action: CanisterAction,
    values: ActionValues,
): boolean[] => {
    const args: boolean[] = [];
    for (let i = 0; i < action.arg.subitems.length; i++) {
        args[i] = checkCanisterActionArg(action.arg.subitems[i], values);
    }
    return args;
};

const checkCanisterActionArg = (arg: CanisterActionArg, values: ActionValues): boolean => {

    const findValueType = (id: string): CandidType | undefined => {
        const constant = values.constants.find((c) => c.id === id);
        if (constant !== undefined) return constant.constant.result;

        const prop = values.props.find((p) => p.id === id);
        if (prop !== undefined) return prop.prop.result;

        const input = values.inputs.find((i) => i.id === id);
        if (input !== undefined) return input.input.result;

        for (const action of values.actions) {
            switch (action.type) {
                case 'canister':
                    const canisterValue = findCanisterActionValue(id, action.result);
                    if (canisterValue !== undefined) return canisterValue.type;
                    break;
                case 'combined':
                    const combinedValue = findCombinedActionValue(id, action.result);
                    if (combinedValue !== undefined) return combinedValue.type;
                    break;
            }
        }

        return undefined;
    };

    if (arg.id !== undefined) {
        const type = findValueType(arg.id);
        if (type === undefined) return false;
        return isSameCandidType(arg.type, type);
    }

    switch (arg.type.type) {
        case 'vec':
            const vec = arg as CanisterActionArgVec;
            if (vec.constant === 0) return true;
            for (let i = 0; i < vec.constant; i++) {
                if (!checkCanisterActionArg(vec.subitems![i], values)) return false;
            }
            return true;
        case 'opt':
            const opt = arg as CanisterActionArgOpt;
            if (opt.constant === 0) return true;
            return checkCanisterActionArg(opt.value, values);
        case 'record':
            const record = arg as CanisterActionArgRecord;
            for (const a of record.subitems) {
                if (!checkCanisterActionArg(a, values)) return false;
            }
            return true;
        case 'variant':
            const variant = arg as CanisterActionArgVariant;
            return checkCanisterActionArg(variant.value, values);
        case 'tuple':
            const tuple = arg as CanisterActionArgTuple;
            for (const a of tuple.subitems) {
                if (!checkCanisterActionArg(a, values)) return false;
            }
            return true;
        case 'rec':
            const rec = arg as CanisterActionArgMainRec;
            return checkCanisterActionArg(rec.value, values);
    }

    return false;
};

export const checkCanisterActionResults = (
    action: CanisterAction,
    findExportedValue: (
        name: string,
        id: string,
    ) => ConstantValue | PropValue | InputValue | SupportedAction | undefined,
): (boolean | undefined)[] => {
    const results: (boolean | undefined)[] = [];
    if (action.result.subitems !== undefined) {
        for (let i = 0; i < action.result.subitems.length; i++) {
            const r = checkCanisterActionResult(action.result.subitems[i], findExportedValue);
            if (r.right === 0 && r.wrong === 0) results[i] = undefined;
            else if (r.wrong > 0) results[i] = false;
            else results[i] = true;
        }
    }
    return results;
};

const checkCanisterActionResult = (
    result: CanisterActionResult,
    findExportedValue: (
        name: string,
        id: string,
    ) => ConstantValue | PropValue | InputValue | SupportedAction | undefined,
): {
    right: number;
    wrong: number;
} => {
    let right = 0;
    let wrong = 0;

    if (result.exported?.id && result.exported.name) {
        if (findExportedValue(result.exported.name, result.exported.id)) wrong++;
        else right++;
    }

    if (result.subitems !== undefined) {
        for (let i = 0; i < result.subitems.length; i++) {
            const r = checkCanisterActionResult(result.subitems[i], findExportedValue);
            right += r.right;
            wrong += r.wrong;
        }
    }

    return { right, wrong };
};

export const checkIdentity = (id: string, values: ActionValues): string => {
    for (const action of values.actions) {
        if (
            action.type === 'canister' &&
            action.identity.from === 'host-login' &&
            action.identity.name &&
            action.identity.id === id
        ) {
            return action.identity.name;
        }
    }
    return '';
};

export const checkLightExperience = (experience: LightExperience): StringResult<string> => {
    const values: { id: string; name: string; type: CandidType }[] = [];
    const identities: { id: string; name: string }[] = [];

    if (experience.version !== '0.0.1')
        return { err: `wrong version: ${experience.version}. must be 0.0.1` };

    const checkConstant = (constant: ConstantValue, index: number): StringResult<boolean> => {
        const id = constant.id;
        const name = constant.name;
        const type = constant.constant.result;
        if (!id) return { err: `constant #${index + 1} must have id` };
        if (!name) return { err: `constant #${index + 1} must have name` };
        if (values.find((v) => v.id === id || v.name === name))
            return { err: `constant #${index + 1} name ${name} is repeated` };
        values.push({ id, name, type });
        return { ok: true };
    };
    for (let i = 0; i < experience.constants.length; i++) {
        const r = checkConstant(experience.constants[i], i);
        if (r.err) return r;
    }

    const checkProp = (prop: PropValue, index: number): StringResult<boolean> => {
        const id = prop.id;
        const name = prop.name;
        const type = prop.prop.result;
        if (!id) return { err: `prop #${index + 1} must have id` };
        if (!name) return { err: `prop #${index + 1} must have name` };
        if (values.find((v) => v.id === id || v.name === name))
            return { err: `prop #${index + 1} name ${name} is repeated` };
        values.push({ id, name, type });
        return { ok: true };
    };
    for (let i = 0; i < experience.props.length; i++) {
        const r = checkProp(experience.props[i], i);
        if (r.err) return r;
    }

    // 3. inputs
    const checkInput = (input: InputValue, index: number): StringResult<boolean> => {
        const id = input.id;
        const name = input.name;
        const type = input.input.result;
        if (!id) return { err: `form #${index + 1} must have id` };
        if (!name) return { err: `form #${index + 1} must have name` };
        if (values.find((v) => v.id === id || v.name === name))
            return { err: `form #${index + 1} name ${name} is repeated` };
        values.push({ id, name, type });
        return { ok: true };
    };
    for (let i = 0; i < experience.inputs.length; i++) {
        const r = checkInput(experience.inputs[i], i);
        if (r.err) return r;
    }

    // 4. actions
    const checkAction = (action: SupportedAction, index: number): StringResult<boolean> => {
        switch (action.type) {
            case 'canister':
                return checkCanisterAction(action, index);
            case 'combined':
                return checkCombinedAction(action, index);
        }
    };
    const checkCanisterAction = (action: CanisterAction, index: number): StringResult<boolean> => {

        let r = ((): StringResult<boolean> => {
            const canister = action.canister;
            // canister id
            if (canister.canister_id.fixed && !isCanisterId(canister.canister_id.value))
                return { err: `action #${index + 1} canister id is not correct.` };
            if (!canister.canister_id.fixed) {
                if (canister.canister_id.value && !isCanisterId(canister.canister_id.value))
                    return { err: `action #${index + 1} canister id is not correct.` };
                if (canister.canister_id.source) {
                    if (
                        !isSameCandidType(findDataSourceType(canister.canister_id.source), {
                            type: 'principal',
                        })
                    )
                        return { err: `action #${index + 1} canister id is not correct.` };
                } else {
                    const id = canister.canister_id.id;
                    if (!id) return { err: `action #${index + 1} canister id is not correct.` };
                    const value = values.find((value) => value.id === id);
                    if (!value) return { err: `action #${index + 1} canister id is not correct.` };
                    if (!isSameCandidType(value.type, { type: 'principal' }))
                        return { err: `action #${index + 1} canister id is not correct.` };
                }
            }
            // info
            if (!canister.info.module_hash)
                return { err: `action #${index + 1} canister method is not correct.` };
            if (!canister.info.updated)
                return { err: `action #${index + 1} canister method is not correct.` };
            // candid
            if (!canister.candid.did)
                return { err: `action #${index + 1} canister method is not correct.` };
            if (!canister.candid.javascript)
                return { err: `action #${index + 1} canister method is not correct.` };
            // method
            if (!canister.method.name)
                return { err: `action #${index + 1} canister method is not correct.` };

            return { ok: true };
        })();
        if (r.err) return r;

        const checkCanisterActionArgForce = (
            arg: CanisterActionArgForce,
        ): StringResult<boolean> => {
            const id = arg.id;
            const type = arg.type;
            const value = values.find((value) => value.id === id);
            if (!value) return { err: `action #${index + 1} canister arg is not correct.` };
            if (!isSameCandidType(type, value.type))
                return { err: `action #${index + 1} canister arg is not correct.` };
            return { ok: true };
        };
        const checkCanisterActionArg = (arg: CanisterActionArg): StringResult<boolean> => {
            if (arg.id !== undefined) return checkCanisterActionArgForce(arg);
            switch (arg.type.type) {
                case 'vec':
                    if (arg.constant === undefined)
                        return { err: `action #${index + 1} canister arg is not correct.` };
                    if (arg.subitems === undefined)
                        return { err: `action #${index + 1} canister arg is not correct.` };
                    for (const item of arg.subitems) {
                        const r = checkCanisterActionArg(item);
                        if (r.err) return r;
                    }
                    return { ok: true };
                case 'opt':
                    if (arg.constant === 0) return { ok: true };
                    if (arg.constant === 1) {
                        if (arg.value === undefined)
                            return { err: `action #${index + 1} canister arg is not correct.` };
                        return checkCanisterActionArg(arg.value);
                    }
                    return { err: `action #${index + 1} canister arg is not correct.` };
                case 'record':
                    if (arg.subitems === undefined)
                        return { err: `action #${index + 1} canister arg is not correct.` };
                    for (const item of arg.subitems) {
                        const r = checkCanisterActionArg(item);
                        if (r.err) return r;
                    }
                    return { ok: true };
                case 'variant':
                    if (arg.constant === undefined)
                        return { err: `action #${index + 1} canister arg is not correct.` };
                    const item = arg.type.subitems.find((i) => i.key === arg.constant);
                    if (item === undefined)
                        return { err: `action #${index + 1} canister arg is not correct.` };
                    if (arg.value === undefined)
                        return { err: `action #${index + 1} canister arg is not correct.` };
                    return checkCanisterActionArg(arg.value);
                case 'tuple':
                    if (arg.subitems === undefined)
                        return { err: `action #${index + 1} canister arg is not correct.` };
                    for (const item of arg.subitems) {
                        const r = checkCanisterActionArg(item);
                        if (r.err) return r;
                    }
                    return { ok: true };
                case 'rec':
                    return checkCanisterActionArg(arg.value!);
            }
            return { err: `action #${index + 1} canister arg is not correct.` };
        };
        r = checkCanisterActionArg(action.arg);
        if (r.err) return r;

        const checkCanisterActionResult = (result: CanisterActionResult): StringResult<boolean> => {
            if (result.exported) {
                const id = result.exported.id;
                const name = result.exported.name;
                const type = findTransformToCandidType(result.exported?.transform) ?? result.type;
                if (id || name) {
                    if (!id)
                        return {
                            err: `action #${index + 1} canister result export value must have id.`,
                        };
                    if (!name)
                        return {
                            err: `action #${index + 1
                                } canister result export value must have name.`,
                        };
                    if (values.find((v) => v.id === id || v.name === name))
                        return {
                            err: `action #${index + 1
                                } canister result export name can not be repeated.`,
                        };
                    values.push({ id, name, type });
                }
            }
            if (result.subitems) {
                for (const item of result.subitems) {
                    const r = checkCanisterActionResult(item);
                    if (r.err) return r;
                }
            }
            return { ok: true };
        };
        r = checkCanisterActionResult(action.result);
        if (r.err) return r;

        const from = action.identity.from;
        const id = action.identity.id;
        const name = action.identity.name;
        switch (from) {
            case 'anonymous':
                break;
            case 'host-login':
                if (id && name) {

                    if (identities.find((v) => v.id === id || v.name === name))
                        return {
                            err: `action #${index + 1} canister identity name can not be repeated.`,
                        };
                    identities.push({ id, name });
                }
                break;
            case 'inner':
                if (!id)
                    return {
                        err: `action #${index + 1} canister identity import must have id.`,
                    };
                if (!identities.find((v) => v.id === id || v.name === name))
                    return {
                        err: `action #${index + 1} canister identity import is not correct.`,
                    };
                break;
        }
        return { ok: true };
    };
    const checkCombinedAction = (action: CombinedAction, index: number): StringResult<boolean> => {

        const checkCombinedActionArgTuple = (
            arg: CombinedActionArgTuple,
        ): StringResult<boolean> => {
            for (let i = 0; i < arg.subitems.length; i++) {
                const id = arg.subitems[i].id;
                const type = arg.subitems[i].type;
                const value = values.find((value) => value.id === id);
                if (!value) return { err: `action #${index + 1} combined arg is not correct.` };
                if (!isSameCandidType(type, value.type))
                    return { err: `action #${index + 1} combined arg is not correct.` };
            }
            return { ok: true };
        };
        let r = checkCombinedActionArgTuple(action.arg);
        if (r.err) return r;

        const checkCombinedActionResult = (result: CombinedActionResult): StringResult<boolean> => {
            if (result.exported) {
                const id = result.exported.id;
                const name = result.exported.name;
                const type = findTransformToCandidType(result.exported?.transform) ?? result.type;
                if (id || name) {
                    if (!id)
                        return {
                            err: `action #${index + 1} combined result export value must have id.`,
                        };
                    if (!name)
                        return {
                            err: `action #${index + 1
                                } combined result export value must have name.`,
                        };
                    if (values.find((v) => v.id === id || v.name === name))
                        return {
                            err: `action #${index + 1
                                } combined result export name can not be repeated.`,
                        };
                    values.push({ id, name, type });
                }
            }
            if (result.subitems) {
                for (const item of result.subitems) {
                    const r = checkCombinedActionResult(item);
                    if (r.err) return r;
                }
            }
            return { ok: true };
        };
        return checkCombinedActionResult(action.result);
    };
    for (let i = 0; i < experience.actions.length; i++) {
        const r = checkAction(experience.actions[i], i);
        if (r.err) return r;
    }

    // 4. trigger
    const trigger = experience.trigger;
    switch (trigger.type) {
        case 'loading':
            if (experience.inputs.length) return { err: `trigger can not be loading` };
            break;
        case 'button':
            if (!trigger.text.trim()) return { err: `button trigger must have text` };
            break;
        case 'clock':
            if (experience.inputs.length) return { err: `trigger can not be loading` };
            break;
    }

    // 5. shows
    const checkShow = (show: DataShow, index: number): StringResult<boolean> => {
        const id = show.show.id;
        if (!id) return { err: `show #${index + 1} must choose value` };
        const value = values.find((v) => v.id === id);
        if (!value) return { err: `show #${index + 1} value not found` };
        if (doesSupportedType(show.show.view, value.type)) return { ok: true };
        return { err: `show #${index + 1} value is not correct` };
    };
    for (let i = 0; i < experience.shows.length; i++) {
        const r = checkShow(experience.shows[i], i);
        if (r.err) return r;
    }

    return { ok: parseLightCore(experience) };
};
