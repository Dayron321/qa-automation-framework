// src/fixtures/base.fixture.ts
// Fixtures personalizados de Playwright
// Un fixture es un objeto/utilidad que se injecta automáticamente en cada test.
// Playwright maneja su ciclo de vida (setup/teardown) de forma automática.

import { test as base } from '@playwright/test';
import { LoginPage }    from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { USERS } from '../data/users';

// ─── Tipo que define los fixtures disponibles ─────────────────────────────────
type AppFixtures = {
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  authenticatedPage: InventoryPage; // ya hace login por ti
};

// ─── Extensión del test base con nuestros fixtures ────────────────────────────
export const test = base.extend<AppFixtures>({

  // Fixture: LoginPage — disponible en cualquier test que lo declare
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await use(loginPage); // aquí corre el test
    // Cleanup automático post-test (si necesitas hacer algo)
  },

  // Fixture: InventoryPage — navega directamente al inventario
  inventoryPage: async ({ page }, use) => {
    const inventoryPage = new InventoryPage(page);
    await inventoryPage.goto();
    await use(inventoryPage);
  },

  // Fixture: authenticatedPage — hace login y te entrega InventoryPage lista
  // Úsalo en tests donde el login es prerequisito, no el objeto del test.
  authenticatedPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(USERS.standard.username, USERS.standard.password);

    const inventoryPage = new InventoryPage(page);
    await use(inventoryPage);
  },
});

// Re-exportamos expect para que los tests importen todo desde un solo lugar
export { expect } from '@playwright/test';
