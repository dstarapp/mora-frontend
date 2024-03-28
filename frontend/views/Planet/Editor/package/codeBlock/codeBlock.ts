import { SlateTransforms, SlateEditor, SlateElement, SlateNode } from '@wangeditor/editor';
import { Editor, Element, Transforms, Node, Range } from 'slate';
import { IButtonMenu, IDomEditor, DomEditor } from '@wangeditor/core';
import { CodeElement } from './custom-types';
import { t } from '@/i18n';
import bus from 'vue3-eventbus';

export default class CodeBlockButtonMenu implements IButtonMenu {
    title: string;
    tag: string;
    iconSvg: string;
    currentEditor: any;

    constructor() {
        this.title = t('editor.codeBlock.title');
        this.tag = 'button';
        this.iconSvg = '<svg></svg>';
        this.currentEditor = '';
    }

    private getSelectCodeElem(editor: IDomEditor): CodeElement | null {
        const codeNode = DomEditor.getSelectedNodeByType(editor, 'code');
        if (codeNode) {
            return codeNode as CodeElement;
        } else {
            return null;
        }
    }

    private changeToCodeBlock(editor: IDomEditor, language: string, content: string) {
        editor.focus();
        const newPreNode = {
            type: 'pre',
            children: [
                {
                    type: 'code',
                    language,
                    children: [
                        {
                            text: content,
                        },
                    ],
                },
            ],
        };

        let currentPath;
        const nodeEntries = SlateEditor.nodes(this.currentEditor, {
            match: (node: SlateNode) => {
                if (SlateElement.isElement(node)) {
                    if (node.type === 'paragraph') {
                        return true;
                    }
                }
                return false;
            },
            universal: true,
        });
        for (let nodeEntry of nodeEntries) {
            const [node, path] = nodeEntry;
            currentPath = path;
            break;
        }

        const p2 = {
            type: 'paragraph',
            children: [{ text: '' }],
        };
        SlateTransforms.insertNodes(this.currentEditor, [newPreNode, p2], {
            at: currentPath,
        });

        if (content) {
            SlateTransforms.removeNodes(editor);
        }
    }

    private changeToPlainText(editor: IDomEditor) {
        const elem = this.getSelectCodeElem(editor);
        if (elem == null) return;

        const str = Node.string(elem);

        Transforms.removeNodes(editor, { mode: 'highest' });

        const pList = str.split('\n').map((s) => {
            return { type: 'paragraph', children: [{ text: s }] };
        });
        Transforms.insertNodes(editor, pList, { mode: 'highest' });
    }

    getValue(editor: IDomEditor): string | boolean {
        const elem = this.getSelectCodeElem(editor);
        if (elem == null) return '';
        return elem.language || '';
    }

    isActive(editor: IDomEditor): boolean {
        const elem = this.getSelectCodeElem(editor);
        return !!elem;
    }

    isDisabled(editor: IDomEditor): boolean {
        return false;
    }

    emitCallback = async (info: { language: string; code: string }) => {
        this.currentEditor.focus();
        await this.currentEditor.restoreSelection();
        await this.changeToCodeBlock(this.currentEditor, info.language.toString(), info.code);
    };

    /**
     * @param editor editor
     * @param value node.type
     */
    exec(editor: IDomEditor, value: string | boolean) {
        editor.focus();
        const active = this.isActive(editor);
        this.currentEditor = editor;
        if (active) {
            this.changeToPlainText(editor);
        } else {
            const nodeEntries = Editor.nodes(editor, {
                match: (n) => editor.children.includes(n as Element),
                universal: true,
            });
            let text = '';
            for (let nodeEntry of nodeEntries) {
                const [n] = nodeEntry;
                if (n.type === 'paragraph') {
                    text += Node.string(n);
                    text += '\n';
                }
            }

            bus.emit('codeBlockEmit', {
                callback: this.emitCallback,
                text: text,
            });
        }
    }
}
