import html2canvas from 'html2canvas';
import store from '@/store';

const mergeCanvases = (canvases) => {
    const outputCanvas = document.createElement('canvas');
    const ctx = outputCanvas.getContext('2d');

    const outputWidth = Math.max(...canvases.map((canvas) => canvas.width));
    const outputHeight = canvases.reduce((total, canvas) => total + canvas.height, 0);

    outputCanvas.width = outputWidth;
    outputCanvas.height = outputHeight;

    let currentY = 0;
    for (const canvas of canvases) {
        ctx.drawImage(canvas, 0, currentY);
        currentY += canvas.height;
    }

    return outputCanvas;
};

const ignoreElements = (element) => {
    if (element.classList.contains('chain-address')) {
        return true;
    }
    if (element.localName === 'div' && element.getAttribute('data-w-e-type') === 'link-card') {
        return true;
    }
    return false;
};

const generateCanvas = async (dom) => {
    let width = dom.offsetWidth;
    let height = dom.offsetHeight;
    let ratio = window.devicePixelRatio;
    let canvas: any = await html2canvas(dom, {
        backgroundColor: store.state.theme == 'light' ? '#ffffff' : '#1c1c1e',
        ignoreElements: ignoreElements,
        useCORS: true,
        allowTaint: true,
        logging: false,
        scale: ratio,
        width: width,
        height: height,
    });

    let link = canvas.toDataURL('image/png', 0);
    canvas.remove();
    canvas = null;

    return {
        file: link,
        width,
        height,
    };
};

export { mergeCanvases, ignoreElements, generateCanvas };
