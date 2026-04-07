# SKU System — Gap Analysis Report

**Feature**: sku-system
**Design**: docs/02-design/features/sku-system.design.md
**Date**: 2026-04-06

## Context Anchor

| Key | Value |
|-----|-------|
| **WHY** | 옵션 조합별 재고 추적 불가 → 과주문, 품절 표시 불가 |
| **WHO** | 고객 (정확한 재고), 관리자 (조합별 관리) |
| **RISK** | Cart/Order selectedOption 마이그레이션, seed 재구성 |
| **SUCCESS** | variant별 재고 차감, 품절 비활성화, Admin 조합별 입력 |
| **SCOPE** | Variant 모델+서비스, Cart/Order 변경, Admin UI, 고객 UI |

---

## 1. Structural Match — 100%

| Design File | Actual File | Status |
|-------------|-------------|:------:|
| Variant.js (new) | server/src/models/Variant.js | PASS |
| variantService.js (new) | server/src/services/variantService.js | PASS |
| stockService.js (new) | server/src/services/stockService.js | PASS |
| variantController.js (new) | server/src/controllers/variantController.js | PASS |
| variants.js route (new) | server/src/routes/variants.js | PASS |
| VariantMatrix.jsx (new) | client/src/components/admin/VariantMatrix.jsx | PASS |
| Cart.js (modify) | variant field added | PASS |
| Order.js (modify) | variant, sku, variantOptions added | PASS |
| productController.js (modify) | variants populate in getById | PASS |
| cartController.js (modify) | variant + stock check | PASS |
| orderController.js (modify) | stock decrement/restore | PASS |
| app.js (modify) | variant routes registered | PASS |
| seed.js (modify) | 640 variants generated | PASS |
| OptionSelector.jsx (modify) | variant-aware + out-of-stock | PASS |
| ProductDetailPage.jsx (modify) | selectedVariant state + price | PASS |
| AdminProductFormPage.jsx (modify) | VariantMatrix integrated | PASS |
| CartItem.jsx (modify) | variant price display | PASS |
| CartPage.jsx + CheckoutPage.jsx (modify) | variant price in totals | PASS |

**Result: 18/18 files — 100%**

---

## 2. Functional Depth — 100%

### Service Methods

| Method | Design | Impl | Status |
|--------|:------:|:----:|:------:|
| variantService.generateCombinations | §3.1 | OK | PASS |
| variantService.getByProduct | §3.1 | OK | PASS |
| variantService.getById | §3.1 | OK | PASS |
| variantService.bulkUpsert | §3.1 | OK | PASS |
| variantService.syncProductAggregates | §3.1 | OK | PASS |
| stockService.checkAvailability | §3.2 | OK | PASS |
| stockService.decrement | §3.2 | OK | PASS |
| stockService.increment | §3.2 | OK | PASS |
| stockService.decrementMultiple | §3.2 | OK | PASS |
| stockService.getAvailabilityMap | §3.2 | OK | PASS (fixed in iteration) |

### Frontend Components

| Component | Items Checked | Passed | Status |
|-----------|:------------:|:------:|:------:|
| OptionSelector | 5 | 5 | PASS |
| ProductDetailPage | 5 | 5 | PASS |
| VariantMatrix | 4 | 4 | PASS |
| AdminProductFormPage | 4 | 4 | PASS |
| Cart/Order pages | 3 | 3 | PASS |
| CSS styles | 1 | 1 | PASS |

**Result: 32/32 items — 100%**

---

## 3. API Contract — 100%

| Design API | Route File | Controller | Status |
|------------|------------|------------|:------:|
| GET /api/products/:id (variants) | products.js | productController.getById | PASS |
| GET /api/products/:productId/variants | variants.js | variantController.getByProduct | PASS |
| POST /api/admin/products/:id/variants | variants.js | variantController.bulkUpsert | PASS |
| PUT /api/admin/variants/:id | variants.js | variantController.update | PASS |
| DELETE /api/admin/variants/:id | variants.js | variantController.remove | PASS |
| POST /api/cart (variant + stock) | cart.js | cartController.addItem | PASS |
| POST /api/orders (stock decrement) | orders.js | orderController.create | PASS |
| PUT /api/admin/orders/:id/status (cancel restore) | orders.js | orderController.updateStatus | PASS |

**Result: 8/8 endpoints — 100%**

---

## 4. Plan Success Criteria

| SC | Criteria | Status | Evidence |
|----|----------|:------:|----------|
| SC-01 | variant별 재고 차감 | ✅ Met | stockService.decrement: atomic $inc |
| SC-02 | 품절 옵션 UI 비활성화 | ✅ Met | OptionSelector: disabled + "Out of Stock" |
| SC-03 | variant별 가격 반영 | ✅ Met | ProductDetailPage: displayPrice = selectedVariant.price |
| SC-04 | Admin 조합별 입력 | ✅ Met | VariantMatrix: SKU/Price/Stock table |
| SC-05 | 하위호환 | ✅ Met | selectedOption 유지, variant optional |
| SC-06 | atomic stock (race condition) | ✅ Met | MongoDB $inc + $gte + transaction |
| SC-07 | 취소 시 stock 복원 | ✅ Met | orderController.updateStatus: stockService.increment |

**Result: 7/7 criteria — 100%**

---

## 5. Match Rate

```
Overall = (Structural × 0.2) + (Functional × 0.4) + (Contract × 0.4)
        = (100% × 0.2) + (100% × 0.4) + (100% × 0.4)
        = 20% + 40% + 40%
        = 100%
```

**Match Rate: 100%**

---

## 6. Iteration History

| Iteration | Gap | Fix | Result |
|:---------:|-----|-----|--------|
| 1 | stockService.getAvailabilityMap missing | Added method | 100% |

---

## 7. Build Verification

- Client build: PASS (vite build, 0 errors)
- Server methods: PASS (10/10 service methods verified)
- Seed: PASS (50 products, 640 variants generated)
