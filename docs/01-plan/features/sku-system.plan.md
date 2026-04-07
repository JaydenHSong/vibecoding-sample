# SKU System — Variant-Based Inventory Management

## Executive Summary

| Perspective | Description |
|-------------|-------------|
| **Problem** | 현재 상품당 단일 stock 필드만 존재하여, Size M + Black은 5개 남았지만 Size L + White는 품절인 상황을 추적할 수 없다 |
| **Solution** | Product에 종속된 Variant 모델을 도입하여 옵션 조합별 SKU 코드, 개별 가격, 개별 재고를 관리한다 |
| **기능/UX 효과** | 고객은 품절된 옵션 조합을 즉시 확인할 수 있고, variant별 가격이 반영되며, 관리자는 조합별 재고를 독립적으로 관리한다 |
| **핵심 가치** | 실제 커머스 운영에 필수적인 재고 정확성을 확보하고, 과주문/재고 불일치 문제를 원천 차단한다 |

## Context Anchor

| Key | Value |
|-----|-------|
| **WHY** | 옵션 조합별 재고 추적 불가 → 과주문 발생 가능, 품절 상태 표시 불가 |
| **WHO** | 고객 (정확한 재고 확인), 관리자 (조합별 재고/가격 관리) |
| **RISK** | 기존 Cart/Order의 selectedOption(string) 마이그레이션, seed 데이터 재구성 |
| **SUCCESS** | variant별 재고 차감, 품절 옵션 비활성화, Admin에서 조합별 가격/재고/SKU 입력 |
| **SCOPE** | Variant 모델, Product↔Variant 연동, Cart/Order 참조 변경, Admin UI, 고객 UI 품절 표시 |

---

## 1. Requirements

### 1.1 Functional Requirements

#### FR-01: Variant Model
- 각 Product의 옵션 조합(Size × Color 등)마다 Variant 문서를 생성
- Variant 필드: `sku` (string, unique), `price` (number), `stock` (number), `options` (Map — e.g., `{Size: "M", Color: "Black"}`), `product` (ref)
- Admin이 SKU 코드를 직접 입력
- variant에 개별 이미지를 지정 가능 (선택적, v2에서 고려)

#### FR-02: Product↔Variant 연동
- Product 생성/수정 시 옵션 조합에 따라 Variant CRUD
- Product의 기존 `stock` 필드는 모든 variant stock 합계로 산출 (virtual 또는 aggregation)
- Product의 `price` 필드는 최저 variant 가격으로 표시 (가격 범위: "From $100")
- 옵션이 없는 상품은 단일 "default" variant로 처리 (하위호환)

#### FR-03: Cart 연동
- `Cart.items.selectedOption` (string) → `Cart.items.variant` (ObjectId ref to Variant)로 변경
- 장바구니 추가 시 해당 variant의 stock 확인
- stock이 0이면 장바구니 추가 거부 + 에러 메시지

#### FR-04: Order 연동
- `Order.items.selectedOption` (string) → variant 정보 스냅샷으로 변경
- Order에는 주문 시점의 `sku`, `price`, `options` 스냅샷을 저장 (variant 삭제되어도 주문 이력 유지)
- 주문 확정(paid) 시 variant stock 차감
- 주문 취소 시 variant stock 복원

#### FR-05: 품절 처리
- 프론트엔드: stock이 0인 variant의 옵션 조합은 버튼 disable + "Out of Stock" 표시
- 옵션 선택 순서에 따라 가능한 조합만 활성화 (e.g., Size M 선택 → M에서 가능한 Color만 활성)
- Add to Cart 시 서버 사이드에서도 재고 재검증 (race condition 방지)

#### FR-06: Admin UI
- 상품 편집 페이지에서 옵션 설정 후 variant 매트릭스 자동 생성
- 매트릭스: 각 조합의 SKU, 가격, 재고를 테이블/그리드로 입력
- 기존 옵션 추가/제거 시 variant 매트릭스 동적 업데이트
- Bulk 설정: "모든 variant에 동일 가격 적용", "모든 variant에 동일 재고 적용"

### 1.2 Non-Functional Requirements

| ID | Requirement |
|----|-------------|
| NFR-01 | 재고 차감은 atomic operation (MongoDB `$inc` with negative value) |
| NFR-02 | variant가 100개 이상인 상품도 Admin UI가 버벅이지 않아야 함 |
| NFR-03 | 기존 옵션 없는 상품은 단일 default variant로 자동 마이그레이션 |
| NFR-04 | Cart/Order의 기존 selectedOption string 데이터는 마이그레이션 스크립트로 처리 |

---

## 2. Data Model Changes

### 2.1 New: Variant Model

```javascript
// server/src/models/Variant.js
const variantSchema = new mongoose.Schema({
  product: { type: ObjectId, ref: 'Product', required: true, index: true },
  sku: { type: String, required: true, unique: true, trim: true },
  price: { type: Number, required: true, min: 0 },
  stock: { type: Number, required: true, default: 0, min: 0 },
  options: { type: Map, of: String },  // { "Size": "M", "Color": "Black" }
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

variantSchema.index({ product: 1, sku: 1 });
```

### 2.2 Modified: Product Model

```javascript
// Product.stock → virtual (sum of variants)
// Product.price → 유지하되, 최저 variant 가격으로 동기화
// Product.options → 유지 (variant 생성의 소스)
```

### 2.3 Modified: Cart Model

```javascript
// Cart.items[].selectedOption (String) → 삭제
// Cart.items[].variant (ObjectId, ref: 'Variant') → 추가
```

### 2.4 Modified: Order Model

```javascript
// Order.items[].selectedOption (String) → 삭제
// Order.items[].sku (String) → 추가
// Order.items[].variantOptions (Map) → 추가 (스냅샷)
// Order.items[].variant (ObjectId, ref: 'Variant') → 추가 (soft ref)
```

---

## 3. API Changes

### 3.1 Product API (기존 수정)

| Method | Endpoint | 변경 사항 |
|--------|----------|-----------|
| GET | `/api/products` | 응답에 `priceRange`, `totalStock` 추가 |
| GET | `/api/products/:id` | 응답에 `variants` 배열 포함 (populate) |

### 3.2 Variant API (신규)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products/:productId/variants` | 상품의 모든 variant 조회 |
| GET | `/api/variants/:id` | 단일 variant 조회 |

### 3.3 Admin API (기존 수정 + 신규)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/products` | product + variants 일괄 생성 |
| PUT | `/api/admin/products/:id` | product + variants 일괄 수정 |
| PUT | `/api/admin/variants/:id` | 단일 variant 수정 (재고/가격) |
| POST | `/api/admin/products/:id/variants/bulk` | variant 일괄 생성/수정 |

### 3.4 Cart API (기존 수정)

| Method | Endpoint | 변경 사항 |
|--------|----------|-----------|
| POST | `/api/cart` | body: `{ product, variant, quantity }` — variant stock 검증 |

### 3.5 Order API (기존 수정)

| Method | Endpoint | 변경 사항 |
|--------|----------|-----------|
| POST | `/api/orders` | 주문 생성 시 variant stock atomic 차감 |

---

## 4. Frontend Changes

### 4.1 ProductDetailPage
- OptionSelector에 variant 데이터 전달 → 품절 조합 disable
- 옵션 선택 시 해당 variant의 price 표시 (기본가 대신)
- 선택된 variant의 stock이 0이면 Add to Cart 비활성화

### 4.2 OptionSelector (Component 수정)
- props로 `variants` 배열 수신
- 옵션 선택 시 가능한 조합 필터링 → 불가능한 값 disable + "Out of Stock"
- 선택 완료 시 `onVariantSelect(variant)` 콜백

### 4.3 AdminProductFormPage
- 옵션 설정 영역 아래에 Variant Matrix 추가
- 옵션 변경 시 조합 자동 계산 → 매트릭스 행 생성
- 각 행: SKU 입력, Price 입력, Stock 입력
- Bulk 액션 버튼: "Set All Prices", "Set All Stock"

### 4.4 Cart/Order 페이지
- selectedOption string 대신 variant 정보 표시
- variant.sku 표시 (주문 상세)

---

## 5. Migration Strategy

### 5.1 DB Migration
1. Variant 모델 생성
2. 기존 Product에서 options가 있는 상품 → 조합별 default variant 생성 (price = product.price, stock = product.stock / 조합 수)
3. options가 없는 상품 → 단일 default variant 생성 (sku = "DEFAULT")
4. Cart의 selectedOption string → 매칭되는 variant ObjectId로 변환
5. Order의 selectedOption은 그대로 유지 (이력 보존) + 새 필드 추가

### 5.2 Seed 데이터
- seed.js 업데이트: 50개 상품 각각에 옵션 조합별 variant 데이터 생성
- variant별 가격 차이 반영 (e.g., XL = 기본가 + 10%)
- variant별 랜덤 재고 (5~50)

---

## 6. Success Criteria

| ID | Criteria | 검증 방법 |
|----|----------|-----------|
| SC-01 | variant별 개별 재고가 정확히 차감된다 | 주문 후 variant stock 확인 |
| SC-02 | 품절 옵션은 UI에서 선택 불가 + "Out of Stock" 표시 | 프론트엔드 테스트 |
| SC-03 | variant별 개별 가격이 상품 상세에 반영된다 | 옵션 변경 시 가격 변경 확인 |
| SC-04 | Admin에서 조합별 SKU/가격/재고 입력 가능 | Admin UI 테스트 |
| SC-05 | 옵션 없는 기존 상품이 정상 동작 (하위호환) | 기존 상품 장바구니 추가 테스트 |
| SC-06 | 동시 주문 시 재고 음수 불가 (atomic) | 동시 요청 테스트 |
| SC-07 | 주문 취소 시 variant stock 복원 | 취소 후 재고 확인 |

---

## 7. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Cart/Order 마이그레이션 중 데이터 손실 | High | selectedOption string을 삭제하지 않고 variant 필드를 추가로 붙임 |
| 옵션 조합 폭발 (Size 5 × Color 10 = 50 variants) | Medium | Admin UI에 조합 수 경고 표시, bulk 설정 기능 제공 |
| 동시 주문 race condition | High | MongoDB `$inc` atomic operation + stock ≥ 0 조건 |
| 기존 seed 데이터와 호환성 | Medium | migration script로 기존 데이터 자동 변환 |

---

## 8. Implementation Order

1. **Variant Model** — `server/src/models/Variant.js`
2. **Product Model 수정** — virtual stock, price range
3. **Variant Controller + Routes** — CRUD + bulk
4. **Product Controller 수정** — variant populate, admin API 변경
5. **Cart Controller 수정** — variant ref + stock 검증
6. **Order Controller 수정** — variant snapshot + atomic 차감
7. **Seed 데이터 업데이트** — variant 포함
8. **OptionSelector 수정** — 품절 표시, 가격 변경
9. **ProductDetailPage 수정** — variant 연동
10. **AdminProductFormPage 수정** — Variant Matrix UI
11. **Cart/Order 페이지 수정** — variant 정보 표시
