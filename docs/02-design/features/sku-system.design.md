# SKU System — Design Document

**Architecture**: Option B — Clean Architecture (Variant Model + Service Layer)
**Plan Reference**: `docs/01-plan/features/sku-system.plan.md`

## Context Anchor

| Key | Value |
|-----|-------|
| **WHY** | 옵션 조합별 재고 추적 불가 → 과주문 발생 가능, 품절 상태 표시 불가 |
| **WHO** | 고객 (정확한 재고 확인), 관리자 (조합별 재고/가격 관리) |
| **RISK** | 기존 Cart/Order의 selectedOption(string) 마이그레이션, seed 데이터 재구성 |
| **SUCCESS** | variant별 재고 차감, 품절 옵션 비활성화, Admin에서 조합별 가격/재고/SKU 입력 |
| **SCOPE** | Variant 모델+서비스, Product↔Variant 연동, Cart/Order 참조 변경, Admin UI, 고객 UI 품절 표시 |

---

## 1. Overview

SKU 시스템은 Product의 옵션 조합(Size × Color 등)마다 독립적인 Variant를 생성하여 **개별 가격, 개별 재고, 고유 SKU 코드**를 관리한다. Clean Architecture 방식으로 **VariantService**(CRUD/조합 로직)와 **StockService**(재고 검증/차감/복원)를 분리하여 재사용성과 테스트 용이성을 확보한다.

### Architecture Decision

| 결정 | 이유 |
|------|------|
| 별도 Variant 컬렉션 | SKU unique index, atomic `$inc`, 개별 쿼리 가능 |
| Service 계층 분리 | 재고 로직을 controller에서 분리, 재사용 가능 (cart/order 공용) |
| VariantService + StockService | Variant CRUD와 재고 로직의 관심사 분리 |

---

## 2. Data Model

### 2.1 Variant (New)

```javascript
// server/src/models/Variant.js
const variantSchema = new mongoose.Schema({
  product: { type: ObjectId, ref: 'Product', required: true, index: true },
  sku: { type: String, required: true, unique: true, trim: true, uppercase: true },
  price: { type: Number, required: true, min: 0 },
  stock: { type: Number, required: true, default: 0, min: 0 },
  options: { type: Map, of: String },  // e.g., { "Size": "M", "Color": "Black" }
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

variantSchema.index({ product: 1, isActive: 1 });
```

### 2.2 Product (Modified)

```javascript
// 기존 유지 + 변경사항
// stock 필드: 유지하되, variant 합산으로 동기화 (VariantService에서 관리)
// price 필드: 유지하되, 최저 variant 가격으로 동기화
// options 필드: 유지 (variant 생성의 소스 데이터)
```

- `stock`: VariantService가 variant 변경 시 자동으로 Product.stock을 합산 업데이트
- `price`: VariantService가 최저 variant 가격으로 Product.price를 업데이트

### 2.3 Cart (Modified)

```javascript
// items 배열 스키마 변경
items: [{
  product: { type: ObjectId, ref: 'Product', required: true },
  variant: { type: ObjectId, ref: 'Variant', required: true },  // NEW (replaces selectedOption)
  quantity: { type: Number, required: true, min: 1, default: 1 }
  // selectedOption: String — REMOVED
}]
```

### 2.4 Order (Modified)

```javascript
// orderItemSchema 변경
const orderItemSchema = new mongoose.Schema({
  product: { type: ObjectId, ref: 'Product', required: true },
  variant: { type: ObjectId, ref: 'Variant' },  // NEW (soft ref, may be null for legacy)
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  sku: { type: String },                         // NEW (snapshot)
  variantOptions: { type: Map, of: String },      // NEW (snapshot, e.g., {Size: "M", Color: "Black"})
  // selectedOption: String — KEPT for legacy orders, not used for new orders
}, { _id: false });
```

---

## 3. Service Layer

### 3.1 VariantService

**File**: `server/src/services/variantService.js`

```javascript
class VariantService {
  // Variant CRUD
  async createVariants(productId, variantsData)
  async updateVariant(variantId, data)
  async deleteVariant(variantId)
  async getByProduct(productId)
  async getById(variantId)

  // Bulk Operations
  async bulkUpsert(productId, variantsData)  // create/update multiple variants
  async generateCombinations(options)         // options array → all combinations

  // Product Sync
  async syncProductAggregates(productId)     // update Product.stock (sum), Product.price (min)
}
```

**Key Methods**:

#### `generateCombinations(options)`
```
Input:  [{ name: "Size", values: ["M", "L"] }, { name: "Color", values: ["Black", "White"] }]
Output: [
  { Size: "M", Color: "Black" },
  { Size: "M", Color: "White" },
  { Size: "L", Color: "Black" },
  { Size: "L", Color: "White" }
]
```

#### `bulkUpsert(productId, variantsData)`
- 새로운 조합 → 생성
- 기존 조합 (options match) → 업데이트 (price, stock, sku)
- 제거된 조합 → isActive = false (soft delete)
- 완료 후 `syncProductAggregates()` 호출

#### `syncProductAggregates(productId)`
```javascript
const variants = await Variant.find({ product: productId, isActive: true });
const totalStock = variants.reduce((sum, v) => sum + v.stock, 0);
const minPrice = Math.min(...variants.map(v => v.price));
await Product.findByIdAndUpdate(productId, { stock: totalStock, price: minPrice });
```

### 3.2 StockService

**File**: `server/src/services/stockService.js`

```javascript
class StockService {
  // Stock Validation
  async checkAvailability(variantId, quantity)  // returns { available: boolean, stock: number }

  // Atomic Stock Operations
  async decrement(variantId, quantity)          // atomic $inc: -quantity, fails if stock < quantity
  async increment(variantId, quantity)          // atomic $inc: +quantity (order cancel / return)
  async decrementMultiple(items)               // batch: [{ variantId, quantity }] — transaction

  // Variant Availability for Frontend
  async getAvailabilityMap(productId)          // returns Map<optionComboKey, { stock, price }>
}
```

**Key Methods**:

#### `decrement(variantId, quantity)`
```javascript
// Atomic operation — prevents race condition
const result = await Variant.findOneAndUpdate(
  { _id: variantId, stock: { $gte: quantity } },
  { $inc: { stock: -quantity } },
  { new: true }
);
if (!result) throw new Error('Insufficient stock');
await this.variantService.syncProductAggregates(result.product);
return result;
```

#### `decrementMultiple(items)`
```javascript
// For order with multiple items — all-or-nothing
const session = await mongoose.startSession();
session.startTransaction();
try {
  for (const { variantId, quantity } of items) {
    const result = await Variant.findOneAndUpdate(
      { _id: variantId, stock: { $gte: quantity } },
      { $inc: { stock: -quantity } },
      { new: true, session }
    );
    if (!result) throw new Error(`Insufficient stock for variant ${variantId}`);
  }
  await session.commitTransaction();
} catch (err) {
  await session.abortTransaction();
  throw err;
} finally {
  session.endSession();
}
```

#### `getAvailabilityMap(productId)`
```javascript
// Frontend uses this to disable out-of-stock combinations
const variants = await Variant.find({ product: productId, isActive: true })
  .select('options stock price');
return variants.map(v => ({
  options: Object.fromEntries(v.options),
  stock: v.stock,
  price: v.price,
  variantId: v._id
}));
```

---

## 4. API Design

### 4.1 Product API (Modified)

#### `GET /api/products/:id`

Response에 variants 포함:
```json
{
  "_id": "...",
  "name": "Silk Shirt",
  "price": 89,
  "stock": 150,
  "options": [{ "name": "Size", "values": ["S","M","L","XL"] }, { "name": "Color", "values": ["Black","White"] }],
  "variants": [
    { "_id": "v1", "sku": "SILK-S-BLK", "price": 89, "stock": 20, "options": { "Size": "S", "Color": "Black" } },
    { "_id": "v2", "sku": "SILK-XL-BLK", "price": 99, "stock": 0, "options": { "Size": "XL", "Color": "Black" } }
  ]
}
```

#### `GET /api/products` (list)

Response에 `priceRange` 추가:
```json
{
  "data": [{
    "_id": "...",
    "name": "Silk Shirt",
    "price": 89,
    "stock": 150,
    "priceRange": { "min": 89, "max": 99 }
  }]
}
```
- `priceRange`는 Product에 저장하지 않고, productController에서 variant 조회 후 계산

### 4.2 Variant API (New)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/products/:productId/variants` | Public | 상품의 active variant 목록 |

### 4.3 Admin Variant API (New)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/admin/products/:id/variants` | Admin | Variant 일괄 생성/수정 (bulkUpsert) |
| PUT | `/api/admin/variants/:id` | Admin | 단일 variant 수정 |
| DELETE | `/api/admin/variants/:id` | Admin | Variant soft delete (isActive=false) |

#### `POST /api/admin/products/:id/variants` (bulkUpsert)

Request:
```json
{
  "variants": [
    { "sku": "SILK-S-BLK", "price": 89, "stock": 20, "options": { "Size": "S", "Color": "Black" } },
    { "sku": "SILK-XL-BLK", "price": 99, "stock": 15, "options": { "Size": "XL", "Color": "Black" } }
  ]
}
```

### 4.4 Cart API (Modified)

#### `POST /api/cart` (addItem)

Request 변경:
```json
// Before: { "product": "pid", "quantity": 1, "selectedOption": "Size: M, Color: Black" }
// After:
{ "product": "pid", "variant": "vid", "quantity": 1 }
```

- StockService.checkAvailability() 호출 후 추가
- stock 부족 시 400 에러: `{ "error": "Insufficient stock", "available": 3 }`

#### `GET /api/cart`

Response 변경: items에 variant populate 포함
```json
{
  "items": [{
    "product": { "_id": "pid", "name": "Silk Shirt", "images": [...] },
    "variant": { "_id": "vid", "sku": "SILK-M-BLK", "price": 89, "stock": 20, "options": { "Size": "M", "Color": "Black" } },
    "quantity": 2
  }]
}
```

### 4.5 Order API (Modified)

#### `POST /api/orders` (createOrder)

- Cart items → Order items 변환 시 variant 스냅샷 저장
- StockService.decrementMultiple() 호출 (transaction)
- 실패 시 전체 롤백

#### `PUT /api/admin/orders/:id` (updateStatus → cancelled)

- 취소 시 StockService.increment() 호출하여 재고 복원

---

## 5. Frontend Components

### 5.1 OptionSelector (Modified)

**File**: `client/src/components/product/OptionSelector.jsx`

Props 변경:
```jsx
// Before: { options, selectedOptions, onChange }
// After:
{
  options,           // [{ name: "Size", values: ["S","M","L"] }]
  variants,          // [{ _id, sku, price, stock, options: {Size:"M", Color:"Black"} }]
  selectedOptions,   // { Size: "M", Color: "Black" }
  onChange,           // (newSelectedOptions) => void
  onVariantSelect    // (variant | null) => void — called when full combo selected
}
```

**동작 로직**:
1. 첫 번째 옵션 (e.g., Size) 선택 → 두 번째 옵션 필터링
2. 선택한 Size에서 가능한 Color만 활성화
3. stock === 0인 조합의 버튼은 disabled + "Out of Stock" 라벨
4. 모든 옵션 선택 완료 → 매칭되는 variant 찾아서 `onVariantSelect(variant)` 호출
5. 가격 표시: 선택 중이면 가능한 variant의 가격 범위, 선택 완료 시 해당 variant 가격

**Helper 함수** (컴포넌트 내부):
```javascript
// 선택한 옵션들과 호환되는 variant 필터
function getAvailableValues(optionName, selectedSoFar, variants) {
  return variants
    .filter(v => Object.entries(selectedSoFar).every(([k, val]) => v.options[k] === val))
    .map(v => ({ value: v.options[optionName], stock: v.stock, price: v.price }));
}

// 선택 완료 시 매칭 variant 찾기
function findMatchingVariant(selectedOptions, variants) {
  return variants.find(v =>
    Object.entries(selectedOptions).every(([k, val]) => v.options[k] === val)
  );
}
```

### 5.2 ProductDetailPage (Modified)

**File**: `client/src/pages/customer/ProductDetailPage.jsx`

변경 사항:
- `product.variants` 데이터 사용
- `selectedVariant` state 추가
- 가격 표시: `selectedVariant?.price || product.price` (기본가 = 최저가)
- Add to Cart: `{ product: id, variant: selectedVariant._id, quantity }`
- variant 미선택 또는 stock 0이면 Add to Cart 비활성화

```jsx
const [selectedVariant, setSelectedVariant] = useState(null);

// OptionSelector에서 variant 선택 완료 시
const handleVariantSelect = (variant) => {
  setSelectedVariant(variant);
};

// 표시 가격
const displayPrice = selectedVariant ? selectedVariant.price : product.price;

// Add to Cart 조건
const canAddToCart = product.variants?.length
  ? selectedVariant && selectedVariant.stock > 0
  : true; // 옵션 없는 상품
```

### 5.3 AdminProductFormPage — Variant Matrix (Modified)

**File**: `client/src/pages/admin/AdminProductFormPage.jsx`

기존 옵션 설정 영역 아래에 **Variant Matrix** 추가.

**구조**:
```
┌─────────────────────────────────────────────────────────┐
│ Product Options                                          │
│ [+ Size] [+ Color]                                       │
│                                                          │
│ ┌── SIZE ──────────────────────────────────────────────┐ │
│ │ [XS] [S] [M] [L] [XL]                               │ │
│ └──────────────────────────────────────────────────────┘ │
│ ┌── COLOR ─────────────────────────────────────────────┐ │
│ │ [Black] [White] [Navy] [Grey]                        │ │
│ └──────────────────────────────────────────────────────┘ │
│                                                          │
│ Variant Matrix (8 combinations)                          │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ [Set All Prices: $___] [Set All Stock: ___]          │ │
│ ├───────┬───────┬──────────────┬────────┬──────────┤   │
│ │ Size  │ Color │ SKU          │ Price  │ Stock    │   │
│ ├───────┼───────┼──────────────┼────────┼──────────┤   │
│ │ S     │ Black │ [SILK-S-BLK] │ [$89]  │ [20]     │   │
│ │ S     │ White │ [SILK-S-WHT] │ [$89]  │ [15]     │   │
│ │ M     │ Black │ [SILK-M-BLK] │ [$89]  │ [25]     │   │
│ │ ...   │       │              │        │          │   │
│ └───────┴───────┴──────────────┴────────┴──────────┘   │
└─────────────────────────────────────────────────────────┘
```

**동작**:
1. 옵션 값 변경 시 → `VariantService.generateCombinations()` 로직을 프론트에서 재현 → 매트릭스 행 자동 생성
2. 기존 variant 데이터가 있으면 매칭하여 SKU/Price/Stock 유지
3. "Set All Prices" / "Set All Stock" 버튼으로 일괄 설정
4. 저장 시 product + variants 를 `POST /api/admin/products/:id/variants`로 전송

**Variant Matrix는 별도 컴포넌트로 분리** (200줄 제한):
- `client/src/components/admin/VariantMatrix.jsx`

### 5.4 Cart Page (Modified)

- `item.selectedOption` (string) 대신 `item.variant` 객체에서 옵션 표시
- 가격: `item.variant.price` 사용
- SKU 표시 (optional)

### 5.5 Order Detail (Modified)

- `item.variantOptions` Map에서 옵션 정보 표시
- `item.sku` 표시
- `item.price`는 주문 시점 스냅샷 (variant 가격 변경 무관)

---

## 6. Service Integration Flow

### 6.1 Add to Cart Flow

```
[Client] OptionSelector → variant 선택
   ↓
[Client] POST /api/cart { product, variant, quantity }
   ↓
[Server] cartController.addItem()
   ↓
[Server] StockService.checkAvailability(variantId, quantity)
   ├── stock >= quantity → 장바구니 추가
   └── stock < quantity → 400 { error: "Insufficient stock", available: N }
```

### 6.2 Order Creation Flow

```
[Client] POST /api/orders { items from cart }
   ↓
[Server] orderController.create()
   ↓
[Server] StockService.decrementMultiple(items) — Transaction
   ├── 모든 variant stock 충분 → commit, 주문 생성
   └── 하나라도 부족 → abort, 400 에러
   ↓
[Server] VariantService.syncProductAggregates() — Product.stock 업데이트
```

### 6.3 Order Cancel Flow

```
[Server] orderController.updateStatus(id, 'cancelled')
   ↓
[Server] StockService.increment(variantId, quantity) — 각 item별
   ↓
[Server] VariantService.syncProductAggregates() — Product.stock 복원
```

### 6.4 Admin Product Save Flow

```
[Client] AdminProductFormPage → 옵션 + Variant Matrix 입력
   ↓
[Client] PUT /api/admin/products/:id  (product 기본 정보)
[Client] POST /api/admin/products/:id/variants (variants 일괄)
   ↓
[Server] VariantService.bulkUpsert(productId, variantsData)
   ↓
[Server] VariantService.syncProductAggregates(productId)
```

---

## 7. Migration Plan

### 7.1 Phase 1: Schema + Seed (backward compatible)

1. Variant 모델 생성
2. Cart 모델에 `variant` 필드 추가 (optional, `selectedOption` 유지)
3. Order 모델에 `sku`, `variantOptions`, `variant` 필드 추가 (optional)
4. Seed 스크립트 업데이트: 각 상품에 variant 데이터 포함

### 7.2 Phase 2: Server Logic

1. VariantService, StockService 생성
2. productController: getById에 variants populate
3. cartController: variant 기반으로 변경 (selectedOption fallback 유지)
4. orderController: variant snapshot + stock 차감

### 7.3 Phase 3: Frontend

1. OptionSelector 수정: variant 기반 품절 표시
2. ProductDetailPage: variant 가격 + stock 연동
3. AdminProductFormPage + VariantMatrix 컴포넌트
4. Cart/Order 페이지: variant 정보 표시

### 7.4 Data Migration Script

```javascript
// server/src/scripts/migrateToVariants.js
// 1. 옵션 있는 기존 상품 → 조합별 variant 생성 (price=product.price, stock=product.stock/조합수)
// 2. 옵션 없는 상품 → 단일 default variant (sku="DEFAULT-{productId}", price=product.price, stock=product.stock)
// 3. Cart selectedOption string → variant ObjectId 매칭 (best-effort)
```

---

## 8. Test Plan

| ID | Scenario | Type | Expected |
|----|----------|------|----------|
| T-01 | Variant CRUD via admin API | API | 201/200/200 |
| T-02 | bulkUpsert — 새 조합 추가 | API | 새 variant 생성, Product.stock 동기화 |
| T-03 | bulkUpsert — 조합 제거 | API | isActive=false, Product.stock 갱신 |
| T-04 | Add to cart — stock 충분 | API | 200, cart 업데이트 |
| T-05 | Add to cart — stock 부족 | API | 400, "Insufficient stock" |
| T-06 | Order create — stock 차감 | API | variant.stock 감소, Product.stock 감소 |
| T-07 | Order cancel — stock 복원 | API | variant.stock 증가, Product.stock 증가 |
| T-08 | Concurrent orders — race condition | API | 하나만 성공, 나머지 실패 |
| T-09 | OptionSelector — 품절 조합 disable | UI | 버튼 disabled + "Out of Stock" |
| T-10 | OptionSelector — 가격 변경 반영 | UI | variant 선택 시 가격 업데이트 |
| T-11 | Admin Variant Matrix — 조합 생성 | UI | 옵션 변경 시 매트릭스 행 자동 생성 |
| T-12 | Admin Variant Matrix — bulk 설정 | UI | Set All Prices/Stock 작동 |
| T-13 | 옵션 없는 상품 — 하위호환 | E2E | 정상 장바구니 추가 및 주문 |

---

## 9. File Inventory

### 9.1 New Files (5)

| File | Lines (est.) | Description |
|------|:------------:|-------------|
| `server/src/models/Variant.js` | ~25 | Variant 스키마 |
| `server/src/services/variantService.js` | ~120 | Variant CRUD, 조합 생성, Product 동기화 |
| `server/src/services/stockService.js` | ~80 | 재고 검증, atomic 차감/복원, transaction |
| `server/src/controllers/variantController.js` | ~60 | Admin variant API handler |
| `server/src/routes/variantRoutes.js` | ~20 | Variant route 정의 |
| `client/src/components/admin/VariantMatrix.jsx` | ~150 | Variant 매트릭스 입력 UI |

### 9.2 Modified Files (9)

| File | Changes |
|------|---------|
| `server/src/models/Cart.js` | `variant` ref 추가, `selectedOption` 유지 |
| `server/src/models/Order.js` | `variant`, `sku`, `variantOptions` 추가 |
| `server/src/controllers/productController.js` | getById에 variants populate, create/update에 variant 연동 |
| `server/src/controllers/cartController.js` | variant 기반 + StockService 재고 검증 |
| `server/src/controllers/orderController.js` | variant snapshot + StockService 차감/복원 |
| `server/src/routes/adminRoutes.js` | variant 라우트 추가 |
| `server/src/seed.js` | variant 데이터 포함 |
| `client/src/components/product/OptionSelector.jsx` | variant 기반 품절/가격 표시 |
| `client/src/pages/customer/ProductDetailPage.jsx` | variant 선택, 가격 연동 |
| `client/src/pages/admin/AdminProductFormPage.jsx` | VariantMatrix 컴포넌트 연동 |
| `client/src/services/productService.js` | variant API 호출 함수 추가 |
| `client/src/services/cartService.js` | addItem 파라미터 변경 |

---

## 10. Error Handling

| Scenario | HTTP | Response |
|----------|:----:|----------|
| Variant not found | 404 | `{ error: "Variant not found" }` |
| Duplicate SKU | 409 | `{ error: "SKU already exists" }` |
| Insufficient stock (cart add) | 400 | `{ error: "Insufficient stock", available: N }` |
| Insufficient stock (order) | 400 | `{ error: "Some items are out of stock", details: [...] }` |
| Invalid variant for product | 400 | `{ error: "Variant does not belong to this product" }` |
| No variant selected (required) | 400 | `{ error: "Please select product options" }` |

---

## 11. Implementation Guide

### 11.1 Implementation Order

| Step | Module | Files | Dependency |
|:----:|--------|-------|------------|
| 1 | Variant Model | `Variant.js` | None |
| 2 | VariantService | `variantService.js` | Step 1 |
| 3 | StockService | `stockService.js` | Step 1 |
| 4 | Variant Controller + Routes | `variantController.js`, `variantRoutes.js` | Step 2 |
| 5 | Product Model/Controller 수정 | `Product.js`, `productController.js` | Step 2 |
| 6 | Cart Model/Controller 수정 | `Cart.js`, `cartController.js` | Step 3 |
| 7 | Order Model/Controller 수정 | `Order.js`, `orderController.js` | Step 3 |
| 8 | Seed 데이터 업데이트 | `seed.js` | Step 2 |
| 9 | OptionSelector 수정 | `OptionSelector.jsx` | Step 5 API ready |
| 10 | ProductDetailPage 수정 | `ProductDetailPage.jsx` | Step 9 |
| 11 | VariantMatrix 컴포넌트 | `VariantMatrix.jsx` | Step 4 API ready |
| 12 | AdminProductFormPage 수정 | `AdminProductFormPage.jsx` | Step 11 |
| 13 | Cart/Order 페이지 수정 | Cart/Order pages | Step 6, 7 |

### 11.2 Dependencies

```
npm install  — 없음 (기존 mongoose transaction 지원)
```

### 11.3 Session Guide

#### Module Map

| Module | Steps | Files | Est. Lines |
|--------|:-----:|-------|:----------:|
| **module-1: Server Core** | 1-3 | Variant.js, variantService.js, stockService.js | ~225 |
| **module-2: Server API** | 4-7 | variantController.js, variantRoutes.js, productController, cartController, orderController, Cart.js, Order.js | ~200 |
| **module-3: Seed** | 8 | seed.js | ~80 |
| **module-4: Frontend Customer** | 9-10 | OptionSelector.jsx, ProductDetailPage.jsx | ~100 |
| **module-5: Frontend Admin** | 11-12 | VariantMatrix.jsx, AdminProductFormPage.jsx | ~180 |
| **module-6: Frontend Cart/Order** | 13 | Cart/Order pages, cartService.js | ~50 |

#### Recommended Session Plan

| Session | Modules | Description |
|:-------:|---------|-------------|
| 1 | module-1 + module-2 | Server: 모델, 서비스, 컨트롤러, 라우트 |
| 2 | module-3 + module-4 | Seed 업데이트 + 고객 UI (옵션 선택, 품절 표시) |
| 3 | module-5 + module-6 | Admin UI (Variant Matrix) + Cart/Order 페이지 |
