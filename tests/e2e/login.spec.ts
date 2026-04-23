/**
 * @file login.spec.ts
 * @description Suite de tests para el flujo de autenticación de SauceDemo.
 * Cubre casos de login exitoso, usuario bloqueado y credenciales inválidas.
 *
 * Etiquetas:
 *   @smoke      — Tests críticos de sanidad (se corren en cada deploy)
 *   @regression — Tests de regresión completa (se corren antes de cada release)
 */

import { test, expect } from '@fixtures';
import { USERS }        from '@data/users';
import { ROUTES }       from '@data/routes';
import { MESSAGES }     from '@data/messages';

// ─── Suite principal de Login ─────────────────────────────────────────────────
test.describe('Autenticación — Login', () => {

  // Navegamos a la página de login antes de cada test para garantizar estado limpio
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  // ── Tests @smoke ────────────────────────────────────────────────────────────

  test('login exitoso con usuario estándar @smoke', async ({ loginPage, page }) => {
    // ARRANGE: credenciales del usuario estándar (leídas desde .env)
    // ACT: completar el formulario y enviar
    await loginPage.login(USERS.STANDARD);

    // ASSERT: la URL debe cambiar al inventario de productos
    await expect(page).toHaveURL(new RegExp(ROUTES.INVENTORY));
  });

  test('muestra error con credenciales inválidas @smoke', async ({ loginPage }) => {
    // ACT
    await loginPage.login(USERS.INVALID);

    // ASSERT: el banner de error debe ser visible
    expect(await loginPage.isErrorVisible()).toBe(true);

    // ASSERT: el texto del error debe ser el esperado
    const errorMsg = await loginPage.getErrorMessage();
    expect(errorMsg).toContain(MESSAGES.LOGIN_ERROR_INVALID_CREDENTIALS);
  });

  // ── Tests @regression ───────────────────────────────────────────────────────

  test('muestra error de usuario bloqueado @regression', async ({ loginPage }) => {
    // ACT: intentar login con usuario bloqueado por el admin
    await loginPage.login(USERS.LOCKED);

    // ASSERT: error visible
    expect(await loginPage.isErrorVisible()).toBe(true);

    // ASSERT: mensaje específico de bloqueo
    const errorMsg = await loginPage.getErrorMessage();
    expect(errorMsg).toContain(MESSAGES.LOGIN_ERROR_LOCKED_USER);
  });

  test('el formulario de login se renderiza correctamente @regression', async ({ page }) => {
    // ASSERT: los tres elementos del formulario deben estar visibles en la página
    await expect(page.locator('[data-test="username"]')).toBeVisible();
    await expect(page.locator('[data-test="password"]')).toBeVisible();
    await expect(page.locator('[data-test="login-button"]')).toBeVisible();
  });

  test('el banner de error desaparece al corregir las credenciales @regression',
    async ({ loginPage, page }) => {
      // ACT 1: login fallido para provocar el error
      await loginPage.login(USERS.INVALID);
      expect(await loginPage.isErrorVisible()).toBe(true);

      // ACT 2: cerrar el banner usando el botón "×" de SauceDemo
      await page.locator('[data-test="error-button"]').click();

      // ASSERT: el banner ya no debe ser visible
      expect(await loginPage.isErrorVisible()).toBe(false);
    },
  );

  test('login exitoso redirige a la URL correcta del inventario @regression',
    async ({ loginPage, page }) => {
      await loginPage.login(USERS.STANDARD);

      // ASSERT: URL exacta (no solo "contiene")
      await expect(page).toHaveURL(`${process.env.BASE_URL}${ROUTES.INVENTORY}`);
    },
  );
});
