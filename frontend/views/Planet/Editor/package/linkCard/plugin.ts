import { DomEditor, IDomEditor, SlateTransforms } from '@wangeditor/editor';

function withLinkCard<T extends IDomEditor>(editor: T) {
    const { isVoid, isInline, normalizeNode } = editor;
    const newEditor = editor;

    newEditor.isVoid = (elem) => {
        const type = DomEditor.getNodeType(elem);

        if (type === 'link-card') {
            return true;
        }

        if (type === 'image') {
            return true;
        }

        if (type === 'formula') {
            return true;
        }

        return isVoid(elem);
    };

    newEditor.isInline = (elem) => {
        const type = DomEditor.getNodeType(elem);

        if (type === 'image') {
            return false;
        }

        if (type === 'formula') {
            return false;
        }

        return isInline(elem);
    };

    newEditor.normalizeNode = ([node, path]) => {
        const type = DomEditor.getNodeType(node);

        if (type !== 'link-card' && type !== 'table') {
            return normalizeNode([node, path]);
        }

        if (type === 'link-card' || type === 'table') {
            const topLevelNodes = newEditor.children || [];
            const nextNode = topLevelNodes[path[0] + 1] || {};
            const nextNodeType = DomEditor.getNodeType(nextNode);
            if (
                nextNodeType !== 'paragraph' &&
                nextNodeType !== 'blockquote' &&
                !nextNodeType.startsWith('header')
            ) {
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

        if (type === 'table') {
            if (newEditor.children[0]?.type === 'table') {
                const p = {
                    type: 'paragraph',
                    children: [{ text: '' }],
                };
                SlateTransforms.insertNodes(newEditor, p, {
                    at: [0],
                });
            }
        }
    };

    return newEditor;
}

export default withLinkCard;
