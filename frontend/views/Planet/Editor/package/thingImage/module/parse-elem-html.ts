import { IDomEditor, SlateDescendant, SlateElement } from '@wangeditor/editor';

function parseHtml(domElem, children: SlateDescendant[], editor: IDomEditor): SlateElement {
    const mode = domElem.getAttribute('data-mode') || '';
    const src = domElem.querySelector('img').getAttribute('src');
    const remark = domElem.querySelector('.Image-caption')?.innerText || '';

    const thingImage = {
        type: 'thingImage',
        src,
        mode,
        children: [{ text: remark }],
    };

    return thingImage;
}

const parseHtmlConf = {
    selector: 'div[class="thing-page-image"]',
    parseElemHtml: parseHtml,
};

export default parseHtmlConf;
