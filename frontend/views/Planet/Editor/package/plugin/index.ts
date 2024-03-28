import { IModuleConf } from '@wangeditor/editor';
import withPlugin from './plugin';
import renderElemConf from './render-elem';
import elemToHtmlConf from './elem-to-html';
import parseHtmlConf from './parse-elem-html';
import { insertPluginMenuConf } from './menu/index';

const module: Partial<IModuleConf> = {
    editorPlugin: withPlugin,
    renderElems: [renderElemConf],
    elemsToHtml: [elemToHtmlConf],
    parseElemsHtml: [parseHtmlConf],
    menus: [insertPluginMenuConf],
};

export default module;
