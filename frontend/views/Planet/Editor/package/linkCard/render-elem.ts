import { h, VNode } from 'snabbdom';
import { DomEditor, IDomEditor, SlateElement } from '@wangeditor/editor';
import { LinkCardElement } from './custom-types';
import virtualize from '@rjaros/snabbdom-virtualize';
import bus from 'vue3-eventbus';

const domRules = (children) => {
    if (children.sel) {
        children.data = {
            ...children.data,
            ...children.data.attrs,
        };
        if (children.sel === 'script') {
            children.data.async = 'async';
            children.data.attrs.async = 'async';
        } else if (children.sel === 'a') {
            if (children.data.class) {
                Object.keys(children.data.class).forEach((i) => {
                    children.sel = `${children.sel}.${i}`;
                });
            }
        }
        if (children.children) {
            children.children.map((item) => {
                if (item.sel) {
                    domRules(item);
                }
            });
        }
    }
};

const generateNode = (cardData, path) => {
    let vnode;
    if (cardData.type === 'link') {
        let html = `<div data-w-e-type="link-card" data-currentpath="${path[0]
            }"><a target="_blank" href="${cardData.url}"><span><p>${cardData.title}</p><p>${cardData.description ? cardData.description : ''
            }</p><p><i></i>${cardData.url}</p></span></a></div>`;
        vnode = virtualize(html);
        vnode.data = {
            ...vnode.data,
            ...vnode.data.attrs,
        };
        vnode.children.map((item) => {
            if (item.sel) {
                domRules(item);
            }
        });
    } else {
        vnode = virtualize(cardData.html);
        if (vnode.children) {
            vnode.children.map((item) => {
                if (item.sel) {
                    domRules(item);
                }
            });
        } else {
            vnode.map((item) => {
                if (item.sel) {
                    domRules(item);
                }
            });
        }
    }

    return vnode;
};

const generateLoading = () => {
    let vnode;
    let html = `<div data-w-e-type="link-card"><div data-w-e-type="link-card-loading"></div></div>`;
    vnode = virtualize(html);
    vnode.data = {
        ...vnode.data,
        ...vnode.data.attrs,
    };
    vnode.children.map((item) => {
        if (item.sel) {
            domRules(item);
        }
    });
    return vnode;
};

const renderLinkCard = (
    elem: SlateElement,
    children: VNode[] | null,
    editor: IDomEditor,
): VNode => {
    const selected = DomEditor.isNodeSelected(editor, elem);
    const { cardData } = elem as LinkCardElement;
    let nodeDom;
    let path = DomEditor.findPath(editor, elem);
    if (cardData) {
        nodeDom = generateNode(cardData, path);
        const vnode = h(
            'div',
            {
                props: {
                    contentEditable: false,
                    className: 'w-e-textarea-link-card-container',
                },
                dataset: {
                    selected: selected ? 'true' : '',
                    currentpath: `${path}`,
                },
                on: {
                    mousedown: (event) => event.preventDefault(),
                    click: (event) => {
                        if (event?.target?.localName === 'div' && !event?.target.className) {
                            bus.emit('cardToLinkEmit', {
                                data: {
                                    idx: path[0],
                                    url: elem.url,
                                    linkText: elem.linkText,
                                },
                            });
                        }
                    },
                },
            },
            nodeDom,
        );
        return vnode;
    } else {
        nodeDom = generateLoading();
        const vnode = h(
            'div',
            {
                props: {
                    contentEditable: false,
                    className: 'w-e-textarea-link-card-container',
                },
                dataset: {
                    selected: selected ? 'true' : '',
                },
                on: {
                    mousedown: (event) => event.preventDefault(),
                },
            },
            nodeDom,
        );
        return vnode;
    }
};

const conf = {
    type: 'link-card',
    renderElem: renderLinkCard,
};

export default conf;
