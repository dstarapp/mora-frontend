import { SlateElement } from '@wangeditor/editor';
import { LinkCardElement } from './custom-types';

function linkCardToHtml(elem: SlateElement, childrenHtml: string): string {
    const { linkText = '', url = '', cardData = '' } = elem as LinkCardElement;
    const html = `<div data-w-e-type="link-card" data-linkText="${linkText}" data-url="${url}"><a href="${url}" target="_blank">${linkText}</a></div>`;
    return html;
}

const conf = {
    type: 'link-card',
    elemToHtml: linkCardToHtml,
};

export default conf;
