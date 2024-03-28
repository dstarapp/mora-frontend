import { Actor, Agent, HttpAgent, HttpAgentOptions } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { IDL } from '@dfinity/candid';
import { Type } from '@dfinity/candid/lib/cjs/idl';
import { CandidType, FuncCandidType, parseTuple } from '@mora-light/core/types/candid';

export const createActor = <T>(
    idlFactory: IDL.InterfaceFactory,
    canisterId: string | Principal,
    options?: { agentOptions?: HttpAgentOptions; actorOptions?: { agent: Agent } },
): T => {
    const agent = new HttpAgent({
        host: 'https://icp0.io/',
        ...options?.agentOptions,
    });
    return Actor.createActor(idlFactory, {
        agent,
        canisterId,
        ...options?.actorOptions,
    });
};

export const parseTypes = (types: Type[]): CandidType[] => {
    // console.error("parseCandidTypes", types);

    const parseType = (type: Type, ids: number[]): CandidType => {
        // console.error("parseCandidType", type);

        if (type instanceof IDL.BoolClass) return { type: 'bool' };
        if (type instanceof IDL.NatClass) return { type: 'nat' };
        if (type instanceof IDL.IntClass) return { type: 'int' };
        if (type instanceof IDL.FixedNatClass) {
            switch (type._bits) {
                case 8:
                    return { type: 'nat8' };
                case 16:
                    return { type: 'nat16' };
                case 32:
                    return { type: 'nat32' };
                case 64:
                    return { type: 'nat64' };
            }
        }
        if (type instanceof IDL.FixedIntClass) {
            switch (type._bits) {
                case 8:
                    return { type: 'int8' };
                case 16:
                    return { type: 'int16' };
                case 32:
                    return { type: 'int32' };
                case 64:
                    return { type: 'int64' };
            }
        }
        if (type instanceof IDL.FloatClass && type['_bits'] === 32) return { type: 'float32' };
        if (type instanceof IDL.FloatClass && type['_bits'] === 64) return { type: 'float64' };
        if (type instanceof IDL.NullClass) return { type: 'null' };
        if (type instanceof IDL.TextClass) return { type: 'text' };
        if (type instanceof IDL.PrincipalClass) return { type: 'principal' };

        //  blob vec nat8

        if (type instanceof IDL.VecClass)
            return { type: 'vec', subtype: parseType(type['_type'], ids) };
        if (type instanceof IDL.OptClass)
            return { type: 'opt', subtype: parseType(type['_type'], ids) };

        if (type instanceof IDL.TupleClass)
            return {
                type: 'tuple',
                subitems: type['_fields'].map((field: [string, Type]) => {
                    return {
                        key: field[0],
                        type: parseType(field[1], ids),
                    };
                }),
            };
        if (type instanceof IDL.RecordClass)
            return {
                type: 'record',
                subitems: type['_fields'].map((field: [string, Type]) => {
                    return {
                        key: field[0],
                        type: parseType(field[1], ids),
                    };
                }),
            };
        if (type instanceof IDL.VariantClass)
            return {
                type: 'variant',
                subitems: type['_fields'].map((field: [string, Type]) => {
                    return {
                        key: field[0],
                        type: parseType(field[1], ids),
                    };
                }),
            };

        if (type instanceof IDL.RecClass) {
            const id = type['_id'];
            if (ids.includes(id)) {
                return {
                    type: 'rec',
                    subtype: undefined,
                    id,
                };
            }
            return {
                type: 'rec',
                subtype: parseType(type['_type'], [...ids, id]),
                id,
            };
        }

        if (type instanceof IDL.UnknownClass) return { type: 'unknown' };
        if (type instanceof IDL.EmptyClass) return { type: 'empty' };
        if (type instanceof IDL.ReservedClass) return { type: 'reserved' };

        if (type instanceof IDL.FuncClass) {
            return {
                type: 'func',
                annotations: [...type.annotations] as ['query'],
                argTypes: parseTuple(parseTypes(type.argTypes)),
                retTypes: parseTuple(parseTypes(type.retTypes)),
            };
        }

        if (type instanceof IDL.ServiceClass) {
            return {
                type: 'service',
                apis: type._fields.map((item) => {
                    return {
                        method: item[0],
                        func: parseType(item[1], []) as FuncCandidType,
                    };
                }),
            };
        }

        console.error('what a type?', type);
        debugger;
        throw new Error('what a type? ' + type);
    };

    return types.map((type) => parseType(type, []));
};

export const isPrincipal = (text: string): boolean => {
    try {
        Principal.fromText(text);
    } catch (e) {
        return false;
    }
    return true;
};

export const isCanisterId = (text: string): boolean => {
    if (!isPrincipal(text)) return false;
    return text.length === 27;
};
