/**
 * @file cart.spec.ts
 * @description Suite de tests para el carrito de compras de SauceDemo.
 * Cubre: agregar productos, verificar contenido del carrito, eliminar items
 * y avanzar al proceso de checkout.
 *
 * Etiquetas:
 *   @smoke      — Tests críticos de sanidad
 *   @regression — Tests de regresión completa
 */

import { test, expect } from '@fixtures';
import { USERS }        from '@data/users';
import { ROUTES }       from '@data/routes';
import { MESSAGES }     from '@data/messages';

// ─── Productos de prueba reutilizados en la suite ─────────────────────────────
const PRODUCT_A = 'Sauce Labs Backpack';
const PRODUCT_B = 'Sauce Labs Bike Light';

// ─── Configuración compartida ─────────────────────────────────────────────────
// Todos los tests parten de un login exitoso y con productos ya en el carrito.
test.describe('Carrito de compras', () => {

  test.beforeEach(async ({ loginPage, inventoryPage }) => {
    // 1. Login con usuario estándar
    await loginPage.goto();
    await loginPage.login(USERS.STANDARD);

    // 2. Agregar dos productos al carrito para tener estado previo en cada test
    await inventoryPage.addItemToCart(PRODUCT_A);
    await inventoryPage.addItemToCart(PRODUCT_B);
  });

  // ── Tests @smoke ────────────────────────────────────────────────────────────

  test('el carrito contiene los productos agregados desde el inventario @smoke',
    async ({ cartPage }) => {
      // Navegamos al carrito
      await cartPage.goto();

      // ASSERT: los 2 productos agregados en beforeEach deben estar listados
      expect(await cartPage.getItemCount()).toBe(2);
    },
  );

  test('el botón Checkout está disponible con items en el carrito @smoke',
    async ({ cartPage, page }) => {
      await cartPage.goto();

      // ASSERT: el botón de checkout debe existir y ser visible
      await expect(page.locator('[data-test="checkout"]')).toBeVisible();
      await expect(page.locator('[data-test="checkout"]')).toHaveText(MESSAGES.CHECKOUT_BUTTON);
    },
  );

  // ── Tests @regression ───────────────────────────────────────────────────────

  test('eliminar un producto reduce el conteo del carrito @regression',
    async ({ cartPage }) => {
      await cartPage.goto();

      // ARRANGE: hay 2 items
      expect(await cartPage.getItemCount()).toBe(2);

      // ACT: eliminar solo el primer producto
      await cartPage.removeItem(PRODUCT_A);

      // ASSERT: debe quedar solo 1 item
      expect(await cartPage.getItemCount()).toBe(1);
    },
  );

  test('eliminar todos los productos deja el carrito vacío @regression',
    async ({ cartPage }) => {
      await cartPage.goto();

      await cartPage.removeItem(PRODUCT_A);
      await cartPage.removeItem(PRODUCT_B);

      // ASSERT: el carrito debe estar vacío
      expect(await cartPage.getItemCount()).toBe(0);
    },
  );

  test('proceder al checkout redirige al paso 1 @regression',
    async ({ cartPage, page }) => {
      await cartPage.goto();

      // ACT: hacer clic en Checkout
      await cartPage.proceedToCheckout();

      // ASSERT: la URL debe cambiar al formulario de datos personales
      await expect(page).toHaveURL(new RegExp(ROUTES.CHECKOUT_STEP1));
    },
  );

  test('el badge del ícono de carrito refleja el conteo correcto @regression',
    async ({ inventoryPage, page }) => {
      // El beforeEach ya agrega 2 items; verificamos desde la página de inventario
      // (antes de navegar al carrito) que el badge muestra el número correcto.
      const count = await inventoryPage.getCartCount();
      expect(count).toBe(2);

      // También verificamos el texto del elemento directamente
      await expect(page.locator('.shopping_cart_badge')).toHaveText('2');
    },
  );
});
