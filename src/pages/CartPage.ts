/**
 * @file CartPage.ts
 * @description Page Object Model para el carrito de compras de SauceDemo (/cart.html).
 * Encapsula las interacciones de revisión del carrito: contar items, eliminar
 * productos individuales y proceder al checkout.
 */

import { type Page, type Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { ROUTES } from '@data/routes';

export class CartPage extends BasePage {

  // ─── Selectores privados ──────────────────────────────────────────────────
  // Cada fila del carrito representa un producto agregado
  private readonly cartItems:      Locator;
  // Botón principal que lleva al formulario de datos personales del checkout
  private readonly checkoutButton: Locator;
  // Todos los botones "Remove" dentro del carrito — prefijo ^= para data-test
  private readonly removeButtons:  Locator;

  /**
   * @param page - Instancia de `Page` de Playwright inyectada desde el test/fixture
   */
  constructor(page: Page) {
    super(page);

    this.cartItems      = page.locator('.cart_item');
    this.checkoutButton = page.locator('[data-test="checkout"]');
    this.removeButtons  = page.locator('[data-test^="remove"]');
  }

  // ─── Navegación ───────────────────────────────────────────────────────────

  /**
   * Navega directamente al carrito de compras.
   * Requiere que haya una sesión activa; de lo contrario SauceDemo redirige al login.
   */
  async goto(): Promise<void> {
    await this.navigate(ROUTES.CART);
    // Esperamos el botón de checkout como señal de que la página está lista
    await this.waitForVisible(this.checkoutButton);
  }

  // ─── Lectura de estado ────────────────────────────────────────────────────

  /**
   * Retorna el número de líneas de producto presentes en el carrito.
   * Un carrito vacío retorna 0.
   */
  async getItemCount(): Promise<number> {
    return this.cartItems.count();
  }

  // ─── Acciones ─────────────────────────────────────────────────────────────

  /**
   * Hace clic en el botón "Checkout" para avanzar al paso 1 del checkout.
   * Después de llamar este método la URL debería cambiar a ROUTES.CHECKOUT_STEP1.
   *
   * @example
   *   await cartPage.proceedToCheckout();
   *   await expect(page).toHaveURL(/checkout-step-one/);
   */
  async proceedToCheckout(): Promise<void> {
    await this.checkoutButton.click();
    await this.waitForUrl(ROUTES.CHECKOUT_STEP1);
  }

  /**
   * Elimina del carrito el producto cuyo nombre coincide exactamente con `itemName`.
   * Busca dentro de cada fila del carrito para hacer clic en el botón "Remove"
   * correcto, sin afectar otros productos.
   *
   * @param itemName - Nombre exacto del producto a eliminar (ej: 'Sauce Labs Backpack')
   * @throws {Error}  Si no se encuentra ningún producto con ese nombre en el carrito
   *
   * @example
   *   await cartPage.removeItem('Sauce Labs Fleece Jacket');
   */
  async removeItem(itemName: string): Promise<void> {
    // Filtramos las filas del carrito para encontrar la que contiene el nombre buscado
    const targetItem = this.cartItems.filter({
      has: this.page.locator('.inventory_item_name', { hasText: itemName }),
    });

    const count = await targetItem.count();
    if (count === 0) {
      throw new Error(`CartPage.removeItem: no se encontró "${itemName}" en el carrito.`);
    }

    // Hacemos clic en el botón "Remove" dentro de esa fila específica
    await targetItem.locator('[data-test^="remove"]').click();
  }
}
