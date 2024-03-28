import LocalHistoryButtonMenu from './localHistory';

export const LocalHistoryMenuConf = {
    key: 'localHistory',
    factory() {
        return new LocalHistoryButtonMenu();
    },
};
