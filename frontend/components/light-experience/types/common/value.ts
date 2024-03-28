import { CandidType, isSameCandidType } from '@mora-light/core/types/candid';
import { SupportedAction } from '../core';
import { CanisterAction, CanisterActionResult } from '../parts/canisters';
import { CombinedAction, CombinedActionResult } from '../parts/combined';
import { ConstantValue } from '../parts/constants';
import { PropValue } from '../parts/props';
import { InputValue } from '../parts/inputs';
import { findTransformToCandidType } from '@mora-light/core/types/transform';

type FoundValue = {
    name: string;
    type: CandidType;
    from: ConstantValue | PropValue | InputValue | SupportedAction;
};

export type ActionValues = {
    constants: ConstantValue[];
    props: PropValue[];
    inputs: InputValue[];
    actions: SupportedAction[];
};

export const findExportedValueByActionValues = (
    values: ActionValues,
    id: string,
): FoundValue | undefined => {
    if (!id) return undefined;

    for (const c of values.constants) {
        if (c.id === id) return { name: c.name, type: c.constant.result, from: c };
    }
    for (const p of values.props) {
        if (p.id === id) return { name: p.name, type: p.prop.result, from: p };
    }
    for (const i of values.inputs) {
        if (i.id === id) return { name: i.name, type: i.input.result, from: i };
    }

    const findValueByCanisterAction = (action: CanisterAction): FoundValue | undefined => {
        const findValueByCanisterActionResult = (
            result: CanisterActionResult,
        ): FoundValue | undefined => {
            if (result.exported && result.exported.id === id) {
                return {
                    name: result.exported.name,
                    type: findTransformToCandidType(result.exported.transform) ?? result.type,
                    from: action,
                };
            }
            if (result.subitems !== undefined) {
                for (const item of result.subitems) {
                    const r = findValueByCanisterActionResult(item);
                    if (r !== undefined) return r;
                }
            }
            return undefined;
        };
        return findValueByCanisterActionResult(action.result);
    };

    const findValueByCombinedAction = (action: CombinedAction): FoundValue | undefined => {
        const findValueByCombinedActionResult = (
            result: CombinedActionResult,
        ): FoundValue | undefined => {
            if (result.exported && result.exported.id === id) {
                return {
                    name: result.exported.name,
                    type: findTransformToCandidType(result.exported.transform) ?? result.type,
                    from: action,
                };
            }
            if (result.subitems !== undefined) {
                for (const item of result.subitems) {
                    const r = findValueByCombinedActionResult(item);
                    if (r !== undefined) return r;
                }
            }
            return undefined;
        };
        return findValueByCombinedActionResult(action.result);
    };

    let r: FoundValue | undefined = undefined;
    for (const a of values.actions) {
        switch (a.type) {
            case 'canister':
                r = findValueByCanisterAction(a);
                if (r !== undefined) return r;
                break;
            case 'combined':
                r = findValueByCombinedAction(a);
                if (r !== undefined) return r;
                break;
        }
    }
};

export const findExportedValueNameByActionValues = (
    values: ActionValues,
    id: string,
    type: CandidType,
): string => {
    const found = findExportedValueByActionValues(values, id);
    if (found === undefined) return '';
    if (!isSameCandidType(type, found.type)) return '';
    return found.name;
};
