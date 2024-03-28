import { DOMElement } from './dom';
import { SlateElement } from '@wangeditor/editor';
import { LinkCardElement } from './custom-types';

const parseHtml = (elem: DOMElement): SlateElement => {
    const linkText = elem.getAttribute('data-linkText') || '';
    const url = elem.getAttribute('data-url') || '';

    return {
        type: 'link-card',
        linkText,
        url,
        cardData: undefined,
        children: [{ text: '' }],
    } as LinkCardElement;
};

const parseHtmlConf = {
    selector: 'div[data-w-e-type="link-card"]',
    parseElemHtml: parseHtml,
};

export default parseHtmlConf;
