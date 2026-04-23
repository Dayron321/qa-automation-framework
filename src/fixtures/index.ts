/**
 * @file index.ts
 * @description Fixtures personalizados de Playwright que extienden el `test` base.
 * Los fixtures inyectan instancias de los Page Objects directamente en cada test,
 * eliminando la necesidad de instanciarlos manualmente y garantizando que cada
 * test parte de un estado limpio y aislado.
 *
 * Uso en los tests:
 *   import { test, expect } from '@fixtures';
 *   test('ejemplo', async ({ loginPage }) => { ... });
 */

import { test as base } from '@playwright/test';
import { LoginPage }     from '@pages/LoginPage';
import { InventoryPage } from '@pages/InventoryPage';
import { CartPage }      from '@pages/CartPage';
import { USERS }         from '@data/users';

// ─── Definición del tipo de los fixtures ─────────────────────────────────────
// Esto le da a TypeScript (y al IDE) autocompletado de todos los fixtures
// disponibles al destructurar el argumento del test.
type PageFixtures = {
  loginPage:     LoginPage;
  inventoryPage: InventoryPage;
  cartPage:      CartPage;
};

// ─── Extensión del test base de Playwright ────────────────────────────────────
// Cada fixture es una función que recibe `page` (ya provista por Playwright)
// y usa `use()` para entregar la instancia al cuerpo del test.
// Playwright se encarga del ciclo de vida: setup antes, teardown después.
export const test = base.extend<PageFixtures>({

  // ── LoginPage ─────────────────────────────────────────────────────────────
  // No navega automáticamente: el test controla cuándo llamar a loginPage.goto().
  // Esto permite testear el estado del formulario de login sin sesión activa.
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  // ── InventoryPage ─────────────────────────────────────────────────────────
  // AUTOSUFICIENTE: realiza el login con USERS.STANDARD antes de entregar
  // la instancia. Así cualquier test que lo reciba ya está autenticado y
  // en /inventory.html, sin depender de un beforeEach externo.
  //
  // Esto resuelve el TimeoutError en selectOption('[data-test="product_sort_container"]')
  // que ocurría cuando los tests de ordenamiento recibían la página sin sesión.
  inventoryPage: async ({ page }, use) => {
    // 1. Instanciamos LoginPage con la misma `page` para compartir contexto
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(USERS.STANDARD);

    // 2. Después del login, SauceDemo redirige automáticamente a /inventory.html.
    //    Esperamos explícitamente esa URL antes de entregar el control al test.
    await page.waitForURL('**/inventory.html', { waitUntil: 'domcontentloaded' });

    // 3. Entregamos la instancia de InventoryPage ya lista para interactuar
    await use(new InventoryPage(page));
  },

  // ── CartPage ───────────────────────────────────────────────────────────────
  // No navega automáticamente: cart.spec.ts maneja el flujo completo
  // (login → agregar productos → navegar al carrito) en su propio beforeEach.
  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },
});

// ─── Re-exportamos expect para que los tests solo necesiten un import ─────────
// Con esto: import { test, expect } from '@fixtures'  ← un solo import limpio
export { expect } from '@playwright/test';
