# Mall → NestJS 迁移计划（完整版）

> 基于对 Java 源码 (`/Users/sunweijie/workspace/github/mall`) 的完整阅读整理。
> 每个任务标注【前置依赖】，确保开发顺序正确。

---

## 关键技术决策（偏离 Java 原版的地方）

| 问题 | Java 原版 | NestJS 方案 | 理由 |
|------|-----------|-------------|------|
| 动态资源权限 | Spring Security Filter + DynamicSecurityMetadataSource | NestJS `ResourceGuard`（Guard + AntPathMatcher） | 功能等价，实现更简洁 |
| 会员关注/收藏/浏览记录 | MongoDB Repository | **MySQL 表**（新增3张表） | 避免引入 MongoDB，降低部署复杂度 |
| 延迟取消订单 | RabbitMQ 死信队列 | **BullMQ (Redis)** 延迟队列 | 无需额外中间件 |
| 短信验证码 | 阿里云短信 | Redis 存储 + 返回明文（开发期 mock） | 预留接口，生产接入 |
| Admin Token payload | `sub=username` | `sub=adminId, username, type='admin'` | 支持 id 直查，不需二次查库 |
| Member Token payload | `sub=username` | `sub=memberId, username, type='member'` | 同上 |
| Refresh Token 机制 | 同 Token 刷新（30分钟内返回原 token） | 保持相同逻辑 | 与前端兼容 |
| 管理员退出 | 清 Redis 用户缓存 | 将 token 加入 Redis 黑名单 + 清用户缓存 | 更安全 |

---

## P0 - 核心认证与权限基础

### Task P0-1: Auth 模块完整实现

**文件**: `src/core/auth/`
**前置**: 无
**Java 对应**: `UmsAdminServiceImpl.login()`, `UmsMemberServiceImpl.login()`, `JwtTokenUtil`

#### P0-1a: JWT 策略与 Guard

- [ ] 新建 `src/core/auth/strategies/jwt.strategy.ts`
  - 从 Authorization header 提取 Bearer token
  - 验证 token 未过期 && 未在 Redis 黑名单中
  - payload 解析: `{ sub: number, username: string, type: 'admin' | 'member' }`
  - 挂到 request.user

- [ ] 新建 `src/core/auth/guards/jwt-auth.guard.ts`
  - 继承 AuthGuard('jwt')
  - 检查路由是否有 `@Public()` 装饰器，有则跳过认证

- [ ] 新建 `src/core/auth/decorators/public.decorator.ts`
  - `@Public()` 元数据装饰器

- [ ] 新建 `src/core/auth/decorators/current-user.decorator.ts`
  - `@CurrentUser()` 从 request.user 取当前登录用户

- [ ] 在 `app.module.ts` 全局注册 `APP_GUARD` → `JwtAuthGuard`

#### P0-1b: Admin 认证

**接口清单** (对应 Java `/admin/*`):

| 接口 | HTTP | Java 对应 |
|------|------|-----------|
| `POST /admin/login` | 公开 | `UmsAdminServiceImpl.login()` |
| `POST /admin/register` | 公开 | `UmsAdminServiceImpl.register()` |
| `GET /admin/info` | 需认证 | `UmsAdminController.getAdminInfo()` |
| `POST /admin/logout` | 需认证 | `UmsAdminServiceImpl.logout()` |
| `GET /admin/refreshToken` | 需认证 | `UmsAdminServiceImpl.refreshToken()` |

**AuthService.adminLogin() 实现逻辑**:
1. 查 `ums_admin` 表（先查 Redis 缓存 `mall:admin:{username}`）
2. bcrypt 验证密码
3. 检查 `status == 1`（否则抛 UnauthorizedException）
4. 签发 JWT: `{ sub: admin.id, username, type: 'admin' }`，exp = 配置的 expiration
5. 写入登录日志 `ums_admin_login_log`（记录 IP、时间）
6. 返回 `{ token, tokenHead: 'Bearer' }`

**AuthService.getAdminInfo() 实现逻辑**:
- 根据 JWT payload 中的 `adminId` 查管理员信息
- 查角色列表（`ums_admin_role_relation` → `ums_role`）
- 查菜单列表（`ums_role_menu_relation` → `ums_menu`，联表递归树）
- 返回 `{ username, icon, roles, menus }`

**AuthService.adminLogout() 实现逻辑**:
- 将当前 token 加入 Redis 黑名单: `SET mall:token_blacklist:{token} 1 EX {剩余过期秒数}`
- 清除用户 Redis 缓存: `DEL mall:admin:{username}`, `DEL mall:resourceList:{adminId}`

**AuthService.refreshToken() 实现逻辑**:
- 提取 token（去掉 tokenHead 前缀）
- 解析 claims，如已过期返回 null
- 如果 30 分钟内刚刷新过（`created` claim 距现在 < 30min），返回原 token
- 否则重新签发，更新 `created`

#### P0-1c: Member（Portal）认证

**接口清单** (对应 Java `/sso/*`):

| 接口 | HTTP | Java 对应 |
|------|------|-----------|
| `POST /sso/login` | 公开 | `UmsMemberServiceImpl.login()` |
| `POST /sso/register` | 公开 | `UmsMemberServiceImpl.register()` |
| `GET /sso/info` | 需认证 | `UmsMemberController.info()` |
| `GET /sso/getAuthCode` | 公开 | `UmsMemberServiceImpl.generateAuthCode()` |
| `POST /sso/updatePassword` | 公开 | `UmsMemberServiceImpl.updatePassword()` |
| `GET /sso/refreshToken` | 需认证 | `UmsMemberServiceImpl.refreshToken()` |

**MemberService.register() 实现逻辑**:
1. 验证短信验证码: `GET mall:authCode:{telephone}` from Redis，对比
2. 查重: username 或 phone 已存在则失败
3. 查默认会员等级 `ums_member_level WHERE default_status=1`
4. 插入 `ums_member`（status=1, bcrypt密码）
5. 写缓存

**MemberService.generateAuthCode() 实现逻辑**:
- 生成6位随机数字
- `SET mall:authCode:{telephone} {code} EX 900`（15分钟）
- 返回 code（开发期明文返回，生产接短信SDK）

---

### Task P0-2: 动态资源权限 Guard

**文件**: `src/core/auth/guards/resource.guard.ts`
**前置**: P0-1a (JwtAuthGuard 已全局注册)
**Java 对应**: `DynamicSecurityFilter` + `DynamicSecurityMetadataSource` + `DynamicAccessDecisionManager`

**逻辑**:
1. 只对 `type='admin'` 的请求生效（member 请求跳过）
2. 从 Redis 或内存加载所有资源规则 `Map<urlPattern, resourceId:name>`
   - 数据来源: `SELECT url, id, name FROM ums_resource`
   - Redis key: `mall:resourceList:all`（整个资源表缓存）
3. 用 AntPathMatcher 匹配当前请求路径 → 得到 needResourceId
4. 若路径未在资源表中配置，**放行**（与 Java 一致）
5. 查当前 admin 的资源列表（先 Redis: `mall:resourceList:{adminId}`，无则查库）
   - SQL: `ums_admin_role_relation` JOIN `ums_role_resource_relation` JOIN `ums_resource`
6. 对比: 当前 admin 的资源列表中是否包含 needResourceId → 无则 403

**缓存失效时机**（与 Java UmsAdminCacheServiceImpl 保持一致）:
- 修改资源时: 清 `mall:resourceList:all` + 清受影响 admin 的 `mall:resourceList:{adminId}`
- 修改角色资源时: 清该角色下所有 admin 的 `mall:resourceList:{adminId}`
- 删除/修改 admin 角色时: 清该 admin 的 `mall:resourceList:{adminId}`

**新建 `src/core/auth/services/admin-cache.service.ts`**（封装上述 Redis 操作）

---

### Task P0-3: 补全缺失 Entity

**前置**: 无（可与 P0-1 并行）
**说明**: 以下 Entity 缺失，无法完成 Service 实现

#### UMS 相关
- [ ] `UmsAdminLoginLogEntity` → `ums_admin_login_log`
- [ ] `UmsAdminRoleRelationEntity` → `ums_admin_role_relation`
- [ ] `UmsRoleMenuRelationEntity` → `ums_role_menu_relation`
- [ ] `UmsRoleResourceRelationEntity` → `ums_role_resource_relation`
- [ ] `UmsMemberLevelEntity` → `ums_member_level`
- [ ] `UmsMemberReceiveAddressEntity` → `ums_member_receive_address`

#### PMS 相关
- [ ] `PmsProductAttributeValueEntity` → `pms_product_attribute_value`
- [ ] `PmsProductLadderEntity` → `pms_product_ladder`
- [ ] `PmsProductFullReductionEntity` → `pms_product_full_reduction`
- [ ] `PmsMemberPriceEntity` → `pms_member_price`
- [ ] `PmsProductOperateLogEntity` → `pms_product_operate_log`
- [ ] `PmsProductVertifyRecordEntity` → `pms_product_vertify_record`
- [ ] `PmsProductAttributeCategoryEntity` → `pms_product_attribute_category`（当前只有 attr，缺 category）

#### OMS 相关
- [ ] `OmsOrderItemEntity` → `oms_order_item`
- [ ] `OmsOrderOperateHistoryEntity` → `oms_order_operate_history`

#### SMS 相关
- [ ] `SmsFlashPromotionSessionEntity` → `sms_flash_promotion_session`
- [ ] `SmsFlashPromotionProductRelationEntity` → `sms_flash_promotion_product_relation`
- [ ] `SmsHomeAdvertiseEntity` → `sms_home_advertise`
- [ ] `SmsHomeBrandEntity` → `sms_home_brand`
- [ ] `SmsHomeNewProductEntity` → `sms_home_new_product`
- [ ] `SmsHomeRecommendProductEntity` → `sms_home_recommend_product`
- [ ] `SmsHomeRecommendSubjectEntity` → `sms_home_recommend_subject`
- [ ] `SmsCouponHistoryEntity` → `sms_coupon_history`
- [ ] `SmsCouponProductRelationEntity` → `sms_coupon_product_relation`
- [ ] `SmsCouponProductCategoryRelationEntity` → `sms_coupon_product_category_relation`

#### CMS 相关（全新模块）
- [ ] `CmsSubjectEntity` → `cms_subject`
- [ ] `CmsSubjectProductRelationEntity` → `cms_subject_product_relation`
- [ ] `CmsPrefrenceAreaEntity` → `cms_prefrence_area`
- [ ] `CmsPrefrenceAreaProductRelationEntity` → `cms_prefrence_area_product_relation`

#### Portal 相关（MySQL 替代 MongoDB）
- [ ] `MemberBrandAttentionEntity` → `member_brand_attention`（新建表）
- [ ] `MemberProductCollectionEntity` → `member_product_collection`（新建表）
- [ ] `MemberReadHistoryEntity` → `member_read_history`（新建表）

#### Portal 订单相关
- [ ] `UmsIntegrationConsumeSettingEntity` → `ums_integration_consume_setting`
- [ ] `SmsCouponHistoryEntity`（上方已列）

---

## P1 - UMS 管理后台

### Task P1-1: AdminUser 完整实现

**前置**: P0-1b, P0-2, P0-3
**路由前缀**: `/admin`
**Java 对应**: `UmsAdminController` + `UmsAdminServiceImpl`

| 接口 | 方法 | 说明 |
|------|------|------|
| `GET /admin/list` | 分页查询 | keyword 模糊匹配 username/nickname |
| `GET /admin/:id` | 获取详情 | - |
| `POST /admin/update/:id` | 更新信息 | 密码字段：与原密码相同则不更新；不同则重新加密 |
| `POST /admin/delete/:id` | 删除 | 清 Redis 缓存 |
| `POST /admin/updateStatus/:id` | 更新状态 | status 字段 |
| `POST /admin/updatePassword` | 修改密码 | 验证旧密码 |
| `POST /admin/role/update` | 分配角色 | 先删后插 + 清缓存 |
| `GET /admin/role/:adminId` | 获取角色列表 | - |

---

### Task P1-2: AdminRole 完整实现

**前置**: P0-3
**路由前缀**: `/role`
**Java 对应**: `UmsRoleController` + `UmsRoleServiceImpl`

| 接口 | 方法 | 说明 |
|------|------|------|
| `POST /role/create` | 创建角色 | adminCount=0, sort=0, createTime |
| `POST /role/update/:id` | 更新角色 | - |
| `POST /role/delete` | 批量删除 | 清该角色下所有 admin 的资源缓存 |
| `GET /role/listAll` | 全部角色 | 不分页 |
| `GET /role/list` | 分页查询 | keyword 筛选 |
| `POST /role/updateStatus/:id` | 更新状态 | - |
| `GET /role/listMenu/:roleId` | 角色菜单 | - |
| `GET /role/listResource/:roleId` | 角色资源 | - |
| `POST /role/allocMenu` | 分配菜单 | 先删后插 |
| `POST /role/allocResource` | 分配资源 | 先删后插 + 清缓存 |

---

### Task P1-3: AdminMenu 完整实现

**前置**: P0-3
**路由前缀**: `/menu`
**Java 对应**: `UmsMenuController` + `UmsMenuServiceImpl`

| 接口 | 方法 | 说明 |
|------|------|------|
| `POST /menu/create` | 创建菜单 | 自动计算 level（parentId=0 则 level=0，否则 level=parent.level+1） |
| `POST /menu/update/:id` | 更新菜单 | 同样更新 level |
| `GET /menu/:id` | 获取详情 | - |
| `POST /menu/delete/:id` | 删除菜单 | - |
| `GET /menu/list/:parentId` | 分页查询 | 按 parentId 过滤 |
| `GET /menu/treeList` | 树形列表 | 全量查询后递归组装树 |
| `POST /menu/updateHidden/:id` | 修改显隐 | - |

---

### Task P1-4: AdminResource + ResourceCategory 完整实现

**前置**: P0-2, P0-3
**路由前缀**: `/resource`, `/resourceCategory`
**Java 对应**: `UmsResourceController` + `UmsResourceCategoryController`

Resource 接口:
| 接口 | 方法 | 说明 |
|------|------|------|
| `POST /resource/create` | 创建 | 清全局资源缓存 `mall:resourceList:all` |
| `POST /resource/update/:id` | 更新 | 清全局缓存 + 清受影响 admin 缓存 |
| `GET /resource/:id` | 获取详情 | - |
| `POST /resource/delete/:id` | 删除 | 清缓存 |
| `GET /resource/list` | 分页查询 | categoryId / nameKeyword / urlKeyword 过滤 |
| `GET /resource/listAll` | 全量 | 不分页 |

ResourceCategory 接口:
| 接口 | 方法 | 说明 |
|------|------|------|
| `POST /resourceCategory/create` | 创建 | - |
| `POST /resourceCategory/update/:id` | 更新 | - |
| `POST /resourceCategory/delete/:id` | 删除 | - |
| `GET /resourceCategory/listAll` | 全量 | 按 sort desc |

---

## P2 - PMS 商品管理

### Task P2-1: Brand 完整实现

**前置**: P0-2
**Java 对应**: `PmsBrandController` + `PmsBrandServiceImpl`

| 接口 | 方法 | 说明 |
|------|------|------|
| `POST /brand/create` | 创建 | - |
| `POST /brand/update/:id` | 更新 | - |
| `POST /brand/delete` | 批量删除 | ids 数组 |
| `GET /brand/list` | 分页查询 | keyword 过滤 |
| `GET /brand/listAll` | 全量 | - |
| `GET /brand/:id` | 详情 | - |
| `POST /brand/update/showStatus` | 批量更新显示状态 | ids + showStatus |
| `POST /brand/update/factoryStatus` | 批量更新厂家制造商 | ids + factoryStatus |

---

### Task P2-2: ProductCategory 完整实现

**前置**: P0-3（需要 ProductAttributeCategoryEntity）
**Java 对应**: `PmsProductCategoryController` + `PmsProductCategoryServiceImpl`

| 接口 | 方法 | 说明 |
|------|------|------|
| `POST /productCategory/create` | 创建 | 若 parentId=0 则 level=0，否则 level=parent+1；若是一级分类需写入 pms_product_category_attribute_relation |
| `POST /productCategory/update/:id` | 更新 | 同上 |
| `POST /productCategory/delete/:id` | 删除 | - |
| `GET /productCategory/list/:parentId` | 分页列表 | - |
| `GET /productCategory/withChildren` | 含子分类列表 | 树形结构（ProductCategoryWithChildrenItem） |
| `GET /productCategory/:id` | 详情 | - |
| `POST /productCategory/update/navStatus` | 批量更新导航显示 | - |
| `POST /productCategory/update/showStatus` | 批量更新显示状态 | - |

---

### Task P2-3: ProductAttr + AttrCategory 完整实现

**前置**: P0-3
**Java 对应**: `PmsProductAttributeController` + `PmsProductAttributeCategoryController`

ProductAttr 接口:
| 接口 | 方法 | 说明 |
|------|------|------|
| `POST /productAttribute/create` | 创建 | 根据 type 字段区分属性/参数 |
| `POST /productAttribute/update/:id` | 更新 | - |
| `POST /productAttribute/delete` | 批量删除 | ids |
| `GET /productAttribute/list/:cid` | 按分类分页查询 | type 过滤（0=规格,1=参数） |
| `GET /productAttribute/:id` | 详情 | - |
| `GET /productAttribute/category/list` | 分类+属性列表 | 返回 ProductAttributeCategoryItem（含 productAttributeList） |

ProductAttrCategory 接口:
| 接口 | 方法 | 说明 |
|------|------|------|
| `POST /productAttributeCategory/create` | 创建 | - |
| `POST /productAttributeCategory/update/:id` | 更新 | - |
| `POST /productAttributeCategory/delete/:id` | 删除 | - |
| `GET /productAttributeCategory/list` | 分页查询 | - |
| `GET /productAttributeCategory/listWithAttr` | 含属性的列表 | - |

---

### Task P2-4: Product 完整实现（最复杂）

**前置**: P0-3（需要全部 PMS 相关 Entity）, P2-2, P2-3
**Java 对应**: `PmsProductController` + `PmsProductServiceImpl`

**接口清单**:
| 接口 | 方法 | 说明 |
|------|------|------|
| `POST /product/create` | 创建商品 | 7表事务（见下方详细说明） |
| `GET /product/updateInfo/:id` | 获取编辑信息 | 联表查询完整商品数据 |
| `POST /product/update/:id` | 更新商品 | 先删后插子表数据 |
| `GET /product/list` | 分页查询 | 多条件过滤 |
| `GET /product/simpleList` | 简单列表 | keyword 模糊，只返回 id/name/pic |
| `POST /product/update/verifyStatus` | 批量审核 | 写入操作日志 |
| `POST /product/update/publishStatus` | 批量上下架 | - |
| `POST /product/update/recommendStatus` | 批量推荐 | - |
| `POST /product/update/newStatus` | 批量设新品 | - |
| `POST /product/update/deleteStatus` | 批量软删除 | - |

**create() 事务写入顺序**（使用 `DataSource.transaction()`）:
1. 插入 `pms_product`（获取自增 id）
2. 批量插入 `pms_sku_stock`（自动生成 skuCode: yyyyMMdd + 4位productId + 3位序号）
3. 批量插入 `pms_product_attribute_value`
4. 批量插入 `pms_product_ladder`（阶梯价，若有）
5. 批量插入 `pms_product_full_reduction`（满减，若有）
6. 批量插入 `pms_member_price`（会员价，若有）
7. 批量插入 `cms_subject_product_relation`（专题关联，若有）
8. 批量插入 `cms_prefrence_area_product_relation`（优选区域，若有）

**update() 事务逻辑**（先删后插子表）:
- SKU 处理特殊: 有 id 的保留更新，无 id 的新增，原有但不在列表中的删除

**getUpdateInfo() 联表查询**:
- 返回 `ProductResult` 包含: product + skuStockList + productAttributeValueList + memberPriceList + productLadderList + productFullReductionList + subjectProductRelationList + prefrenceAreaProductRelationList

---

### Task P2-5: SkuStock 完整实现

**前置**: P0-3
**Java 对应**: `PmsSkuStockController`

| 接口 | 方法 | 说明 |
|------|------|------|
| `GET /sku/stock/:pid` | 按商品ID查询 | keyword 筛选 skuCode/spData |
| `POST /sku/stock/update` | 批量更新 | list 直接 save |

---

## P3 - OMS 订单管理（Admin 侧）

### Task P3-1: Order Admin 完整实现

**前置**: P0-3
**路由前缀**: `/order`（Admin 侧）
**Java 对应**: `OmsOrderController` + `OmsOrderServiceImpl`

| 接口 | 方法 | 说明 |
|------|------|------|
| `GET /order/list` | 分页查询 | orderSn/status/timeRange/receiverKeyword/billType 过滤 |
| `POST /order/update/delivery` | 批量发货 | 写快递单号，更新状态=2（已发货），写操作记录 |
| `POST /order/update/close` | 批量关闭 | 更新状态=4，写操作记录，释放库存 |
| `POST /order/delete` | 批量删除 | delete_status=1（已关闭才能删） |
| `GET /order/:id` | 订单详情 | 含 orderItemList + operateHistoryList |
| `POST /order/update/receiverInfo` | 修改收货信息 | 验证订单状态（只有待发货可改） |
| `POST /order/update/moneyInfo` | 修改费用信息 | freightAmount/discountAmount/integrationAmount/couponAmount |
| `POST /order/update/note` | 修改备注 | - |

---

### Task P3-2: ReturnApply Admin 完整实现

**前置**: P0-3
**Java 对应**: `OmsOrderReturnApplyController` + `OmsOrderReturnApplyServiceImpl`

| 接口 | 方法 | 说明 |
|------|------|------|
| `GET /returnApply/list` | 分页查询 | status/productName/handleMan/createTime 过滤 |
| `POST /returnApply/delete` | 批量删除 | ids |
| `GET /returnApply/:id` | 详情 | 返回 OmsOrderReturnApplyResult（含 orderItem 信息） |
| `POST /returnApply/update/status/:id` | 修改状态 | 0=待处理/1=退货中/2=已完成/3=已拒绝，写处理备注/人/时间 |

---

### Task P3-3: ReturnReason / OrderSetting / CompanyAddress

**前置**: P0-3（均为简单 CRUD，无复杂业务逻辑）

ReturnReason (`/returnReason`):
- create / update / delete(ids) / list / updateStatus

OrderSetting (`/orderSetting`):
- `GET /orderSetting/:id` 获取配置
- `POST /orderSetting/update/:id` 更新配置

CompanyAddress (`/companyAddress`):
- create / update / delete / list / getItem

---

## P4 - SMS 营销管理

### Task P4-1: Coupon 完整实现

**前置**: P0-3
**路由前缀**: `/coupon`
**Java 对应**: `SmsCouponController` + `SmsCouponHistoryController` + `SmsCouponServiceImpl`

| 接口 | 方法 | 说明 |
|------|------|------|
| `POST /coupon/create` | 创建优惠券 | 同时插入 product_relation / product_category_relation |
| `POST /coupon/delete/:id` | 删除 | 同时删关联表 |
| `POST /coupon/update/:id` | 更新 | 先删后插关联表 |
| `GET /coupon/list` | 分页查询 | name / type 过滤 |
| `GET /coupon/:id` | 详情 | 含关联商品/分类 |

CouponHistory (`/couponHistory`):
| 接口 | 方法 | 说明 |
|------|------|------|
| `GET /couponHistory/list` | 分页查询 | couponId / memberUsername / useStatus / orderSn 过滤 |

---

### Task P4-2: FlashPromotion 完整实现

**前置**: P0-3
**路由前缀**: `/flash`, `/flashSession`, `/flashProductRelation`
**Java 对应**: 三个控制器

FlashPromotion (`/flash`):
- create / update / delete / updateStatus / getItem / list(keyword)

FlashPromotionSession (`/flashSession`):
| 接口 | 方法 | 说明 |
|------|------|------|
| `POST /flashSession/create` | 创建场次 | - |
| `POST /flashSession/update/:id` | 更新场次 | - |
| `POST /flashSession/update/status/:id` | 更新启用状态 | - |
| `POST /flashSession/delete/:id` | 删除 | - |
| `GET /flashSession/:id` | 详情 | - |
| `GET /flashSession/list` | 全部场次 | - |
| `GET /flashSession/selectList` | 按活动查场次（含商品数量） | `SmsFlashPromotionSessionDetail` |

FlashProductRelation (`/flashProductRelation`):
| 接口 | 方法 | 说明 |
|------|------|------|
| `POST /flashProductRelation/create` | 批量添加关联 | list 批量插入 |
| `POST /flashProductRelation/update/:id` | 修改关联 | 秒杀价/库存 |
| `POST /flashProductRelation/delete/:id` | 删除 | - |
| `GET /flashProductRelation/:id` | 详情 | - |
| `GET /flashProductRelation/list` | 分页查询 | flashPromotionId + sessionId 过滤，返回 FlashPromotionProduct（含商品信息） |

---

### Task P4-3: HomeContent 完整实现（Admin 侧）

**前置**: P0-3
**路由前缀**: `/home/advertise`, `/home/brand`, `/home/newProduct`, `/home/recommendProduct`, `/home/recommendSubject`

各模块均为类似模式，以 Advertise 为代表说明:

HomeAdvertise:
- create / delete(ids) / updateStatus / getItem / update / list(name/type/endTime)

HomeBrand:
- create(list) / updateSort / delete(ids) / updateRecommendStatus(ids) / list(brandName/recommendStatus)

HomeNewProduct:
- create(list) / updateSort / delete(ids) / updateRecommendStatus(ids) / list(productName/recommendStatus)

HomeRecommendProduct:
- create(list) / updateSort / delete(ids) / updateRecommendStatus(ids) / list(productName/recommendStatus)

HomeRecommendSubject:
- create(list) / updateSort / delete(ids) / updateRecommendStatus(ids) / list(subjectName/recommendStatus)

---

## P5 - CMS 内容管理（全新模块）

### Task P5-1: Subject 专题管理

**前置**: P0-3
**路由前缀**: `/subject`
**Java 对应**: `CmsSubjectController`

| 接口 | 方法 | 说明 |
|------|------|------|
| `POST /subject/create` | 创建 | - |
| `POST /subject/update/:id` | 更新 | - |
| `POST /subject/delete` | 批量删除 | ids |
| `GET /subject/list` | 分页查询 | keyword / cateId 过滤 |
| `GET /subject/listAll` | 全量 | - |

### Task P5-2: PrefrenceArea 优选专区管理

**前置**: P0-3
**路由前缀**: `/prefrenceArea`
**Java 对应**: `CmsPrefrenceAreaController`

| 接口 | 方法 | 说明 |
|------|------|------|
| `POST /prefrenceArea/create` | 创建 | - |
| `POST /prefrenceArea/update/:id` | 更新 | - |
| `POST /prefrenceArea/delete` | 批量删除 | - |
| `GET /prefrenceArea/listAll` | 全量 | - |

---

## P6 - Portal 移动端

### Task P6-1: Portal Member 完整实现

**前置**: P0-1c, P0-3
**路由前缀**: `/member`
**Java 对应**: `UmsMemberController`（已在 P0-1c 处理认证接口）

追加接口（非认证类）:
| 接口 | 方法 | 说明 |
|------|------|------|
| `GET /member/memberLevel/list` | 会员等级列表 | defaultStatus 过滤 |

---

### Task P6-2: MemberReceiveAddress

**前置**: P0-3
**路由前缀**: `/member/address`
**Java 对应**: `UmsMemberReceiveAddressController`

- add（绑定当前 memberId）
- delete / update / list / getItem
- 注意: add/delete/update/list 均需从 JWT 中取 memberId，验证归属权

---

### Task P6-3: Portal Home 完整实现

**前置**: P0-3, P4 (HomeContent 数据)
**路由前缀**: `/home`
**Java 对应**: `HomeController` + `HomeServiceImpl`

| 接口 | 方法 | 说明 |
|------|------|------|
| `GET /home/content` | 首页聚合数据 | 广告+推荐品牌+秒杀+新品+热品+专题 |
| `GET /home/recommendProductList` | 推荐商品 | 分页，暂时返回所有已上架商品 |
| `GET /home/productCateList/:parentId` | 商品分类 | showStatus=1，按 sort desc |
| `GET /home/subjectList` | 专题列表 | cateId 过滤，分页 |
| `GET /home/hotProductList` | 热品推荐 | - |
| `GET /home/newProductList` | 新品推荐 | - |

**content() 聚合实现**（对应 HomeServiceImpl）:
1. 获取 `sms_home_advertise` WHERE status=1
2. 获取推荐品牌（`sms_home_brand` JOIN `pms_brand` WHERE recommend_status=1 LIMIT 6）
3. 获取秒杀信息：当前有效的 flash_promotion + 当前时段 session + 关联商品
4. 获取新品推荐（`sms_home_new_product` JOIN `pms_product` LIMIT 4）
5. 获取热品推荐（`sms_home_recommend_product` JOIN `pms_product` LIMIT 4）
6. 获取推荐专题（`sms_home_recommend_subject` JOIN `cms_subject` LIMIT 4）

---

### Task P6-4: Portal Cart 完整实现

**前置**: P0-3
**路由前缀**: `/cart`
**Java 对应**: `OmsCartItemController` + `OmsCartItemServiceImpl`

| 接口 | 方法 | 说明 |
|------|------|------|
| `POST /cart/add` | 加入购物车 | 检查已有相同 productId+skuId → 数量累加；否则查商品信息新增 |
| `GET /cart/list` | 获取列表 | 标记库存不足/下架商品 |
| `GET /cart/list/promotion` | 含促销信息列表 | 计算每项商品促销优惠（见下方） |
| `GET /cart/update/quantity` | 修改数量 | 验证归属权 |
| `GET /cart/getProduct/:productId` | 获取商品规格 | 用于重选规格 |
| `POST /cart/update/attr` | 修改规格 | - |
| `POST /cart/delete` | 删除 | ids + 验证归属权 |
| `POST /cart/clear` | 清空 | 当前 member 全清 |
| `GET /cart/getCount` | 获取数量 | - |

**listPromotion() 促销计算逻辑**（对应 `OmsPromotionServiceImpl`，是下单的基础）:
1. 按 productCategoryId 分组购物车商品
2. 对每个商品查询所有促销活动（满减/打折/阶梯价/秒杀价）
3. 计算每项商品的实际优惠金额（integration_amount = 每个商品分摊的优惠）
4. 返回 `CartPromotionItem[]`（含 realStock/promotionMessage/reduceAmount）

---

### Task P6-5: Portal Product 完整实现

**前置**: P0-3, P2-4
**路由前缀**: `/product`（Portal 侧）
**Java 对应**: `PmsPortalProductController` + `PmsPortalProductServiceImpl`

| 接口 | 方法 | 说明 |
|------|------|------|
| `GET /product/search` | 综合搜索 | keyword/brandId/categoryId/sort 多维过滤，用 MySQL LIKE 实现 |
| `GET /product/categoryTreeList` | 分类树 | 全量递归树（PmsProductCategoryNode 含子节点列表） |
| `GET /product/detail/:id` | 商品详情 | 含 SKU/属性/会员价/阶梯价/促销信息/品牌 |

**detail() 组装内容**（对应 `PmsPortalProductDetail`）:
- product + skuStockList + productAttributeList（规格+参数）
- memberPriceList + productLadderList + productFullReductionList
- brand + productCategory

---

### Task P6-6: Portal Brand

**前置**: P0-3
**路由前缀**: `/brand`（Portal 侧）
**Java 对应**: `PmsPortalBrandController`

| 接口 | 方法 | 说明 |
|------|------|------|
| `GET /brand/recommendList` | 推荐品牌分页 | 关联 sms_home_brand 筛选 |
| `GET /brand/detail/:brandId` | 品牌详情 | - |
| `GET /brand/productList` | 品牌商品分页 | brandId 过滤已上架商品 |

---

### Task P6-7: Portal Order 完整实现（最复杂）

**前置**: P6-4（依赖购物车促销计算）, P0-3, P6-2（收货地址）
**路由前缀**: `/order`（Portal 侧，注意与 Admin 侧 `/order` 区分，可加前缀 `/portal/order` 或用路由分组）
**Java 对应**: `OmsPortalOrderController` + `OmsPortalOrderServiceImpl`

| 接口 | 方法 | 说明 |
|------|------|------|
| `POST /order/generateConfirmOrder` | 生成确认单 | 见下方 |
| `POST /order/generateOrder` | 提交下单 | 见下方，带事务 |
| `POST /order/paySuccess` | 支付回调 | 更新状态+扣库存+增积分 |
| `POST /order/cancelTimeOutOrder` | 超时取消 | 批量取消，释放库存 |
| `POST /order/cancelOrder` | 取消单个 | 发送延迟队列消息 |
| `GET /order/list` | 订单列表 | status=-1 全部，0~4 各状态 |
| `GET /order/detail/:orderId` | 订单详情 | 含 orderItemList |
| `POST /order/cancelUserOrder` | 用户取消 | - |
| `POST /order/confirmReceiveOrder` | 确认收货 | 更新状态=3 |
| `POST /order/deleteOrder` | 删除订单 | delete_status=1（只有已关闭才能删） |

**generateConfirmOrder() 逻辑**:
1. 计算购物车促销项（cartItemService.listPromotion）
2. 获取当前会员收货地址列表
3. 获取可用优惠券（memberCouponService.listCart，type=1 可用）
4. 获取会员当前积分 + 积分使用规则（ums_integration_consume_setting）
5. 计算总金额/优惠/应付金额

**generateOrder() 事务逻辑**:
1. 验证购物车商品库存（SELECT ... FOR UPDATE / 乐观锁）
2. 锁定库存（UPDATE pms_sku_stock SET lock_stock = lock_stock + quantity）
3. 计算各种优惠（优惠券/积分/满减）
4. 生成订单号（Redis INCR `mall:orderId` + 当日日期前缀）
5. 写入 `oms_order` + `oms_order_item`（批量）
6. 如使用优惠券: 更新 sms_coupon_history.use_status=1
7. 扣减真实库存（UPDATE pms_sku_stock SET stock = stock - quantity）
8. 发送延迟消息（BullMQ）：N分钟后若未支付则自动取消

**cancelTimeOutOrder() 逻辑**:
1. 查询 status=0 AND create_time < NOW() - orderSetting.normalOrderOvertime（小时）
2. 恢复库存（lock_stock - quantity）
3. 更新 status=4（已关闭），写操作记录

**BullMQ 延迟队列接入**（对应 Java RabbitMQ）:
- 引入 `@nestjs/bull`，创建 `order-cancel` Queue
- Producer: generateOrder 后推延迟 job
- Consumer: 收到 job 后调 cancelOrder（检查 status=0 才执行）

---

### Task P6-8: Portal Order ReturnApply

**前置**: P0-3
**路由前缀**: `/returnApply`（Portal 侧）
**Java 对应**: `OmsPortalOrderReturnApplyController`

| 接口 | 方法 | 说明 |
|------|------|------|
| `POST /returnApply/create` | 申请退货 | 写 oms_order_return_apply，更新订单状态 |

---

### Task P6-9: MemberCoupon（Portal 侧）

**前置**: P0-3
**路由前缀**: `/member/coupon`
**Java 对应**: `UmsMemberCouponController` + `UmsMemberCouponServiceImpl`

| 接口 | 方法 | 说明 |
|------|------|------|
| `POST /member/coupon/add/:couponId` | 领取优惠券 | 验证领取条件（per_limit/剩余数量） |
| `GET /member/coupon/listHistory` | 历史记录 | useStatus 过滤（0未用/1已用/2已过期） |
| `GET /member/coupon/list` | 可用券列表 | useStatus 过滤 |
| `GET /member/coupon/list/cart/:type` | 购物车可用券 | 对购物车商品做规则匹配 |
| `GET /member/coupon/listByProduct/:productId` | 商品可用券 | 匹配全场/分类/商品券 |

**add() 逻辑**:
1. 查优惠券基本信息（验证 end_time/publish_count/per_limit）
2. 检查该会员已领数量 `sms_coupon_history WHERE member_id=? AND coupon_id=?`
3. 插入 `sms_coupon_history`（use_status=0）
4. 更新 `sms_coupon.receive_count + 1`

---

### Task P6-10: 关注/收藏/浏览历史（MySQL 实现）

**前置**: P0-3
**说明**: Java 原版使用 MongoDB，改为 MySQL 三张新表

MemberAttention (`/member/attention`):
- `member_brand_attention(member_id, brand_id, brand_name, brand_logo, create_time, ...)`
- add / delete(brandId) / list(分页) / detail(brandId) / clear

MemberProductCollection (`/member/productCollection`):
- `member_product_collection(member_id, product_id, product_name, product_pic, product_price, create_time)`
- add / delete(productId) / list(分页) / detail(productId) / clear

MemberReadHistory (`/member/readHistory`):
- `member_read_history(id, member_id, product_id, product_name, product_pic, product_price, create_time)`
- create / delete(ids) / clear / list(分页)

---

## P7 - OSS 文件存储

### Task P7-1: OSS MinIO 完整实现

**前置**: 无
**路由前缀**: `/minio`
**Java 对应**: `MinioController`（Java 原版有 OSS 和 MinIO 两套，NestJS 统一用 MinIO）

| 接口 | 方法 | 说明 |
|------|------|------|
| `POST /minio/upload` | 服务端上传 | multipart/form-data → MinIO |
| `GET /minio/policy` | 获取预签名策略 | presigned PUT URL（前端直传） |
| `DELETE /minio/delete` | 删除文件 | objectName |

---

## 各阶段依赖图

```
P0-3（Entity补全）
    ↓
P0-1a/b/c（Auth）→ P0-2（ResourceGuard）
    ↓                     ↓
P1（UMS CRUD）        P2（PMS CRUD）
    ↓                     ↓
P3（OMS Admin）       P4（SMS 营销）
                          ↓
                      P5（CMS）
    ↓
P6-1/2（Member/Address）
    ↓
P6-3（Portal Home）← P4（数据来源）
P6-4（Cart）← P2-4（商品库存）
P6-5（Portal Product）
P6-6（Portal Brand）
P6-7（Portal Order）← P6-4（促销计算）+ P6-2（地址）
P6-8（ReturnApply）
P6-9（MemberCoupon）
P6-10（关注/收藏/历史）
P7（OSS）
```

---

## 统一编码规范（实现时遵守）

1. **分页统一**: 所有分页接口使用 `PageQueryDto { page=1, limit=5 }` + `PageResult<T>`
2. **软删除**: 使用 `deleteStatus` 字段，不物理删除
3. **时间字段**: Entity 中用 `@CreateDateColumn` / `@UpdateDateColumn`
4. **命名**: 路由路径与 Java 保持一致（前端无需改动）
5. **事务**: 多表写入统一使用 `DataSource.manager.transaction()`
6. **Redis key 规范**: `mall:{domain}:{identifier}`，如 `mall:admin:username`
7. **DTO 验证**: 所有 POST body 使用 `class-validator` 装饰器
8. **错误处理**: 业务错误统一抛 `BadRequestException(message)` 或 `NotFoundException`

---

## 当前已有代码的状态评估

| 模块 | 状态 | 需要工作 |
|------|------|---------|
| Auth | 骨架，全 TODO | 完整实现 P0-1 |
| AdminUser | 骨架，全 TODO | 完整实现 P1-1 |
| AdminRole | 骨架，全 TODO | 完整实现 P1-2 |
| AdminMenu | 骨架，全 TODO | 完整实现 P1-3 |
| AdminResource | 骨架，无 Service | 添加 Service + 完整实现 P1-4 |
| Brand | 骨架，TODO | 完整实现 P2-1 |
| Product | 骨架，部分 TODO | 完整实现 P2-4 |
| ProductCategory | 骨架，TODO | 完整实现 P2-2 |
| ProductAttr | 骨架，无 Service | 添加 Service + 完整实现 P2-3 |
| SkuStock | 骨架，TODO | 完整实现 P2-5 |
| Order(Admin) | 骨架，全 TODO | 完整实现 P3-1 |
| ReturnApply | 骨架，TODO | 完整实现 P3-2 |
| ReturnReason | 骨架，TODO | 完整实现 P3-3 |
| OrderSetting | 骨架，TODO | 完整实现 P3-3 |
| CompanyAddress | 骨架，TODO | 完整实现 P3-3 |
| Coupon | 骨架，TODO | 完整实现 P4-1 |
| FlashPromotion | 骨架，TODO | 完整实现 P4-2（需补 Session/Relation） |
| HomeContent | 骨架，TODO | 完整实现 P4-3（需补 5 个实体） |
| Cart | 骨架，TODO | 完整实现 P6-4 |
| PortalHome | 骨架，TODO | 完整实现 P6-3 |
| PortalMember | 骨架，TODO | 完整实现 P6-1 |
| OSS | 骨架 | 完整实现 P7-1 |
