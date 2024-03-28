export type TextInputComponentUI = {
    type: 'TextInputComponent';
    style:
    | {
        type: 'text';
        autosize?: undefined;
        minRows?: undefined;
    }
    | {
        type: 'textarea';
        autosize: boolean;
        minRows: number;
    };
    label?: string;
    placeholder?: string;
    default?: string;
};
