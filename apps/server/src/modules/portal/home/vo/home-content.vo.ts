import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { HomeAdvertiseVo } from '@/modules/sms/home-content/vo/home-advertise.vo';
import { HomeBrandVo } from '@/modules/sms/home-content/vo/home-brand.vo';
import { HomeNewProductVo } from '@/modules/sms/home-content/vo/home-new-product.vo';
import { HomeHotProductVo } from '@/modules/sms/home-content/vo/home-hot-product.vo';
import { HomeRecommendSubjectVo } from '@/modules/sms/home-content/vo/home-recommend-subject.vo';

/** 秒杀商品信息 */
class FlashProductItemVo {
  @ApiProperty({ description: '商品ID', type: 'integer' })
  id: number;

  @ApiProperty({ description: '商品名称' })
  name: string;

  @ApiProperty({ description: '商品图片' })
  pic: string;

  @ApiProperty({ description: '商品原价' })
  price: number;

  @ApiProperty({ description: '秒杀价格' })
  flashPromotionPrice: number;

  @ApiProperty({ type: 'integer', description: '秒杀总量' })
  flashPromotionCount: number;

  @ApiProperty({ type: 'integer', description: '每人限购数量' })
  flashPromotionLimit: number;
}

/** 首页秒杀活动信息 */
class HomeFlashPromotionVo {
  @ApiProperty({ description: '秒杀活动ID', type: 'integer' })
  id: number;

  @ApiProperty({ description: '活动标题' })
  title: string;

  @ApiProperty({ description: '场次开始时间' })
  startTime: string;

  @ApiProperty({ description: '场次结束时间' })
  endTime: string;

  @ApiProperty({ description: '场次ID', type: 'integer' })
  sessionId: number;

  @ApiProperty({ description: '场次名称' })
  sessionName: string;

  @ApiPropertyOptional({
    description: '下一场开始时间',
    type: String,
    nullable: true,
    example: '2025-06-01T10:00:00.000Z',
  })
  nextStartTime: string | null;

  @ApiProperty({ type: [FlashProductItemVo], description: '秒杀商品列表' })
  productList: FlashProductItemVo[];
}

/** 首页数据聚合响应 */
export class HomeContentVo {
  @ApiProperty({ type: [HomeAdvertiseVo] })
  advertiseList: HomeAdvertiseVo[];

  @ApiProperty({ type: [HomeBrandVo] })
  brandList: HomeBrandVo[];

  @ApiProperty({ type: [HomeNewProductVo] })
  newProductList: HomeNewProductVo[];

  @ApiProperty({ type: [HomeHotProductVo] })
  hotProductList: HomeHotProductVo[];

  @ApiProperty({ type: [HomeRecommendSubjectVo] })
  subjectList: HomeRecommendSubjectVo[];

  @ApiPropertyOptional({ type: HomeFlashPromotionVo, nullable: true })
  homeFlashPromotion: HomeFlashPromotionVo | null;
}
