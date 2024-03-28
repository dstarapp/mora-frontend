import { h, VNode } from 'snabbdom';
import { IDomEditor } from '@wangeditor/editor';
import virtualize from '@rjaros/snabbdom-virtualize/strings';

const generateNode = ({ value }) => {
    let type = '';
    if (!value.file_extension) {
        type = 'default';
    } else if (~value.file_extension.indexOf('image')) {
        type = 'image';
    } else if (~value.file_extension.indexOf('video')) {
        type = 'video';
    } else if (~value.file_extension.indexOf('pdf')) {
        type = 'pdf';
    } else if (~value.file_extension.indexOf('application')) {
        type = 'application';
    } else {
        type = 'default';
    }

    let vnode;
    let html = `<div data-w-e-type="upload-file" data-url="${value.link}">
      <i data-class="${type}"></i>
      <span>
        <p>${value.file_name}</p>
        <p>${value.total_size}</p>
      </span>
  </div>`;
    vnode = virtualize(html);
    return vnode;
};

const renderUploadFile = (elem, children: VNode[] | null, editor: IDomEditor): VNode => {
    const vnode = h(
        'div',
        {
            props: {
                contentEditable: false,
                className: 'w-e-textarea-upload-file-container',
            },
        },
        generateNode(elem),
    );

    return vnode;
};

const conf = {
    type: 'uploadFile',
    renderElem: renderUploadFile,
};

export default conf;
