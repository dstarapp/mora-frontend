import { DOMElement } from './utils/dom';

const parseHtml = (elem: DOMElement) => {
    let prop = elem.querySelector('[data-plugin-prop]')?.getAttribute('data-plugin-prop');
    return {
        type: 'plugin',
        value: {
            id: elem.querySelector('[data-plugin-id]')?.getAttribute('data-plugin-id'),
            hash: elem.querySelector('[data-plugin-hash]')?.getAttribute('data-plugin-hash'),
            canister: elem
                .querySelector('[data-plugin-canister]')
                ?.getAttribute('data-plugin-canister'),
            propValue: prop ? decodeURIComponent(prop) : '',
            loading: true,
        },
        children: [{ text: '' }],
    };
};

const parseHtmlConf = {
    selector: 'div[data-w-e-type="plugin"]',
    parseElemHtml: parseHtml,
};

export default parseHtmlConf;
