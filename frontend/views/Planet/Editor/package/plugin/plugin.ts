import { DomEditor, IDomEditor, SlateTransforms } from '@wangeditor/editor';

function withPlugin<T extends IDomEditor>(editor: T) {
    const { isInline, isVoid, normalizeNode } = editor;
    const newEditor = editor;

    newEditor.isVoid = (elem) => {
        const type = DomEditor.getNodeType(elem);

        if (type === 'plugin') {
            return true;
        }

        return isVoid(elem);
    };

    newEditor.isInline = (elem) => {
        const type = DomEditor.getNodeType(elem);
        if (type === 'plugin') {
            return false;
        }

        return isInline(elem);
    };

    newEditor.normalizeNode = ([node, path]) => {
        const type = DomEditor.getNodeType(node);

        if (type !== 'plugin') {
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
            const p = {
                type: 'paragraph',
                children: [{ text: '' }],
            };
            const insertPath = [path[0] + 1];
            SlateTransforms.insertNodes(newEditor, p, {
                at: insertPath,
            });
        }
    };

    return newEditor;
}

export default withPlugin;
