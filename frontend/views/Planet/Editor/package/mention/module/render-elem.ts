/**
 * @description render elem
 * @author wangfupeng
 */

import { h, VNode } from 'snabbdom';
import { DomEditor, IDomEditor, SlateElement } from '@wangeditor/editor';
import { MentionElement } from './custom-types';

function renderMention(elem: SlateElement, children: VNode[] | null, editor: IDomEditor): VNode {
    const selected = DomEditor.isNodeSelected(editor, elem);
    const { value = '' } = elem as MentionElement;

    const vnode = h(
        'span',
        {
            props: {
                contentEditable: false,
            },
            className: 'w-e-textarea-mention-container',
            style: {},
        },
        `@${value}`,
    );

    return vnode;
}

const conf = {
    type: 'mention',
    renderElem: renderMention,
};

export default conf;
