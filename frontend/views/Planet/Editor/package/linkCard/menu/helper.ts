import { Editor, Range, Transforms } from 'slate';
import { IDomEditor, DomEditor } from '@wangeditor/core';
import { LinkElement } from '../custom-types';
import { replaceSymbols } from './util';

/**
 * link
 * @param menuKey menu key
 * @param editor editor
 * @param text menu text
 * @param url menu url
 */
async function check(
    menuKey: string,
    editor: IDomEditor,
    text: string,
    url: string,
): Promise<boolean> {
    const { checkLink } = editor.getMenuConfig(menuKey);
    if (checkLink) {
        const res = await checkLink(text, url);
        if (typeof res === 'string') {
            editor.alert(res, 'error');
            return false;
        }
        if (res == null) {
            return false;
        }
    }

    return true;
}

/**
 * url
 * @param menuKey menu key
 * @param editor editor
 * @param url url
 * @returns parsedUrl
 */
async function parse(menuKey: string, editor: IDomEditor, url: string): Promise<string> {
    const { parseLinkUrl } = editor.getMenuConfig(menuKey);
    if (parseLinkUrl) {
        const newUrl = await parseLinkUrl(url);
        return newUrl;
    }
    return url;
}

export function isMenuDisabled(editor: IDomEditor): boolean {
    if (editor.selection == null) return true;

    const selectedElems = DomEditor.getSelectedElems(editor);
    const notMatch = selectedElems.some((elem) => {
        const { type } = elem;
        if (editor.isVoid(elem)) return true;
        if (['pre', 'code', 'link'].includes(type)) return true;
    });
    if (notMatch) return true; // disabled
    return false; // enable
}

/**
 * link node
 * @param url url
 * @param text text
 */
export function genLinkNode(url: string, text?: string): LinkElement {
    const linkNode: LinkElement = {
        type: 'link',
        url: replaceSymbols(url),
        children: text ? [{ text }] : [],
    };
    return linkNode;
}

/**
 * link
 * @param editor editor
 * @param text text
 * @param url url
 */
export async function insertLink(editor: IDomEditor, text: string, url: string) {
    if (!url) return;
    if (!text) text = url;

    editor.restoreSelection();

    if (isMenuDisabled(editor)) return;

    const checkRes = await check('insertLink', editor, text, url);
    if (!checkRes) return;

    const parsedUrl = await parse('insertLink', editor, url);

    const { selection } = editor;
    if (selection == null) return;
    const isCollapsed = Range.isCollapsed(selection);

    if (isCollapsed) {
        editor.insertText(' ');

        const linkNode = genLinkNode(parsedUrl, text);
        Transforms.insertNodes(editor, linkNode);

        editor.insertFragment([{ text: ' ' }]);
    } else {
        const selectedText = Editor.string(editor, selection);
        if (selectedText !== text) {

            editor.deleteFragment();
            const linkNode = genLinkNode(parsedUrl, text);
            Transforms.insertNodes(editor, linkNode);
        } else {

            const linkNode = genLinkNode(parsedUrl);
            Transforms.wrapNodes(editor, linkNode, { split: true });
            Transforms.collapse(editor, { edge: 'end' });
        }
    }
}

/**
 * link url
 * @param editor editor
 * @param text text
 * @param url link url
 */
export async function updateLink(editor: IDomEditor, text: string, url: string) {
    if (!url) return;

    const checkRes = await check('editLink', editor, text, url);
    if (!checkRes) return;

    const parsedUrl = await parse('editLink', editor, url);

    const props: Partial<LinkElement> = { url: replaceSymbols(parsedUrl) };
    Transforms.setNodes(editor, props, {
        match: (n) => DomEditor.checkNodeType(n, 'link'),
    });
}
