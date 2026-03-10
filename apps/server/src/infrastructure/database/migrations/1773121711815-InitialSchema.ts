import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1773121711815 implements MigrationInterface {
  name = 'InitialSchema1773121711815';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "auth_session" ("id" SERIAL NOT NULL, "userId" integer NOT NULL, "userType" character varying(10) NOT NULL, "hash" character varying(512) NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "expiresAt" TIMESTAMP, CONSTRAINT "PK_19354ed146424a728c1112a8cbf" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6a649d390ad11a510689acbd45" ON "auth_session" ("userId", "userType") `,
    );
    await queryRunner.query(
      `CREATE TABLE "ums_member_level" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "name" character varying(100), "growth_point" integer NOT NULL DEFAULT '0', "default_status" integer NOT NULL DEFAULT '0', "free_freight_point" numeric(10,2), "comment_growth_point" integer NOT NULL DEFAULT '0', "privilege_free_freight" integer NOT NULL DEFAULT '0', "privilege_sign_in" integer NOT NULL DEFAULT '0', "privilege_comment" integer NOT NULL DEFAULT '0', "privilege_promotion" integer NOT NULL DEFAULT '0', "privilege_member_price" integer NOT NULL DEFAULT '0', "privilege_birthday" integer NOT NULL DEFAULT '0', "note" text, CONSTRAINT "PK_b047d3213d3b1a33f6ac34b2861" PRIMARY KEY ("id")); COMMENT ON COLUMN "ums_member_level"."default_status" IS '是否为默认等级：0->不是；1->是'; COMMENT ON COLUMN "ums_member_level"."free_freight_point" IS '免运费标准'; COMMENT ON COLUMN "ums_member_level"."comment_growth_point" IS '每次评价获取的成长值'; COMMENT ON COLUMN "ums_member_level"."privilege_free_freight" IS '是否有免邮特权'; COMMENT ON COLUMN "ums_member_level"."privilege_sign_in" IS '是否有签到特权'; COMMENT ON COLUMN "ums_member_level"."privilege_comment" IS '是否有评论获奖励特权'; COMMENT ON COLUMN "ums_member_level"."privilege_promotion" IS '是否有专享活动特权'; COMMENT ON COLUMN "ums_member_level"."privilege_member_price" IS '是否有会员价格特权'; COMMENT ON COLUMN "ums_member_level"."privilege_birthday" IS '是否有生日特权'`,
    );
    await queryRunner.query(
      `CREATE TABLE "ums_integration_consume_setting" ("id" SERIAL NOT NULL, "deduction_per_amount" integer, "max_percent_per_order" integer, "use_unit" integer, "coupon_status" integer, CONSTRAINT "PK_fda4bbc99ff274011149c80030f" PRIMARY KEY ("id")); COMMENT ON COLUMN "ums_integration_consume_setting"."deduction_per_amount" IS '每一元需要抵扣的积分数量'; COMMENT ON COLUMN "ums_integration_consume_setting"."max_percent_per_order" IS '每笔订单最高抵用百分比'; COMMENT ON COLUMN "ums_integration_consume_setting"."use_unit" IS '每次使用积分最小单位100'; COMMENT ON COLUMN "ums_integration_consume_setting"."coupon_status" IS '是否可以和优惠券同用；0->不可以；1->可以'`,
    );
    await queryRunner.query(
      `CREATE TABLE "ums_admin" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "username" character varying(64) NOT NULL, "password" character varying(64) NOT NULL, "icon" character varying(500), "email" character varying(100), "nick_name" character varying(200), "note" text, "login_time" TIMESTAMP, "status" integer NOT NULL DEFAULT '1', CONSTRAINT "UQ_054c11d1c4133fd1b419721ba13" UNIQUE ("username"), CONSTRAINT "PK_c87bead41feca9ce58727d783e6" PRIMARY KEY ("id")); COMMENT ON COLUMN "ums_admin"."icon" IS '头像'; COMMENT ON COLUMN "ums_admin"."status" IS '帐号启用状态：0->禁用；1->启用'`,
    );
    await queryRunner.query(
      `CREATE TABLE "ums_admin_role_relation" ("id" SERIAL NOT NULL, "admin_id" integer NOT NULL, "role_id" integer NOT NULL, CONSTRAINT "UQ_e50daaf53098ea3d614bf97eaff" UNIQUE ("admin_id", "role_id"), CONSTRAINT "PK_bd249fb82e1b8ba327e40093ff4" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "ums_admin_login_log" ("id" SERIAL NOT NULL, "admin_id" integer, "create_time" TIMESTAMP, "ip" character varying(64), "address" character varying(100), "user_agent" character varying(500), CONSTRAINT "PK_5a6e146a7f0d6616ef626db9b9f" PRIMARY KEY ("id")); COMMENT ON COLUMN "ums_admin_login_log"."user_agent" IS '浏览器登录类型'`,
    );
    await queryRunner.query(
      `CREATE TABLE "ums_role_resource_relation" ("id" SERIAL NOT NULL, "role_id" integer NOT NULL, "resource_id" integer NOT NULL, CONSTRAINT "UQ_e9a83a0886b0f7d0c5c143a7c3a" UNIQUE ("role_id", "resource_id"), CONSTRAINT "PK_56d6c7a65fc7479db0a3bae8cb3" PRIMARY KEY ("id")); COMMENT ON COLUMN "ums_role_resource_relation"."role_id" IS '角色ID'; COMMENT ON COLUMN "ums_role_resource_relation"."resource_id" IS '资源ID'`,
    );
    await queryRunner.query(
      `CREATE TABLE "ums_role_menu_relation" ("id" SERIAL NOT NULL, "role_id" integer NOT NULL, "menu_id" integer NOT NULL, CONSTRAINT "UQ_8bab70dd11ef9a5e32e8a6c83c2" UNIQUE ("role_id", "menu_id"), CONSTRAINT "PK_ad3392fe0fcba1af081dc859bec" PRIMARY KEY ("id")); COMMENT ON COLUMN "ums_role_menu_relation"."role_id" IS '角色ID'; COMMENT ON COLUMN "ums_role_menu_relation"."menu_id" IS '菜单ID'`,
    );
    await queryRunner.query(
      `CREATE TABLE "ums_role" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "name" character varying(100) NOT NULL, "description" character varying(100), "adminCount" integer NOT NULL DEFAULT '0', "status" integer NOT NULL DEFAULT '1', "sort" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_05b71bffe352cc619d1fe24b337" PRIMARY KEY ("id")); COMMENT ON COLUMN "ums_role"."name" IS '名称'; COMMENT ON COLUMN "ums_role"."description" IS '描述'; COMMENT ON COLUMN "ums_role"."adminCount" IS '管理员数量'; COMMENT ON COLUMN "ums_role"."status" IS '启用状态：0->禁用；1->启用'`,
    );
    await queryRunner.query(
      `CREATE TABLE "ums_resource" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "category_id" integer, "name" character varying(200) NOT NULL, "url" character varying(200) NOT NULL, "description" character varying(200), CONSTRAINT "PK_e1e8e7978eee23ec4e4c3328977" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "ums_resource_category" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "name" character varying(200) NOT NULL, "sort" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_0f8b426ab21c827b432eb3a44be" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "ums_menu" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "parent_id" integer, "level" integer NOT NULL DEFAULT '0', "name" character varying(100) NOT NULL, "title" character varying(200), "icon" character varying(200), "hidden" integer NOT NULL DEFAULT '0', "keepAlive" character varying(200), "component" character varying(200), "path" character varying(200), "sort" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_8e61fccf14da6ddeceb5838acbf" PRIMARY KEY ("id")); COMMENT ON COLUMN "ums_menu"."parent_id" IS '父级ID'; COMMENT ON COLUMN "ums_menu"."level" IS '菜单级数'; COMMENT ON COLUMN "ums_menu"."title" IS '前端名称'; COMMENT ON COLUMN "ums_menu"."icon" IS '菜单图标'; COMMENT ON COLUMN "ums_menu"."hidden" IS '前端隐藏：0->不隐藏；1->隐藏'; COMMENT ON COLUMN "ums_menu"."component" IS '前端路由路径'`,
    );
    await queryRunner.query(
      `CREATE TABLE "sms_home_recommend_subject" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "subject_id" integer NOT NULL, "subject_name" character varying(64) NOT NULL DEFAULT '', "recommend_status" integer NOT NULL DEFAULT '0', "sort" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_8b46b80ea82eb4dc608bfac997e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "sms_home_advertise" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "name" character varying(100) NOT NULL, "type" integer NOT NULL DEFAULT '0', "pic" character varying NOT NULL DEFAULT '', "start_time" TIMESTAMP, "end_time" TIMESTAMP, "status" integer NOT NULL DEFAULT '0', "clickCount" integer NOT NULL DEFAULT '0', "order_count" integer NOT NULL DEFAULT '0', "url" character varying NOT NULL DEFAULT '', "note" text, "sort" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_2e139913368863edd8c84e0388e" PRIMARY KEY ("id")); COMMENT ON COLUMN "sms_home_advertise"."type" IS '轮播位置：0->PC首页轮播；1->app首页轮播'; COMMENT ON COLUMN "sms_home_advertise"."status" IS '上下线状态：0->下线；1->上线'; COMMENT ON COLUMN "sms_home_advertise"."clickCount" IS '点击数'; COMMENT ON COLUMN "sms_home_advertise"."order_count" IS '下单数'`,
    );
    await queryRunner.query(
      `CREATE TABLE "sms_home_brand" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "brand_id" integer NOT NULL, "brand_name" character varying(64) NOT NULL DEFAULT '', "recommend_status" integer NOT NULL DEFAULT '0', "sort" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_eec9c052662c04f18eae644b569" PRIMARY KEY ("id")); COMMENT ON COLUMN "sms_home_brand"."recommend_status" IS '推荐状态：0->不推荐；1->推荐'`,
    );
    await queryRunner.query(
      `CREATE TABLE "sms_home_subject" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "subject_id" integer NOT NULL, "subject_name" character varying(64) NOT NULL DEFAULT '', "recommend_status" integer NOT NULL DEFAULT '0', "sort" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_119e1c14d85b59601e086a98496" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "sms_home_new_product" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "product_id" integer NOT NULL, "product_name" character varying(200) NOT NULL DEFAULT '', "recommend_status" integer NOT NULL DEFAULT '0', "sort" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_4c1697e51f28ce7869362d83f15" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "sms_home_hot_product" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "product_id" integer NOT NULL, "product_name" character varying(200) NOT NULL DEFAULT '', "recommend_status" integer NOT NULL DEFAULT '0', "sort" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_33036231847f0089b4b5e1d302d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "sms_flash_promotion" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "title" character varying(200) NOT NULL, "start_date" date NOT NULL, "end_date" date NOT NULL, "status" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_6707e2f5fb59a4ea889d89a577f" PRIMARY KEY ("id")); COMMENT ON COLUMN "sms_flash_promotion"."status" IS '上下线状态：0-下线；1-上线'`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5191951252d879a6e00aa442e9" ON "sms_flash_promotion" ("status") `,
    );
    await queryRunner.query(
      `CREATE TABLE "sms_flash_promotion_session" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "name" character varying(200) NOT NULL, "start_time" TIME NOT NULL, "end_time" TIME NOT NULL, "status" integer NOT NULL DEFAULT '1', CONSTRAINT "PK_e01c9a8bc8e45650d33aa9e2aa2" PRIMARY KEY ("id")); COMMENT ON COLUMN "sms_flash_promotion_session"."status" IS '启用状态：0->不启用；1->启用'`,
    );
    await queryRunner.query(
      `CREATE TABLE "sms_flash_promotion_product_relation" ("id" SERIAL NOT NULL, "flash_promotion_id" integer NOT NULL, "flash_promotion_session_id" integer NOT NULL, "product_id" integer NOT NULL, "flash_promotion_price" numeric(10,2) NOT NULL, "flash_promotion_count" integer NOT NULL, "flash_promotion_limit" integer NOT NULL, "sort" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_1714615a919be0d1afc4ce8c204" PRIMARY KEY ("id")); COMMENT ON COLUMN "sms_flash_promotion_product_relation"."flash_promotion_price" IS '秒杀价格'; COMMENT ON COLUMN "sms_flash_promotion_product_relation"."flash_promotion_count" IS '秒杀数量'; COMMENT ON COLUMN "sms_flash_promotion_product_relation"."flash_promotion_limit" IS '每人限购数量'`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_126c65354183caab8da97938ce" ON "sms_flash_promotion_product_relation" ("flash_promotion_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b5f1b11ac4024dbca9218acd29" ON "sms_flash_promotion_product_relation" ("flash_promotion_session_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "sms_coupon_history" ("id" SERIAL NOT NULL, "coupon_id" integer, "member_id" integer, "coupon_code" character varying(64), "member_nickname" character varying(64), "get_type" integer, "create_time" TIMESTAMP, "use_status" integer, "use_time" TIMESTAMP, "order_id" integer, "order_sn" character varying(100), CONSTRAINT "PK_45e061d7135fc81d0a971f05cb7" PRIMARY KEY ("id")); COMMENT ON COLUMN "sms_coupon_history"."member_nickname" IS '领取人昵称'; COMMENT ON COLUMN "sms_coupon_history"."get_type" IS '获取类型：0->后台赠送；1->主动获取'; COMMENT ON COLUMN "sms_coupon_history"."use_status" IS '使用状态：0->未使用；1->已使用；2->已过期'; COMMENT ON COLUMN "sms_coupon_history"."use_time" IS '使用时间'; COMMENT ON COLUMN "sms_coupon_history"."order_id" IS '订单编号'; COMMENT ON COLUMN "sms_coupon_history"."order_sn" IS '订单号码'`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_77682e5f1e199be0d64eb143ea" ON "sms_coupon_history" ("coupon_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_57f66b8a50749155022a0af034" ON "sms_coupon_history" ("member_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "sms_coupon_product_relation" ("id" SERIAL NOT NULL, "coupon_id" integer, "product_id" integer, "product_name" character varying(200), "product_sn" character varying(64), CONSTRAINT "PK_201a2bcdcb79f29c4b604359ded" PRIMARY KEY ("id")); COMMENT ON COLUMN "sms_coupon_product_relation"."product_name" IS '商品名称'; COMMENT ON COLUMN "sms_coupon_product_relation"."product_sn" IS '商品编码'`,
    );
    await queryRunner.query(
      `CREATE TABLE "sms_coupon_product_category_relation" ("id" SERIAL NOT NULL, "coupon_id" integer, "product_category_id" integer, "product_category_name" character varying(200), "parent_category_name" character varying(200), CONSTRAINT "PK_66ddd8f622468a71afcc51afc21" PRIMARY KEY ("id")); COMMENT ON COLUMN "sms_coupon_product_category_relation"."product_category_name" IS '产品分类名称'; COMMENT ON COLUMN "sms_coupon_product_category_relation"."parent_category_name" IS '父分类名称'`,
    );
    await queryRunner.query(
      `CREATE TABLE "sms_coupon" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "type" integer NOT NULL DEFAULT '0', "name" character varying(100) NOT NULL, "platform" integer NOT NULL DEFAULT '0', "count" integer NOT NULL DEFAULT '0', "amount" numeric(10,2) NOT NULL, "per_limit" integer NOT NULL DEFAULT '1', "min_point" numeric(10,2) NOT NULL, "start_time" TIMESTAMP, "end_time" TIMESTAMP, "use_type" integer NOT NULL DEFAULT '0', "note" text, "publish_count" integer NOT NULL DEFAULT '0', "use_count" integer NOT NULL DEFAULT '0', "receive_count" integer NOT NULL DEFAULT '0', "enable_time" TIMESTAMP, "code" character varying(64), "member_level" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_f7d8e2497b40cbfc3744b16ba69" PRIMARY KEY ("id")); COMMENT ON COLUMN "sms_coupon"."type" IS '优惠券类型：0->全场通用；1->指定分类；2->指定商品'; COMMENT ON COLUMN "sms_coupon"."platform" IS '使用平台：0->全部；1->移动；2->PC'; COMMENT ON COLUMN "sms_coupon"."count" IS '数量'; COMMENT ON COLUMN "sms_coupon"."amount" IS '金额'; COMMENT ON COLUMN "sms_coupon"."per_limit" IS '每人限领张数'; COMMENT ON COLUMN "sms_coupon"."min_point" IS '使用门槛；0表示无门槛'; COMMENT ON COLUMN "sms_coupon"."use_type" IS '使用类型：0->全场通用；1->指定分类；2->指定商品'; COMMENT ON COLUMN "sms_coupon"."note" IS '使用说明'; COMMENT ON COLUMN "sms_coupon"."publish_count" IS '发行数量'; COMMENT ON COLUMN "sms_coupon"."use_count" IS '已使用数量'; COMMENT ON COLUMN "sms_coupon"."receive_count" IS '领取数量'; COMMENT ON COLUMN "sms_coupon"."enable_time" IS '可以领取的日期'; COMMENT ON COLUMN "sms_coupon"."code" IS '优惠码'; COMMENT ON COLUMN "sms_coupon"."member_level" IS '可领取的会员类型：0->无限制'`,
    );
    await queryRunner.query(
      `CREATE TABLE "ums_member_product_history" ("id" SERIAL NOT NULL, "member_id" integer NOT NULL, "product_id" integer NOT NULL, "product_name" character varying(500), "product_pic" text, "product_price" numeric(10,2), "create_time" TIMESTAMP, CONSTRAINT "PK_6412b1d636e9e5d82e2e856aee3" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_cd982101943de22b451de06084" ON "ums_member_product_history" ("member_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "ums_member" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "member_level_id" integer, "username" character varying(64), "password" character varying(64), "nickname" character varying(64), "phone" character varying(64), "status" integer NOT NULL DEFAULT '1', "icon" character varying(500), "gender" integer, "birthday" date, "city" character varying(100), "job" character varying(200), "personal_sign" character varying(200), "source_type" integer, "integration" integer NOT NULL DEFAULT '0', "growth" integer NOT NULL DEFAULT '0', "lucky_count" integer NOT NULL DEFAULT '0', "history_integration" integer NOT NULL DEFAULT '0', "login_time" TIMESTAMP, CONSTRAINT "PK_e62ae6578a44f43469be07fd0c0" PRIMARY KEY ("id")); COMMENT ON COLUMN "ums_member"."username" IS '用户名'; COMMENT ON COLUMN "ums_member"."password" IS '密码'; COMMENT ON COLUMN "ums_member"."nickname" IS '昵称'; COMMENT ON COLUMN "ums_member"."phone" IS '手机号码'; COMMENT ON COLUMN "ums_member"."status" IS '帐号启用状态：0->禁用；1->启用'; COMMENT ON COLUMN "ums_member"."icon" IS '头像'; COMMENT ON COLUMN "ums_member"."gender" IS '性别：0->未知；1->男；2->女'; COMMENT ON COLUMN "ums_member"."birthday" IS '生日'; COMMENT ON COLUMN "ums_member"."city" IS '所在城市'; COMMENT ON COLUMN "ums_member"."job" IS '职业'; COMMENT ON COLUMN "ums_member"."personal_sign" IS '个性签名'; COMMENT ON COLUMN "ums_member"."source_type" IS '用户来源'; COMMENT ON COLUMN "ums_member"."integration" IS '积分'; COMMENT ON COLUMN "ums_member"."growth" IS '成长值'; COMMENT ON COLUMN "ums_member"."lucky_count" IS '剩余抽奖次数'; COMMENT ON COLUMN "ums_member"."history_integration" IS '历史积分数量'; COMMENT ON COLUMN "ums_member"."login_time" IS '最后登录时间'`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a96be685cea3d1138ae20632f3" ON "ums_member" ("username") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1fcb4fab319f3a1ca3eaccc5d4" ON "ums_member" ("phone") `,
    );
    await queryRunner.query(
      `CREATE TABLE "ums_member_receive_address" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "member_id" integer NOT NULL, "name" character varying(100), "phoneNumber" character varying(64), "default_status" integer NOT NULL DEFAULT '0', "post_code" character varying(100), "province" character varying(100), "city" character varying(100), "region" character varying(100), "detail_address" character varying(500), CONSTRAINT "PK_8005d1ec67d2878964b45cf04c3" PRIMARY KEY ("id")); COMMENT ON COLUMN "ums_member_receive_address"."name" IS '收货人名称'; COMMENT ON COLUMN "ums_member_receive_address"."phoneNumber" IS '手机号码'; COMMENT ON COLUMN "ums_member_receive_address"."default_status" IS '是否为默认：0->否；1->是'; COMMENT ON COLUMN "ums_member_receive_address"."post_code" IS '邮政编码'; COMMENT ON COLUMN "ums_member_receive_address"."province" IS '省份/直辖市'; COMMENT ON COLUMN "ums_member_receive_address"."city" IS '城市'; COMMENT ON COLUMN "ums_member_receive_address"."region" IS '区'; COMMENT ON COLUMN "ums_member_receive_address"."detail_address" IS '详细地址(街道)'`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5446c83f23194e8b4d95345968" ON "ums_member_receive_address" ("member_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "ums_member_product_collection" ("id" SERIAL NOT NULL, "member_id" integer NOT NULL, "product_id" integer NOT NULL, "product_name" character varying(500), "product_pic" text, "product_price" numeric(10,2), "create_time" TIMESTAMP, CONSTRAINT "PK_e28fbfdf01d9b1f4e68f4d0d59a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_99f63a1042d7caf88b1dcd0423" ON "ums_member_product_collection" ("member_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "oms_cart_item" ("id" SERIAL NOT NULL, "member_id" integer NOT NULL, "product_id" integer NOT NULL, "product_sku_id" integer, "product_name" character varying(500) NOT NULL DEFAULT '', "product_pic" text, "product_attr" text, "product_brand" character varying(200), "product_sn" character varying(200), "product_price" numeric(10,2) NOT NULL, "product_quantity" integer NOT NULL DEFAULT '1', "product_category_id" integer, "delete_status" integer NOT NULL DEFAULT '1', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_bfb218d79a1d8014ecbf17e089c" PRIMARY KEY ("id")); COMMENT ON COLUMN "oms_cart_item"."product_attr" IS '购买时的商品规格'; COMMENT ON COLUMN "oms_cart_item"."delete_status" IS '是否有效（库存不足时标记）：0->无效；1->有效'`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1b424188ac02acc9bb15053606" ON "oms_cart_item" ("member_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_92a3d291f00f228c3498831340" ON "oms_cart_item" ("product_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_05626f6150bd52d76b8216ca48" ON "oms_cart_item" ("product_sku_id") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_cart_member_sku_active" ON "oms_cart_item" ("member_id", "product_sku_id") WHERE "delete_status" = 1`,
    );
    await queryRunner.query(
      `CREATE TABLE "ums_member_brand_attention" ("id" SERIAL NOT NULL, "member_id" integer NOT NULL, "member_nickname" character varying(255), "member_icon" character varying(500), "brand_id" integer NOT NULL, "brand_name" character varying(255), "brand_logo" text, "create_time" TIMESTAMP, CONSTRAINT "PK_2bab3df1631ef8580c42b14772a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_0baa29f5e6140e753f7b2310b7" ON "ums_member_brand_attention" ("member_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "pms_sku_stock" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "product_id" integer NOT NULL, "sku_code" character varying(64) NOT NULL, "price" numeric(10,2) NOT NULL, "stock" integer NOT NULL DEFAULT '0', "low_stock" integer NOT NULL DEFAULT '0', "pic" character varying, "sale" integer NOT NULL DEFAULT '0', "promotion_price" numeric(10,2), "lock_stock" integer NOT NULL DEFAULT '0', "sp_data" text, "version" integer NOT NULL, CONSTRAINT "PK_3bcb015da01d91561acdcbe1968" PRIMARY KEY ("id")); COMMENT ON COLUMN "pms_sku_stock"."sku_code" IS 'sku编码'; COMMENT ON COLUMN "pms_sku_stock"."low_stock" IS '预警库存'; COMMENT ON COLUMN "pms_sku_stock"."lock_stock" IS '锁定库存'; COMMENT ON COLUMN "pms_sku_stock"."sp_data" IS '规格数据，JSON格式'; COMMENT ON COLUMN "pms_sku_stock"."version" IS '乐观锁版本号'`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e98f1397dc7c3081bc210578c7" ON "pms_sku_stock" ("product_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "pms_product_category" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "parent_id" integer, "name" character varying(64) NOT NULL, "level" integer NOT NULL DEFAULT '0', "product_count" integer NOT NULL DEFAULT '0', "product_unit" character varying(64) NOT NULL DEFAULT '', "nav_status" integer NOT NULL DEFAULT '0', "show_status" integer NOT NULL DEFAULT '1', "sort" integer NOT NULL DEFAULT '0', "icon" character varying, "keywords" character varying(255), "description" text, "parentId" integer, CONSTRAINT "PK_364b586767c1bc60bb174741b79" PRIMARY KEY ("id")); COMMENT ON COLUMN "pms_product_category"."level" IS '分类级别：0-1级；1-2级'; COMMENT ON COLUMN "pms_product_category"."nav_status" IS '是否显示在导航栏'; COMMENT ON COLUMN "pms_product_category"."show_status" IS '显示状态：0-不显示；1-显示'`,
    );
    await queryRunner.query(
      `CREATE TABLE "pms_product_category_attribute_relation" ("id" SERIAL NOT NULL, "product_category_id" integer NOT NULL, "product_attribute_id" integer NOT NULL, CONSTRAINT "PK_a78c40ddaad5c9d6d13d30ea0a8" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "pms_product_attribute" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "product_attribute_category_id" integer NOT NULL, "name" character varying(64) NOT NULL, "select_type" integer NOT NULL DEFAULT '0', "input_type" integer NOT NULL DEFAULT '0', "input_list" character varying(255), "sort" integer NOT NULL DEFAULT '0', "filter_type" integer NOT NULL DEFAULT '0', "search_type" integer NOT NULL DEFAULT '0', "related_status" integer NOT NULL DEFAULT '0', "hand_add_status" integer NOT NULL DEFAULT '0', "type" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_d7b9258adc3bade104ae545d6fd" PRIMARY KEY ("id")); COMMENT ON COLUMN "pms_product_attribute"."select_type" IS '属性选择类型：0-唯一；1-单选；2-多选'; COMMENT ON COLUMN "pms_product_attribute"."input_type" IS '属性录入方式：0-手工录入；1-从列表中选取'; COMMENT ON COLUMN "pms_product_attribute"."input_list" IS '可选值列表，以逗号隔开'; COMMENT ON COLUMN "pms_product_attribute"."filter_type" IS '分类筛选样式：0-普通；1-颜色'; COMMENT ON COLUMN "pms_product_attribute"."search_type" IS '检索类型：0-不需要进行检索；1-关键字检索；2-范围检索'; COMMENT ON COLUMN "pms_product_attribute"."related_status" IS '相同属性产品是否关联：0-不关联；1-关联'; COMMENT ON COLUMN "pms_product_attribute"."hand_add_status" IS '是否支持手动新增：0-不支持；1-支持'; COMMENT ON COLUMN "pms_product_attribute"."type" IS '属性的类型：0-规格；1-参数'`,
    );
    await queryRunner.query(
      `CREATE TABLE "pms_product_attribute_category" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "name" character varying(64) NOT NULL, "attribute_count" integer NOT NULL DEFAULT '0', "param_count" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_5ce3c1105d4219f16cf3d095c7a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "pms_brand" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "name" character varying(64) NOT NULL, "first_letter" character varying(8) NOT NULL DEFAULT '', "sort" integer NOT NULL DEFAULT '0', "factory_status" integer NOT NULL DEFAULT '0', "show_status" integer NOT NULL DEFAULT '1', "product_count" integer NOT NULL DEFAULT '0', "product_comment_count" integer NOT NULL DEFAULT '0', "logo" character varying NOT NULL DEFAULT '', "big_pic" character varying NOT NULL DEFAULT '', "brand_story" text, CONSTRAINT "PK_02b0b88362f4e141f6a82a847b4" PRIMARY KEY ("id")); COMMENT ON COLUMN "pms_brand"."factory_status" IS '是否为品牌制造商：0-否 1-是'`,
    );
    await queryRunner.query(
      `CREATE TABLE "pms_product_attribute_value" ("id" SERIAL NOT NULL, "product_id" integer, "product_attribute_id" integer, "value" character varying, CONSTRAINT "PK_3955bb5a3da37d9b40e02ad572a" PRIMARY KEY ("id")); COMMENT ON COLUMN "pms_product_attribute_value"."value" IS '手动添加规格或参数的值，参数单值，规格有多个时以逗号隔开'`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1215beedb5b184f8c949f3fa5f" ON "pms_product_attribute_value" ("product_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "pms_product_ladder" ("id" SERIAL NOT NULL, "product_id" integer, "count" integer, "discount" numeric(10,2), "price" numeric(10,2), CONSTRAINT "PK_46f7684c7975782374faac9f629" PRIMARY KEY ("id")); COMMENT ON COLUMN "pms_product_ladder"."count" IS '满足的商品数量'; COMMENT ON COLUMN "pms_product_ladder"."discount" IS '折扣'; COMMENT ON COLUMN "pms_product_ladder"."price" IS '折后价格'`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e8f023b25b83221519822ff5d5" ON "pms_product_ladder" ("product_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "pms_product_full_reduction" ("id" SERIAL NOT NULL, "product_id" integer, "full_price" numeric(10,2), "reduce_price" numeric(10,2), CONSTRAINT "PK_a3debb5a27a7ec6e34a555b0e63" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_0eafe49c901fa64d04dcc7d981" ON "pms_product_full_reduction" ("product_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "pms_member_price" ("id" SERIAL NOT NULL, "product_id" integer, "member_level_id" integer, "member_price" numeric(10,2), "member_level_name" character varying(100), CONSTRAINT "PK_477967c42b451593a7707c949cc" PRIMARY KEY ("id")); COMMENT ON COLUMN "pms_member_price"."member_price" IS '会员价格'`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d90bf7b119fbbb030e2ac0dabe" ON "pms_member_price" ("product_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "pms_product" ("id" SERIAL NOT NULL, "brand_id" integer, "brand_name" character varying(255) NOT NULL DEFAULT '', "product_category_id" integer, "product_category_name" character varying(255) NOT NULL DEFAULT '', "product_attribute_category_id" integer, "freight_template_id" integer, "name" character varying(64) NOT NULL, "pic" character varying NOT NULL DEFAULT '', "product_sn" character varying(64) NOT NULL DEFAULT '', "delete_status" integer NOT NULL DEFAULT '0', "publish_status" integer NOT NULL DEFAULT '0', "new_status" integer NOT NULL DEFAULT '0', "recommend_status" integer NOT NULL DEFAULT '0', "verify_status" integer NOT NULL DEFAULT '0', "sort" integer NOT NULL DEFAULT '0', "sale" integer NOT NULL DEFAULT '0', "price" numeric(10,2) NOT NULL, "promotion_price" numeric(10,2), "gift_growth" integer NOT NULL DEFAULT '0', "gift_point" integer NOT NULL DEFAULT '0', "use_point_limit" integer, "sub_title" character varying(255), "description" text, "original_price" numeric(10,2), "stock" integer NOT NULL DEFAULT '0', "low_stock" integer NOT NULL DEFAULT '0', "unit" character varying(16), "weight" numeric(10,2), "preview_status" integer NOT NULL DEFAULT '0', "service_ids" character varying(64), "keywords" character varying(255), "note" character varying(255), "album_pics" text, "detail_title" character varying(255), "detail_desc" text, "detail_html" text, "detail_mobile_html" text, "promotion_start_time" TIMESTAMP, "promotion_end_time" TIMESTAMP, "promotion_per_limit" integer, "promotion_type" integer NOT NULL DEFAULT '0', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_40caf1a865fba5c40d18e7c240e" PRIMARY KEY ("id")); COMMENT ON COLUMN "pms_product"."product_sn" IS '货号'; COMMENT ON COLUMN "pms_product"."delete_status" IS '删除状态：0->未删除；1->已删除'; COMMENT ON COLUMN "pms_product"."publish_status" IS '上架状态：0->下架；1->上架'; COMMENT ON COLUMN "pms_product"."new_status" IS '新品状态：0->不是新品；1->新品'; COMMENT ON COLUMN "pms_product"."recommend_status" IS '推荐状态：0->不推荐；1->推荐'; COMMENT ON COLUMN "pms_product"."verify_status" IS '审核状态：0->未审核；1->审核通过'; COMMENT ON COLUMN "pms_product"."promotion_per_limit" IS '活动限购数量'; COMMENT ON COLUMN "pms_product"."promotion_type" IS '促销类型：0-无优惠；1-特惠；2-会员价；3-阶梯价；4-满减'`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5191c9b35a2fb851d4f475f3f0" ON "pms_product" ("brand_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ac1466fcff5944750b31ccc30a" ON "pms_product" ("product_category_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "pms_product_vertify_record" ("id" SERIAL NOT NULL, "product_id" integer, "create_time" TIMESTAMP, "vertify_man" character varying(64), "status" integer, "detail" character varying(255), CONSTRAINT "PK_d9ba06ca8a044db41f3661a036c" PRIMARY KEY ("id")); COMMENT ON COLUMN "pms_product_vertify_record"."vertify_man" IS '审核人'; COMMENT ON COLUMN "pms_product_vertify_record"."detail" IS '反馈详情'`,
    );
    await queryRunner.query(
      `CREATE TABLE "oms_order_return_reason" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "name" character varying(100) NOT NULL, "sort" integer NOT NULL DEFAULT '0', "status" integer NOT NULL DEFAULT '1', CONSTRAINT "PK_5fa7026dc65d47462946024297b" PRIMARY KEY ("id")); COMMENT ON COLUMN "oms_order_return_reason"."status" IS '状态：0->不可用；1->可用'`,
    );
    await queryRunner.query(
      `CREATE TABLE "oms_order_return_apply" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "member_id" integer, "order_id" integer NOT NULL, "company_address_id" integer, "product_id" integer NOT NULL, "order_sn" character varying(64) NOT NULL DEFAULT '', "member_username" character varying(64) NOT NULL DEFAULT '', "return_amount" numeric(10,2) NOT NULL, "return_name" character varying(100) NOT NULL DEFAULT '', "return_phone" character varying(100) NOT NULL DEFAULT '', "status" integer NOT NULL DEFAULT '0', "handle_time" TIMESTAMP, "product_pic" text, "product_name" character varying(200) NOT NULL DEFAULT '', "product_brand" character varying(200), "product_attr" text, "product_count" integer NOT NULL DEFAULT '0', "product_price" numeric(10,2), "product_real_price" numeric(10,2), "reason" text, "description" text, "proof_pics" text, "handleNote" text, "handle_man" character varying(100), "receive_man" character varying(100), "receive_time" TIMESTAMP, "receive_note" text, CONSTRAINT "PK_d06f1a8ee381b5a7c717cfeea71" PRIMARY KEY ("id")); COMMENT ON COLUMN "oms_order_return_apply"."member_id" IS '会员 ID'; COMMENT ON COLUMN "oms_order_return_apply"."status" IS '申请状态：0->待处理；1->退货中；2->已完成；3->已拒绝'; COMMENT ON COLUMN "oms_order_return_apply"."reason" IS '申请原因'; COMMENT ON COLUMN "oms_order_return_apply"."description" IS '描述'; COMMENT ON COLUMN "oms_order_return_apply"."proof_pics" IS '凭证图片，以逗号隔开'; COMMENT ON COLUMN "oms_order_return_apply"."handleNote" IS '处理备注'`,
    );
    await queryRunner.query(
      `CREATE TABLE "oms_order_setting" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "flash_order_overtime" integer NOT NULL, "normal_order_overtime" integer NOT NULL, "confirm_overtime" integer NOT NULL, "finish_overtime" integer NOT NULL, "comment_overtime" integer NOT NULL, CONSTRAINT "PK_4cdb82a5ca7b1f970dec021b921" PRIMARY KEY ("id")); COMMENT ON COLUMN "oms_order_setting"."flash_order_overtime" IS '秒杀订单超时关闭时间(分)'; COMMENT ON COLUMN "oms_order_setting"."normal_order_overtime" IS '正常订单超时时间(分)'; COMMENT ON COLUMN "oms_order_setting"."confirm_overtime" IS '发货后自动确认收货时间（天）'; COMMENT ON COLUMN "oms_order_setting"."finish_overtime" IS '自动完成交易时间，不能申请售后（天）'; COMMENT ON COLUMN "oms_order_setting"."comment_overtime" IS '订单完成后自动好评时间（天）'`,
    );
    await queryRunner.query(
      `CREATE TABLE "oms_order_item" ("id" SERIAL NOT NULL, "order_id" integer, "order_sn" character varying(64), "product_id" integer, "product_pic" character varying(500), "product_name" character varying(200), "product_brand" character varying(200), "product_sn" character varying(64), "product_price" numeric(10,2), "product_quantity" integer, "product_sku_id" integer, "product_sku_code" character varying(50), "product_category_id" integer, "promotion_name" character varying(200), "promotion_amount" numeric(10,2), "coupon_amount" numeric(10,2), "integration_amount" numeric(10,2), "real_amount" numeric(10,2), "gift_integration" integer, "gift_growth" integer, "product_attr" character varying(500), CONSTRAINT "PK_ab852543426a6372eaf5261dd54" PRIMARY KEY ("id")); COMMENT ON COLUMN "oms_order_item"."order_id" IS '订单id'; COMMENT ON COLUMN "oms_order_item"."order_sn" IS '订单编号'; COMMENT ON COLUMN "oms_order_item"."product_price" IS '销售价格'; COMMENT ON COLUMN "oms_order_item"."product_quantity" IS '购买数量'; COMMENT ON COLUMN "oms_order_item"."product_sku_id" IS '商品sku编号'; COMMENT ON COLUMN "oms_order_item"."product_sku_code" IS '商品sku条码'; COMMENT ON COLUMN "oms_order_item"."product_category_id" IS '商品分类id'; COMMENT ON COLUMN "oms_order_item"."promotion_name" IS '商品促销名称'; COMMENT ON COLUMN "oms_order_item"."promotion_amount" IS '商品促销分解金额'; COMMENT ON COLUMN "oms_order_item"."coupon_amount" IS '优惠券优惠分解金额'; COMMENT ON COLUMN "oms_order_item"."integration_amount" IS '积分优惠分解金额'; COMMENT ON COLUMN "oms_order_item"."real_amount" IS '该商品经过优惠后的分解金额'; COMMENT ON COLUMN "oms_order_item"."product_attr" IS '商品销售属性'`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_82cf3816ad68f1de45df078d3e" ON "oms_order_item" ("order_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a59fcfbd27938ef11335336409" ON "oms_order_item" ("product_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "oms_order_operate_history" ("id" SERIAL NOT NULL, "order_id" integer, "operate_man" character varying(100), "create_time" TIMESTAMP, "order_status" integer, "note" character varying(500), CONSTRAINT "PK_e670ca6cb253d7f4503d6352c6a" PRIMARY KEY ("id")); COMMENT ON COLUMN "oms_order_operate_history"."order_id" IS '订单id'; COMMENT ON COLUMN "oms_order_operate_history"."operate_man" IS '操作人：用户；系统；后台管理员'; COMMENT ON COLUMN "oms_order_operate_history"."create_time" IS '操作时间'; COMMENT ON COLUMN "oms_order_operate_history"."order_status" IS '订单状态：0->待付款；1->待发货；2->已发货；3->已完成；4->已关闭；5->无效订单'; COMMENT ON COLUMN "oms_order_operate_history"."note" IS '备注'`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e747b8cf5d2fb0d350d77cbc2f" ON "oms_order_operate_history" ("order_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "oms_order" ("id" SERIAL NOT NULL, "member_id" integer NOT NULL, "member_username" character varying(64) NOT NULL DEFAULT '', "coupon_id" integer, "order_sn" character varying(64) NOT NULL, "total_amount" numeric(10,2) NOT NULL, "pay_amount" numeric(10,2), "freight_amount" numeric(10,2) NOT NULL DEFAULT '0', "promotion_amount" numeric(10,2) NOT NULL DEFAULT '0', "coupon_amount" numeric(10,2) NOT NULL DEFAULT '0', "integration_amount" numeric(10,2) NOT NULL DEFAULT '0', "payType" integer NOT NULL DEFAULT '1', "sourceType" integer NOT NULL DEFAULT '1', "status" smallint NOT NULL DEFAULT '0', "confirmStatus" smallint NOT NULL DEFAULT '0', "receiver_name" character varying(100) NOT NULL DEFAULT '', "receiver_phone" character varying(32) NOT NULL DEFAULT '', "receiver_post_code" character varying(32) NOT NULL DEFAULT '', "receiver_province" character varying(32) NOT NULL DEFAULT '', "receiver_city" character varying(32) NOT NULL DEFAULT '', "receiver_region" character varying(32) NOT NULL DEFAULT '', "receiver_detail_address" character varying(200) NOT NULL DEFAULT '', "note" text, "order_type" integer NOT NULL DEFAULT '0', "integration" integer NOT NULL DEFAULT '0', "growth" integer NOT NULL DEFAULT '0', "use_integration" integer, "auto_confirm_day" integer, "delete_status" integer NOT NULL DEFAULT '0', "delivery_company" character varying(64), "delivery_sn" character varying(64), "payment_time" TIMESTAMP, "delivery_time" TIMESTAMP, "receive_time" TIMESTAMP, "comment_time" TIMESTAMP, "modify_time" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_586fa961f7f4de11c4b3e15cb37" UNIQUE ("order_sn"), CONSTRAINT "PK_941d5ceeabc7ca05f9df1677b3a" PRIMARY KEY ("id")); COMMENT ON COLUMN "oms_order"."order_sn" IS '订单号'; COMMENT ON COLUMN "oms_order"."total_amount" IS '订单总金额'; COMMENT ON COLUMN "oms_order"."pay_amount" IS '应付金额'; COMMENT ON COLUMN "oms_order"."freight_amount" IS '运费'; COMMENT ON COLUMN "oms_order"."promotion_amount" IS '促销优化金额'; COMMENT ON COLUMN "oms_order"."coupon_amount" IS '优惠券抵扣金额'; COMMENT ON COLUMN "oms_order"."integration_amount" IS '积分抵扣金额'; COMMENT ON COLUMN "oms_order"."payType" IS '支付方式：0->未支付；1->支付宝；2->微信'; COMMENT ON COLUMN "oms_order"."sourceType" IS '订单来源：0->PC订单；1->app订单'; COMMENT ON COLUMN "oms_order"."status" IS '订单状态'; COMMENT ON COLUMN "oms_order"."confirmStatus" IS '确认收货状态：0->未确认；1->已确认'; COMMENT ON COLUMN "oms_order"."receiver_name" IS '收货人姓名'; COMMENT ON COLUMN "oms_order"."receiver_phone" IS '收货人手机号'; COMMENT ON COLUMN "oms_order"."receiver_post_code" IS '邮政编码'; COMMENT ON COLUMN "oms_order"."receiver_province" IS '省份'; COMMENT ON COLUMN "oms_order"."receiver_city" IS '城市'; COMMENT ON COLUMN "oms_order"."receiver_region" IS '区'; COMMENT ON COLUMN "oms_order"."receiver_detail_address" IS '详细地址'; COMMENT ON COLUMN "oms_order"."note" IS '订单备注'; COMMENT ON COLUMN "oms_order"."order_type" IS '订单类型：0->正常订单；1->秒杀订单'; COMMENT ON COLUMN "oms_order"."integration" IS '可获得的积分'; COMMENT ON COLUMN "oms_order"."growth" IS '可获得的成长值'; COMMENT ON COLUMN "oms_order"."use_integration" IS '下单时使用的积分'; COMMENT ON COLUMN "oms_order"."auto_confirm_day" IS '自动确认时间（天）'; COMMENT ON COLUMN "oms_order"."delete_status" IS '删除状态：0->未删除；1->已删除'; COMMENT ON COLUMN "oms_order"."delivery_company" IS '物流公司（配送方式）'; COMMENT ON COLUMN "oms_order"."delivery_sn" IS '物流单号'`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_0bc266f8f368d1c916ffd0238e" ON "oms_order" ("member_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_586fa961f7f4de11c4b3e15cb3" ON "oms_order" ("order_sn") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_7254e05367ab1778df24dd1e15" ON "oms_order" ("status", "created_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_61e08d95a8e16076ca30970893" ON "oms_order" ("member_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TABLE "oms_company_address" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "address_name" character varying(200) NOT NULL, "send_status" integer NOT NULL DEFAULT '0', "receive_status" integer NOT NULL DEFAULT '0', "name" character varying(100) NOT NULL, "phone" character varying(64) NOT NULL, "province" character varying(100) NOT NULL, "city" character varying(100) NOT NULL, "region" character varying(100) NOT NULL, "detail_address" character varying(200) NOT NULL, CONSTRAINT "PK_b2be677aa395a6aed2bad23cf77" PRIMARY KEY ("id")); COMMENT ON COLUMN "oms_company_address"."address_name" IS '地址名称'; COMMENT ON COLUMN "oms_company_address"."send_status" IS '默认发货地址：0->否；1->是'; COMMENT ON COLUMN "oms_company_address"."receive_status" IS '是否默认收货地址：0->否；1->是'; COMMENT ON COLUMN "oms_company_address"."name" IS '收发货人姓名'; COMMENT ON COLUMN "oms_company_address"."phone" IS '收货人手机号'; COMMENT ON COLUMN "oms_company_address"."province" IS '省/直辖市'; COMMENT ON COLUMN "oms_company_address"."city" IS '市'; COMMENT ON COLUMN "oms_company_address"."region" IS '区'; COMMENT ON COLUMN "oms_company_address"."detail_address" IS '详细地址'`,
    );
    await queryRunner.query(
      `CREATE TABLE "cms_subject" ("id" SERIAL NOT NULL, "category_id" integer, "title" character varying(200), "pic" character varying(500), "product_count" integer NOT NULL DEFAULT '0', "recommend_status" integer NOT NULL DEFAULT '0', "create_time" TIMESTAMP, "collect_count" integer NOT NULL DEFAULT '0', "read_count" integer NOT NULL DEFAULT '0', "comment_count" integer NOT NULL DEFAULT '0', "album_pics" text, "description" character varying(1000), "show_status" integer NOT NULL DEFAULT '0', "forward_count" integer NOT NULL DEFAULT '0', "category_name" character varying(200), "content" text, CONSTRAINT "PK_a933a972e2037e0a62913b1c9fe" PRIMARY KEY ("id")); COMMENT ON COLUMN "cms_subject"."pic" IS '专题主图'; COMMENT ON COLUMN "cms_subject"."product_count" IS '关联产品数量'; COMMENT ON COLUMN "cms_subject"."album_pics" IS '画册图片用逗号分割'; COMMENT ON COLUMN "cms_subject"."show_status" IS '显示状态：0->不显示；1->显示'; COMMENT ON COLUMN "cms_subject"."forward_count" IS '转发数'; COMMENT ON COLUMN "cms_subject"."category_name" IS '专题分类名称'`,
    );
    await queryRunner.query(
      `CREATE TABLE "cms_subject_product_relation" ("id" SERIAL NOT NULL, "subject_id" integer, "product_id" integer, CONSTRAINT "PK_dc907b5a5ccb161dddab90e8c0a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "cms_prefrence_area" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "name" character varying(255), "sub_title" character varying(255), "sort" integer NOT NULL DEFAULT '0', "show_status" integer NOT NULL DEFAULT '0', "pic" character varying(500), CONSTRAINT "PK_eb0df1c587d21d8f96c8790aa7f" PRIMARY KEY ("id")); COMMENT ON COLUMN "cms_prefrence_area"."pic" IS '展示图片'`,
    );
    await queryRunner.query(
      `CREATE TABLE "cms_prefrence_area_product_relation" ("id" SERIAL NOT NULL, "prefrence_area_id" integer, "product_id" integer, CONSTRAINT "PK_34e01d67df99ea1d8e29f3ad518" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "pms_product_category_closure" ("id_ancestor" integer NOT NULL, "id_descendant" integer NOT NULL, CONSTRAINT "PK_e6e3d69917c1dba51b300296c9e" PRIMARY KEY ("id_ancestor", "id_descendant"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_f302e692ed429355a095af112c" ON "pms_product_category_closure" ("id_ancestor") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9adab890a65943c2e6852fd2c7" ON "pms_product_category_closure" ("id_descendant") `,
    );
    await queryRunner.query(
      `ALTER TABLE "pms_product_category" ADD CONSTRAINT "FK_93025099d9a56ef7b137ad1b13d" FOREIGN KEY ("parentId") REFERENCES "pms_product_category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "pms_product_category_closure" ADD CONSTRAINT "FK_f302e692ed429355a095af112c6" FOREIGN KEY ("id_ancestor") REFERENCES "pms_product_category"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "pms_product_category_closure" ADD CONSTRAINT "FK_9adab890a65943c2e6852fd2c77" FOREIGN KEY ("id_descendant") REFERENCES "pms_product_category"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "pms_product_category_closure" DROP CONSTRAINT "FK_9adab890a65943c2e6852fd2c77"`,
    );
    await queryRunner.query(
      `ALTER TABLE "pms_product_category_closure" DROP CONSTRAINT "FK_f302e692ed429355a095af112c6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "pms_product_category" DROP CONSTRAINT "FK_93025099d9a56ef7b137ad1b13d"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_9adab890a65943c2e6852fd2c7"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_f302e692ed429355a095af112c"`,
    );
    await queryRunner.query(`DROP TABLE "pms_product_category_closure"`);
    await queryRunner.query(`DROP TABLE "cms_prefrence_area_product_relation"`);
    await queryRunner.query(`DROP TABLE "cms_prefrence_area"`);
    await queryRunner.query(`DROP TABLE "cms_subject_product_relation"`);
    await queryRunner.query(`DROP TABLE "cms_subject"`);
    await queryRunner.query(`DROP TABLE "oms_company_address"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_61e08d95a8e16076ca30970893"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_7254e05367ab1778df24dd1e15"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_586fa961f7f4de11c4b3e15cb3"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_0bc266f8f368d1c916ffd0238e"`,
    );
    await queryRunner.query(`DROP TABLE "oms_order"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e747b8cf5d2fb0d350d77cbc2f"`,
    );
    await queryRunner.query(`DROP TABLE "oms_order_operate_history"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a59fcfbd27938ef11335336409"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_82cf3816ad68f1de45df078d3e"`,
    );
    await queryRunner.query(`DROP TABLE "oms_order_item"`);
    await queryRunner.query(`DROP TABLE "oms_order_setting"`);
    await queryRunner.query(`DROP TABLE "oms_order_return_apply"`);
    await queryRunner.query(`DROP TABLE "oms_order_return_reason"`);
    await queryRunner.query(`DROP TABLE "pms_product_vertify_record"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ac1466fcff5944750b31ccc30a"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_5191c9b35a2fb851d4f475f3f0"`,
    );
    await queryRunner.query(`DROP TABLE "pms_product"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d90bf7b119fbbb030e2ac0dabe"`,
    );
    await queryRunner.query(`DROP TABLE "pms_member_price"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_0eafe49c901fa64d04dcc7d981"`,
    );
    await queryRunner.query(`DROP TABLE "pms_product_full_reduction"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e8f023b25b83221519822ff5d5"`,
    );
    await queryRunner.query(`DROP TABLE "pms_product_ladder"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_1215beedb5b184f8c949f3fa5f"`,
    );
    await queryRunner.query(`DROP TABLE "pms_product_attribute_value"`);
    await queryRunner.query(`DROP TABLE "pms_brand"`);
    await queryRunner.query(`DROP TABLE "pms_product_attribute_category"`);
    await queryRunner.query(`DROP TABLE "pms_product_attribute"`);
    await queryRunner.query(
      `DROP TABLE "pms_product_category_attribute_relation"`,
    );
    await queryRunner.query(`DROP TABLE "pms_product_category"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e98f1397dc7c3081bc210578c7"`,
    );
    await queryRunner.query(`DROP TABLE "pms_sku_stock"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_0baa29f5e6140e753f7b2310b7"`,
    );
    await queryRunner.query(`DROP TABLE "ums_member_brand_attention"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_cart_member_sku_active"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_05626f6150bd52d76b8216ca48"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_92a3d291f00f228c3498831340"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_1b424188ac02acc9bb15053606"`,
    );
    await queryRunner.query(`DROP TABLE "oms_cart_item"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_99f63a1042d7caf88b1dcd0423"`,
    );
    await queryRunner.query(`DROP TABLE "ums_member_product_collection"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_5446c83f23194e8b4d95345968"`,
    );
    await queryRunner.query(`DROP TABLE "ums_member_receive_address"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_1fcb4fab319f3a1ca3eaccc5d4"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a96be685cea3d1138ae20632f3"`,
    );
    await queryRunner.query(`DROP TABLE "ums_member"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_cd982101943de22b451de06084"`,
    );
    await queryRunner.query(`DROP TABLE "ums_member_product_history"`);
    await queryRunner.query(`DROP TABLE "sms_coupon"`);
    await queryRunner.query(
      `DROP TABLE "sms_coupon_product_category_relation"`,
    );
    await queryRunner.query(`DROP TABLE "sms_coupon_product_relation"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_57f66b8a50749155022a0af034"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_77682e5f1e199be0d64eb143ea"`,
    );
    await queryRunner.query(`DROP TABLE "sms_coupon_history"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b5f1b11ac4024dbca9218acd29"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_126c65354183caab8da97938ce"`,
    );
    await queryRunner.query(
      `DROP TABLE "sms_flash_promotion_product_relation"`,
    );
    await queryRunner.query(`DROP TABLE "sms_flash_promotion_session"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_5191951252d879a6e00aa442e9"`,
    );
    await queryRunner.query(`DROP TABLE "sms_flash_promotion"`);
    await queryRunner.query(`DROP TABLE "sms_home_hot_product"`);
    await queryRunner.query(`DROP TABLE "sms_home_new_product"`);
    await queryRunner.query(`DROP TABLE "sms_home_subject"`);
    await queryRunner.query(`DROP TABLE "sms_home_brand"`);
    await queryRunner.query(`DROP TABLE "sms_home_advertise"`);
    await queryRunner.query(`DROP TABLE "sms_home_recommend_subject"`);
    await queryRunner.query(`DROP TABLE "ums_menu"`);
    await queryRunner.query(`DROP TABLE "ums_resource_category"`);
    await queryRunner.query(`DROP TABLE "ums_resource"`);
    await queryRunner.query(`DROP TABLE "ums_role"`);
    await queryRunner.query(`DROP TABLE "ums_role_menu_relation"`);
    await queryRunner.query(`DROP TABLE "ums_role_resource_relation"`);
    await queryRunner.query(`DROP TABLE "ums_admin_login_log"`);
    await queryRunner.query(`DROP TABLE "ums_admin_role_relation"`);
    await queryRunner.query(`DROP TABLE "ums_admin"`);
    await queryRunner.query(`DROP TABLE "ums_integration_consume_setting"`);
    await queryRunner.query(`DROP TABLE "ums_member_level"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_6a649d390ad11a510689acbd45"`,
    );
    await queryRunner.query(`DROP TABLE "auth_session"`);
  }
}
