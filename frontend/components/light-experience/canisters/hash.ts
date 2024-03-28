import { sha256 } from '@noble/hashes/sha256';

export const hashExperience = (
    id: string,
    info_json: string,
    experience_json: string,
    core_json: string,
): string => {
    const json = JSON.stringify({
        id,
        info: info_json,
        experience: experience_json,
        core: core_json,
    });
    console.log('🚀 ~ file: hash.ts:16 ~ json:', json);
    const hash = sha256.create();
    hash.update(json);
    return base_32_encode(Array.from(hash.digest())).substring(0, 15);
};

const base_32_encode = (data: number[]): string => {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let result = '';

    while (data.length % 5 !== 0) {
        data.push(0);
    }

    const d = data
        .map((n) => {
            let s = n.toString(2);
            while (s.length < 8) {
                s = 0 + s;
            }
            return s;
        })
        .join('');

    let i = 0;
    while (i < d.length) {
        result += alphabet.charAt(parseInt(d.substring(i, i + 5), 2));
        i += 5;
    }

    return result;
};
