import InsertPluginMenu from './InsertPlugin';

export const insertPluginMenuConf = {
    key: 'plugin',
    factory() {
        return new InsertPluginMenu();
    },
};
