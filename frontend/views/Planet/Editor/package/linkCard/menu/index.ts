import ConvertToLinkCard from './ConvertToLinkCard';
import EditLink from './EditLink';

export const convertToLinkCardMenuConf = {
    key: 'convertToLinkCard',
    factory() {
        return new ConvertToLinkCard();
    },
};

export const editLink2 = {
    key: 'editLink2',
    factory() {
        return new EditLink();
    },
};
