export type SwitchInputComponentUI = {
    type: 'SwitchInputComponent';
    style: {
        inlinePrompt?: boolean;
        activeText?: string;
        inactiveText?: string;
    };
    label?: string;
    default?: boolean;
};
