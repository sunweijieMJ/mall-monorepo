import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HomeAdvertiseEntity } from '@/modules/sms/home-content/infrastructure/persistence/relational/entities/home-advertise.entity';
import { HomeBrandEntity } from '@/modules/sms/home-content/infrastructure/persistence/relational/entities/home-brand.entity';
import { HomeNewProductEntity } from '@/modules/sms/home-content/infrastructure/persistence/relational/entities/home-new-product.entity';
import { HomeHotProductEntity } from '@/modules/sms/home-content/infrastructure/persistence/relational/entities/home-content.entity';
import { HomeRecommendSubjectEntity } from '@/modules/sms/home-content/infrastructure/persistence/relational/entities/home-recommend-subject.entity';
import {
  FlashPromotionEntity,
  FlashProductRelationEntity,
  FlashSessionEntity,
} from '@/modules/sms/flash-promotion/infrastructure/persistence/relational/entities/flash-promotion.entity';
import { ProductEntity } from '@/modules/pms/product/infrastructure/persistence/relational/entities/product.entity';

@Injectable()
export class HomeService {
  constructor(
    @InjectRepository(HomeAdvertiseEntity)
    private readonly advertiseRepo: Repository<HomeAdvertiseEntity>,

    @InjectRepository(HomeBrandEntity)
    private readonly brandRepo: Repository<HomeBrandEntity>,

    @InjectRepository(HomeNewProductEntity)
    private readonly newProductRepo: Repository<HomeNewProductEntity>,

    @InjectRepository(HomeHotProductEntity)
    private readonly hotProductRepo: Repository<HomeHotProductEntity>,

    @InjectRepository(HomeRecommendSubjectEntity)
    private readonly subjectRepo: Repository<HomeRecommendSubjectEntity>,

    @InjectRepository(FlashPromotionEntity)
    private readonly flashPromotionRepo: Repository<FlashPromotionEntity>,

    @InjectRepository(FlashSessionEntity)
    private readonly flashSessionRepo: Repository<FlashSessionEntity>,

    @InjectRepository(FlashProductRelationEntity)
    private readonly flashProductRelRepo: Repository<FlashProductRelationEntity>,

    @InjectRepository(ProductEntity)
    private readonly productRepo: Repository<ProductEntity>,
  ) {}

  /**
   * 聚合首页数据
   * 使用 Promise.all 并行查询各模块数据，提升响应速度
   * 结果由 HomeController 通过 CacheInterceptor 缓存 5 分钟
   */
  async getHomeContent(): Promise<Record<string, unknown>> {
    const [banners, brands, newProducts, hotProducts, subjects] =
      await Promise.all([
        // 轮播广告：type=1（app首页轮播），status=1（上线），按 sort 倒序
        this.advertiseRepo.find({
          where: { type: 1, status: 1 },
          order: { sort: 'DESC' },
        }),
        // 推荐品牌：recommendStatus=1，按 sort 倒序，取前 6 条
        this.brandRepo.find({
          where: { recommendStatus: 1 },
          order: { sort: 'DESC' },
          take: 6,
        }),
        // 新品推荐：recommendStatus=1，按 sort 倒序，取前 4 条
        this.newProductRepo.find({
          where: { recommendStatus: 1 },
          order: { sort: 'DESC' },
          take: 4,
        }),
        // 人气推荐：recommendStatus=1，按 sort 倒序，取前 4 条
        this.hotProductRepo.find({
          where: { recommendStatus: 1 },
          order: { sort: 'DESC' },
          take: 4,
        }),
        // 推荐专题：recommendStatus=1，按 sort 倒序，取前 4 条
        this.subjectRepo.find({
          where: { recommendStatus: 1 },
          order: { sort: 'DESC' },
          take: 4,
        }),
      ]);

    // 查询当前时间段的秒杀活动
    const homeFlashPromotion = await this.getCurrentFlashPromotion();

    return {
      advertiseList: banners,
      brandList: brands,
      newProductList: newProducts,
      hotProductList: hotProducts,
      subjectList: subjects,
      homeFlashPromotion,
    };
  }

  /**
   * 获取当前时间段的秒杀活动
   * 1. 先根据当前日期查找正在进行的秒杀活动（sms_flash_promotion）
   * 2. 再根据当前时间查找对应的场次（sms_flash_promotion_session）
   * 3. 查询该场次的秒杀商品列表（关联商品信息）
   * 4. 查询下一场次的开始时间
   * 5. 找不到活动或场次则返回 null
   */
  private async getCurrentFlashPromotion(): Promise<Record<
    string,
    unknown
  > | null> {
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    const promotion = await this.flashPromotionRepo
      .createQueryBuilder('fp')
      .where('fp.status = 1')
      .andWhere('fp.start_date <= :today', { today })
      .andWhere('fp.end_date >= :today', { today })
      .orderBy('fp.id', 'DESC')
      .getOne();

    if (!promotion) return null;

    const currentTime = now.toTimeString().split(' ')[0];

    const session = await this.flashSessionRepo
      .createQueryBuilder('fs')
      .where('fs.status = 1')
      .andWhere('fs.start_time <= :currentTime', { currentTime })
      .andWhere('fs.end_time >= :currentTime', { currentTime })
      .getOne();

    if (!session) return null;

    // 查询该场次的秒杀商品列表
    const relations = await this.flashProductRelRepo.find({
      where: {
        flashPromotionId: promotion.id,
        flashPromotionSessionId: session.id,
      },
      order: { sort: 'DESC' },
    });

    const productList = [];
    for (const rel of relations) {
      const product = await this.productRepo.findOne({
        where: { id: rel.productId },
      });
      if (product) {
        productList.push({
          id: product.id,
          name: product.name,
          pic: product.pic,
          price: product.price,
          flashPromotionPrice: rel.flashPromotionPrice,
          flashPromotionCount: rel.flashPromotionCount,
          flashPromotionLimit: rel.flashPromotionLimit,
        });
      }
    }

    // 查询下一场次的开始时间
    const nextSession = await this.flashSessionRepo
      .createQueryBuilder('fs')
      .where('fs.status = 1')
      .andWhere('fs.start_time > :currentTime', { currentTime })
      .orderBy('fs.start_time', 'ASC')
      .getOne();

    return {
      id: promotion.id,
      title: promotion.title,
      startTime: session.startTime,
      endTime: session.endTime,
      sessionId: session.id,
      sessionName: session.name,
      nextStartTime: nextSession?.startTime || null,
      productList,
    };
  }
}
