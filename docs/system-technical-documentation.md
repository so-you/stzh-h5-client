# 青岛世天智汇 H5 客户端系统说明与技术文档

## 1. 文档目的

本文档用于说明 `stzh-h5-client` 工程的系统定位、业务功能、技术架构、代码组织、核心数据流、接口调用方式、运行构建流程和当前已知风险，方便后续开发、联调、测试、部署和项目交接。

更详细的后端接口契约见同目录下的 `backend-api.md`。

## 2. 系统概述

`stzh-h5-client` 是“青岛世天智汇”船员购物场景的 H5/多端前端客户端。系统面向靠港或锚地船舶上的船员用户，提供保税仓商品浏览、购物车、订单试算、订单提交、订单查看、船舶信息维护、登录注册和语言切换等功能。

工程基于 uni-app 构建，当前主要完成 H5 端联调能力，同时保留小程序和 App 等多端构建脚本。

### 2.1 核心用户

- 船员/客户：浏览商品、维护船舶信息、提交配送到船订单、查看订单状态。
- 业务运营/联调人员：通过演示账号验证商品、订单、用户和船舶信息链路。

### 2.2 核心业务闭环

1. 用户进入首页查看分类和推荐商品。
2. 用户进入商品列表，按分类或关键词筛选商品。
3. 用户查看商品详情并加入购物车。
4. 用户登录后在购物车进行订单试算。
5. 系统检查用户是否维护船号和船籍。
6. 用户填写收货人、舱房号和联系方式。
7. 用户提交订单，系统跳转至订单详情页。
8. 用户在订单页查看订单状态和商品明细。

## 3. 技术栈

| 类别 | 技术 |
|------|------|
| 前端框架 | Vue 3 |
| 多端框架 | uni-app |
| 构建工具 | Vite |
| 状态管理 | Pinia |
| 状态持久化 | pinia-plugin-persistedstate |
| 国际化 | vue-i18n |
| HTTP 客户端 | axios |
| 样式 | SCSS、rpx |
| 类型检查 | TypeScript、vue-tsc |

工程入口和插件注册位于 `src/main.ts`，应用生命周期逻辑位于 `src/App.vue`。

## 4. 工程目录结构

```text
.
├── docs/
│   ├── backend-api.md
│   └── system-technical-documentation.md
├── src/
│   ├── api/
│   ├── components/
│   ├── i18n/
│   ├── pages/
│   ├── static/
│   ├── stores/
│   ├── styles/
│   ├── types/
│   ├── utils/
│   ├── App.vue
│   ├── main.ts
│   ├── manifest.json
│   └── pages.json
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

### 4.1 目录职责

| 目录/文件 | 职责 |
|-----------|------|
| `src/pages/` | 页面级业务实现 |
| `src/api/` | 后端接口封装 |
| `src/utils/request.ts` | axios 实例、请求拦截、响应解包、401 处理 |
| `src/stores/` | Pinia 状态模块 |
| `src/types/index.ts` | 业务类型定义 |
| `src/i18n/` | 中文和英文语言包 |
| `src/styles/` | 全局设计变量和公共样式 |
| `src/components/` | 可复用基础组件 |
| `src/static/` | tab 图标和静态资源 |
| `src/pages.json` | 页面路由、导航栏、tabBar 配置 |
| `src/manifest.json` | uni-app 应用和多端发布配置 |
| `vite.config.ts` | Vite 插件和本地代理 |

## 5. 页面说明

页面路由集中配置在 `src/pages.json`。

| 页面 | 路径 | 说明 |
|------|------|------|
| 首页 | `pages/home/index` | 品牌信息、搜索入口、商品分类、推荐商品 |
| 商品列表 | `pages/catalog/index` | 分类 tab、关键词搜索、商品列表 |
| 商品详情 | `pages/catalog/detail` | 商品主图、价格、规格、库存、加入购物车、立即购买 |
| 购物车 | `pages/cart/index` | 购物车商品、数量调整、订单试算、收货信息、提交订单 |
| 订单列表 | `pages/order/index` | 按状态 tab 查看订单列表 |
| 订单详情 | `pages/order/detail` | 订单状态、收货信息、商品明细、金额汇总 |
| 我的 | `pages/mine/index` | 用户信息、船舶信息、扫码收货入口、语言切换、退出登录 |
| 船舶信息 | `pages/mine/ship` | 船号、船名、船籍、IMO、MMSI 维护 |
| 登录 | `pages/auth/login` | 用户登录 |
| 注册 | `pages/auth/register` | 用户注册 |

## 6. 前端架构

### 6.1 应用初始化

`src/main.ts` 创建 Vue SSR App，并注册 Pinia、Pinia 持久化插件和 i18n。

`src/App.vue` 在 `onLaunch` 阶段检查本地是否已有登录 token。如果存在 token 但用户资料为空，则调用 `userStore.fetchProfile()` 拉取当前用户资料。

### 6.2 路由和导航

uni-app 通过 `src/pages.json` 管理页面。当前 tabBar 包含：

- 首页：`pages/home/index`
- 商品：`pages/catalog/index`
- 订单：`pages/order/index`
- 我的：`pages/mine/index`

普通页面通过 `uni.navigateTo` 进入，tab 页面通过 `uni.switchTab` 切换。提交订单成功后通过 `uni.redirectTo` 跳转至订单详情。

### 6.3 状态管理

状态管理使用 Pinia 的 setup store 写法。

#### 用户状态 `src/stores/user.ts`

保存内容：

- `token`
- `userInfo`

核心方法：

- `login(username, password)`：调用登录接口，保存 token 和用户信息。
- `register(username, password)`：调用注册接口，保存 token 和用户信息。
- `fetchProfile()`：拉取当前用户资料。
- `logout()`：清空 token 和用户资料。

持久化 key 为 `user`，持久化字段为 `token` 和 `userInfo`。

#### 购物车状态 `src/stores/cart.ts`

保存内容：

- `items`

核心方法：

- `addProduct(product, quantity)`：添加商品到购物车。
- `updateQuantity(productId, quantity)`：更新商品数量。
- `removeItem(productId)`：移除商品。
- `clear()`：清空购物车。

持久化 key 为 `cart`，持久化字段为 `items`。

## 7. 接口调用架构

### 7.1 基础地址

请求基地址在 `src/utils/request.ts` 中定义：

```ts
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1'
```

开发环境下，`vite.config.ts` 将 `/api` 代理到：

```text
http://localhost:8080
```

因此默认请求链路为：

```text
前端 /api/v1/* -> Vite proxy /api/* -> http://localhost:8080/api/*
```

如果独立部署 H5，可通过环境变量覆盖：

```bash
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

### 7.2 请求封装

`src/utils/request.ts` 负责：

- 创建 axios 实例。
- 设置 `Content-Type: application/json`。
- 从本地用户状态中读取 token。
- 在请求头中注入 `Authorization: Bearer <token>`。
- 自动解包后端统一响应中的 `data`。
- 当后端业务 `code !== "0"` 时抛出错误。
- 当 HTTP 状态为 401 时清除本地用户状态并跳转登录页。

### 7.3 API 模块

| 文件 | 接口职责 |
|------|----------|
| `src/api/auth.ts` | 登录、注册 |
| `src/api/user.ts` | 当前用户资料、船舶信息更新 |
| `src/api/catalog.ts` | 商品分类、商品列表、商品详情 |
| `src/api/order.ts` | 购物车试算、创建订单、订单列表、订单详情 |

接口的详细字段、错误码和示例响应见 `backend-api.md`。

## 8. 核心业务流程

### 8.1 商品浏览流程

1. 首页 `src/pages/home/index.vue` 调用 `getCategories()` 和 `getProducts({ page: 1, page_size: 6 })`。
2. 用户点击分类时，将分类 ID 临时写入 `catalog:selectedCategoryId`。
3. 商品页 `src/pages/catalog/index.vue` 在显示时消费该分类 ID，并调用 `getProducts()`。
4. 用户点击商品进入 `src/pages/catalog/detail.vue`。
5. 商品详情页调用 `getProductDetail(productId)` 展示商品信息。

### 8.2 加购和下单流程

1. 商品详情页调用 `cartStore.addProduct()` 添加商品。
2. 购物车页面读取 `cartStore.items`。
3. 若用户已登录，购物车调用 `estimateCart(items)` 获取订单试算。
4. 提交订单前执行登录检查。
5. 提交订单前执行船舶信息检查，至少需要船号和船籍。
6. 校验收货人和舱房号。
7. 调用 `createOrder(params)` 创建订单。
8. 创建成功后清空购物车并跳转订单详情页。

### 8.3 订单查看流程

1. 订单 tab 页面 `src/pages/order/index.vue` 在 `onShow` 中检查登录状态。
2. 已登录时调用 `getOrders({ status, page: 1, page_size: 20 })`。
3. 用户点击订单卡片进入订单详情。
4. 订单详情页调用 `getOrderDetail(orderId)` 展示明细。

### 8.4 船舶信息维护流程

1. 我的页面展示当前默认船舶或用户资料中的船舶字段。
2. 船舶信息页面进入时调用 `userStore.fetchProfile()`。
3. 表单回填当前船舶信息。
4. 保存时调用 `updateShip()`。
5. 保存成功后刷新用户资料并返回上一页。

### 8.5 国际化流程

国际化使用 `vue-i18n`，语言包位于：

- `src/i18n/zh-CN.ts`
- `src/i18n/en-US.ts`

默认语言为 `zh-CN`。我的页面提供中英文切换，切换后将语言写入 `locale` 本地存储。

## 9. 运行与构建

### 9.1 安装依赖

```bash
npm install
```

### 9.2 H5 开发

```bash
npm run dev:h5
```

本地后端默认需要运行在：

```text
http://localhost:8080
```

### 9.3 类型检查

```bash
npm run type-check
```

### 9.4 H5 构建

```bash
npm run build:h5
```

构建产物默认输出到：

```text
dist/build/h5
```

### 9.5 其他端构建

`package.json` 中已预置微信、支付宝、百度、抖音、QQ、快应用等多端脚本，例如：

```bash
npm run dev:mp-weixin
npm run build:mp-weixin
```

当前业务代码仍以 H5 联调为主，多端发布前需要重点检查存储、权限、扫码和平台 API 兼容性。

## 10. 配置说明

### 10.1 Vite 代理

`vite.config.ts` 中配置：

```ts
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true,
    },
  },
}
```

用于本地开发时把前端 `/api` 请求转发到后端服务。

### 10.2 环境变量

支持通过 `VITE_API_BASE_URL` 覆盖接口基础地址。

示例：

```bash
VITE_API_BASE_URL=https://example.com/api/v1 npm run build:h5
```

### 10.3 uni-app manifest

`src/manifest.json` 包含应用名称、版本、多端构建配置和权限配置。当前 `appid` 为空，微信小程序 `appid` 也为空。正式发布前需要补齐对应平台配置。

## 11. 数据模型概览

主要业务类型位于 `src/types/index.ts`。

| 类型 | 说明 |
|------|------|
| `IUserInfo` | 用户资料和船舶信息 |
| `IShip` | 船舶信息 |
| `IProduct` | 商品信息 |
| `ICategory` | 商品分类 |
| `ICartItem` | 购物车商品 |
| `IOrder` | 订单主信息 |
| `IOrderItem` | 订单商品明细 |
| `IOrderEstimate` | 购物车/订单试算结果 |
| `ICreateOrderParams` | 创建订单请求参数 |
| `TOrderStatus` | 订单状态枚举 |
| `TTradeMode` | 交易模式枚举 |

## 12. 样式和组件

### 12.1 设计变量

设计变量集中在 `src/styles/theme.scss`，包含：

- 品牌色
- 辅助色
- 背景色
- 文字色
- 边框色
- 阴影
- 圆角
- 间距
- 字号

### 12.2 全局样式

`src/styles/common.scss` 负责全局 reset、基础字体、按钮重置、卡片、标签、空状态、隐藏滚动条等公共样式。

### 12.3 公共组件

| 组件 | 说明 |
|------|------|
| `AppEmpty.vue` | 空状态展示 |
| `AppSkeleton.vue` | 简单骨架屏效果 |

## 13. 当前已知风险和改进建议

### 13.1 多端兼容风险

当前代码多处直接使用 `localStorage`。这对 H5 可用，但在小程序、App 或 SSR 场景下可能存在兼容问题。建议后续封装统一 storage 工具，并优先使用 uni-app 的存储 API。

建议方向：

- 新增 `src/utils/storage.ts`。
- 封装 `getStorage`、`setStorage`、`removeStorage`。
- 统一替换用户、购物车、语言、分类跳转等场景的本地存储调用。

### 13.2 扫码收货功能未接入后端

后端文档中已有：

- `POST /api/v1/orders/{orderNo}/receipt/verify-code`
- `POST /api/v1/orders/receipt/package-scan`

但当前我的页面扫码后只展示成功提示，没有调用包裹扫码确认收货接口。若要完成业务闭环，需要在 `src/api/order.ts` 中补充扫码收货接口，并在 `src/pages/mine/index.vue` 的扫码成功回调中调用。

### 13.3 订单列表分页能力不足

订单接口是分页接口，但当前订单页固定加载第一页 20 条。订单量增大后，用户无法继续加载更多订单。建议增加触底加载、分页状态和刷新能力。

### 13.4 Active 订单 tab 可能漏数据

当前 active tab 没有请求后端特定状态，而是先请求第一页全部订单，再在前端排除 `COMPLETED`、`CANCELLED`、`EXCEPTION`。如果后端分页数据中活跃订单分布在后续页，页面会漏显示。

建议后端提供 active 状态集合查询，或前端按多个状态并行请求后合并。

### 13.5 Sass 弃用告警

当前构建可通过，但 Dart Sass 输出 `@import` 弃用告警。后续升级 Sass 时需要将 `@import` 迁移为 `@use` 或 `@forward`。

### 13.6 测试体系缺失

当前工程没有单元测试、组件测试或端到端测试脚本。建议按风险优先补充：

- 请求封装和 API 层单元测试。
- 用户 store 和购物车 store 单元测试。
- 登录、商品浏览、加购下单、订单查看的端到端测试。

## 14. 联调检查清单

后端联调前确认：

- 后端服务运行在 `http://localhost:8080`，或已设置 `VITE_API_BASE_URL`。
- 登录、注册接口返回统一响应结构。
- 商品分类和商品列表可匿名访问。
- 订单、用户、船舶信息接口需要携带 JWT。
- 演示账号可用。

前端联调建议顺序：

1. 登录演示账号。
2. 首页能加载分类和推荐商品。
3. 商品列表能按分类和关键词查询。
4. 商品详情能显示价格、库存、规格和描述。
5. 商品能加入购物车。
6. 购物车能完成订单试算。
7. 未维护船舶信息时能引导到船舶信息页。
8. 船舶信息能保存并回填。
9. 订单能提交成功。
10. 订单列表和订单详情能显示新订单。

## 15. 维护约定

### 15.1 新增接口

新增后端接口时建议同时更新：

- `backend-api.md`
- `src/types/index.ts`
- `src/api/*.ts`
- 对应页面或 store

### 15.2 新增页面

新增页面时需要：

- 在 `src/pages/` 下创建页面目录。
- 在 `src/pages.json` 中注册页面路径。
- 如需 tabBar 入口，同步更新 `tabBar.list` 和 `src/static` 图标。

### 15.3 新增语言文案

新增可见文案时需要同时更新：

- `src/i18n/zh-CN.ts`
- `src/i18n/en-US.ts`

页面中优先通过 `$t()` 或 `t()` 引用文案，避免硬编码中文或英文。

### 15.4 新增业务类型

接口返回或请求字段发生变化时，应优先更新 `src/types/index.ts`，再调整 API 和页面逻辑，减少隐式 `any` 或重复类型定义。

## 16. 当前验证结果

最近一次本地验证结果：

```bash
npm run type-check
```

通过。

```bash
npm run build:h5
```

通过。构建期间存在 Sass 弃用告警，不影响当前构建结果。
