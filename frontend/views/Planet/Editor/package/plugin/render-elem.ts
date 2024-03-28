import { h, VNode } from 'snabbdom';
import { IDomEditor } from '@wangeditor/editor';
import virtualize from '@rjaros/snabbdom-virtualize/strings';
import { getImagesUrl } from '@/utils/functions';
import bus from 'vue3-eventbus';
import CONFIG from '@/assets/config';

const generateNode = ({ value }) => {
    let vnode;
    let html = '';
    if (value.loading) {
        html = `<div data-w-e-type="plugin">
                   <div data-class="loading"></div>
                </div>`;
    } else if (value.frozen) {
        html = `<div data-w-e-type="plugin">
                   <div data-class="frozen"></div>
                </div>`;
    } else {
        html = `<div data-w-e-type="plugin" data-class="hover" data-plugin-prop="${encodeURI(
            value.propValue,
        )}">
                    <div data-class="header">
                        <img src="${getImagesUrl(value.thumbnail)}">
                        <p><i></i>Light ID：${value.id}</p>
                    </div>
                    <div data-class="info">
                        <p>${value.name}</p>
                        <strong><i></i>${value.userDeal}</strong>
                    </div>
                    <div data-class="desc">${value.desc}</div>
                </div>`;
    }
    vnode = virtualize(html);
    return vnode;
};

const renderPlugin = (elem, children: VNode[] | null, editor: IDomEditor): VNode => {
    const vnode = h(
        'div',
        {
            props: {
                contentEditable: false,
                className: 'w-e-textarea-plugin-container',
            },
            on: {
                click: (event) => {
                    bus.emit('previewEmit');
                },
            },
        },
        generateNode(elem),
    );

    return vnode;
};

const conf = {
    type: 'plugin',
    renderElem: renderPlugin,
};

export default conf;
