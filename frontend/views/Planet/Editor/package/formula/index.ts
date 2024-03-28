import EditFormulaButtonMenu from './editFormula';
import InsertFormulaMenu from './InsertFormula';

export const editFormulaMenuConf = {
    key: 'editFormula2',
    factory() {
        return new EditFormulaButtonMenu();
    },
};

export const formulaMenuConf = {
    key: 'insertFormula2',
    factory() {
        return new InsertFormulaMenu();
    },
};
