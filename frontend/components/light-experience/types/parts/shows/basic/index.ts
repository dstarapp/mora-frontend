import { TrimmedBoolViewConstraint } from './bool';
import { TrimmedImageViewConstraint } from './image';
import { TrimmedTableViewConstraint } from './table';
import { TrimmedTextViewConstraint } from './text';

export type TrimmedBasicShowViewConstraint =
    | TrimmedBoolViewConstraint
    | TrimmedTextViewConstraint
    | TrimmedImageViewConstraint
    | TrimmedTableViewConstraint;

// single box
export type TrimmedSingleTransmitShowView = {
    subtype?: undefined;
    subitems?: undefined;
    constraint: TrimmedBasicShowViewConstraint; // show constraint
};
