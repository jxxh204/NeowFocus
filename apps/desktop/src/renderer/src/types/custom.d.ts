declare module '*.svg' {
  import { FC, SVGProps } from 'react'
  export const ReactComponent: FC<SVGProps<SVGSVGElement>>
  const content: string
  export default content
}
