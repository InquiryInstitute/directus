declare module 'page-flip' {
  export class PageFlip {
    constructor(container: HTMLElement, options: {
      width?: number
      height?: number
      showCover?: boolean
      maxShadowOpacity?: number
    })
    loadFromHTML(element: HTMLElement): void
    flipNext(): void
    flipPrev(): void
    addPage(page: HTMLElement): void
  }
}
