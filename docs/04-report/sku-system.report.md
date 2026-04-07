# SKU System — Completion Report

**Feature**: sku-system (Variant-Based Inventory Management)
**Date**: 2026-04-06
**PDCA Cycle**: Plan → Design → Do → Check → Report

---

## Executive Summary

### 1.1 Overview

| Perspective | Planned | Delivered |
|-------------|---------|-----------|
| **Problem** | 상품당 단일 stock → 옵션 조합별 재고 추적 불가 | Variant 모델로 조합별 개별 재고/가격/SKU 관리 완성 |
| **Solution** | Variant 모델 + VariantService + StockService (Clean Architecture) | 별도 Variant 컬렉션, Service 계층 2개, Controller 1개, Route 1개 신규 |
| **기능/UX** | 품절 옵션 비활성화, variant별 가격 반영, Admin 매트릭스 입력 | OptionSelector 품절 표시, 가격 실시간 변경, VariantMatrix bulk 설정 |
| **핵심 가치** | 재고 정확성 + 과주문 원천 차단 | Atomic `$inc` + Transaction으로 race condition 방지, 취소 시 복원 |

### 1.2 Metrics

| Metric | Value |
|--------|-------|
| Match Rate | 100% |
| Iterations | 1 (getAvailabilityMap 추가) |
| Success Criteria | 7/7 (100%) |
| New Files | 6 |
| Modified Files | 12 |
| Seed Data | 50 products → 640 variants |
| Client Build | 235KB (no regression) |

### 1.3 Value Delivered

| Perspective | Result |
|-------------|--------|
| **고객** | 품절 옵션 즉시 확인, 선택한 variant 가격 실시간 반영, 재고 부족 시 장바구니 추가 차단 |
| **관리자** | 옵션 조합별 SKU/가격/재고 매트릭스 입력, Bulk 가격/재고 설정, variant soft delete |
| **시스템** | Atomic stock 차감 (race condition 방지), MongoDB Transaction, 주문 취소 시 stock 복원 |
| **하위호환** | 옵션 없는 상품 정상 동작, 기존 selectedOption string 유지, legacy order 데이터 보존 |

---

## 2. Key Decisions & Outcomes

| Phase | Decision | Followed? | Outcome |
|-------|----------|:---------:|---------|
| Plan | variant별 개별 가격 (기본가+추가 아님) | ✅ Yes | variant마다 독립 가격, Seed에서 XL +10% 적용 |
| Plan | Admin SKU 직접 입력 | ✅ Yes | VariantMatrix에 SKU input, Seed는 자동 생성 |
| Plan | 품절 = 선택 불가 + Out of Stock | ✅ Yes | disabled button + text + CSS strikethrough |
| Design | Option B: Clean Architecture | ✅ Yes | VariantService + StockService 분리 |
| Design | 별도 Variant 컬렉션 | ✅ Yes | SKU unique index, atomic $inc 용이 |
| Design | Cart에 variant ref 추가 | ✅ Yes | selectedOption string도 유지 (하위호환) |
| Design | Order에 variant 스냅샷 | ✅ Yes | sku, variantOptions Map 저장 |

---

## 3. Success Criteria Final Status

| SC | Criteria | Status | Evidence |
|----|----------|:------:|----------|
| SC-01 | variant별 재고 정확히 차감 | ✅ Met | stockService.js:14 — atomic `findOneAndUpdate` with `$inc` + `$gte` |
| SC-02 | 품절 옵션 UI 선택 불가 | ✅ Met | OptionSelector.jsx:72-96 — `disabled={outOfStock}` + "Out of Stock" text |
| SC-03 | variant별 가격 반영 | ✅ Met | ProductDetailPage.jsx:88 — `displayPrice = selectedVariant.price` |
| SC-04 | Admin 조합별 SKU/가격/재고 입력 | ✅ Met | VariantMatrix.jsx — table with SKU/Price/Stock inputs + bulk actions |
| SC-05 | 옵션 없는 상품 하위호환 | ✅ Met | ProductDetailPage.jsx:90 — `hasVariants ? ... : true`, Cart fallback to selectedOption |
| SC-06 | 동시 주문 시 재고 음수 불가 | ✅ Met | stockService.js:36-65 — MongoDB transaction + `$gte` condition |
| SC-07 | 주문 취소 시 stock 복원 | ✅ Met | orderController.js:135-140 — `stockService.increment()` per item |

**Overall: 7/7 criteria met (100%)**

---

## 4. Architecture Summary

```
┌─────────────────────────────────────────────────────────────┐
│                        Client (React)                        │
├──────────────┬──────────────┬──────────────┬────────────────┤
│ OptionSelector│ ProductDetail│ VariantMatrix│ CartItem       │
│ (variants,   │ (selectedVar,│ (SKU/Price/  │ (variant.price)│
│  out-of-stock)│  displayPrice│  Stock grid) │                │
├──────────────┴──────────────┴──────────────┴────────────────┤
│                    API Layer (Express 5)                      │
├──────────────┬──────────────┬──────────────┬────────────────┤
│ variantCtrl  │ productCtrl  │ cartCtrl     │ orderCtrl      │
│ (bulkUpsert, │ (variants    │ (stock check,│ (stock decr,   │
│  update, del)│  populate)   │  variant ref)│  cancel restore│
├──────────────┴──────────────┴──────────────┴────────────────┤
│                     Service Layer                            │
├─────────────────────────────┬───────────────────────────────┤
│      VariantService          │       StockService            │
│ - generateCombinations       │ - checkAvailability           │
│ - bulkUpsert                 │ - decrement (atomic)          │
│ - syncProductAggregates      │ - increment (restore)         │
│ - getByProduct/getById       │ - decrementMultiple (txn)     │
│                              │ - getAvailabilityMap          │
├─────────────────────────────┴───────────────────────────────┤
│                     Data Layer (MongoDB)                      │
├─────────────────────────────┬───────────────────────────────┤
│ Product (stock=sum, price=  │ Variant (sku unique, price,   │
│  min, options=source)        │  stock, options Map, isActive) │
├──────────────┬──────────────┼───────────────────────────────┤
│ Cart (variant│ Order (variant│                               │
│  ref added)  │  + sku/options│                               │
│              │  snapshot)    │                               │
└──────────────┴──────────────┴───────────────────────────────┘
```

---

## 5. File Inventory

### New Files (6)

| File | Lines | Purpose |
|------|:-----:|---------|
| server/src/models/Variant.js | 16 | Variant schema — SKU unique, price, stock, options Map |
| server/src/services/variantService.js | 72 | CRUD, bulkUpsert, generateCombinations, syncProductAggregates |
| server/src/services/stockService.js | 80 | checkAvailability, atomic decrement/increment, transaction, availabilityMap |
| server/src/controllers/variantController.js | 62 | Admin variant API — bulkUpsert, update, soft-delete |
| server/src/routes/variants.js | 12 | Public + admin variant routes |
| client/src/components/admin/VariantMatrix.jsx | 132 | Option combination matrix — SKU/Price/Stock inputs, bulk actions |

### Modified Files (12)

| File | Change |
|------|--------|
| server/src/models/Cart.js | Added `variant` ObjectId ref |
| server/src/models/Order.js | Added `variant`, `sku`, `variantOptions` fields |
| server/src/controllers/productController.js | Variants populate in getById, variant support in create |
| server/src/controllers/cartController.js | Variant-based matching + StockService check |
| server/src/controllers/orderController.js | Variant snapshot + stock decrement/restore |
| server/src/routes/variants.js | New route file registered |
| server/src/app.js | Variant routes registered |
| server/src/seed.js | 640 variants generated for 50 products |
| client/src/components/product/OptionSelector.jsx | Variant-aware with out-of-stock display |
| client/src/pages/customer/ProductDetailPage.jsx | selectedVariant state, displayPrice, variant cart API |
| client/src/pages/admin/AdminProductFormPage.jsx | VariantMatrix integration, variant save |
| client/src/components/order/CartItem.jsx | variant.price for display |
| client/src/pages/customer/CartPage.jsx | variant.price in total |
| client/src/pages/customer/CheckoutPage.jsx | variant.price in total + summary |
| client/src/services/adminService.js | bulkUpsertVariants method |

---

## 6. Gap Analysis Summary

| Axis | Score |
|------|:-----:|
| Structural Match | 100% (18/18 files) |
| Functional Depth | 100% (32/32 items) |
| API Contract | 100% (8/8 endpoints) |
| **Overall Match Rate** | **100%** |

### Iteration Log

| # | Gap | Fix | Post-Fix Rate |
|:-:|-----|-----|:-------------:|
| 1 | stockService.getAvailabilityMap() missing | Added method (10 lines) | 100% |

---

## 7. Lessons Learned

| Category | Insight |
|----------|---------|
| **Architecture** | Service 계층 분리(VariantService + StockService)로 Cart/Order 컨트롤러의 재고 로직 중복 제거 |
| **Data Model** | 별도 컬렉션으로 분리한 것이 SKU unique index와 atomic $inc에 결정적 — embedded subdoc 방식이었으면 race condition 방지가 훨씬 복잡했을 것 |
| **Migration** | selectedOption string을 삭제하지 않고 variant 필드를 추가로 붙이는 방식이 하위호환에 효과적 |
| **Frontend** | OptionSelector의 availability 필터링 로직이 프론트에서 variants 배열로 충분히 처리 가능 — 별도 API 불필요 |
| **Seed** | SKU 충돌 방지를 위해 productId 일부를 SKU에 포함하는 패턴이 유효 |
