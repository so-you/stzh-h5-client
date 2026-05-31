import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = new URL('..', import.meta.url).pathname
const failures = []

function readText(path) {
  return readFileSync(join(root, path), 'utf8')
}

function check(condition, message) {
  if (!condition) failures.push(message)
}

function includes(path, needle) {
  return readText(path).includes(needle)
}

const pages = JSON.parse(readText('src/pages.json'))
const tabBarList = pages.tabBar?.list ?? []
const tabPaths = tabBarList.map((item) => item.pagePath)

check(
  JSON.stringify(tabPaths) === JSON.stringify([
    'pages/home/index',
    'pages/catalog/index',
    'pages/cart/index',
    'pages/mine/index',
  ]),
  `tabBar paths should be home/catalog/cart/mine, got ${tabPaths.join(', ')}`,
)

const cartTab = tabBarList.find((item) => item.pagePath === 'pages/cart/index')
check(!!cartTab, 'tabBar should contain pages/cart/index')
check(cartTab?.text === '购物车', `cart tab text should be 购物车, got ${cartTab?.text ?? 'missing'}`)
check(cartTab?.iconPath === 'static/tab-cart.png', `cart iconPath should be static/tab-cart.png`)
check(cartTab?.selectedIconPath === 'static/tab-cart-active.png', `cart selectedIconPath should be static/tab-cart-active.png`)
check(existsSync(join(root, 'src/static/tab-cart.png')), 'src/static/tab-cart.png should exist')
check(existsSync(join(root, 'src/static/tab-cart-active.png')), 'src/static/tab-cart-active.png should exist')

check(
  includes('src/pages/catalog/detail.vue', "uni.switchTab({ url: '/pages/cart/index' })"),
  'buyNow should switchTab to /pages/cart/index because cart is a tab page',
)

check(
  includes('src/pages/mine/index.vue', "uni.navigateTo({ url: '/pages/order/index' })"),
  'mine page should navigateTo /pages/order/index because orders are no longer a tab page',
)

check(
  includes('src/pages/cart/index.vue', 'function goShopping()') &&
    includes('src/pages/cart/index.vue', "uni.switchTab({ url: '/pages/catalog/index' })"),
  'empty cart should provide a goShopping action that switchTabs to /pages/catalog/index',
)

if (failures.length) {
  console.error('UI layout verification failed:')
  failures.forEach((failure) => console.error(`- ${failure}`))
  process.exit(1)
}

console.log('UI layout verification passed')
