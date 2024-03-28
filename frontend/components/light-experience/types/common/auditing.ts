import { StringResult } from '@mora-light/core/types/common';
import { LightBasicInfo, LightExperience } from '../core';
import { checkLightExperience } from './checks';
import { LightCore } from '@mora-light/core/types';
import {
    ArgumentConstraint,
    DataSource,
    findVecArgumentConstraintByIndex,
} from '@mora-light/core/types/source';
import { Transform } from '@mora-light/core/types/transform';
import { DataTransmit } from '@mora-light/core/types/transmit';
import { findChildType, unwrapCandidType } from '@mora-light/core/types/candid';
import { ElMessage } from 'element-plus';

const warnings: Record<string, string> = {
    'ryjl3-tyaaa-aaaaa-aaaba-cai': 'IC Ledger Canister',
};

export const audit_info = (basic: LightBasicInfo, experience: LightExperience) => {
    const showBasic = () => {
        console.group('basic info');
        console.error(`basic info: name -> ${basic.name}`);
        console.error(`basic info: categories -> ${JSON.stringify(basic.categories)}`);
        console.error(`basic info: tags -> ${JSON.stringify(basic.tags)}`);
        console.error(`basic info: runnable_planet -> ${JSON.stringify(basic.runnable_planet)}`);
        console.error(`basic info: instruction -> ${basic.instruction}`);
        console.groupEnd();
    };
    const core_json: StringResult<string> = checkLightExperience(experience);
    if (core_json.err !== undefined) {
        console.error('================ Audit Info ================');
        showBasic();
        console.error(`core info: wrong`);
        console.error(core_json.err);
        console.error(experience);
        console.error('================ Audit Info ================');
        return;
    }
    const core: LightCore = JSON.parse(core_json.ok);
    console.error('================ Audit Info ================');
    showBasic();
    console.error(`core info: version -> ${core.version}`);
    const checkDataSource = (source: DataSource) => {
        switch (source.source) {
            case 'light':
                checkArgumentConstraint(source.light.arg);
                break;
            case 'combined':
                checkArgumentConstraint(source.combined.arg);
                break;
            case 'canister':
                if (!source.canister.canister_id.fixed)
                    checkDataSource(source.canister.canister_id.source);
                else {
                    for (const key of Object.keys(warnings))
                        if (source.canister.canister_id.value === key)
                            ElMessage.warning(`Use ${warnings[key]}`);
                }
                console.group(
                    `canister call: ${source.canister.canister_id.fixed
                        ? source.canister.canister_id.value
                        : `dynamic${source.canister.canister_id.value
                            ? `${source.canister.canister_id.value}`
                            : ''
                        }`
                    } -> ${source.canister.method.name} -> ${source.canister.identity.from}`,
                );
                checkArgumentConstraint(source.canister.arg);
                console.groupEnd();
                break;
            case 'input':
                break;
            case 'constant':
                break;
            case 'inner':
                break;
            case 'prop':
                break;
            case 'outer':
                break;
        }
        if (source.transform) {
            console.group(`source ${source.source} transform`);
            checkTransform(source.transform);
            console.groupEnd();
        }
    };
    const checkArgumentConstraint = (arg: ArgumentConstraint) => {
        switch (arg.constraint.type) {
            case 'force':
                checkDataSource(arg.constraint.source);
                break;
            case 'blob':
                if (arg.constraint.constant === 0) break;
                if (arg.constraint.constant > 0) {
                    for (let i = 0; i < arg.constraint.constant; i++) {
                        const constraint = findVecArgumentConstraintByIndex(arg as any, i);
                        checkArgumentConstraint(constraint);
                    }
                } else {
                    checkDataSource(arg.constraint.length!);
                    const length = Math.max(
                        arg.constraint.subitems!.length,
                        arg.constraint.subitems2?.length ?? 0,
                    );
                    for (let i = 0; i < length; i++) {
                        const constraint = findVecArgumentConstraintByIndex(arg as any, i);
                        checkArgumentConstraint(constraint);
                    }
                    checkArgumentConstraint(arg.constraint.default!);
                }
                break;
            case 'vec':
                if (arg.constraint.constant === 0) break;
                if (arg.constraint.constant > 0) {
                    for (let i = 0; i < arg.constraint.constant; i++) {
                        const constraint = findVecArgumentConstraintByIndex(arg as any, i);
                        checkArgumentConstraint(constraint);
                    }
                } else {
                    checkDataSource(arg.constraint.length!);
                    const length = Math.max(
                        arg.constraint.subitems!.length,
                        arg.constraint.subitems2?.length ?? 0,
                    );
                    for (let i = 0; i < length; i++) {
                        const constraint = findVecArgumentConstraintByIndex(arg as any, i);
                        checkArgumentConstraint(constraint);
                    }
                    checkArgumentConstraint(arg.constraint.default!);
                }
                break;
            case 'opt':
                if (arg.constraint.constant === 0) break;
                if (arg.constraint.constant !== 1) {
                    checkDataSource(arg.constraint.has!);
                }
                checkArgumentConstraint(arg.constraint.value);
                break;
            case 'record':
                for (const subitem of arg.constraint.subitems) {
                    checkArgumentConstraint(subitem);
                }
                break;
            case 'variant':
                if (arg.constraint.constant) {
                    const key = arg.constraint.constant;
                    if (arg.type.subitems!.find((subitem) => subitem.key === key)) {
                        checkArgumentConstraint(arg.constraint.value!);
                        break;
                    }
                }
                checkDataSource(arg.constraint.select!);
                for (const subitem of arg.constraint.subitems!) {
                    checkArgumentConstraint(subitem);
                }
                break;
            case 'tuple':
                for (const subitem of arg.constraint.subitems) {
                    checkArgumentConstraint(subitem);
                }
                break;
            case 'rec':
                checkArgumentConstraint(arg.constraint.value);
                break;
        }
    };
    const checkTransform = (transform: Transform | undefined) => {
        if (!transform) return;
        console.group(
            `transform: ${unwrapCandidType(
                findChildType(transform.from, transform.child ?? 0),
            )} -> ${unwrapCandidType(transform.to)}`,
        );
        console.error(
            `${transform.names ? `names${JSON.stringify(transform.names)}\n` : ''}code:\n${transform.transform.code
            }`,
        );
        checkTransform(transform.nested);
        console.groupEnd();
    };
    const checkDataTransmit = (transmit: DataTransmit) => {
        switch (transmit.transmit) {
            case 'outer':
                break;
            case 'show':
                console.group(`show ${transmit.view.constraint.name}`);
                checkTransform(transmit.transform);
                console.groupEnd();
                break;
        }
    };

    for (let i = 0; i < core.data.length; i++) checkDataSource(core.data[i]);
    checkTransform(core.transform);
    for (let i = 0; i < core.transmits.length; i++) checkDataTransmit(core.transmits[i]);
    console.error('================ Audit Info ================');
};
