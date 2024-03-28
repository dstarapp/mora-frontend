import { DomEditor, IDomEditor, SlateTransforms } from '@wangeditor/editor';

function withFormula<T extends IDomEditor>(editor: T) {
    const { isInline, isVoid, normalizeNode } = editor;
    const newEditor = editor;

    newEditor.isVoid = (elem) => {
        const type = DomEditor.getNodeType(elem);

        if (type === 'uploadFile') {
            return true;
        }

        return isVoid(elem);
    };

    newEditor.isInline = (elem) => {
        const type = DomEditor.getNodeType(elem);
        if (type === 'uploadFile') {
            return false;
        }

        return isInline(elem);
    };

    newEditor.normalizeNode = ([node, path]) => {
        const type = DomEditor.getNodeType(node);

        if (type !== 'uploadFile') {
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

        const nextNode2 = topLevelNodes[path[0] - 1] || undefined;
        const nextNodeType2 = DomEditor.getNodeType(nextNode2);

        if (
            nextNodeType2 !== 'paragraph' &&
            nextNodeType2 !== 'blockquote' &&
            nextNodeType !== 'uploadFile' &&
            !nextNodeType2.startsWith('header')
        ) {
            const p = {
                type: 'paragraph',
                children: [{ text: '' }],
            };
            const insertPath2 = [path[0]];
            SlateTransforms.insertNodes(newEditor, p, {
                at: insertPath2[0] >= 0 ? insertPath2 : [0],
            });
        }
    };

    return newEditor;
}

export default withFormula;
