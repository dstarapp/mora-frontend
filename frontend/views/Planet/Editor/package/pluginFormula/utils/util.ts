import { nanoid } from 'nanoid';

export function genRandomStr(prefix = 'r'): string {
    return `${prefix}-${nanoid()}`;
}
