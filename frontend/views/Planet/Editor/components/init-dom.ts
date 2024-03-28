/**
 * @description init mention modal DOM elem
 * @author wangfupeng
 */

import { IDomEditor } from '@wangeditor/editor';
import bus from 'vue3-eventbus';

/**
 * show modal elem
 */
export function showModalElem(editor: IDomEditor) {
    const domSelection = document.getSelection();
    const domRange = domSelection?.getRangeAt(0);
    if (domRange == null) return;
    const rect = domRange.getBoundingClientRect();

    const modalElem = document.getElementById('mention-modal');
    if (modalElem == null) return;
    bus.emit('mentionOpen');
    modalElem.style.top = `${window.scrollY + rect.top + 20}px`;
    modalElem.style.left = `${rect.left + 5}px`;
    modalElem.style.display = 'block';
}

/**
 * hide modal elem
 */
export function hideModalElem(editor: IDomEditor) {
    const modalElem = document.getElementById('mention-modal');
    if (modalElem == null) return;
    modalElem.style.display = 'none';
}
