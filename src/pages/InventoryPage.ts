/**
 * @file InventoryPage.ts
 * @description Page Object Model para el catálogo de productos de SauceDemo (/inventory.html).
 * Encapsula la interacción con la lista de productos, el ordenamiento y el carrito.
 */

import { type Page, type Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { ROUTES } from '@data/routes';

// ─── Tipo para las opciones de ordenamiento del dropdown ─────────────────────
// Los valores corresponden exactamente a los values del <select> en SauceDemo.
// 'az'   → Name (A to Z)   | 'za'   → Name (Z to A)
// 'lohi' → Price (low–high) | 'hilo' → Price (high–low)
export type SortOption = 'az' | 'za' | 'lohi' | 'hilo';

export class InventoryPage extends BasePage {

  // ─── Selectores privados ──────────────────────────────────────────────────
  private readonly pageTitle:        Locator;
  private readonly inventoryItems:   Locator;
  private readonly addToCartButtons: Locator;
  private readonly cartBadge:        Locator;
  private readonly sortDropdown:     Locator;

  /**
   * @param page - Instancia de `Page` de Playwright inyectada desde el test/fixture
   */
  constructor(page: Page) {
    super(page);

    this.pageTitle        = page.locator('.title');
    // Cada tarjeta de producto en el grid
    this.inventoryItems   = page.locator('.inventory_item');
    // Todos los botones "Add to cart" — usamos ^= para el prefijo del data-test
    this.addToCartButtons = page.locator('[data-test^="add-to-cart"]');
    // Badge numérico del ícono del carrito (aparece solo cuando hay items)
    this.cartBadge        = page.locator('.shopping_cart_badge');
    // Dropdown de ordenamiento de productos
    this.sortDropdown     = page.locator('.product_sort_container');
  }

  // ─── Navegación ───────────────────────────────────────────────────────────

  /**
   * Navega directamente al catálogo de productos.
   * Normalmente se llega aquí tras un login exitoso, pero este método
   * es útil para tests que parten de un estado de sesión ya existente.
   */
  async goto(): Promise<void> {
    await this.navigate(ROUTES.INVENTORY);
    await this.waitForVisible(this.pageTitle);
  }

  // ─── Lectura de estado ────────────────────────────────────────────────────

  /**
   * Retorna el texto del título del catálogo.
   * En SauceDemo el valor esperado es 'Products'.
   */
  async getTitle(): Promise<string> {
    await this.waitForVisible(this.pageTitle);
    return this.pageTitle.innerText();
  }

  /**
   * Cuenta cuántos productos están actualmente visibles en el catálogo.
   * SauceDemo muestra 6 productos por defecto.
   */
  async getItemCount(): Promise<number> {
    return this.inventoryItems.count();
  }

  /**
   * Retorna el número que muestra el badge del carrito.
   * Si el badge no está visible (carrito vacío), retorna 0.
   */
  async getCartCount(): Promise<number> {
    const isVisible = await this.cartBadge.isVisible();
    if (!isVisible) return 0;

    const text = await this.cartBadge.innerText();
    const count = parseInt(text, 10);

    // Guardamos contra un badge con texto no numérico (caso defensivo)
    return isNaN(count) ? 0 : count;
  }

  // ─── Acciones ─────────────────────────────────────────────────────────────

  /**
   * Agrega al carrito el producto cuyo nombre coincide exactamente con `itemName`.
   * Busca dentro de cada tarjeta de producto para localizar el botón correcto,
   * evitando agregar el producto equivocado en tests con múltiples items.
   *
   * @param itemName - Nombre exacto del producto (ej: 'Sauce Labs Backpack')
   * @throws {Error}  Si no se encuentra ningún producto con ese nombre
   *
   * @example
   *   await inventoryPage.addItemToCart('Sauce Labs Backpack');
   */
  async addItemToCart(itemName: string): Promise<void> {
    // Filtramos las tarjetas buscando la que contiene el nombre exacto del producto
    const targetItem = this.inventoryItems.filter({
      has: this.page.locator('.inventory_item_name', { hasText: itemName }),
    });

    // Verificamos que encontramos exactamente un resultado
    const count = await targetItem.count();
    if (count === 0) {
      throw new Error(`InventoryPage.addItemToCart: no se encontró el producto "${itemName}".`);
    }

    // Hacemos clic en el botón "Add to cart" dentro de esa tarjeta específica
    await targetItem.locator('[data-test^="add-to-cart"]').click();
  }

  /**
   * Cambia el ordenamiento del catálogo usando el dropdown de SauceDemo.
   *
   * @param option - Clave de ordenamiento. Ver tipo `SortOption`
   *
   * @example
   *   await inventoryPage.sortBy('lohi'); // Precio: menor a mayor
   *   await inventoryPage.sortBy('az');   // Nombre: A → Z
   */
  async sortBy(option: SortOption): Promise<void> {
    await this.sortDropdown.selectOption(option);
  }
}
