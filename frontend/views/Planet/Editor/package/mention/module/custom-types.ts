/**
 * @description mention element
 * @author wangfupeng
 */

type EmptyText = {
    text: '';
};

export type MentionElement = {
    type: 'thingImage';
    src: string;
    mode: 'middle' | 'full';
    children: EmptyText[];
};
