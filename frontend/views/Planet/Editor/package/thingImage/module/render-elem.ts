import { h, VNode } from 'snabbdom';
import { DomEditor, IDomEditor, SlateElement, SlateTransforms } from '@wangeditor/editor';

const placeholderText = 'Write a caption';
const emptyText = '';
const remark_limit = 140;

function clearStyle(children) {
    return children.map((t) => {
        if (t.data && t.data.style) {
            t.data.style = {};
        }
        if (t.children) {
            t.children = clearStyle(t.children);
        }
        return t;
    });
}

function renderMention(elem: SlateElement, children: VNode[] | null, editor: IDomEditor): VNode {
    const { src = '', mode = 'middle', file, uploadFail } = elem;

    const selected = DomEditor.isNodeSelected(editor, elem);
    const isDisabled = editor.isDisabled();
    const waitUploadFile = !!file;
    const textPath = isDisabled ? [] : DomEditor.findPath(editor, elem.children[0]);
    let remark = '';
    elem.children.map((item) => {
        remark += item.text;
    });
    // let remark = elem.children[0].text;
    let isFullWidth = mode === 'full';

    const imageElVnode = h('img', {
        props: { src: src },
        style: { width: '100%' },
        on: {
            mousedown: (e) => {
                e.preventDefault();
            },
        },
    });

    const closeIconVnode = h(
        'div',
        {
            props: { className: 'ImageDelete-Wrapper-icon' },
            on: {
                click() {
                    const path = DomEditor.findPath(editor, elem);
                    SlateTransforms.removeNodes(editor, { at: path });
                },
            },
        },
        [],
    );

    const imageBodyVnode = h(
        'div',
        {
            props: { className: 'ImageDelete-Wrapper', contentEditable: false },
            style: {
                width: isFullWidth ? '100%' : 'auto',
                maxWidth: isFullWidth ? '100%' : '40%',
            },
        },
        isDisabled ? [imageElVnode] : [imageElVnode, closeIconVnode],
    );

    const imageVnode = h(
        'div',
        {
            props: {},
            style: {},
        },
        [imageBodyVnode],
    );

    const buttonVnode = h('div', {
        props: { className: `Image-buttonWrap ${isFullWidth ? 'status-full' : 'status-middle'}` },
        style: {},
        on: {
            click() {
                const path = DomEditor.findPath(editor, elem);
                SlateTransforms.setNodes(
                    editor,
                    {
                        mode: isFullWidth ? 'middle' : 'full',
                    },
                    {
                        at: path,
                        mode: 'highest',
                    },
                );
            },
        },
    });

    const buttonWrapVnode = h(
        'div',
        {
            props: { className: 'Image-resizerWrap' },
            style: {},
        },
        [buttonVnode],
    );

    const imageWrapVnode = h(
        'div',
        {
            props: { className: 'Image-resizerContainer', contentEditable: false },
            style: {
                position: 'relative',
                lineHeight: '0',
            },
        },
        isDisabled ? [imageVnode] : [imageVnode, buttonWrapVnode],
    );

    const remarkVnode = h(
        'div',
        {
            props: { className: 'Image-caption' },
            style: {},
            on: {
                click() {
                },
            },
        },
        clearStyle(children),
    );

    const thingCardVnode = h(
        'div',
        {
            props: {
                className: `thing-page-image Image-captionContainer ${selected && !isDisabled ? 'thing-image-container' : ''
                    } ${waitUploadFile ? 'Image-loading' : ''} ${uploadFail ? 'Image-loading-fail' : ''
                    }`,
            },
            style: {},
            on: {
                click() { },
            },
        },

        isDisabled ? [imageWrapVnode] : [imageWrapVnode, remarkVnode],
    );

    if (!isDisabled) {
        if (!selected && !remark.trim()) {
            SlateTransforms.insertText(editor, placeholderText, { at: textPath });
        } else if (selected && remark === placeholderText) {
            SlateTransforms.insertText(editor, emptyText, { at: textPath });
        } else if (remark && remark.trim().length > remark_limit) {
            SlateTransforms.insertText(editor, remark.trim().substring(0, remark_limit), {
                at: textPath,
            });
        }
    }

    return thingCardVnode;
}

const conf = {
    type: 'thingImage',
    renderElem: renderMention,
};

export default conf;
