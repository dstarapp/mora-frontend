/**
 * @description elem to html
 * @author wangfupeng
 */

import { SlateElement } from '@wangeditor/editor';
import { MentionElement } from './custom-types';

function mentionToHtml(elem: SlateElement, childrenHtml: string): string {
    const { value = '', info = {} } = elem as MentionElement;
    const infoStr = info;
    return `<span data-w-e-type="mention" data-w-e-is-void data-w-e-is-inline data-value="${value}" data-info="${infoStr}">@${value}</span>`;
}

const conf = {
    type: 'mention',
    elemToHtml: mentionToHtml,
};

export default conf;
