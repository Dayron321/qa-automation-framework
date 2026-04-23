/**
 * @file inventory.spec.ts
 * @description Suite de tests para el catálogo de productos de SauceDemo.
 * Cubre: renderizado del inventario, conteo de productos, agregar al carrito
 * y las cuatro opciones de ordenamiento.
 *
 * Etiquetas:
 *   @smoke      — Tests críticos de sanidad
 *   @regression — Tests de regresión completa
 *
 * Nota de arquitectura:
 *   El fixture `inventoryPage` ya maneja la autenticación y navegación a
 *   /inventory.html internamente. No se necesita beforeEach de login aquí.
 */

import { test, expect } from '@fixtures';
import { MESSAGES }     from '@data/messages';
import { formatPrice }  from '@utils/helpers';

test.describe('Inventario — Catálogo de productos', () => {

  // ── Tests @smoke ────────────────────────────────────────────────────────────

  test('la página de inventario muestra el título correcto @smoke',
    async ({ inventoryPage }) => {
      // ASSERT: el fixture ya nos dejó en /inventory.html autenticados
      const title = await inventoryPage.getTitle();
      expect(title).toBe(MESSAGES.INVENTORY_TITLE);
    },
  );

  test('el catálogo muestra exactamente 6 productos @smoke',
    async ({ inventoryPage }) => {
      // SauceDemo siempre muestra 6 productos en el inventario base
      const count = await inventoryPage.getItemCount();
      expect(count).toBe(6);
    },
  );

  test('agregar un producto al carrito actualiza el badge @smoke',
    async ({ inventoryPage }) => {
      // ARRANGE: el badge no debe existir antes de agregar productos
      expect(await inventoryPage.getCartCount()).toBe(0);

      // ACT: agregar el primer producto del catálogo
      await inventoryPage.addItemToCart('Sauce Labs Backpack');

      // ASSERT: el badge debe mostrar "1"
      expect(await inventoryPage.getCartCount()).toBe(1);
    },
  );

  // ── Tests @regression ───────────────────────────────────────────────────────

  test('agregar múltiples productos acumula el contador del carrito @regression',
    async ({ inventoryPage }) => {
      await inventoryPage.addItemToCart('Sauce Labs Backpack');
      await inventoryPage.addItemToCart('Sauce Labs Bike Light');
      await inventoryPage.addItemToCart('Sauce Labs Bolt T-Shirt');

      // ASSERT: el badge debe reflejar los 3 productos agregados
      expect(await inventoryPage.getCartCount()).toBe(3);
    },
  );

  // ── Tests de ordenamiento @regression ────────────────────────────────────────
  // El fixture garantiza que al llegar aquí el dropdown ya está disponible
  // en /inventory.html con sesión activa. No se requiere ningún navigate adicional.

  test('ordenamiento A→Z lista los productos en orden alfabético @regression',
    async ({ inventoryPage, page }) => {
      // ACT: cambiar el dropdown al valor 'az' (Name A to Z)
      await inventoryPage.sortBy('az');

      // Obtenemos todos los nombres de producto después del reordenamiento
      const names  = await page.locator('.inventory_item_name').allInnerTexts();
      const sorted = [...names].sort();

      // ASSERT: el orden de la UI debe coincidir con el orden alfabético calculado
      expect(names).toEqual(sorted);
    },
  );

  test('ordenamiento Z→A lista los productos en orden alfabético inverso @regression',
    async ({ inventoryPage, page }) => {
      await inventoryPage.sortBy('za');

      const names  = await page.locator('.inventory_item_name').allInnerTexts();
      const sorted = [...names].sort().reverse();

      expect(names).toEqual(sorted);
    },
  );

  test('ordenamiento precio menor→mayor ordena correctamente @regression',
    async ({ inventoryPage, page }) => {
      await inventoryPage.sortBy('lohi');

      // Convertimos los textos de precio a número para comparar numéricamente
      const priceTexts = await page.locator('.inventory_item_price').allInnerTexts();
      const prices     = priceTexts.map(formatPrice);
      const sorted     = [...prices].sort((a, b) => a - b);

      // ASSERT: los precios en la UI ya deben estar en orden ascendente
      expect(prices).toEqual(sorted);
    },
  );

  test('ordenamiento precio mayor→menor ordena correctamente @regression',
    async ({ inventoryPage, page }) => {
      await inventoryPage.sortBy('hilo');

      const priceTexts = await page.locator('.inventory_item_price').allInnerTexts();
      const prices     = priceTexts.map(formatPrice);
      const sorted     = [...prices].sort((a, b) => b - a);

      expect(prices).toEqual(sorted);
    },
  );
});
