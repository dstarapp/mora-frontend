import { DomEditor, IDomEditor, SlateTransforms } from '@wangeditor/editor';
import { Editor } from 'slate';

const placeholderText = 'Write a caption';

function withMention<T extends IDomEditor>(editor: T) {
    const { normalizeNode, insertNode, insertData, insertBreak } = editor;
    const newEditor = editor;

    newEditor.insertNode = (node) => {
        if (node.type === 'thingImage') {
            if (!node.children) {
                node.children = [{ text: placeholderText }];
            }
            let res = insertNode(node);
            return res;
        }
        return insertNode(node);
    };

    newEditor.insertData = (data) => {
        const selectedNode = DomEditor.getSelectedNodeByType(newEditor, 'thingImage');
        if (selectedNode == null) {
            insertData(data);
            return;
        }

        const text = data.getData('text/plain');
        Editor.insertText(newEditor, text);
    };

    newEditor.insertBreak = () => {
        const selectedNode = DomEditor.getSelectedNodeByType(newEditor, 'thingImage');
        if (selectedNode != null) {
            const path = DomEditor.findPath(editor, selectedNode);
            const topLevelNodes = newEditor.children || [];
            const nextNode = topLevelNodes[path[0] + 1] || {};
            const nextNodeType = DomEditor.getNodeType(nextNode);
            if (
                nextNodeType !== 'paragraph' &&
                nextNodeType !== 'blockquote' &&
                !nextNodeType.startsWith('header')
            ) {
                const p = { type: 'paragraph', children: [{ text: '' }] };
                const insertPath = [path[0] + 1];
                SlateTransforms.insertNodes(newEditor, p, {
                    at: insertPath,
                });
            }
            newEditor.select({
                anchor: { path: [path[0] + 1, 0], offset: 0 },
                focus: { path: [path[0] + 1, 0], offset: 0 },
            });
            return;
        }

        insertBreak();
    };

    newEditor.normalizeNode = ([node, path]) => {
        const type = DomEditor.getNodeType(node);
        if (type !== 'thingImage') {
            return normalizeNode([node, path]);
        }
        const topLevelNodes = newEditor.children || [];
        const nextNode = topLevelNodes[path[0] + 1] || {};
        const nextNodeType = DomEditor.getNodeType(nextNode);
        if (
            nextNodeType !== 'paragraph' &&
            nextNodeType !== 'blockquote' &&
            !nextNodeType.startsWith('header')
        ) {
            const topLevelNodes = newEditor.children || [];
            const nextNode = topLevelNodes[path[0] + 1] || {};
            const nextNodeType = DomEditor.getNodeType(nextNode);
            if (!nextNodeType && JSON.stringify(nextNode) === '{}') {
                const p = {
                    type: 'paragraph',
                    children: [{ text: '' }],
                };
                const insertPath = [path[0] + 1];
                SlateTransforms.insertNodes(newEditor, p, {
                    at: insertPath,
                });
            }
        }
    };

    return newEditor;
}

export default withMention;
