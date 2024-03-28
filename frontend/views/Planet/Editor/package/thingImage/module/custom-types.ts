/**
 * @description mention element
 * @author wangfupeng
 */

type EmptyText = {
    text: '';
};
export type MentionElement = {
    type: 'thingImage';
    value: string;
    info: any;
    children: EmptyText[];
};
