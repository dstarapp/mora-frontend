import { DataSource, findDataSourceExtra, findDataSourceType } from '@mora-light/core/types/source';
import { LightExperience } from '../core';
import { deepClone } from '@mora-light/core/types/common';
import { LightCore } from '@mora-light/core/types';
import {
    CanisterAction,
    CanisterActionArg,
    CanisterActionArgForce,
    CanisterActionResult,
} from '../parts/canisters';
import {
    ArgumentConstraint,
    ArrayArgumentConstraintSubitem,
    CanisterIdSource,
    DataSourceProp,
} from '@mora-light/core/types/source';
import {
    CanisterIdentity,
    CanisterIdentityHostLogin,
    DataSourceCanister,
} from '@mora-light/core/types/source';
import {
    CandidType,
    TupleCandidType,
    isSameCandidType,
    CandidTypeSubitem,
    MainRecCandidType,
} from '@mora-light/core/types/candid';
import { Transform } from '@mora-light/core/types/transform';
import { CombinedAction, CombinedActionResult } from '../parts/combined';
import {
    CombinedShowViewSubitem,
    CombinedTransmitShowView,
    DataTransmit,
    SingleTransmitShowView,
    UnionTransmitShowView,
} from '@mora-light/core/types/transmit';
import { TrimmedUnionTransmitShowView, doesSupportedType } from '../parts/shows';

export const parseLightCore = (experience: LightExperience): string => {
    const data: DataSource[] = [];
    for (let i = 0; i < experience.constants.length; i++) {
        const constant = experience.constants[i];
        data.push({
            source: 'constant',
            constant: {
                result: deepClone(constant.constant.result),
                value: deepClone(constant.constant.value),
            },
            exported: {
                target: 'inner',
                name: constant.id,
            },
        });
    }
    // 1.2 props
    for (let i = 0; i < experience.props.length; i++) {
        const prop = experience.props[i];
        const source: DataSourceProp = {
            source: 'prop',
            prop: {
                result: deepClone(prop.prop.result),
                name: prop.name,
            },
            exported: {
                target: 'inner',
                name: prop.id,
            },
        };
        if (prop.prop.label) source.prop.label = prop.prop.label;
        if (prop.prop.tip) source.prop.tip = prop.prop.tip;
        data.push(source);
    }
    // 1.3 inputs
    for (let i = 0; i < experience.inputs.length; i++) {
        const input = experience.inputs[i];
        data.push({
            source: 'input',
            input: {
                result: deepClone(input.input.result),
                ui: deepClone(input.ui),
            },
            exported: {
                target: 'inner',
                name: input.id,
            },
        });
    }
    // 1.4 actions
    const parseCanisterAction = (action: CanisterAction) => {
        const { canister_id, arg, identity } = ((): {
            canister_id: CanisterIdSource;
            arg: ArgumentConstraint;
            identity: CanisterIdentity;
        } => {
            let canister_id: CanisterIdSource | undefined = undefined;
            if (action.canister.canister_id.fixed) {
                canister_id = deepClone(action.canister.canister_id);
            } else if (action.canister.canister_id.source) {
                canister_id = deepClone(action.canister.canister_id);
            } else {
                const name = action.canister.canister_id.id;
                const source = data.find((s) => s.exported?.name === name);
                if (!source) throw new Error(`can not find variable: ${name}`);
                if (!isSameCandidType(findDataSourceType(source), { type: 'principal' }))
                    throw new Error('type is not match');
                canister_id = {
                    fixed: false,
                    source: {
                        source: 'inner',
                        inner: {
                            name,
                            result: { type: 'principal' },
                            extra: findDataSourceExtra(source),
                        },
                    },
                };
            }

            const parseCanisterActionArgForce = (
                arg: CanisterActionArgForce,
            ): ArgumentConstraint => {
                const name = arg.id;
                const source = data.find((s) => s.exported?.name === name);
                if (!source) throw new Error(`can not find variable: ${name}`);
                if (!isSameCandidType(findDataSourceType(source), arg.type))
                    throw new Error('type is not match');
                return {
                    type: deepClone(arg.type),
                    constraint: {
                        type: 'force',
                        source: {
                            source: 'inner',
                            inner: {
                                name,
                                result: deepClone(arg.type),
                                extra: findDataSourceExtra(source),
                            },
                        },
                    },
                };
            };
            const parseCanisterActionArg = (arg: CanisterActionArg): ArgumentConstraint => {
                if (arg.id) return parseCanisterActionArgForce(arg);
                switch (arg.type.type) {
                    case 'vec':
                        if (arg.constant === undefined)
                            throw new Error('type vec: constant can not be undefined.');
                        if (arg.constant === 0) {
                            return {
                                type: deepClone(arg.type),
                                constraint: { type: 'vec', constant: 0 },
                            };
                        }
                        if (arg.subitems === undefined)
                            throw new Error('type vec: subitems can not be undefined.');
                        return {
                            type: deepClone(arg.type),
                            constraint: {
                                type: 'vec',
                                constant: arg.constant as number,
                                length: {
                                    source: 'constant',
                                    constant: {
                                        result: { type: 'nat32' },
                                        value: arg.constant as number,
                                    },
                                },
                                subitems: arg.subitems.map((item) => {
                                    const custom: ArrayArgumentConstraintSubitem = {
                                        type: 'custom',
                                        constraint: parseCanisterActionArg(item),
                                    };
                                    return custom;
                                }),
                                default: {
                                    type: deepClone(arg.type.subtype),
                                    constraint: {
                                        type: 'force',
                                        source: {
                                            source: 'input',
                                            input: { result: deepClone(arg.type.subtype) },
                                        },
                                    },
                                },
                                using: arg.using,
                            },
                        };
                    case 'opt':
                        if (arg.constant === 0) {
                            return {
                                type: deepClone(arg.type),
                                constraint: { type: 'opt', constant: 0 },
                            };
                        }
                        if (arg.constant === 1) {
                            if (arg.value === undefined)
                                throw new Error('type opt: value can not be undefined.');
                            return {
                                type: deepClone(arg.type),
                                constraint: {
                                    type: 'opt',
                                    constant: 1,
                                    value: parseCanisterActionArg(arg.value),
                                },
                            };
                        }
                        throw new Error('type opt: constant can not be undefined.');
                    case 'record':
                        if (arg.subitems === undefined)
                            throw new Error('type record: subitems can not be undefined.');
                        return {
                            type: deepClone(arg.type),
                            constraint: {
                                type: 'record',
                                subitems: arg.subitems.map((item) => parseCanisterActionArg(item)),
                            },
                        };
                    case 'variant':
                        if (arg.constant === undefined)
                            throw new Error('type variant: constant can not be undefined.');
                        const item = arg.type.subitems.find((i) => i.key === arg.constant);
                        if (item === undefined) throw new Error('type variant: constant is wrong.');
                        if (arg.value === undefined)
                            throw new Error('type variant: value can not be undefined.');
                        return {
                            type: deepClone(arg.type),
                            constraint: {
                                type: 'variant',
                                constant: arg.constant as string,
                                value: parseCanisterActionArg(arg.value),
                            },
                        };
                    case 'tuple':
                        if (arg.subitems === undefined)
                            throw new Error('type tuple: subitems can not be undefined.');
                        return {
                            type: deepClone(arg.type),
                            constraint: {
                                type: 'tuple',
                                subitems: arg.subitems.map((item) => parseCanisterActionArg(item)),
                            },
                        };
                    case 'rec':
                        return {
                            type: deepClone(arg.type) as MainRecCandidType,
                            constraint: {
                                type: 'rec',
                                value: parseCanisterActionArg(arg.value!),
                            },
                        };
                }
                throw new Error('what is wrong?');
            };

            const identity = ((): CanisterIdentity => {
                switch (action.identity.from) {
                    case 'anonymous':
                        return { from: 'anonymous' };
                    case 'host-login':
                        const login: CanisterIdentityHostLogin = { from: 'host-login' };
                        if (action.identity.id && action.identity.name) {
                            login.exported = { target: 'inner', name: action.identity.id };
                        }
                        return login;
                    case 'inner':
                        const name = action.identity.id;
                        const source = data
                            .filter((d) => d.source === 'canister')
                            .find(
                                (d) =>
                                    (d as DataSourceCanister).canister.identity.exported?.name ===
                                    name,
                            );
                        if (!source) throw new Error(`can not find inner identity: ${name}`);
                        return { from: 'inner', name, detail: 'host-login' };
                }
            })();

            return { canister_id, arg: parseCanisterActionArg(action.arg), identity };
        })();

        const name = action.id;
        data.push({
            source: 'canister',
            canister: {
                canister_id,
                info: action.canister.info,
                candid: action.canister.candid,
                method: action.canister.method,
                arg,
                identity,
            },
            exported: { target: 'inner', name },
        });

        const to = action.canister.method.result;
        const parseCanisterActionResult = (result: CanisterActionResult, codes: string[]) => {
            if (result.exported) {

                const transform: Transform = {
                    from: deepClone(to),
                    transform: {
                        type: 'function',
                        code: [...codes, 'result = data;'].join('\n'),
                    },
                    to: deepClone(result.type),
                };
                if (result.exported.transform) {
                    transform.nested = deepClone(result.exported.transform);
                }
                data.push({
                    source: 'inner',
                    inner: {
                        name,
                        result: deepClone(to),
                        extra: { constant: false },
                    },
                    transform,
                    exported: {
                        target: 'inner',
                        name: result.exported.id,
                    },
                });
            }
            if (result.subitems) {
                for (let i = 0; i < result.subitems.length; i++) {
                    const item = result.subitems[i];
                    parseCanisterActionResult(item, [
                        ...codes,
                        result.type.type === 'record'
                            ? `data = data['${result.type.subitems[i].key}'];`
                            : `data = data[${i}];`,
                    ]);
                }
            }
        };
        parseCanisterActionResult(
            action.result,
            [],
        );
    };
    const parseCombinedAction = (action: CombinedAction) => {

        const { from, arg, names } = ((): {
            from: TupleCandidType;
            arg: ArgumentConstraint;
            names: string[];
        } => {
            const argSubitems: CandidTypeSubitem[] = [];
            const argConstraints: ArgumentConstraint[] = [];
            const names: string[] = [];
            let constant = true;
            for (let i = 0; i < action.arg.subitems.length; i++) {
                const name = action.arg.subitems[i].id;
                names.push(action.arg.subitems[i].name);
                const source = data.find((s) => s.exported?.name === name);
                if (!source) throw new Error(`can not find variable: ${name}`);
                if (!isSameCandidType(findDataSourceType(source), action.arg.subitems[i].type))
                    throw new Error('type is not match');
                const extra = findDataSourceExtra(source);
                if (constant && !extra.constant) constant = false;
                const type = action.arg.subitems[i].type;
                argSubitems.push({ key: `_${i}_`, type: deepClone(type) });
                argConstraints.push({
                    type: deepClone(type),
                    constraint: {
                        type: 'force',
                        source: {
                            source: 'inner',
                            inner: {
                                name,
                                result: deepClone(type),
                                extra,
                            },
                        },
                    },
                });
            }
            const from: TupleCandidType = {
                type: 'tuple',
                subitems: argSubitems,
            };
            return {
                from,
                arg: {
                    type: deepClone(from),
                    constraint: { type: 'tuple', subitems: argConstraints },
                },
                names,
            };
        })();

        const transform = deepClone(action.transform);
        transform.from = deepClone(from);
        transform.transform.code = `${transform.transform.code}${transform.transform.code.trim().endsWith(';') ? '' : ';'
            }\nresult = [result];`;

        const regex = /^[a-zA-Z_][a-zA-Z_0-9]*$/;
        transform.names = names.map((n) => (regex.test(n) ? n : ''));
        if (transform.names.filter((n) => !!n).length === 0) delete transform.names;

        const name = action.id;
        data.push({
            source: 'combined',
            combined: { from, arg },
            transform,
            exported: { target: 'inner', name },
        });

        const to = transform.to;
        const parseCombinedActionResult = (result: CombinedActionResult, codes: string[]) => {
            if (result.exported) {

                const transform: Transform = {
                    from: deepClone(to),
                    transform: {
                        type: 'function',
                        code: [...codes, 'result = data;'].join('\n'),
                    },
                    to: deepClone(result.type),
                };
                if (result.exported.transform) {
                    transform.nested = result.exported.transform;
                }
                data.push({
                    source: 'inner',
                    inner: {
                        name,
                        result: deepClone(to),
                        extra: { constant: false },
                    },
                    transform,
                    exported: {
                        target: 'inner',
                        name: result.exported.id,
                    },
                });
            }
            if (result.subitems) {
                for (let i = 0; i < result.subitems.length; i++) {
                    const item = result.subitems[i];
                    parseCombinedActionResult(item, [
                        ...codes,
                        result.type.type === 'record'
                            ? `data = data['${result.type.subitems[i].key}'];`
                            : `data = data[${i}];`,
                    ]);
                }
            }
        };
        parseCombinedActionResult(
            action.result,
            [],
        );
    };
    for (let i = 0; i < experience.actions.length; i++) {
        const action = experience.actions[i];
        switch (action.type) {
            case 'canister':
                parseCanisterAction(action);
                break;
            case 'combined':
                parseCombinedAction(action);
                break;
        }
    }

    const subitems: CandidTypeSubitem[] = [];
    for (let i = 0; i < data.length; i++) {
        subitems.push({ key: `_${i}_`, type: deepClone(findDataSourceType(data[i])) });
    }
    const resultType: CandidType = { type: 'tuple', subitems };

    const transmits: DataTransmit[] = [];
    for (let i = 0; i < experience.shows.length; i++) {
        const show = experience.shows[i];
        const name = show.show.id;
        const index = data.findIndex((s) => s.exported?.name === name);
        if (index < 0) throw new Error(`can not find variable: ${name}`);
        const source = data[index];
        if (!source) throw new Error(`can not find variable: ${name}`);
        const from = ((): CandidType => {
            const sourceType = findDataSourceType(source);
            const type = doesSupportedType(show.show.view, sourceType);
            if (type) return type;
            throw new Error(`wrong type: ${name}`);
        })();

        transmits.push({
            transmit: 'show',
            from: deepClone(resultType),
            transform: {
                from: deepClone(resultType),
                transform: {
                    type: 'function',
                    code: `result = data[${index}];`,
                },
                to: deepClone(from),
            },
            view: parseShowView(from, show.show.view),
        });
    }

    const value: LightCore = {
        version: experience.version,
        data,
        transmits,
    };

    switch (experience.trigger.type) {
        case 'button':
            value.trigger = deepClone(experience.trigger);
            break;
        case 'clock':
            value.trigger = deepClone(experience.trigger);
            break;
    }

    // console.error('parse experience', experience, '->', value);

    return JSON.stringify(value);
};

const parseShowView = (
    from: CandidType,
    view: TrimmedUnionTransmitShowView,
): UnionTransmitShowView => {
    if (view.subtype === undefined && view.subitems === undefined) {
        // single type
        const type = doesSupportedType(view, from);
        if (type) {
            const constraint: SingleTransmitShowView = {
                from: deepClone(type),
                constraint: { name: view.constraint.name },
            };
            if (view.constraint.ui) constraint.constraint.ui = view.constraint.ui;
            return constraint;
        }
        throw new Error(`wrong type: ${view.constraint.name}`);
    } else if (view.subtype !== undefined) {
        // subtype type
        const type = doesSupportedType(view, from);
        if (type) {
            const constraint: CombinedTransmitShowView = {
                from: deepClone(type),
                subtype: parseShowView(from.subtype!, view.subtype),
                constraint: { name: view.constraint.name },
            };
            if (view.constraint.ui) constraint.constraint.ui = view.constraint.ui;
            return constraint;
        }
        throw new Error(`wrong type: ${view.constraint.name}`);
    } else {
        // subitems type
        const type = doesSupportedType(view, from);
        if (type) {
            const constraint: CombinedTransmitShowView = {
                from: deepClone(type),
                subitems: ((): CombinedShowViewSubitem[] => {
                    const subitems: CombinedShowViewSubitem[] = [];
                    for (let i = 0; i < view.subitems.length; i++) {
                        const key = view.subitems[i].key;
                        if (key !== from.subitems![i].key) throw new Error(`wrong key: ${key}`);
                        subitems.push({
                            key: key,
                            view: parseShowView(from.subitems![i].type, view.subitems[i].view),
                        });
                    }
                    return subitems;
                })(),
                constraint: { name: view.constraint.name },
            };
            if (view.constraint.ui) constraint.constraint.ui = view.constraint.ui;
            return constraint;
        }
        throw new Error(`wrong type: ${view.constraint.name}`);
    }
};
