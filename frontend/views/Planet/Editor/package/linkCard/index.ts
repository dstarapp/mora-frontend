import { IModuleConf } from '@wangeditor/editor';
import withLinkCard from './plugin';
import renderElemConf from './render-elem';
import elemToHtmlConf from './elem-to-html';
import parseHtmlConf from './parse-elem-html';
import { convertToLinkCardMenuConf, editLink2 } from './menu/index';

const module: Partial<IModuleConf> = {
    editorPlugin: withLinkCard,
    renderElems: [renderElemConf],
    elemsToHtml: [elemToHtmlConf],
    parseElemsHtml: [parseHtmlConf],
    menus: [convertToLinkCardMenuConf, editLink2],
};

export default module;
