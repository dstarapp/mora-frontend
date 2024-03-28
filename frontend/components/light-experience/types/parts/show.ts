import { v4 as uuid } from 'uuid';
import { TrimmedUnionTransmitShowView } from './shows';

export type DataShow = {
    id: string;

    show: {
        id: string;
        view: TrimmedUnionTransmitShowView;
    };
};

export const getInitialDataShow = (view: TrimmedUnionTransmitShowView): DataShow => {
    return {
        id: uuid(),
        show: {
            id: '',
            view,
        },
    };
};
