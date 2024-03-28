import { ActionValues } from './value';

export type CanisterActionCurrentEditingState = {
    id: string;
    type: 'arg' | 'result';
    index: number;
    values: ActionValues;
};
