import InsertFormulaMenu from './InsertFormula';
import EditFormulaMenu from './EditFormula';

export const insertFormulaMenuConf = {
    key: 'insertFormula',
    factory() {
        return new InsertFormulaMenu();
    },
};

export const editFormulaMenuConf = {
    key: 'editFormula',
    factory() {
        return new EditFormulaMenu();
    },
};
