/**
 * @file messages.ts
 * @description Textos literales que los tests verifican contra la UI de SauceDemo.
 * Centralizar los mensajes aquí hace que los tests sean resistentes a
 * refactorizaciones: si la app cambia un texto, solo hay que actualizar este archivo.
 */

// ─── Mensajes de error ────────────────────────────────────────────────────────
// Textos que SauceDemo muestra en el banner rojo de error dentro del formulario
// de login. Se verifican con: await expect(page.locator('[data-test="error"]')).
export const MESSAGES = {

  // Error que aparece cuando el usuario o la contraseña son incorrectos
  LOGIN_ERROR_INVALID_CREDENTIALS:
    'Epic sadface: Username and password do not match any user in this service',

  // Error específico que aparece cuando el usuario está bloqueado por el admin
  LOGIN_ERROR_LOCKED_USER:
    'Epic sadface: Sorry, this user has been locked out.',

  // ─── Textos de la página de inventario ───────────────────────────────────
  // Título del encabezado de la página de catálogo de productos
  INVENTORY_TITLE: 'Products',

  // ─── Textos del flujo de checkout ─────────────────────────────────────────
  // Texto del botón principal que inicia el proceso de pago desde el carrito
  CHECKOUT_BUTTON: 'Checkout',

  // Mensaje de confirmación mostrado al completar un pedido exitosamente
  ORDER_COMPLETE: 'Thank you for your order!',

} as const;

// ─── Tipo derivado de los mensajes ────────────────────────────────────────────
// Permite tipar parámetros que esperan un mensaje conocido del sistema.
// Ejemplo: function assertMessage(message: AppMessage) { ... }
export type AppMessage = (typeof MESSAGES)[keyof typeof MESSAGES];
