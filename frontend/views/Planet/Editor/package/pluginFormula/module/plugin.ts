import { DomEditor, IDomEditor } from '@wangeditor/editor';

function withFormula<T extends IDomEditor>(editor: T) {
    const { isInline, isVoid } = editor;
    const newEditor = editor;

    newEditor.isInline = (elem) => {
        const type = DomEditor.getNodeType(elem);
        if (type === 'formula') {
            return false;
        }

        return isInline(elem);
    };

    newEditor.isVoid = (elem) => {
        const type = DomEditor.getNodeType(elem);
        if (type === 'formula') {
            return true;
        }

        return isVoid(elem);
    };

    return newEditor;
}

export default withFormula;
