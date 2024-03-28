import type { Principal } from '@dfinity/principal';

export type Subaccount = Uint8Array;
export type Map = Array<[string, Value]>;
export type Value =
    | { Int: bigint }
    | { Map: Map }
    | { Nat: bigint }
    | { Nat64: bigint }
    | { Blob: Uint8Array }
    | { Text: string }
    | { Array: Array<Value> };

// Source: https://github.com/dfinity/icrc-1#standard-metadata-entries
export enum IcrcMetadataResponseEntries {
    SYMBOL = 'icrc1:symbol',
    NAME = 'icrc1:name',
    DECIMALS = 'icrc1:decimals',
    FEE = 'icrc1:fee',
    LOGO = 'icrc1:logo',
}

export type IcrcTokenMetadataResponse = [string | IcrcMetadataResponseEntries, Value][];

export interface IcrcAccount {
    owner: Principal;
    subaccount?: Subaccount;
}
