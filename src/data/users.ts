/**
 * @file users.ts
 * @description Credenciales de los usuarios de prueba para SauceDemo.
 * Los valores sensibles se leen desde variables de entorno (.env) para
 * evitar hardcodear credenciales en el repositorio.
 */

// ─── Tipo base para cualquier credencial de usuario ───────────────────────────
// Usado como contrato en Page Objects y fixtures para garantizar tipado estricto.
export type UserCredentials = {
  username: string;
  password: string;
};

// ─── Mapa de usuarios de prueba ───────────────────────────────────────────────
// Cada entrada representa un rol/estado de usuario en la aplicación.
// Las variables de entorno son leídas en tiempo de ejecución desde .env
// (ver .env.example para referencia de las variables esperadas).
export const USERS: Record<string, UserCredentials> = {

  // Usuario estándar — acceso completo a todas las funcionalidades de la tienda.
  // Es el usuario principal para los tests del flujo feliz (happy path).
  STANDARD: {
    username: process.env.STANDARD_USER ?? 'standard_user',
    password: process.env.PASSWORD      ?? 'secret_sauce',
  },

  // Usuario bloqueado — el login devuelve un error de acceso denegado.
  // Útil para tests de validación de mensajes de error y casos negativos.
  LOCKED: {
    username: process.env.LOCKED_USER ?? 'locked_out_user',
    password: process.env.PASSWORD    ?? 'secret_sauce',
  },

  // Usuario inválido — no existe en el sistema.
  // Permite verificar el mensaje de error de credenciales incorrectas.
  INVALID: {
    username: 'invalid_user',
    password: 'wrong_password',
  },
} as const;
