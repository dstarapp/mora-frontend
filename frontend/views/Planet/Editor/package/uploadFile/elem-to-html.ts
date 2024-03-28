function uploadFileToHtml(elem, childrenHtml: string): string {
    let value = elem.value;
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

    const html = `<div data-w-e-type="upload-file" data-url="${value.link}">
      <i data-class="${type}"></i>
      <span>
        <p>${value.file_name}</p>
        <p>${value.total_size}</p>
      </span>
  </div>`;
    return html;
}

const conf = {
    type: 'uploadFile',
    elemToHtml: uploadFileToHtml,
};

export default conf;
