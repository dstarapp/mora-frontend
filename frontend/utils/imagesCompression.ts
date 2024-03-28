import CONFIG from '@/assets/config';
import imageCompression from 'browser-image-compression';

const getBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
    });
};

// https://github.com/Donaldcwl/browser-image-compression
const imageCompress = async (file) => {
    const options = {
        maxSizeMB: CONFIG.imgMaximum,
        quality: CONFIG.compressionRatio,
        maxWidthOrHeight: 1920,
    };
    return await imageCompression(file, options);
};

export { getBase64, imageCompress };
