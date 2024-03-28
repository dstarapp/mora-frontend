import { SlateElement } from '@wangeditor/editor'

type ImageElement = SlateElement & {
  src: string
  alt: string
  url: string
  href: string
}

type InsertFnType = (url: string, alt: string, href: string) => void

type UpLoadReq = {
  data: string
  success: boolean
  message: string
}

declare module "*.vue" {
  import { ComponentOptions } from "vue";
  const componentOptions: ComponentOptions;
  export default componentOptions;
}
