type EmptyText = {
    text: '';
};

export type FormulaElement = {
    type: 'formula';
    value: string;
    children: EmptyText[];
};
