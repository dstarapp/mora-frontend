type ChildText = {
    text: '';
};

export type LinkCardElement = {
    type: 'link-card';
    url: string;
    linkText: string;
    cardData?: any;
    children: ChildText[];
};

export type LinkElement = {
    type: 'link';
    url: string;
    target?: string;
    children: ChildText[];
};
