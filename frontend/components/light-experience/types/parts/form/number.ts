import { Float32Decimal, Float64Decimal } from '@mora-light/core/types/candid';

export type NumberInputComponentUI = {
    type: 'NumberInputComponent';
    style:
    | {
        type: 'nat' | 'int' | 'nat64' | 'int64';
        min?: string;
        max?: string;
        decimal?: undefined;
    }
    | {
        type: 'nat8' | 'nat16' | 'nat32' | 'int8' | 'int16' | 'int32';
        min?: number;
        max?: number;
        decimal?: undefined;
    }
    | {
        type: 'float32';
        min?: undefined;
        max?: undefined;
        decimal?: Float32Decimal;
    }
    | {
        type: 'float64';
        min?: undefined;
        max?: undefined;
        decimal?: Float64Decimal;
    };
    label?: string;
    placeholder?: string;
    default?: string | number;
};
