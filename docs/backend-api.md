# H5 客户端后台服务接口文档

本文档供 `stzh-h5-client` 独立开发、联调和部署使用，接口基于当前 `Tsingtaohui/backend` 后端实现整理。

## 1. 基础约定

### 1.1 服务地址

开发环境默认后端地址：

```text
http://localhost:8080
```

H5 客户端请求基地址：

```text
/api/v1
```

独立部署时可通过环境变量覆盖：

```bash
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

### 1.2 认证

除登录、注册和商品目录查询外，其余接口需要携带 JWT：

```http
Authorization: Bearer <token>
```

当前公开接口：

| 方法 | 路径 |
|------|------|
| POST | `/api/v1/auth/register` |
| POST | `/api/v1/auth/login` |
| GET | `/api/v1/catalog/categories` |
| GET | `/api/v1/catalog/products` |
| GET | `/api/v1/catalog/products/{productId}` |

### 1.3 响应结构

后端统一返回：

```json
{
  "code": "0",
  "message": "OK",
  "data": {},
  "requestId": "optional-request-id"
}
```

H5 客户端的 `src/utils/request.ts` 会自动解包 `data`。当 `code !== "0"` 时，请求会被视为失败。

### 1.4 分页结构

```json
{
  "items": [],
  "page": 1,
  "pageSize": 20,
  "total": 100
}
```

### 1.5 字段命名

后端响应为 camelCase，例如 `skuCode`、`pageSize`、`shipNo`。请求参数中 URL query 使用已有接口约定，例如 `category_id`、`page_size`。

## 2. 错误码

| code | 说明 |
|------|------|
| `0` | 成功 |
| `AUTH_001` | 用户名或密码错误 |
| `AUTH_002` | 登录状态失效 |
| `USER_001` | 用户名已存在 |
| `ORDER_001` | 购物车为空 |
| `ORDER_002` | 库存不足 |
| `ORDER_003` | 订单状态不允许当前操作 |
| `CUSTOMS_001` | 海关红牌节点同步失败 |
| `DRONE_001` | 无可用无人机 |
| `WAREHOUSE_001` | 扫码结果不匹配 |

## 3. 认证接口

### 3.1 注册

```http
POST /api/v1/auth/register
Content-Type: application/json
```

请求：

```json
{
  "username": "customer03",
  "password": "demo1234",
  "preferredLanguage": "zh-CN"
}
```

字段约束：

| 字段 | 必填 | 说明 |
|------|------|------|
| `username` | 是 | 3-64 字符 |
| `password` | 是 | 至少 8 位，需包含字母和数字 |
| `preferredLanguage` | 否 | `zh-CN` 或 `en-US`，默认 `zh-CN` |

响应 `data`：

```json
{
  "token": "jwt-token",
  "user": {
    "id": 10001,
    "username": "customer03",
    "userType": "CUSTOMER",
    "preferredLanguage": "zh-CN"
  }
}
```

### 3.2 登录

```http
POST /api/v1/auth/login
Content-Type: application/json
```

请求：

```json
{
  "username": "customer01",
  "password": "demo1234"
}
```

响应 `data`：

```json
{
  "token": "jwt-token",
  "user": {
    "id": 10001,
    "username": "customer01",
    "userType": "CUSTOMER",
    "preferredLanguage": "zh-CN"
  }
}
```

## 4. 用户与船舶信息

### 4.1 获取当前用户资料

```http
GET /api/v1/users/me
Authorization: Bearer <token>
```

响应 `data`：

```json
{
  "id": 10001,
  "username": "customer01",
  "displayName": "Captain Johnson",
  "contactPhone": null,
  "email": null,
  "nationality": null,
  "preferredLanguage": "en-US",
  "ships": [
    {
      "id": 1,
      "shipNo": "MAERSK-001",
      "shipName": "Maersk Elba",
      "shipNationality": "DK",
      "imo": "IMO9876544",
      "mmsi": null,
      "isDefault": true
    }
  ]
}
```

### 4.2 更新当前用户船舶信息

```http
PUT /api/v1/users/me/ship
Authorization: Bearer <token>
Content-Type: application/json
```

请求：

```json
{
  "shipNo": "MAERSK-001",
  "shipName": "Maersk Elba",
  "shipNationality": "DK",
  "imo": "IMO9876544",
  "mmsi": "123456789"
}
```

字段约束：

| 字段 | 必填 | 说明 |
|------|------|------|
| `shipNo` | 是 | 船号 |
| `shipName` | 否 | 船名 |
| `shipNationality` | 是 | 船籍 |
| `imo` | 否 | IMO 编码 |
| `mmsi` | 否 | MMSI 编码 |

响应 `data` 为更新后的 `ShipVO`。

## 5. 商品目录

### 5.1 商品分类

```http
GET /api/v1/catalog/categories
```

响应 `data`：

```json
[
  {
    "id": 1,
    "parentId": null,
    "nameZh": "饮料",
    "nameEn": "Beverages",
    "sortOrder": 1,
    "children": []
  }
]
```

### 5.2 商品列表

```http
GET /api/v1/catalog/products?category_id=1&keyword=water&page=1&page_size=20
```

查询参数：

| 参数 | 必填 | 说明 |
|------|------|------|
| `category_id` | 否 | 商品分类 ID |
| `keyword` | 否 | 商品关键字 |
| `page` | 否 | 页码，默认 1 |
| `page_size` | 否 | 每页数量，默认 20 |

响应 `data`：

```json
{
  "items": [
    {
      "id": 20001,
      "skuCode": "SKU-WATER-550",
      "nameZh": "矿泉水 550ml",
      "nameEn": "Mineral Water 550ml",
      "price": "1.80",
      "mainImageUrl": "/files/products/water.png",
      "availableQty": 42,
      "droneDeliverable": true,
      "weightKg": "0.550",
      "volumeM3": "0.0010"
    }
  ],
  "page": 1,
  "pageSize": 20,
  "total": 1
}
```

### 5.3 商品详情

```http
GET /api/v1/catalog/products/{productId}
```

响应 `data`：

```json
{
  "id": 20001,
  "skuCode": "SKU-WATER-550",
  "categoryId": 1,
  "nameZh": "矿泉水 550ml",
  "nameEn": "Mineral Water 550ml",
  "descriptionZh": "保税仓商品",
  "descriptionEn": "Bonded warehouse product",
  "mainImageUrl": "/files/products/water.png",
  "specification": "550ml",
  "price": "1.80",
  "weightKg": "0.550",
  "volumeM3": "0.0010",
  "source": "BONDED_WAREHOUSE",
  "droneDeliverable": true,
  "status": "ON_SHELF",
  "availableQty": 42
}
```

## 6. 购物车与订单

### 6.1 购物车试算

当前 H5 代码调用此接口：

```http
POST /api/v1/cart/estimate
Authorization: Bearer <token>
Content-Type: application/json
```

后端也保留了等价接口：

```http
POST /api/v1/orders/estimate
```

请求：

```json
{
  "items": [
    {
      "productId": 20001,
      "quantity": 2
    }
  ]
}
```

响应 `data`：

```json
{
  "totalPrice": "3.60",
  "totalWeightKg": "1.100",
  "totalVolumeM3": "0.0020",
  "tradeMode": "AUTO_TRADE",
  "canAutoTrade": true,
  "reasons": [],
  "items": [
    {
      "id": null,
      "productId": 20001,
      "skuCode": "SKU-WATER-550",
      "productNameZh": "矿泉水 550ml",
      "productNameEn": "Mineral Water 550ml",
      "unitPrice": "1.80",
      "quantity": 2,
      "unitWeightKg": "0.550",
      "unitVolumeM3": "0.0010",
      "lineAmount": "3.60"
    }
  ]
}
```

### 6.2 创建订单

```http
POST /api/v1/orders
Authorization: Bearer <token>
Content-Type: application/json
```

请求：

```json
{
  "items": [
    {
      "productId": 20001,
      "quantity": 2
    }
  ],
  "consigneeName": "John",
  "cabinNo": "A-102",
  "contactInfo": "+123456789",
  "expectedDeliveryTime": "2026-05-31T15:00:00",
  "remark": "Call before delivery",
  "shipNo": "MAERSK-001",
  "shipName": "Maersk Elba",
  "shipNationality": "DK",
  "imo": "IMO9876544",
  "mmsi": "123456789",
  "berthOrAnchorage": "ANCHORAGE-B2",
  "targetGps": "36.0600,120.3800",
  "shippingAgentId": 30001,
  "shippingAgentName": "Qingdao Shipping Agent"
}
```

必填字段：

| 字段 | 说明 |
|------|------|
| `items` | 不为空，元素包含 `productId` 和 `quantity` |
| `consigneeName` | 收货人 |
| `cabinNo` | 舱房号 |

响应 `data` 为订单详情对象，字段见 6.4。

### 6.3 我的订单列表

```http
GET /api/v1/orders?status=PENDING_RECEIPT&page=1&page_size=20
Authorization: Bearer <token>
```

查询参数：

| 参数 | 必填 | 说明 |
|------|------|------|
| `status` | 否 | 订单状态 |
| `page` | 否 | 页码，默认 1 |
| `page_size` | 否 | 每页数量，默认 20 |

响应 `data` 为分页订单列表。

### 6.4 订单详情

```http
GET /api/v1/orders/{orderId}
Authorization: Bearer <token>
```

响应 `data`：

```json
{
  "id": 50001,
  "orderNo": "TH202605290001",
  "userId": 10001,
  "totalPrice": "20.20",
  "totalWeightKg": "2.100",
  "totalVolumeM3": "0.0060",
  "tradeMode": "AUTO_TRADE",
  "orderStatus": "WAREHOUSE_PROCESSING",
  "warehouseStatus": "PICKING",
  "deliveryStatus": "PENDING",
  "customsSyncStatus": "SUCCESS",
  "consigneeName": "John",
  "cabinNo": "A-102",
  "contactInfo": "+123456789",
  "expectedDeliveryTime": "2026-05-31T15:00:00",
  "remark": "Call before delivery",
  "shipNo": "MAERSK-001",
  "shipName": "Maersk Elba",
  "shipNationality": "DK",
  "imo": "IMO9876544",
  "mmsi": "123456789",
  "berthOrAnchorage": "ANCHORAGE-B2",
  "targetGps": "36.0600,120.3800",
  "shippingAgentId": 30001,
  "shippingAgentName": "Qingdao Shipping Agent",
  "completedAt": null,
  "createdAt": "2026-05-29T10:00:00",
  "items": [
    {
      "id": 1,
      "productId": 20001,
      "skuCode": "SKU-WATER-550",
      "productNameZh": "矿泉水 550ml",
      "productNameEn": "Mineral Water 550ml",
      "unitPrice": "1.80",
      "quantity": 2,
      "unitWeightKg": "0.550",
      "unitVolumeM3": "0.0010",
      "lineAmount": "3.60"
    }
  ]
}
```

### 6.5 验证码确认收货

```http
POST /api/v1/orders/{orderNo}/receipt/verify-code
Authorization: Bearer <token>
Content-Type: application/json
```

请求：

```json
{
  "verifyCode": "836214"
}
```

响应 `data`：

```json
{
  "orderNo": "TH202605290001",
  "orderStatus": "COMPLETED"
}
```

注意：后端当前要求字段名为 `verifyCode`，不是 `verify_code`。

### 6.6 扫码确认收货

```http
POST /api/v1/orders/receipt/package-scan
Authorization: Bearer <token>
Content-Type: application/json
```

请求：

```json
{
  "packageNo": "PKG-QD-290006"
}
```

响应 `data`：

```json
{
  "orderNo": "TH202605290006",
  "packageNo": "PKG-QD-290006",
  "orderStatus": "COMPLETED"
}
```

注意：后端当前要求字段名为 `packageNo`，不是 `package_no`。

## 7. 枚举

### 7.1 订单状态

| 值 | 说明 |
|----|------|
| `PENDING_CONFIRM` | 待确认 |
| `CONFIRMED` | 已确认 |
| `WAREHOUSE_PROCESSING` | 仓库处理中 |
| `PENDING_OUTBOUND` | 待出库 |
| `OUTBOUND` | 已出库 |
| `PENDING_LOADING` | 待装载 |
| `IN_DELIVERY` | 配送中 |
| `PENDING_RECEIPT` | 待收货 |
| `COMPLETED` | 已完成 |
| `CANCELLED` | 已取消 |
| `EXCEPTION` | 异常 |

### 7.2 交易模式

| 值 | 说明 |
|----|------|
| `AUTO_TRADE` | 自动交易 |
| `MATCHING_ORDER` | 撮合订单 |

## 8. 演示账号

H5 客户端演示账号：

```text
用户名：customer01
密码：demo1234
```

备用账号：

```text
用户名：customer02
密码：demo1234
```

## 9. 前端调用文件对应关系

| 前端文件 | 后端接口 |
|----------|----------|
| `src/api/auth.ts` | `/auth/login`、`/auth/register` |
| `src/api/user.ts` | `/users/me`、`/users/me/ship` |
| `src/api/catalog.ts` | `/catalog/categories`、`/catalog/products`、`/catalog/products/{productId}` |
| `src/api/order.ts` | `/cart/estimate`、`/orders`、`/orders/{orderId}` |

