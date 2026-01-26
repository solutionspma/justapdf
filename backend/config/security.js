/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * JUSTAPDF - SECURITY CONSTANTS
 * Supra admin enforcement and immutable role controls
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export const SUPRA_ADMIN_EMAIL = (
  process.env.SUPRA_ADMIN_EMAIL ||
  process.env.ROOT_EMAIL ||
  'justapdf@pitchmarketing.agency'
).toLowerCase();

export const SUPRA_ADMIN_ROLE = 'supra_admin';

export function isSupraAdminEmail(email) {
  return !!email && email.toLowerCase() === SUPRA_ADMIN_EMAIL;
}

