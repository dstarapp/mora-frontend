import { Editor, Transforms, Range } from 'slate';
import { IButtonMenu, IDomEditor, DomEditor } from '@wangeditor/core';
import { LinkElement } from './custom-types';
import { t } from '@/i18n';
import bus from 'vue3-eventbus';

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

async function parse(menuKey: string, editor: IDomEditor, url: string): Promise<string> {
    const { parseLinkUrl } = editor.getMenuConfig(menuKey);
    if (parseLinkUrl) {
        const newUrl = await parseLinkUrl(url);
        return newUrl;
    }
    return url;
}

export function replaceSymbols(str: string) {
    return str.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function genLinkNode(url: string, text?: string): LinkElement {
    const linkNode: LinkElement = {
        type: 'link',
        url: replaceSymbols(url),
        children: text ? [{ text }] : [],
    };
    return linkNode;
}

export default class InsertLinkButtonMenu implements IButtonMenu {
    title: string;
    tag: string;
    iconSvg: string;
    currentEditor: IDomEditor | null;

    constructor() {
        this.title = t('editor.insertLink.title');
        this.tag = 'button';
        this.iconSvg = '<svg></svg>';
        this.currentEditor = null;
    }

    private getSelectedLinkElem(editor: IDomEditor): LinkElement | null {
        const node = DomEditor.getSelectedNodeByType(editor, 'link');
        if (node == null) return null;
        return node as LinkElement;
    }

    private isMenuDisabled(editor: IDomEditor): boolean {
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
     * node.url
     * @param editor editor
     */
    getValue(editor: IDomEditor): string | boolean {
        const linkElem = this.getSelectedLinkElem(editor);
        if (linkElem) {
            return linkElem.url || '';
        }
        return '';
    }

    isActive(editor: IDomEditor): boolean {
        return false;
    }

    isDisabled(editor: IDomEditor): boolean {
        return this.isMenuDisabled(editor);
    }

    emitCallback = async (info: { text: string; link: string }) => {
        if (!this.currentEditor) {
            return;
        }
        await this.currentEditor.restoreSelection();

        const checkRes = await check('insertLink', this.currentEditor, info.text, info.link);
        if (!checkRes) {
            return;
        }

        const parsedUrl = await parse('insertLink', this.currentEditor, info.link);

        const { selection } = this.currentEditor;
        if (selection == null) return;
        Range.isCollapsed(selection);

        const anchorOffset = selection.anchor.offset;
        const focusOffset = selection.focus.offset;
        const linkNode = genLinkNode(parsedUrl, info.text);

        if (anchorOffset === 0 && focusOffset === 0) {
            this.currentEditor.insertText(' ');
            Transforms.insertNodes(this.currentEditor, linkNode);
            this.currentEditor.insertFragment([{ text: ' ' }]);
        } else {
            this.currentEditor.deleteFragment();
            this.currentEditor.insertText(' ');
            // Transforms.insertNodes(this.currentEditor, linkNode)
            this.currentEditor.insertNode(linkNode);
            this.currentEditor.insertFragment([{ text: ' ' }]);
        }
    };

    /**
     * @param editor editor
     * @param value node.type
     */
    exec(editor: IDomEditor, value: string | boolean) {
        this.currentEditor = editor;
        const { selection } = this.currentEditor;
        const selectedText = Editor.string(editor, selection);

        bus.emit('insertLinkEmit', {
            insertFn: this.emitCallback,
            text: selectedText,
        });
    }
}
