/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * JUSTAPDF - PERMISSIONS CONFIG
 * Centralized permission definitions for roles and plans
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export function getAllPermissions() {
  return {
    pdf: { read: true, edit: true, create: true, delete: true, passwordOverride: true },
    signatures: { create: true, verify: true, request: true, blockchain: true },
    design: { full: true },
    ai: { contracts: true, analysis: true, chat: true },
    web3: { smartContracts: true, deploy: true },
    crm: { full: true },
    admin: { users: true, orgs: true, billing: true, features: true, system: true },
    billing: { view: true, manage: true },
    dialer: { sms: true, voice: true },
    cms: { full: true },
    ads: { manage: true, view: true }
  };
}

export function getDefaultPermissions(plan) {
  const base = {
    pdf: { read: true, edit: true, create: true, delete: true, passwordOverride: false },
    signatures: { create: true, verify: true, request: false, blockchain: false },
    design: { full: false },
    ai: { contracts: false, analysis: false, chat: false },
    web3: { smartContracts: false, deploy: false },
    crm: { full: false },
    admin: { users: false, orgs: false, billing: false, features: false, system: false },
    billing: { view: true, manage: false }
  };

  switch (plan) {
    case 'pro':
      base.signatures.request = true;
      base.ai.contracts = true;
      base.ai.chat = true;
      base.crm.full = true;
      break;
    case 'business':
      base.signatures = { create: true, verify: true, request: true, blockchain: true };
      base.ai = { contracts: true, analysis: true, chat: true };
      base.web3 = { smartContracts: true, deploy: true };
      base.pdf.passwordOverride = true;
      base.design.full = true;
      base.crm.full = true;
      break;
    case 'enterprise':
      return getAllPermissions();
  }

  return base;
}

export function getPlanSeats(plan) {
  const seats = {
    starter: 2,
    pro: 5,
    business: -1, // Unlimited
    enterprise: -1 // Unlimited
  };
  return seats[plan] || 2;
}

