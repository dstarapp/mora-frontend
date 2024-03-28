import { IDomEditor, DomEditor, SlateNode, SlateTransforms } from '@wangeditor/editor';
import { Transforms } from 'slate';
import { ElMessage } from 'element-plus';
import { t } from '@/i18n';
import { IButtonMenu } from '@wangeditor/editor';
import { LinkCardElement, LinkElement } from '../custom-types';
import { cardInfo } from '@/request/axios/bv';

class ConvertToLinkCard implements IButtonMenu {
    readonly title = t('editor.settings.card');
    readonly iconSvg = '<svg></svg>';
    readonly tag = 'button';

    private getSelectedLinkElem(editor: IDomEditor): LinkElement | null {
        const node = DomEditor.getSelectedNodeByType(editor, 'link');
        if (node == null) return null;
        return node as LinkElement;
    }

    getValue(editor: IDomEditor): string | boolean {
        return '';
    }

    isActive(editor: IDomEditor): boolean {
        return false;
    }

    isDisabled(editor: IDomEditor): boolean {
        if (editor.selection == null) return true;

        const linkElem = this.getSelectedLinkElem(editor);
        if (linkElem == null) {
            return true;
        }
        return false;
    }

    async exec(editor: IDomEditor, value: string | boolean) {
        if (this.isDisabled(editor)) return;

        const linkElem = this.getSelectedLinkElem(editor);
        if (linkElem == null) return;

        SlateTransforms.setNodes(
            editor,
            {
                // @ts-ignore
                cardLoading: true,
            },
            {
                mode: 'highest',
            },
        );

        const { url } = linkElem;
        const linkText = SlateNode.string(linkElem);

        let domID = DomEditor.findKey(editor, linkElem).id;
        let id = `w-e-element-${domID}`;
        let dom = document.getElementById(id);
        if (dom) {
            dom?.classList.add('cardLoading');
        }

        let str = {
            url,
            reqTime: Date.now(),
        };
        cardInfo(str)
            .then((res: any) => {
                if (res.error) {
                    ElMessage.error(res.error);
                    return;
                }
                if (res.width && res.height) {
                    ElMessage.warning(t('editor.insertLink.notSupported'));
                    return;
                }

                if (res.success === 100000) {
                    ElMessage.error(t('editor.insertLink.getLinkNot'));
                    dom?.classList.remove('cardLoading');
                } else if (res.type) {
                    const linkPath = DomEditor.findPath(editor, linkElem);
                    SlateTransforms.removeNodes(editor, { at: linkPath });
                    SlateTransforms.splitNodes(editor, { always: true });
                    const linkCard: LinkCardElement = {
                        type: 'link-card',
                        url,
                        linkText,
                        cardData: res,
                        children: [{ text: '' }],
                    };
                    dom?.classList.remove('cardLoading');
                    Transforms.insertNodes(editor, linkCard);
                }
            })
            .catch((res) => {
                ElMessage.error(t('editor.insertLink.getLinkError'));
                dom?.classList.remove('cardLoading');
            });
    }
}

export default ConvertToLinkCard;
