export interface TokenDetails {
  tokenId: number;
  svg: string;
  svgDataUri: string;
  attributes: {
    seed: number;
    shapeCount: number;
    tintColor: string;
    tintTransparency: string;
    style: string;
    structure: string;
    isCustom: string;
  };
}
