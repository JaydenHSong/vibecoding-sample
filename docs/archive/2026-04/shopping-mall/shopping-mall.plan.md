# Shopping Mall Planning Document

> **Summary**: React+Vite + Express+MongoDB 기반 풀스택 쇼핑몰 (고객 12페이지 + 어드민 10페이지)
>
> **Project**: vibecoding-sample
> **Version**: 1.0.0
> **Author**: jaydensong
> **Date**: 2026-04-05
> **Status**: Draft

---

## Executive Summary

| Perspective | Content |
|-------------|---------|
| **Problem** | 22개 페이지의 쇼핑몰을 체계적으로 구현할 스키마/API/UI 설계가 필요 |
| **Solution** | MongoDB 스키마 → Express CRUD API → React+Vite 컴포넌트 순서로 단계적 구현 |
| **Function/UX Effect** | 고객: 상품 탐색~주문 완료 풀플로우 / 어드민: 상품·주문·회원·통계 관리 대시보드 |
| **Core Value** | Stitch 디자인(29CM 에디토리얼 스타일)을 실제 동작하는 풀스택 쇼핑몰로 구현 |

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

## 1. Overview

### 1.1 Purpose

Google Stitch에서 완성한 22개 쇼핑몰 페이지 디자인을 기반으로, React+Vite (client) + Node.js+Express+MongoDB (server) 풀스택 쇼핑몰을 구현한다.

### 1.2 Background

- Stitch에서 29CM 에디토리얼 스타일로 22개 페이지 UI 디자인 완료
- client(React+Vite), server(Express+MongoDB) 프로젝트 셋팅 완료
- 스키마 설계부터 시작하여 체계적으로 구현 필요

### 1.3 Related Documents

- `shopping-mall-pages.txt` — 22개 페이지 목록 정의서
- Google Stitch Project ID: `8803964047661137733`

---

## 2. Scope

### 2.1 In Scope

- [ ] MongoDB 스키마 설계 (10개 엔티티)
- [ ] Express REST API (CRUD 라우터 + 컨트롤러)
- [ ] JWT 인증 (회원가입/로그인)
- [ ] React 컴포넌트 22개 페이지
- [ ] Stitch 디자인 → React 컴포넌트 변환
- [ ] 프론트-백엔드 API 연동
- [ ] 어드민 대시보드 (매출/통계)

### 2.2 Out of Scope

- 실제 PG 결제 연동 (모의 결제 처리)
- 실시간 알림/채팅 (WebSocket)
- 이메일/SMS 발송
- 소셜 로그인 OAuth 연동 (UI만 구현)
- 배포/CI/CD

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-01 | 회원가입/로그인 (JWT 인증) | High | Pending |
| FR-02 | 상품 CRUD (이미지, 옵션, 카테고리) | High | Pending |
| FR-03 | 상품 목록 (필터, 정렬, 페이지네이션) | High | Pending |
| FR-04 | 상품 상세 (이미지 갤러리, 옵션 선택, 리뷰) | High | Pending |
| FR-05 | 장바구니 (추가/수량변경/삭제/총액계산) | High | Pending |
| FR-06 | 주문/결제 (배송지, 결제수단, 주문요약) | High | Pending |
| FR-07 | 주문 상태 관리 (결제확인→배송중→배송완료) | High | Pending |
| FR-08 | 마이페이지 (주문내역, 정보수정, 배송지관리, 찜목록) | Medium | Pending |
| FR-09 | 검색 (키워드, 필터, 정렬) | Medium | Pending |
| FR-10 | 리뷰/평점 (작성, 승인/삭제) | Medium | Pending |
| FR-11 | 고객센터 (FAQ, 1:1 문의/답변) | Medium | Pending |
| FR-12 | 배너/콘텐츠 관리 | Low | Pending |
| FR-13 | 어드민 대시보드 (매출통계, 주문요약) | Medium | Pending |
| FR-14 | 어드민 회원/상품/주문/리뷰/문의 관리 | Medium | Pending |

### 3.2 Non-Functional Requirements

| Category | Criteria | Measurement Method |
|----------|----------|-------------------|
| Performance | API 응답 200ms 이내 | Postman 테스트 |
| Security | JWT 인증, 비밀번호 bcrypt 해싱 | 코드 리뷰 |
| UX | Stitch 디자인과 90% 이상 일치 | 시각적 비교 |

---

## 4. Success Criteria

### 4.1 Definition of Done

- [ ] 10개 MongoDB 모델 스키마 완성
- [ ] 모든 CRUD API 엔드포인트 동작 확인
- [ ] 22개 React 페이지 컴포넌트 구현
- [ ] 프론트-백엔드 API 연동 완료
- [ ] JWT 인증 플로우 동작

### 4.2 Quality Criteria

- [ ] API 엔드포인트별 정상 응답 확인
- [ ] 빌드 에러 없음
- [ ] Stitch 디자인과 UI 일치

---

## 5. Risks and Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| 22개 페이지 복잡도로 일관성 깨짐 | High | Medium | Phase별 단계적 구현, 공통 컴포넌트 추출 |
| MongoDB 스키마 관계 복잡도 | Medium | Low | 정규화보다 embed/reference 적절히 혼합 |
| Stitch 디자인→React 변환 품질 | Medium | Medium | Stitch HTML 코드 참조하여 스타일 유지 |

---

## 6. Impact Analysis

### 6.1 Changed Resources

| Resource | Type | Change Description |
|----------|------|--------------------|
| 신규 프로젝트 | Full Stack | client + server 전체 신규 구현 |

### 6.2 Current Consumers

신규 프로젝트로 기존 소비자 없음.

### 6.3 Verification

- [x] 신규 프로젝트 — 기존 영향 없음

---

## 7. Architecture Considerations

### 7.1 Project Level Selection

| Level | Characteristics | Recommended For | Selected |
|-------|-----------------|-----------------|:--------:|
| **Starter** | Simple structure | Static sites, portfolios | ☐ |
| **Dynamic** | Feature-based modules, BaaS integration | Web apps with backend, fullstack apps | ☑ |
| **Enterprise** | Strict layer separation, DI, microservices | High-traffic systems | ☐ |

### 7.2 Key Architectural Decisions

| Decision | Options | Selected | Rationale |
|----------|---------|----------|-----------|
| Frontend Framework | Next.js / React+Vite / Vue | React+Vite | 사용자 요청, SPA로 충분 |
| Backend Framework | Express / Fastify / NestJS | Express | 사용자 요청, 빠른 개발 |
| Database | MongoDB / PostgreSQL / MySQL | MongoDB | 사용자 요청, 유연한 스키마 |
| State Management | Context / Zustand / Redux | Zustand | 경량, 간단한 API |
| API Client | fetch / axios / react-query | axios | Express와 궁합, 인터셉터 |
| Styling | Tailwind / CSS Modules / styled | CSS (Stitch 스타일 유지) | Stitch HTML 코드 기반 |
| Authentication | JWT / Session | JWT | REST API 무상태 인증 |

### 7.3 Clean Architecture Approach

```
Selected Level: Dynamic

client/                          server/
├── src/                         ├── src/
│   ├── components/              │   ├── models/        # Mongoose 스키마
│   │   ├── common/              │   ├── routes/        # Express 라우터
│   │   ├── layout/              │   ├── controllers/   # 비즈니스 로직
│   │   └── pages/               │   ├── middleware/    # 인증 등
│   ├── pages/                   │   ├── config/        # DB 설정
│   │   ├── customer/            │   ├── app.js
│   │   └── admin/               │   └── server.js
│   ├── store/                   ├── .env
│   ├── services/  # API calls   └── package.json
│   ├── hooks/
│   └── utils/
├── vite.config.js
└── package.json
```

---

## 8. Data Schema (Phase 1)

### 8.1 Entity Relationship

```
User (1) ──── (N) Order
  │                  │
  │ (1)──(N) Review  │ (1)──(N) OrderItem ──(N)──(1) Product
  │                  │                              │
  │ (1)──(N) Cart    │                    (N)──(1) Category
  │                  │
  │ (1)──(N) Inquiry │
  │                  │
  └── Wishlist[]     │
                     │
Banner (standalone)  │
FAQ (standalone)     │
```

### 8.2 Entity Definitions

#### User
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | String | Yes | 이메일 (unique) |
| password | String | Yes | bcrypt 해싱 |
| name | String | Yes | 이름 |
| phone | String | No | 연락처 |
| addresses | Array | No | 배송지 목록 [{label, address, detail, zipCode, isDefault}] |
| role | String | Yes | `customer` / `admin` (default: customer) |
| gender | String | No | `male` / `female` / `other` |
| wishlist | [ObjectId] | No | 찜한 상품 ID 목록 (ref: Product) |
| createdAt | Date | Auto | 생성일 |
| updatedAt | Date | Auto | 수정일 |

#### Product
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | String | Yes | 상품명 |
| price | Number | Yes | 가격 |
| description | String | No | 상품 설명 |
| images | [String] | No | 이미지 URL 배열 |
| category | ObjectId | Yes | 카테고리 (ref: Category) |
| options | Array | No | [{name, values[]}] ex: [{name:"사이즈", values:["S","M","L"]}] |
| stock | Number | Yes | 재고 수량 (default: 0) |
| isBestSeller | Boolean | No | 베스트셀러 여부 |
| isNew | Boolean | No | 신상품 여부 |
| averageRating | Number | No | 평균 평점 (계산 필드) |
| reviewCount | Number | No | 리뷰 수 (계산 필드) |
| createdAt | Date | Auto | 생성일 |
| updatedAt | Date | Auto | 수정일 |

#### Category
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | String | Yes | 카테고리명 |
| slug | String | Yes | URL용 슬러그 (unique) |
| parent | ObjectId | No | 상위 카테고리 (ref: Category, self) |
| createdAt | Date | Auto | 생성일 |

#### Order
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| orderNumber | String | Yes | 주문번호 (auto-generated, unique) |
| user | ObjectId | Yes | 주문자 (ref: User) |
| items | [OrderItem] | Yes | 주문 상품 (embedded) |
| status | String | Yes | `pending` / `paid` / `shipping` / `delivered` / `cancelled` |
| totalAmount | Number | Yes | 총 금액 |
| shippingAddress | Object | Yes | {name, phone, address, detail, zipCode} |
| paymentMethod | String | Yes | `card` / `bank` / `virtual` |
| createdAt | Date | Auto | 생성일 |
| updatedAt | Date | Auto | 수정일 |

#### OrderItem (Embedded in Order)
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| product | ObjectId | Yes | 상품 (ref: Product) |
| name | String | Yes | 주문 시점 상품명 (스냅샷) |
| price | Number | Yes | 주문 시점 가격 (스냅샷) |
| quantity | Number | Yes | 수량 |
| selectedOption | String | No | 선택 옵션 |

#### Cart
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| user | ObjectId | Yes | 소유자 (ref: User, unique) |
| items | Array | Yes | [{product: ObjectId, quantity: Number, selectedOption: String}] |
| updatedAt | Date | Auto | 수정일 |

#### Review
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| user | ObjectId | Yes | 작성자 (ref: User) |
| product | ObjectId | Yes | 대상 상품 (ref: Product) |
| rating | Number | Yes | 평점 (1~5) |
| content | String | Yes | 리뷰 내용 |
| approved | Boolean | Yes | 승인 여부 (default: false) |
| createdAt | Date | Auto | 생성일 |

#### Banner
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| title | String | Yes | 배너 제목 |
| image | String | Yes | 이미지 URL |
| link | String | No | 클릭 시 이동 링크 |
| position | String | Yes | `main` / `popup` |
| isActive | Boolean | Yes | 활성화 여부 (default: true) |
| order | Number | No | 정렬 순서 |
| createdAt | Date | Auto | 생성일 |

#### Inquiry
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| user | ObjectId | Yes | 작성자 (ref: User) |
| title | String | Yes | 문의 제목 |
| content | String | Yes | 문의 내용 |
| answer | String | No | 답변 내용 |
| answeredAt | Date | No | 답변 일시 |
| createdAt | Date | Auto | 생성일 |

#### FAQ
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| question | String | Yes | 질문 |
| answer | String | Yes | 답변 |
| category | String | Yes | FAQ 카테고리 |
| order | Number | No | 정렬 순서 |
| createdAt | Date | Auto | 생성일 |

---

## 9. API Endpoints (Phase 2 Preview)

### 9.1 Customer API

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | 회원가입 |
| POST | `/api/auth/login` | 로그인 |
| GET | `/api/products` | 상품 목록 (필터, 정렬, 페이지네이션) |
| GET | `/api/products/:id` | 상품 상세 |
| GET | `/api/categories` | 카테고리 목록 |
| GET | `/api/cart` | 장바구니 조회 |
| POST | `/api/cart` | 장바구니 추가 |
| PUT | `/api/cart/:itemId` | 장바구니 수량 변경 |
| DELETE | `/api/cart/:itemId` | 장바구니 삭제 |
| POST | `/api/orders` | 주문 생성 |
| GET | `/api/orders` | 내 주문 목록 |
| GET | `/api/orders/:id` | 주문 상세 |
| GET | `/api/users/me` | 내 정보 |
| PUT | `/api/users/me` | 내 정보 수정 |
| GET | `/api/users/me/wishlist` | 찜 목록 |
| POST | `/api/users/me/wishlist/:productId` | 찜 추가/제거 (토글) |
| POST | `/api/reviews` | 리뷰 작성 |
| GET | `/api/reviews/product/:productId` | 상품 리뷰 목록 |
| GET | `/api/search` | 검색 |
| GET | `/api/faq` | FAQ 목록 |
| POST | `/api/inquiries` | 1:1 문의 작성 |
| GET | `/api/inquiries` | 내 문의 목록 |
| GET | `/api/banners` | 활성 배너 목록 |

### 9.2 Admin API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/dashboard` | 대시보드 통계 |
| GET/POST/PUT/DELETE | `/api/admin/products` | 상품 CRUD |
| GET/PUT | `/api/admin/orders` | 주문 관리/상태변경 |
| GET | `/api/admin/users` | 회원 목록/상세 |
| GET/POST/PUT/DELETE | `/api/admin/banners` | 배너 CRUD |
| GET/PUT/DELETE | `/api/admin/reviews` | 리뷰 관리 |
| GET/PUT | `/api/admin/inquiries` | 문의 관리/답변 |
| GET | `/api/admin/stats` | 매출/통계 |

---

## 10. Page-Component Mapping (Phase 3 Preview)

### 10.1 Customer Pages

| # | Page | Route | Component |
|---|------|-------|-----------|
| 1 | 메인 (홈) | `/` | `HomePage` |
| 2 | 상품 목록 | `/products` | `ProductListPage` |
| 3 | 상품 상세 | `/products/:id` | `ProductDetailPage` |
| 4 | 장바구니 | `/cart` | `CartPage` |
| 5 | 주문/결제 | `/checkout` | `CheckoutPage` |
| 6 | 주문 완료 | `/order-complete/:id` | `OrderCompletePage` |
| 7 | 회원가입 | `/register` | `RegisterPage` |
| 8 | 로그인 | `/login` | `LoginPage` |
| 9 | 마이페이지 | `/mypage` | `MyPage` |
| 10 | 검색 결과 | `/search` | `SearchPage` |
| 11 | 고객센터 | `/support` | `SupportPage` |
| 12 | 이용약관 | `/terms` | `TermsPage` |

### 10.2 Admin Pages

| # | Page | Route | Component |
|---|------|-------|-----------|
| 13 | 대시보드 (매출/통계) | `/admin` | `AdminDashboardPage` |
| 14 | 상품 관리 | `/admin/products` | `AdminProductsPage` |
| 15 | 상품 등록/수정 | `/admin/products/new` | `AdminProductFormPage` |
| 16 | 주문 관리 | `/admin/orders` | `AdminOrdersPage` |
| 17 | 주문 상세 | `/admin/orders/:id` | `AdminOrderDetailPage` |
| 18 | 회원 관리 | `/admin/users` | `AdminUsersPage` |
| 19 | 배너 관리 | `/admin/banners` | `AdminBannersPage` |
| 20 | 리뷰 관리 | `/admin/reviews` | `AdminReviewsPage` |
| 21 | 문의 관리 | `/admin/inquiries` | `AdminInquiriesPage` |
| 22 | 매출/통계 | `/admin/stats` | `AdminStatsPage` |

---

## 11. Implementation Phases

| Phase | 내용 | 주요 산출물 |
|-------|------|-----------|
| **Phase 1** | MongoDB 스키마 | 10개 Mongoose 모델 (`server/src/models/`) |
| **Phase 2** | CRUD 라우터 & 로직 | 라우터 + 컨트롤러 + 인증 미들웨어 |
| **Phase 3** | 프론트 페이지 디자인 | 22개 React 컴포넌트 (Stitch 디자인 기반) |
| **Phase 4** | 프론트 로직 | Zustand 스토어 + API 연동 + 라우팅 |

---

## 12. Next Steps

1. [ ] Plan 승인 후 → `/pdca design shopping-mall`
2. [ ] 또는 바로 Phase 1 스키마 구현 시작

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-04-05 | Initial draft — 스키마 + API + 페이지 매핑 포함 | jaydensong |
