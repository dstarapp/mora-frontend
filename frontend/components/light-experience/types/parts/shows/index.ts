import {
    SupportedBasicShowName,
    SupportedShowName,
    SupportedSubItemsShowName,
    SupportedSubtypeShowName,
    getBoolViewSupportedTypeList,
    getImageViewSupportedTypeList,
    getOptViewSupportedTypeList,
    getRecordViewSupportedTypeList,
    getTableViewSupportedTypeList,
    getTextViewSupportedTypeList,
    getTupleViewSupportedTypeList,
    getVariantViewSupportedTypeList,
    getVecViewSupportedTypeList,
} from '@mora-light/core/types/transmit';
import { TrimmedSingleTransmitShowView } from './basic';
import { TrimmedCombinedTransmitShowView } from './combined';
import { CandidType, isSameCandidType } from '@mora-light/core/types/candid';
import { deepClone } from '@mora-light/core/types/common';

export type TrimmedUnionTransmitShowView =
    | TrimmedSingleTransmitShowView
    | TrimmedCombinedTransmitShowView;

export const findShowNameByView = (view: TrimmedUnionTransmitShowView): SupportedShowName => {
    if (view.subtype === undefined && view.subitems === undefined) {
        // single type
        return view.constraint.name;
    } else if (view.subtype !== undefined) {
        // combined type subtype
        return view.constraint.name;
    } else {
        // combined type subitems
        return view.constraint.name;
    }
};

const isSupportedType = (
    type: CandidType,
    supportedTypeList: CandidType[],
): CandidType | undefined => {
    for (const supportedType of supportedTypeList) {
        if (isSameCandidType(type, supportedType)) return supportedType;
    }
    return undefined;
};

export const doesSupportedType = (
    view: TrimmedUnionTransmitShowView,
    type: CandidType,
): CandidType | undefined => {
    // console.error('doesSupportedType', view, type);
    if (view.subtype === undefined && view.subitems === undefined) {
        // single type
        switch (view.constraint.name) {
            case 'BoolView':
                return isSupportedType(type, getBoolViewSupportedTypeList());
            case 'ImageView':
                return isSupportedType(type, getImageViewSupportedTypeList());
            case 'TextView':
                return isSupportedType(type, getTextViewSupportedTypeList());
            case 'TableView':
                return isSupportedType(type, getTableViewSupportedTypeList());
        }
    } else if (view.subtype !== undefined) {
        // combined type subtype
        let subtype: CandidType | undefined = undefined;
        switch (view.constraint.name) {
            case 'VecView':
                if (type.type !== 'vec') return undefined;
                subtype = doesSupportedType(view.subtype, type.subtype);
                if (subtype !== undefined) return { type: 'vec', subtype };
                return undefined;
            case 'OptView':
                if (type.type !== 'opt') return undefined;
                subtype = doesSupportedType(view.subtype, type.subtype);
                if (subtype !== undefined) return { type: 'opt', subtype };
                return undefined;
        }
    } else {
        // combined type subitems
        switch (view.constraint.name) {
            case 'RecordView':
                if (type.type !== 'record') return undefined;
                if (
                    !((): boolean => {
                        const keys1 = type.subitems.map((subitem) => subitem.key);
                        const keys2 = view.subitems.map((subitem) => subitem.key);
                        for (const key of keys1) if (!keys2.includes(key)) return false;
                        for (const key of keys2) if (!keys1.includes(key)) return false;
                        return true;
                    })()
                )
                    return undefined;
                for (const key of type.subitems.map((subitem) => subitem.key)) {
                    const index1 = type.subitems.findIndex((subitem) => subitem.key === key);
                    const index2 = view.subitems.findIndex((subitem) => subitem.key === key);
                    const subtype1 = type.subitems[index1].type;
                    const view2 = view.subitems[index2].view;
                    if (!doesSupportedType(view2, subtype1)) return undefined;
                }
                return deepClone(type);
            case 'VariantView':
                if (type.type !== 'variant') return undefined;
                if (
                    !((): boolean => {
                        const keys1 = type.subitems.map((subitem) => subitem.key);
                        const keys2 = view.subitems.map((subitem) => subitem.key);
                        for (const key of keys1) if (!keys2.includes(key)) return false;
                        for (const key of keys2) if (!keys1.includes(key)) return false;
                        return true;
                    })()
                )
                    return undefined;
                for (const key of type.subitems.map((subitem) => subitem.key)) {
                    const index1 = type.subitems.findIndex((subitem) => subitem.key === key);
                    const index2 = view.subitems.findIndex((subitem) => subitem.key === key);
                    const subtype1 = type.subitems[index1].type;
                    const view2 = view.subitems[index2].view;
                    if (!doesSupportedType(view2, subtype1)) return undefined;
                }
                return deepClone(type);
            case 'TupleView':
                if (type.type !== 'tuple') return undefined;
                if (type.subitems.length !== view.subitems.length) return undefined;
                for (let i = 0; i < type.subitems.length; i++) {
                    const subtype1 = type.subitems[i].type;
                    const view2 = view.subitems[i].view;
                    if (!doesSupportedType(view2, subtype1)) return undefined;
                }
                return deepClone(type);
        }
    }
};

export const findSupportedSimpleTypes = (view: TrimmedUnionTransmitShowView): CandidType[] => {
    if (view.subtype === undefined && view.subitems === undefined) {
        // single type
        switch (view.constraint.name) {
            case 'BoolView':
                return [{ type: 'bool' }];
            case 'ImageView':
                return [{ type: 'text' }];
            case 'TextView':
                return [{ type: 'text' }];
            case 'TableView':
                return getTableViewSupportedTypeList();
        }
    } else if (view.subtype !== undefined) {
        // combined type subtype
        switch (view.constraint.name) {
            case 'VecView':
                return getVecViewSupportedTypeList(findSupportedSimpleTypes(view.subtype));
            case 'OptView':
                return getOptViewSupportedTypeList(findSupportedSimpleTypes(view.subtype));
        }
    } else {
        // combined type subitems
        switch (view.constraint.name) {
            case 'RecordView':
                return getRecordViewSupportedTypeList(
                    view.subitems.map((subitem) => ({
                        key: subitem.key,
                        types: findSupportedSimpleTypes(subitem.view),
                    })),
                );
            case 'VariantView':
                return getVariantViewSupportedTypeList(
                    view.subitems.map((subitem) => ({
                        key: subitem.key,
                        types: findSupportedSimpleTypes(subitem.view),
                    })),
                );
            case 'TupleView':
                return getTupleViewSupportedTypeList(
                    view.subitems.map((subitem) => ({
                        key: subitem.key,
                        types: findSupportedSimpleTypes(subitem.view),
                    })),
                );
        }
    }
};

export const getInitialShowView = (name: SupportedShowName): TrimmedUnionTransmitShowView => {
    switch (name) {
        case 'BoolView':
            return {
                constraint: {
                    name: 'BoolView',
                },
            };
        case 'TextView':
            return {
                constraint: {
                    name: 'TextView',
                },
            };
        case 'ImageView':
            return {
                constraint: {
                    name: 'ImageView',
                },
            };
        case 'TableView':
            return {
                constraint: {
                    name: 'TableView',
                },
            };
        case 'VecView':
            return {
                subtype: getInitialShowView('TextView'),
                constraint: {
                    name: 'VecView',
                },
            };
        case 'OptView':
            return {
                subtype: getInitialShowView('TextView'),
                constraint: {
                    name: 'OptView',
                },
            };
        case 'RecordView':
            return {
                subitems: [],
                constraint: {
                    name: 'RecordView',
                },
            };
        case 'VariantView':
            return {
                subitems: [],
                constraint: {
                    name: 'VariantView',
                },
            };
        case 'TupleView':
            return {
                subitems: [],
                constraint: {
                    name: 'TupleView',
                },
            };
    }
    // throw new Error('what a type? ' + name);
};
