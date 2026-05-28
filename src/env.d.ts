/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

declare module '@pagefind/default-ui' {
  export class PagefindUI {
    constructor(options: {
      element: string;
      showSubResults?: boolean;
      showImages?: boolean;
      translations?: Record<string, string>;
    });
  }
}
