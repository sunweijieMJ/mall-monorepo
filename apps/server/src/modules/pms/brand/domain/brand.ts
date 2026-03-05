/** 品牌领域实体（无框架依赖） */
export class Brand {
  id: number;
  name: string;
  firstLetter: string;
  sort: number;
  /** 是否为品牌制造商：0-否 1-是 */
  factoryStatus: number;
  showStatus: number;
  productCount: number;
  productCommentCount: number;
  logo: string;
  bigPic: string;
  brandStory: string | null;
  createdAt: Date;
  updatedAt: Date;
}
