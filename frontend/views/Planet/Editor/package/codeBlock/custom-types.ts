type PureText = {
    text: string;
};

export type PreElement = {
    type: 'pre';
    children: CodeElement[];
};

export type CodeElement = {
    type: 'code';
    language: string;
    children: PureText[];
};
