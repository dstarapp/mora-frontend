/**
 * @description parse elem html
 * @author wangfupeng
 */

import { DOMElement } from '../utils/dom'
import { IDomEditor, SlateDescendant, SlateElement } from '@wangeditor/editor'
import { MentionElement } from './custom-types'

function parseHtml(
  elem: DOMElement,
  children: SlateDescendant[],
  editor: IDomEditor
): SlateElement {

  const value = elem.getAttribute('data-value') || ''
  const rawInfo = decodeURIComponent(elem.getAttribute('data-info') || '')
  let info: any
  try {
    info = JSON.parse(rawInfo)
  } catch (ex) {
    info = rawInfo
  }

  return {
    type: 'mention',
    value,
    info,
    children: [{ text: '' }],
  } as MentionElement
}

const parseHtmlConf = {
  selector: 'span[data-w-e-type="mention"]',
  parseElemHtml: parseHtml,
}

export default parseHtmlConf
