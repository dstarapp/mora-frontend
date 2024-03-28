export type TimeInputComponentUI = {
    type: 'TimeInputComponent';
    style: {
        type: 'year' | 'month' | 'week' | 'day' | 'second';
        unit: 's' | 'ms' | 'ns';
    };
    label?: string;
    placeholder?: string;
    default?: string;
};
