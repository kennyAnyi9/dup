declare module 'qr-code-styling' {
  export interface QRCodeStylingOptions {
    width?: number;
    height?: number;
    type?: string;
    data?: string;
    image?: string;
    dotsOptions?: {
      color?: string;
      type?: 'square' | 'rounded' | 'dots' | 'classy' | 'classy-rounded';
    };
    backgroundOptions?: {
      color?: string;
    };
    imageOptions?: {
      crossOrigin?: string;
      margin?: number;
      imageSize?: number;
    };
    cornersSquareOptions?: {
      type?: 'square' | 'rounded' | 'dots' | 'classy' | 'classy-rounded';
      color?: string;
    };
    cornersDotOptions?: {
      type?: 'square' | 'rounded' | 'dots' | 'classy' | 'classy-rounded';
      color?: string;
    };
  }

  export interface DownloadOptions {
    name?: string;
    extension?: string;
  }

  export default class QRCodeStyling {
    constructor(options?: QRCodeStylingOptions);
    append(element: HTMLElement): void;
    update(options: Partial<QRCodeStylingOptions>): void;
    download(options?: DownloadOptions): void;
  }
}