import { TextInputComponentUI } from './form/text';
import { NumberInputComponentUI } from './form/number';
import { SwitchInputComponentUI } from './form/switch';
import { DropdownInputComponentUI } from './form/dropdown';
import { TimeInputComponentUI } from './form/time';
import { v4 as uuid } from 'uuid';
import { CandidType } from '@mora-light/core/types/candid';

export type InputValueInput = { result: CandidType };

export type InputValue = {
    id: string;
    name: string;

    type: 'input';

    input: InputValueInput;
    ui: InputValueComponentUI;
};

export type InputValueComponentUI =
    | TextInputComponentUI
    | NumberInputComponentUI
    | SwitchInputComponentUI
    | DropdownInputComponentUI
    | TimeInputComponentUI;

export type InputValueComponentType =
    | 'TextInputComponent'
    | 'NumberInputComponent'
    | 'SwitchInputComponent'
    | 'DropdownInputComponent'
    | 'TimeInputComponent';


export const getInitialInputValueComponent = (type: InputValueComponentType): InputValue => {
    switch (type) {
        case 'TextInputComponent':
            return {
                id: uuid(),
                name: '',
                type: 'input',
                input: { result: { type: 'text' } },
                ui: {
                    type: 'TextInputComponent',
                    style: { type: 'text' },
                },
            };
        case 'NumberInputComponent':
            return {
                id: uuid(),
                name: '',
                type: 'input',
                input: { result: { type: 'nat' } },
                ui: {
                    type: 'NumberInputComponent',
                    style: { type: 'nat' },
                },
            };
        case 'SwitchInputComponent':
            return {
                id: uuid(),
                name: '',
                type: 'input',
                input: { result: { type: 'bool' } },
                ui: {
                    type: 'SwitchInputComponent',
                    style: {},
                },
            };
        case 'DropdownInputComponent':
            return {
                id: uuid(),
                name: '',
                type: 'input',
                input: {
                    result: {
                        type: 'variant',
                        subitems: [],
                    },
                },
                ui: {
                    type: 'DropdownInputComponent',
                    style: {},
                },
            };
        case 'TimeInputComponent':
            return {
                id: uuid(),
                name: '',
                type: 'input',
                input: { result: { type: 'int64' } },
                ui: {
                    type: 'TimeInputComponent',
                    style: {
                        type: 'day',
                        unit: 's',
                    },
                },
            };
    }
};
