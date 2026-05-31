# UI Layout Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the approved “mainstream clean commerce” UI refresh and move the cart into the bottom tab bar.

**Architecture:** Keep existing Vue/uni-app pages and API contracts. Make navigation changes in `src/pages.json`, route behavior changes in page scripts, shared visual language changes in SCSS, and page-specific layout polish in scoped Vue styles/templates.

**Tech Stack:** Vue 3, uni-app, TypeScript, Pinia, vue-i18n, SCSS, Vite.

---

## File Structure

- Create: `docs/superpowers/plans/2026-05-31-ui-layout-refresh.md`
- Create: `scripts/verify-ui-layout.mjs`
- Create: `src/static/tab-cart.png`
- Create: `src/static/tab-cart-active.png`
- Modify: `.gitignore`
- Modify: `package.json`
- Modify: `src/pages.json`
- Modify: `src/pages/catalog/detail.vue`
- Modify: `src/pages/cart/index.vue`
- Modify: `src/pages/mine/index.vue`
- Modify: `src/pages/home/index.vue`
- Modify: `src/pages/catalog/index.vue`
- Modify: `src/styles/theme.scss`
- Modify: `src/styles/common.scss`
- Modify: `src/i18n/zh-CN.ts`
- Modify: `src/i18n/en-US.ts`

## Task 1: Static UI Layout Verification

**Files:**
- Create: `scripts/verify-ui-layout.mjs`
- Modify: `package.json`

- [ ] **Step 1: Add a failing static verification script**

Create `scripts/verify-ui-layout.mjs` that checks:

- `src/pages.json` tabBar list is exactly `pages/home/index`, `pages/catalog/index`, `pages/cart/index`, `pages/mine/index`.
- Cart tab text is `购物车`.
- Cart tab icon paths are `static/tab-cart.png` and `static/tab-cart-active.png`.
- `src/pages/catalog/detail.vue` uses `uni.switchTab({ url: '/pages/cart/index' })` for buy-now navigation.
- `src/pages/mine/index.vue` uses `uni.navigateTo({ url: '/pages/order/index' })` for “我的订单”.
- `src/pages/cart/index.vue` includes an empty-cart action that switches to `pages/catalog/index`.

- [ ] **Step 2: Add npm script**

Add `"verify:ui-layout": "node scripts/verify-ui-layout.mjs"` to `package.json`.

- [ ] **Step 3: Run red check**

Run: `npm run verify:ui-layout`

Expected: FAIL because current tabBar still contains `pages/order/index`, no cart icons exist, and route behavior still uses old navigation.

## Task 2: Navigation and Icons

**Files:**
- Create: `src/static/tab-cart.png`
- Create: `src/static/tab-cart-active.png`
- Modify: `src/pages.json`
- Modify: `src/pages/catalog/detail.vue`
- Modify: `src/pages/mine/index.vue`

- [ ] **Step 1: Add cart tab icons**

Generate two transparent PNG cart icons matching the existing tab icon footprint:

- inactive: neutral gray
- active: brand orange-red

- [ ] **Step 2: Update tabBar**

Change the third tab from order to cart:

```json
{
  "pagePath": "pages/cart/index",
  "text": "购物车",
  "iconPath": "static/tab-cart.png",
  "selectedIconPath": "static/tab-cart-active.png"
}
```

Keep `pages/order/index` and `pages/order/detail` in the top-level `pages` list.

- [ ] **Step 3: Update buy-now cart navigation**

In `src/pages/catalog/detail.vue`, change buy-now navigation from `uni.navigateTo` to:

```ts
uni.switchTab({ url: '/pages/cart/index' })
```

- [ ] **Step 4: Update my-orders navigation**

In `src/pages/mine/index.vue`, change order list navigation from `uni.switchTab` to:

```ts
uni.navigateTo({ url: '/pages/order/index' })
```

- [ ] **Step 5: Run green check for navigation**

Run: `npm run verify:ui-layout`

Expected: Some checks pass. If cart empty action is not implemented yet, the script may still fail on that check until Task 4.

## Task 3: Shared Visual Language

**Files:**
- Modify: `src/styles/theme.scss`
- Modify: `src/styles/common.scss`

- [ ] **Step 1: Adjust design tokens**

Keep the current brand color and add clearer card/border/input tokens if needed:

- page background remains light gray
- cards remain white
- borders and shadows become subtle
- brand color remains orange-red

- [ ] **Step 2: Add reusable utility classes**

Add common classes for:

- `.page-shell`
- `.page-title-row`
- `.section-card`
- `.primary-action`
- `.secondary-action`
- `.commerce-tag`
- `.commerce-tag.success`
- `.commerce-price`

- [ ] **Step 3: Keep scoped page styles compatible**

Do not remove existing scoped styles that pages still depend on. Add utilities without requiring every page to be fully rewritten.

## Task 4: Cart Page as First-Class Tab

**Files:**
- Modify: `src/pages/cart/index.vue`
- Modify: `src/i18n/zh-CN.ts`
- Modify: `src/i18n/en-US.ts`

- [ ] **Step 1: Add empty-cart action text**

Add:

```ts
cart: {
  goShopping: '去选购'
}
```

and English:

```ts
cart: {
  goShopping: 'Browse Products'
}
```

- [ ] **Step 2: Add empty-cart action**

Use `AppEmpty` action slot:

```vue
<template #action>
  <button class="empty-action" @tap="goShopping">{{ $t('cart.goShopping') }}</button>
</template>
```

Add:

```ts
function goShopping() {
  uni.switchTab({ url: '/pages/catalog/index' })
}
```

- [ ] **Step 3: Polish cart layout**

Keep existing logic and improve:

- page header spacing
- cart item card borders
- quantity stepper controls
- summary section
- form fields
- fixed bottom bar spacing above native tabBar

- [ ] **Step 4: Run static check**

Run: `npm run verify:ui-layout`

Expected: PASS.

## Task 5: Homepage and Catalog Visual Polish

**Files:**
- Modify: `src/pages/home/index.vue`
- Modify: `src/pages/catalog/index.vue`

- [ ] **Step 1: Homepage polish**

Keep current data loading logic. Adjust:

- brand header to a cleaner commerce header
- search bar prominence
- reduce decorative banner height or visual weight
- category grid spacing
- product card consistency

- [ ] **Step 2: Catalog polish**

Keep current filtering logic. Adjust:

- sticky search area
- category tab active state
- product cards and tags
- image aspect ratio consistency

## Task 6: Mine Page Entry Hierarchy

**Files:**
- Modify: `src/pages/mine/index.vue`

- [ ] **Step 1: Emphasize “我的订单”**

Since orders leave the bottom tab, make the order entry visually prominent in the menu grid.

- [ ] **Step 2: Keep secondary entries available**

Keep:

- 扫码收货
- 船舶信息
- 个人资料 placeholder
- 语言切换
- 退出登录

Do not change scan receipt API behavior.

## Task 7: Final Verification

**Files:**
- All modified files

- [ ] **Step 1: Run static verification**

Run: `npm run verify:ui-layout`

Expected: PASS.

- [ ] **Step 2: Run type check**

Run: `npm run type-check`

Expected: PASS.

- [ ] **Step 3: Run H5 build**

Run: `npm run build:h5`

Expected: PASS. Sass deprecation warnings may remain because existing SCSS uses `@import`.

- [ ] **Step 4: Review git diff**

Run: `git diff --stat` and `git diff --check`.

Expected: only intended UI/layout/docs/static verification changes; no whitespace errors.
