import { TrimmedUnionTransmitShowView } from '../index';
import { TrimmedOptViewConstraint } from './opt';
import { TrimmedRecordViewConstraint } from './record';
import { TrimmedTupleViewConstraint } from './tuple';
import { TrimmedVariantViewConstraint } from './variant';
import { TrimmedVecViewConstraint } from './vec';

export type TrimmedSubtypeShowViewConstraint = TrimmedVecViewConstraint | TrimmedOptViewConstraint;

export type TrimmedSubitemsShowViewConstraint =
    | TrimmedRecordViewConstraint
    | TrimmedVariantViewConstraint
    | TrimmedTupleViewConstraint;

export type TrimmedCombinedShowViewSubitem = { key: string; view: TrimmedUnionTransmitShowView };

export type TrimmedCombinedTransmitShowView =
    | {
          subtype: TrimmedUnionTransmitShowView;
          subitems?: undefined;
          constraint: TrimmedSubtypeShowViewConstraint; // show constraint
      }
    | {
          subtype?: undefined;
          subitems: TrimmedCombinedShowViewSubitem[];
          constraint: TrimmedSubitemsShowViewConstraint; // show constraint
      };
