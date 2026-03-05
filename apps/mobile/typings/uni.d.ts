/// <reference types='@dcloudio/types' />

/**
 * 扩展uni-app类型
 */
declare namespace UniApp {
  interface Uni {
    onPageScroll?: (callback: (event: { scrollTop: number }) => void) => void;
  }
}

export {};
