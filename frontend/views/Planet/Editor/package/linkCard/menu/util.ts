export function replaceSymbols(str: string) {
    return str.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
