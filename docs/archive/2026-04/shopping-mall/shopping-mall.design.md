# Shopping Mall Design Document

> **Summary**: Stitch 디자인 시스템(29CM 에디토리얼) 기반 React+Vite 풀스택 쇼핑몰 상세 설계
>
> **Project**: vibecoding-sample
> **Version**: 1.0.0
> **Author**: jaydensong
> **Date**: 2026-04-05
> **Status**: Draft
> **Planning Doc**: [shopping-mall.plan.md](../../01-plan/features/shopping-mall.plan.md)

---

## Context Anchor

| Key | Value |
|-----|-------|
| **WHY** | Stitch에서 디자인한 22개 쇼핑몰 페이지를 실제 동작하는 풀스택 앱으로 구현 |
| **WHO** | 쇼핑몰 고객 (구매자) + 어드민 (운영자) |
| **RISK** | 22개 페이지의 복잡한 스키마 관계와 API 설계의 일관성 유지 |
| **SUCCESS** | 모든 CRUD API 동작 + 프론트 페이지 22개 React 컴포넌트 구현 완료 |
| **SCOPE** | Phase 1: 스키마 → Phase 2: CRUD/라우터 → Phase 3: 프론트 페이지 → Phase 4: 프론트 로직 |

---

## Design Anchor (from Google Stitch)

> Stitch Project ID: `8803964047661137733`
> Design System: "The Curated Gallery" — Editorial Minimalism (29CM 스타일)

| Category | Tokens |
|----------|--------|
| **Colors** | primary: `#000000`, secondary: `#006876`, bg: `#f9f9f9`, surface: `#ffffff`, surface-low: `#f3f3f3`, surface-high: `#e8e8e8`, text: `#1a1c1c`, text-variant: `#4c4546`, outline: `#7e7576`, outline-variant: `#cfc4c5`, error: `#ba1a1a`, error-container: `#ffdad6` |
| **Typography** | Inter (Pretendard Variable), display-lg: 3.5rem, headline-lg: 2rem, body-md: 0.875rem, label-sm: 0.6875rem, letter-spacing: -0.02em (headlines) |
| **Spacing** | Scale 3 (base 8px), card gap: 48px min vertical, section: 96px |
| **Radius** | sm: 0.125rem (buttons), md: 0.375rem (max), **rounded corners above md 금지** |
| **Tone** | 에디토리얼 미니멀리즘, 비대칭 레이아웃, 화이트스페이스 활용, 3:4 비율 상품 이미지 |
| **Layout** | Glassmorphism 헤더 (backdrop-blur 20-40px), 톤 레이어링으로 깊이, 1px 보더 금지 |

### Stitch Design Rules (필수 준수)

1. **No-Line Rule**: 1px solid 보더 사용 금지. 배경색 변화로 영역 구분
2. **Surface Hierarchy**: `#f9f9f9`(base) → `#f3f3f3`(section) → `#ffffff`(card pop)
3. **Ghost Border**: 필수 보더 시 `#cfc4c5` opacity 20%만 허용
4. **Gradient CTA**: 주요 버튼은 `#000000` → `#1b1b1b` 그라디언트
5. **Typography Contrast**: 큰 display + 작은 uppercase label 조합
6. **No Dividers**: 리스트 구분선 금지, 48px+ 간격으로 분리
7. **Ambient Shadow**: 플로팅 요소에만 `rgba(26,28,28, 0.04-0.06)` blur 30-60px

---

## 1. Overview

### 1.1 Design Goals

- Stitch HTML 디자인을 React 컴포넌트로 정확히 변환
- 디자인 토큰을 CSS 변수로 중앙 관리하여 일관성 유지
- 고객 페이지 / 어드민 페이지 레이아웃 분리
- 서버 API와 프론트엔드 간 명확한 데이터 플로우

### 1.2 Design Principles

- **Stitch Fidelity**: Stitch HTML/CSS를 최대한 재사용, 스타일 직접 참조
- **Component Reuse**: 공통 UI 요소를 common 컴포넌트로 추출
- **Clean Separation**: pages(라우팅) / components(UI) / services(API) / store(상태) 분리

---

## 2. Architecture

### 2.0 Architecture Comparison

| Criteria | Option A: Flat | Option B: Feature | **Option C: Page+Component** |
|----------|:-:|:-:|:-:|
| **Approach** | 22개 페이지 플랫 배치 | 기능별 폴더 분리 | 페이지/컴포넌트 역할 분리 |
| **New Files** | ~30 | ~60 | ~45 |
| **Complexity** | Low | High | Medium |
| **Maintainability** | Low | High | High |
| **Stitch 변환** | 쉬움 | 복잡함 | **최적** |
| **Recommendation** | 프로토타입 | 대규모 앱 | **이 프로젝트** |

**Selected**: Option C — **Rationale**: Stitch HTML을 pages/로 빠르게 변환하면서, 재사용 UI는 components/로 분리. 22개 페이지 규모에 가장 균형잡힌 구조.

### 2.1 Component Diagram

```
┌─────────────────────────────────────────────────────┐
│ Client (React + Vite)                                │
│ ┌──────────┐  ┌──────────┐  ┌──────────┐            │
│ │  Pages   │→│Components│→│  Styles  │            │
│ │(customer)│  │ (common) │  │ (tokens) │            │
│ │ (admin)  │  │(product) │  │  (CSS)   │            │
│ └────┬─────┘  │ (order)  │  └──────────┘            │
│      │        │ (admin)  │                           │
│      ↓        └──────────┘                           │
│ ┌──────────┐  ┌──────────┐                           │
│ │  Store   │←│ Services │  ← axios API calls        │
│ │(Zustand) │  │  (API)   │                           │
│ └──────────┘  └────┬─────┘                           │
└─────────────────────┼───────────────────────────────┘
                      │ HTTP (REST)
┌─────────────────────┼───────────────────────────────┐
│ Server (Express)     ↓                               │
│ ┌──────────┐  ┌──────────┐  ┌──────────┐            │
│ │  Routes  │→│Controllers│→│  Models  │→ MongoDB   │
│ │  + Auth  │  │          │  │(Mongoose)│            │
│ └──────────┘  └──────────┘  └──────────┘            │
└─────────────────────────────────────────────────────┘
```

### 2.2 Data Flow

```
User Action → Page Component → Store Action → API Service → Express Route
    ↑                                                           │
    └── Re-render ← Store Update ← Response ← Controller ←─────┘
```

### 2.3 Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| react-router-dom | ^7.x | SPA 라우팅 |
| zustand | ^5.x | 상태 관리 |
| axios | ^1.x | API 클라이언트 |
| react-icons | ^5.x | 아이콘 |

---

## 3. Data Model

> Plan §8에 정의된 10개 엔티티 스키마 참조. Server 구현 완료 (`server/src/models/`).

### 3.1 Server Models (구현 완료)

| Model | File | Key Relations |
|-------|------|---------------|
| User | `models/User.js` | → Order, Review, Cart, Inquiry, Wishlist |
| Product | `models/Product.js` | → Category, ← Review |
| Category | `models/Category.js` | → parent (self), ← Product |
| Order | `models/Order.js` | → User, embedded OrderItems |
| Cart | `models/Cart.js` | → User, → Product |
| Review | `models/Review.js` | → User, → Product |
| Banner | `models/Banner.js` | standalone |
| Inquiry | `models/Inquiry.js` | → User |
| FAQ | `models/FAQ.js` | standalone |

### 3.2 Frontend Types

```javascript
// services/api.js 에서 사용할 주요 타입 (JSDoc or 주석으로 관리)

// Product: { _id, name, price, description, images[], category, options[], stock, isBestSeller, isNew, averageRating, reviewCount }
// Order: { _id, orderNumber, user, items[], status, totalAmount, shippingAddress, paymentMethod }
// User: { _id, email, name, phone, addresses[], role, gender, wishlist[] }
// Cart: { _id, user, items[{product, quantity, selectedOption}] }
// Review: { _id, user, product, rating, content, approved }
// Pagination: { page, limit, total, totalPages }
```

---

## 4. API Specification

> Server 구현 완료 (`server/src/routes/`, `server/src/controllers/`). Plan §9 참조.

### 4.1 API Client 설계 (Frontend)

```
client/src/services/
├── api.js           # axios 인스턴스 (baseURL, interceptor)
├── authService.js   # register, login
├── productService.js # getProducts, getProduct, search
├── cartService.js   # getCart, addItem, updateItem, removeItem
├── orderService.js  # createOrder, getMyOrders, getOrder
├── userService.js   # getMe, updateMe, addresses, wishlist
├── reviewService.js # createReview, getProductReviews
├── supportService.js # getFAQ, createInquiry, getInquiries
├── bannerService.js  # getActiveBanners
└── adminService.js   # dashboard, stats, admin CRUD operations
```

### 4.2 API Instance

```javascript
// services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
```

---

## 5. UI/UX Design (Stitch 기반)

### 5.1 Layout 구조

#### Customer Layout

```
┌─────────────────────────────────────────────────┐
│ Header (Glass: backdrop-blur 20px)              │
│ [Logo]              [Search] [Cart] [My]        │
├─────────────────────────────────────────────────┤
│                                                  │
│  Main Content (bg: #f9f9f9)                     │
│  ┌──────────────────────────────────────────┐   │
│  │  Surface Card (bg: #ffffff)              │   │
│  └──────────────────────────────────────────┘   │
│                                                  │
├─────────────────────────────────────────────────┤
│ Footer (bg: #1a1c1c, text: #f9f9f9)            │
└─────────────────────────────────────────────────┘
```

#### Admin Layout

```
┌─────────┬────────────────────────────────────────┐
│ Sidebar │ Admin Header                           │
│ (240px) │────────────────────────────────────────│
│ [Menu]  │                                        │
│ 상품    │  Content Area                          │
│ 주문    │  (bg: #f3f3f3)                         │
│ 회원    │  ┌─────────────────────────────────┐   │
│ 배너    │  │ Card (bg: #ffffff)              │   │
│ 리뷰    │  └─────────────────────────────────┘   │
│ 문의    │                                        │
│ 통계    │                                        │
└─────────┴────────────────────────────────────────┘
```

### 5.2 User Flow

```
Customer Flow:
홈 → 상품목록 → 상품상세 → 장바구니 → 결제 → 주문완료
        ↕           ↕          ↕
     검색/필터    리뷰작성    수량변경
        
                마이페이지 → 주문내역/정보수정/배송지/찜
                고객센터 → FAQ/1:1문의

Admin Flow:
대시보드 → 상품관리 → 등록/수정
         → 주문관리 → 주문상세/상태변경
         → 회원관리
         → 배너/리뷰/문의 관리
         → 매출통계
```

### 5.3 Component List

#### Common Components

| Component | File | Responsibility |
|-----------|------|----------------|
| `Header` | `components/common/Header.jsx` | 글래스모피즘 네비게이션 (로고, 검색, 카트, 마이) |
| `Footer` | `components/common/Footer.jsx` | 다크 풋터 (링크, 정보) |
| `AdminSidebar` | `components/common/AdminSidebar.jsx` | 어드민 사이드 네비게이션 |
| `AdminHeader` | `components/common/AdminHeader.jsx` | 어드민 상단바 |
| `Pagination` | `components/common/Pagination.jsx` | 페이지네이션 UI |
| `LoadingSpinner` | `components/common/LoadingSpinner.jsx` | 로딩 인디케이터 |

#### Product Components

| Component | File | Responsibility |
|-----------|------|----------------|
| `ProductCard` | `components/product/ProductCard.jsx` | 상품 카드 (3:4 이미지, 가격, 평점) |
| `ProductGrid` | `components/product/ProductGrid.jsx` | 상품 그리드 레이아웃 |
| `ProductFilter` | `components/product/ProductFilter.jsx` | 카테고리/가격 필터 |
| `ProductSort` | `components/product/ProductSort.jsx` | 정렬 드롭다운 |
| `ProductGallery` | `components/product/ProductGallery.jsx` | 상품 상세 이미지 갤러리 |
| `ProductOptions` | `components/product/ProductOptions.jsx` | 옵션 선택 UI |
| `ReviewList` | `components/product/ReviewList.jsx` | 리뷰 목록 + 평점 표시 |
| `ReviewForm` | `components/product/ReviewForm.jsx` | 리뷰 작성 폼 |

#### Order Components

| Component | File | Responsibility |
|-----------|------|----------------|
| `CartItem` | `components/order/CartItem.jsx` | 장바구니 상품 행 (수량, 삭제) |
| `CartSummary` | `components/order/CartSummary.jsx` | 총액 계산 + 주문 버튼 |
| `CheckoutForm` | `components/order/CheckoutForm.jsx` | 배송지 + 결제수단 폼 |
| `OrderSummary` | `components/order/OrderSummary.jsx` | 주문 요약 (상품, 금액) |
| `OrderStatusBadge` | `components/order/OrderStatusBadge.jsx` | 주문 상태 뱃지 |

#### Admin Components

| Component | File | Responsibility |
|-----------|------|----------------|
| `StatCard` | `components/admin/StatCard.jsx` | 대시보드 통계 카드 |
| `RevenueChart` | `components/admin/RevenueChart.jsx` | 매출 차트 |
| `DataTable` | `components/admin/DataTable.jsx` | 범용 데이터 테이블 (정렬, 필터) |
| `StatusSelect` | `components/admin/StatusSelect.jsx` | 주문 상태 변경 셀렉트 |
| `ImageUpload` | `components/admin/ImageUpload.jsx` | 이미지 업로드 UI |

### 5.4 Page UI Checklist

#### HomePage (메인)

- [ ] Banner: 메인 슬라이더 (Stitch 배너 데이터, 자동 재생)
- [ ] Section: 추천 상품 그리드 (ProductCard, 4열)
- [ ] Section: 카테고리 바로가기 (아이콘 + 라벨)
- [ ] Section: 신상품 리스트 (isNew=true)
- [ ] Section: 베스트셀러 리스트 (isBestSeller=true)

#### ProductListPage (상품 목록)

- [ ] Filter: 카테고리 필터 (사이드바 or 상단)
- [ ] Filter: 가격 범위 (min/max 입력)
- [ ] Sort: 드롭다운 (최신순, 가격낮은순, 가격높은순, 인기순, 평점순)
- [ ] Grid: ProductCard 리스트 (3:4 비율 이미지)
- [ ] Pagination: 페이지 네비게이션

#### ProductDetailPage (상품 상세)

- [ ] Gallery: 이미지 갤러리 (썸네일 + 메인 이미지)
- [ ] Info: 상품명, 가격 (display 크기)
- [ ] Options: 옵션 선택 (사이즈, 색상 등)
- [ ] Button: 장바구니 담기 (gradient CTA: #000→#1b1b1b)
- [ ] Button: 찜하기 (하트 토글)
- [ ] Tab: 상품 설명 / 리뷰 탭
- [ ] ReviewList: 평점 + 리뷰 목록
- [ ] ReviewForm: 리뷰 작성 (별점 + 텍스트)

#### CartPage (장바구니)

- [ ] List: CartItem 목록 (이미지, 이름, 옵션, 가격)
- [ ] Input: 수량 변경 (증가/감소 버튼)
- [ ] Button: 삭제 버튼
- [ ] Summary: 총 상품금액, 배송비, 합계
- [ ] Button: 주문하기 CTA

#### CheckoutPage (주문/결제)

- [ ] Form: 배송지 입력 (이름, 연락처, 주소, 상세주소, 우편번호)
- [ ] Select: 저장된 배송지 선택
- [ ] Radio: 결제수단 (카드/무통장/가상계좌)
- [ ] Summary: 주문 상품 요약 + 총액
- [ ] Button: 결제하기 CTA

#### OrderCompletePage (주문 완료)

- [ ] Display: 주문번호
- [ ] Display: 주문 내역 (상품, 수량, 금액)
- [ ] Button: 주문 상세보기
- [ ] Button: 쇼핑 계속하기

#### LoginPage / RegisterPage (로그인/회원가입)

- [ ] Form: 이메일 입력 (유효성 검증)
- [ ] Form: 비밀번호 입력
- [ ] Form: (회원가입) 이름, 연락처, 성별
- [ ] Button: 로그인/회원가입 CTA
- [ ] Link: 회원가입/로그인 전환
- [ ] Button: 소셜 로그인 (UI만, 비활성)

#### MyPage (마이페이지)

- [ ] Tab: 주문내역 / 회원정보 / 배송지관리 / 찜목록
- [ ] List: 주문내역 (주문번호, 날짜, 상태, 금액)
- [ ] Form: 회원정보 수정 (이름, 연락처, 성별, 비밀번호)
- [ ] List: 배송지 목록 (추가/수정/삭제/기본설정)
- [ ] Grid: 찜한 상품 (ProductCard)

#### SearchPage (검색 결과)

- [ ] Input: 검색바 (키워드 입력)
- [ ] Display: 검색 결과 수
- [ ] Filter: 카테고리/가격 필터
- [ ] Sort: 정렬
- [ ] Grid: ProductCard 결과 리스트

#### SupportPage (고객센터)

- [ ] Tab: FAQ / 1:1 문의
- [ ] Accordion: FAQ 목록 (카테고리별 필터)
- [ ] Form: 문의 작성 (제목, 내용)
- [ ] List: 내 문의 목록 (제목, 날짜, 답변상태)

#### TermsPage (이용약관)

- [ ] Tab: 이용약관 / 개인정보처리방침
- [ ] Content: 마크다운 스타일 텍스트

#### AdminDashboardPage (어드민 대시보드)

- [ ] StatCard: 오늘 주문수
- [ ] StatCard: 오늘 매출
- [ ] StatCard: 신규 회원
- [ ] StatCard: 총 상품수
- [ ] Chart: 기간별 매출 차트
- [ ] List: 최근 주문 리스트

#### AdminProductsPage (상품 관리)

- [ ] Search: 상품명 검색
- [ ] Filter: 카테고리 필터
- [ ] Table: 상품 목록 (이미지, 이름, 가격, 재고, 카테고리)
- [ ] Button: 상품 등록
- [ ] Button: 수정/삭제 액션

#### AdminProductFormPage (상품 등록/수정)

- [ ] Form: 상품명, 가격, 설명
- [ ] Upload: 이미지 업로드 (다중)
- [ ] Select: 카테고리 선택
- [ ] Form: 옵션 설정 (동적 추가/삭제)
- [ ] Input: 재고 수량
- [ ] Checkbox: 베스트셀러/신상품
- [ ] Button: 저장 CTA

#### AdminOrdersPage (주문 관리)

- [ ] Filter: 주문 상태별 필터 (전체/결제확인/배송중/배송완료/취소)
- [ ] Table: 주문 목록 (주문번호, 주문자, 금액, 상태, 날짜)
- [ ] Button: 상태 일괄 변경

#### AdminOrderDetailPage (주문 상세)

- [ ] Display: 주문 정보 (번호, 날짜, 상태)
- [ ] Display: 주문 상품 목록 (이름, 수량, 금액)
- [ ] Display: 주문자 정보 (이름, 연락처)
- [ ] Display: 배송지 정보
- [ ] Display: 결제 정보
- [ ] Select: 주문 상태 변경

#### AdminUsersPage (회원 관리)

- [ ] Search: 이름/이메일 검색
- [ ] Table: 회원 목록 (이름, 이메일, 가입일, 주문수)
- [ ] Link: 회원 상세 (주문이력 조회)

#### AdminBannersPage (배너 관리)

- [ ] List: 배너 목록 (이미지 미리보기, 제목, 위치, 활성)
- [ ] Button: 배너 등록
- [ ] Form: 배너 등록/수정 (제목, 이미지, 링크, 위치, 순서)
- [ ] Toggle: 활성/비활성

#### AdminReviewsPage (리뷰 관리)

- [ ] Filter: 승인상태 필터
- [ ] Table: 리뷰 목록 (상품, 작성자, 별점, 내용, 승인상태)
- [ ] Button: 승인/삭제

#### AdminInquiriesPage (문의 관리)

- [ ] Filter: 답변상태 필터 (전체/미답변/답변완료)
- [ ] Table: 문의 목록 (제목, 작성자, 날짜, 답변상태)
- [ ] Form: 답변 작성 텍스트 영역

#### AdminStatsPage (매출/통계)

- [ ] Select: 기간 선택 (7일/30일/90일)
- [ ] Chart: 기간별 매출 차트 (일별)
- [ ] Table: 상품별 판매 순위 (Top 10)
- [ ] Chart: 회원 가입 추이

---

## 6. Error Handling

### 6.1 Error Handling Strategy

| Scenario | Frontend | Backend |
|----------|----------|---------|
| 네트워크 에러 | Toast 알림 "서버 연결 실패" | - |
| 401 Unauthorized | 자동 로그아웃 → 로그인 페이지 | JWT 에러 응답 |
| 403 Forbidden | "권한이 없습니다" 알림 | adminOnly 미들웨어 |
| 404 Not Found | 404 페이지 표시 | 리소스 없음 응답 |
| 400 Validation | 폼 필드별 에러 메시지 | 유효성 검사 응답 |
| 500 Server Error | "잠시 후 다시 시도해주세요" | 에러 로깅 |

---

## 7. Security Considerations

- [x] JWT 인증 미들웨어 (`server/src/middleware/auth.js`) — 구현 완료
- [x] bcrypt 비밀번호 해싱 — 구현 완료
- [x] Admin 권한 분리 (adminOnly) — 구현 완료
- [ ] CORS 설정 (프로덕션 시 origin 제한)
- [ ] XSS 방지 (React 기본 이스케이프)
- [ ] Rate Limiting (추후)

---

## 8. Test Plan

### 8.1 Test Scope

| Type | Target | Tool | Phase |
|------|--------|------|-------|
| L1: API | 서버 엔드포인트 | curl | Do (완료) |
| L2: UI | 페이지 컴포넌트 | 수동 테스트 | Do |
| L3: E2E | 사용자 플로우 | 수동 테스트 | Check |

### 8.2 Seed Data

| Entity | Count | Description |
|--------|:-----:|-------------|
| User | 3 | admin 1명 + customer 2명 |
| Category | 5 | 상의, 하의, 아우터, 신발, 액세서리 |
| Product | 20 | 카테고리별 4개씩 |
| Order | 5 | 다양한 상태 |
| Review | 10 | 승인 5 + 미승인 5 |
| Banner | 3 | 메인 2 + 팝업 1 |
| FAQ | 5 | 배송, 교환, 결제 |

---

## 9. Clean Architecture

### 9.1 Layer Structure

| Layer | Responsibility | Location |
|-------|---------------|----------|
| **Pages** | 라우팅, 레이아웃, 데이터 fetch 조합 | `src/pages/` |
| **Components** | 재사용 UI, 프레젠테이션 로직 | `src/components/` |
| **Store** | 글로벌 상태 (인증, 카트) | `src/store/` |
| **Services** | API 호출, 데이터 변환 | `src/services/` |
| **Hooks** | 커스텀 훅 (useAuth, useCart) | `src/hooks/` |
| **Styles** | Stitch 디자인 토큰, 공통 CSS | `src/styles/` |

---

## 10. Coding Convention

### 10.1 Naming Conventions

| Target | Rule | Example |
|--------|------|---------|
| Components | PascalCase | `ProductCard`, `AdminSidebar` |
| Pages | PascalCase + Page | `HomePage`, `CartPage` |
| Services | camelCase + Service | `productService`, `authService` |
| Store | camelCase + Store | `useAuthStore`, `useCartStore` |
| CSS Files | kebab-case | `design-tokens.css`, `product-card.css` |
| Event handlers | handle + Action | `handleSubmit`, `handleDelete` |

### 10.2 Environment Variables

| Variable | Purpose | Scope |
|----------|---------|-------|
| `VITE_API_URL` | API 서버 URL | Client |
| `PORT` | 서버 포트 | Server |
| `MONGODB_URI` | DB 연결 | Server |
| `JWT_SECRET` | JWT 서명 키 | Server |

---

## 11. Implementation Guide

### 11.1 File Structure

```
client/src/
├── pages/
│   ├── customer/
│   │   ├── HomePage.jsx
│   │   ├── ProductListPage.jsx
│   │   ├── ProductDetailPage.jsx
│   │   ├── CartPage.jsx
│   │   ├── CheckoutPage.jsx
│   │   ├── OrderCompletePage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── MyPage.jsx
│   │   ├── SearchPage.jsx
│   │   ├── SupportPage.jsx
│   │   └── TermsPage.jsx
│   └── admin/
│       ├── AdminDashboardPage.jsx
│       ├── AdminProductsPage.jsx
│       ├── AdminProductFormPage.jsx
│       ├── AdminOrdersPage.jsx
│       ├── AdminOrderDetailPage.jsx
│       ├── AdminUsersPage.jsx
│       ├── AdminBannersPage.jsx
│       ├── AdminReviewsPage.jsx
│       ├── AdminInquiriesPage.jsx
│       └── AdminStatsPage.jsx
├── components/
│   ├── common/
│   │   ├── Header.jsx
│   │   ├── Footer.jsx
│   │   ├── AdminSidebar.jsx
│   │   ├── AdminHeader.jsx
│   │   ├── Pagination.jsx
│   │   └── LoadingSpinner.jsx
│   ├── product/
│   │   ├── ProductCard.jsx
│   │   ├── ProductGrid.jsx
│   │   ├── ProductFilter.jsx
│   │   ├── ProductSort.jsx
│   │   ├── ProductGallery.jsx
│   │   ├── ProductOptions.jsx
│   │   ├── ReviewList.jsx
│   │   └── ReviewForm.jsx
│   ├── order/
│   │   ├── CartItem.jsx
│   │   ├── CartSummary.jsx
│   │   ├── CheckoutForm.jsx
│   │   ├── OrderSummary.jsx
│   │   └── OrderStatusBadge.jsx
│   └── admin/
│       ├── StatCard.jsx
│       ├── RevenueChart.jsx
│       ├── DataTable.jsx
│       ├── StatusSelect.jsx
│       └── ImageUpload.jsx
├── services/
│   ├── api.js
│   ├── authService.js
│   ├── productService.js
│   ├── cartService.js
│   ├── orderService.js
│   ├── userService.js
│   ├── reviewService.js
│   ├── supportService.js
│   ├── bannerService.js
│   └── adminService.js
├── store/
│   ├── useAuthStore.js
│   └── useCartStore.js
├── hooks/
│   ├── useAuth.js
│   └── useCart.js
├── styles/
│   ├── design-tokens.css      # Stitch 디자인 토큰 (CSS 변수)
│   ├── global.css              # 글로벌 리셋 + 기본 스타일
│   ├── customer-layout.css     # 고객 레이아웃
│   └── admin-layout.css        # 어드민 레이아웃
├── App.jsx                     # React Router 설정
└── main.jsx                    # Vite 엔트리
```

### 11.2 Implementation Order

1. [ ] **인프라**: 디자인 토큰 CSS + axios 인스턴스 + Zustand 스토어 + React Router
2. [ ] **공통 UI**: Header, Footer, AdminSidebar, Pagination
3. [ ] **인증**: LoginPage, RegisterPage + authService + useAuthStore
4. [ ] **상품**: ProductCard → ProductListPage → ProductDetailPage + 필터/정렬
5. [ ] **장바구니/주문**: CartPage → CheckoutPage → OrderCompletePage
6. [ ] **마이페이지**: MyPage (주문내역, 정보수정, 배송지, 찜)
7. [ ] **기타 고객**: SearchPage, SupportPage, TermsPage
8. [ ] **어드민**: Dashboard → 상품관리 → 주문관리 → 회원/배너/리뷰/문의/통계

### 11.3 Session Guide

#### Module Map

| Module | Scope Key | Description | Est. Files |
|--------|-----------|-------------|:----------:|
| 인프라 + 공통 UI | `module-1` | 디자인 토큰, Router, Header/Footer, API 인스턴스 | 12 |
| 인증 + 사용자 | `module-2` | Login, Register, MyPage, Auth Store | 8 |
| 상품 | `module-3` | ProductList, ProductDetail, 필터/정렬/검색 | 10 |
| 장바구니 + 주문 | `module-4` | Cart, Checkout, OrderComplete, Cart Store | 8 |
| 고객 기타 | `module-5` | Support, Terms, Banner 연동 | 4 |
| 어드민 | `module-6` | Dashboard, 상품/주문/회원/배너/리뷰/문의/통계 관리 | 15 |

#### Recommended Session Plan

| Session | Scope | Description |
|---------|-------|-------------|
| Session 1 | `--scope module-1` | 인프라 + 공통 컴포넌트 |
| Session 2 | `--scope module-2` | 인증 + 마이페이지 |
| Session 3 | `--scope module-3` | 상품 페이지 |
| Session 4 | `--scope module-4` | 장바구니 + 주문 |
| Session 5 | `--scope module-5` | 고객 기타 페이지 |
| Session 6 | `--scope module-6` | 어드민 전체 |

---

## Stitch Screen → React Component Mapping

| Stitch Screen Title | Screen ID | React Component | Route |
|---------------------|-----------|-----------------|-------|
| 고감도 밀착 큐레이션 메인 홈 | `0ea433a4` | `HomePage` | `/` |
| 상품 목록 페이지 (에디토리얼) | `fa9b8790` | `ProductListPage` | `/products` |
| 상품 상세 페이지 (에디토리얼) | `6c221789` | `ProductDetailPage` | `/products/:id` |
| 장바구니 페이지 (에디토리얼) | `26af987b` | `CartPage` | `/cart` |
| 주문/결제 페이지 (에디토리얼) | `aa5e5312` | `CheckoutPage` | `/checkout` |
| 주문 완료 페이지 (에디토리얼) | `c6105b64` | `OrderCompletePage` | `/order-complete/:id` |
| 로그인/회원가입 페이지 | `50c26d38` | `LoginPage` / `RegisterPage` | `/login`, `/register` |
| 마이페이지 (에디토리얼) | `d4a79e4c` | `MyPage` | `/mypage` |
| 검색 결과 페이지 (에디토리얼) | `7e02eab5` | `SearchPage` | `/search` |
| 고객센터 페이지 (에디토리얼) | `c21ea9d4` | `SupportPage` | `/support` |
| 이용약관 및 정책 (에디토리얼) | `e46e6efc` | `TermsPage` | `/terms` |
| 이용약관 및 정책 상세 | `7a45e1c0` | `TermsPage` (상세) | `/terms/:type` |
| 어드민 매출/통계 | `78a17204` | `AdminDashboardPage` | `/admin` |
| 어드민 상품 관리 | `e7cc9bf0` | `AdminProductsPage` | `/admin/products` |
| 어드민 상품 등록/수정 | `7503e95e` | `AdminProductFormPage` | `/admin/products/new` |
| 어드민 주문 관리 | `b656a696` | `AdminOrdersPage` | `/admin/orders` |
| 어드민 주문 상세 | `0555f815` | `AdminOrderDetailPage` | `/admin/orders/:id` |
| 어드민 회원 관리 | `888ac381` | `AdminUsersPage` | `/admin/users` |
| 어드민 배너 관리 | `ad323aaf` | `AdminBannersPage` | `/admin/banners` |
| 어드민 리뷰 관리 | `0f28e1e0` | `AdminReviewsPage` | `/admin/reviews` |
| 어드민 문의 관리 | `1752ef66` | `AdminInquiriesPage` | `/admin/inquiries` |

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-04-05 | Initial draft — Stitch 디자인 시스템 기반, Option C 아키텍처 | jaydensong |
