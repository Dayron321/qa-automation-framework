/**
 * @file routes.ts
 * @description Rutas relativas de la aplicación SauceDemo.
 * Centralizar las rutas aquí evita strings mágicos dispersos en los tests.
 * Se usan junto con la baseURL configurada en playwright.config.ts, de modo
 * que basta con: await page.goto(ROUTES.INVENTORY)
 */

// ─── Rutas de SauceDemo ───────────────────────────────────────────────────────
// Todas las rutas son relativas a la baseURL definida en playwright.config.ts.
// El objeto es inmutable (as const) para evitar modificaciones accidentales en tests.
export const ROUTES = {

  // Página de inicio de sesión — punto de entrada de la aplicación
  LOGIN: '/',

  // Catálogo de productos — destino después de un login exitoso
  INVENTORY: '/inventory.html',

  // Carrito de compras — lista de productos agregados
  CART: '/cart.html',

  // Checkout paso 1 — formulario con datos personales (nombre, apellido, CP)
  CHECKOUT_STEP1: '/checkout-step-one.html',

  // Checkout paso 2 — resumen del pedido con totales y taxes
  CHECKOUT_STEP2: '/checkout-step-two.html',

  // Confirmación de orden — pantalla final tras completar el pago
  CHECKOUT_COMPLETE: '/checkout-complete.html',

} as const;

// ─── Tipo derivado de las rutas ───────────────────────────────────────────────
// Permite tipar parámetros que esperan una ruta válida del sistema.
// Ejemplo: function navigateTo(route: AppRoute) { ... }
export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];
