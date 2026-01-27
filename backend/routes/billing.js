/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * MOD PDF - BILLING ROUTES (Stripe & PaymentCloud)
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import express from 'express';
import crypto from 'crypto';
import { db } from '../database/connection.js';
import { getCreditBalance, recordActionOutcome } from '../services/credits.js';
import { CREDIT_PACKS, SUBSCRIPTIONS, PROFESSIONAL_PACKS } from '../config/pricing.js';
import { calculateCredits, getAllOperations } from '../services/operationRegistry.js';

const router = express.Router();

// Pricing configuration (legacy placeholder, keep for now)
const PRICING = {};

// ═══════════════════════════════════════════════════════════════════════════════
// PRICING & PLANS
// ═══════════════════════════════════════════════════════════════════════════════

router.get('/plans', async (req, res) => {
  try {
    res.json({
      success: true,
      plans: PRICING
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch plans' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// OPERATION CATALOG
// ═══════════════════════════════════════════════════════════════════════════════

router.get('/operations', async (req, res) => {
  res.json({ success: true, operations: getAllOperations() });
});

router.get('/credit-packs', async (req, res) => {
  res.json({ success: true, packs: CREDIT_PACKS });
});

router.get('/subscriptions', async (req, res) => {
  res.json({ success: true, subscriptions: SUBSCRIPTIONS });
});

router.get('/professional-packs', async (req, res) => {
  res.json({ success: true, packs: PROFESSIONAL_PACKS });
});

// ═══════════════════════════════════════════════════════════════════════════════
// SUBSCRIPTION MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════════

router.get('/subscription', async (req, res) => {
  try {
    const { orgId } = req.user;
    
    // Mock subscription
    const subscription = {
      id: crypto.randomUUID(),
      organizationId: orgId,
      plan: 'pro',
      status: 'active',
      billingPeriod: 'monthly',
      currentPeriodStart: new Date().toISOString(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      amount: 49,
      currency: 'USD',
      paymentMethod: {
        type: 'card',
        last4: '4242',
        brand: 'visa',
        expiryMonth: 12,
        expiryYear: 2025
      },
      seats: {
        used: 3,
        total: 5
      }
    };
    
    res.json({ success: true, subscription });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch subscription' });
  }
});

router.post('/subscription', async (req, res) => {
  try {
    const { plan, billingPeriod, paymentMethodId } = req.body;
    
    // Validate plan
    if (!PRICING[plan]) {
      return res.status(400).json({ success: false, error: 'Invalid plan' });
    }
    
    const subscription = {
      id: crypto.randomUUID(),
      plan,
      status: 'active',
      billingPeriod,
      createdAt: new Date().toISOString()
    };
    
    res.status(201).json({ success: true, subscription });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create subscription' });
  }
});

router.put('/subscription', async (req, res) => {
  try {
    const { plan, billingPeriod } = req.body;
    
    res.json({
      success: true,
      message: 'Subscription updated',
      effectiveDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update subscription' });
  }
});

router.delete('/subscription', async (req, res) => {
  try {
    const { reason, feedback } = req.body;
    
    res.json({
      success: true,
      message: 'Subscription will be cancelled at end of billing period',
      cancellationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to cancel subscription' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// PAYMENT METHODS
// ═══════════════════════════════════════════════════════════════════════════════

router.get('/payment-methods', async (req, res) => {
  try {
    const paymentMethods = [
      {
        id: crypto.randomUUID(),
        type: 'card',
        brand: 'visa',
        last4: '4242',
        expiryMonth: 12,
        expiryYear: 2025,
        isDefault: true,
        provider: 'stripe'
      }
    ];
    
    res.json({ success: true, paymentMethods });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch payment methods' });
  }
});

router.post('/payment-methods', async (req, res) => {
  try {
    const { provider, token } = req.body;
    
    // provider: 'stripe' or 'paymentcloud'
    
    const paymentMethod = {
      id: crypto.randomUUID(),
      type: 'card',
      provider,
      createdAt: new Date().toISOString()
    };
    
    res.status(201).json({ success: true, paymentMethod });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to add payment method' });
  }
});

router.delete('/payment-methods/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    res.json({ success: true, message: 'Payment method removed' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to remove payment method' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// INVOICES
// ═══════════════════════════════════════════════════════════════════════════════

router.get('/invoices', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const invoices = [
      {
        id: crypto.randomUUID(),
        number: 'INV-001234',
        date: new Date().toISOString(),
        amount: 49,
        currency: 'USD',
        status: 'paid',
        pdfUrl: '/api/billing/invoices/INV-001234/pdf'
      }
    ];
    
    res.json({ success: true, invoices });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch invoices' });
  }
});

router.get('/invoices/:id/pdf', async (req, res) => {
  try {
    const { id } = req.params;
    
    // In production, generate and return PDF
    res.json({ success: true, message: 'Invoice PDF would be generated here' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to generate invoice' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// USAGE & BILLING PORTAL
// ═══════════════════════════════════════════════════════════════════════════════

router.get('/usage', async (req, res) => {
  try {
    const { month } = req.query;
    
    res.json({
      success: true,
      usage: {
        documents: { used: 456, limit: -1, unlimited: true },
        signatures: { used: 89, limit: -1, unlimited: true },
        storage: { used: '2.4 GB', limit: '50 GB' },
        apiCalls: { used: 12345, limit: 100000 },
        aiRequests: { used: 34, limit: 100 }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch usage' });
  }
});

router.get('/portal-session', async (req, res) => {
  try {
    // Create Stripe customer portal session
    // In production, this would use Stripe's API
    
    res.json({
      success: true,
      portalUrl: 'https://billing.stripe.com/session/xxx'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create portal session' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// CREDIT LEDGER
// ═══════════════════════════════════════════════════════════════════════════════

router.post('/credits/consume', async (req, res) => {
  try {
    const { actionKey, success = true, metadata = {}, quantity = 1 } = req.body;

    if (!actionKey) {
      return res.status(400).json({ success: false, error: 'actionKey is required' });
    }

    const entry = await recordActionOutcome({
      userId: req.user.userId,
      userEmail: req.user.email,
      actionKey,
      success,
      quantity,
      metadata
    });

    res.status(201).json({ success: true, entry });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to record credit usage' });
  }
});

router.post('/credits/estimate', async (req, res) => {
  try {
    const { actionKey, quantity = 1 } = req.body;
    const estimate = calculateCredits(actionKey, quantity);
    if (estimate === null) {
      return res.status(404).json({ success: false, error: 'Unknown operation' });
    }

    res.json({ success: true, actionKey, quantity, credits: estimate });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to estimate credits' });
  }
});

router.get('/credits/balance', async (req, res) => {
  try {
    const balance = await getCreditBalance(req.user.userId);
    res.json({ success: true, balance });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch credit balance' });
  }
});

router.get('/credits/ledger', async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    const entries = await db.findMany(
      'credit_ledger',
      { user_id: req.user.userId },
      { limit: parseInt(limit, 10), offset: parseInt(offset, 10), orderBy: 'created_at:desc' }
    );

    res.json({ success: true, entries });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch credit ledger' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// STRIPE WEBHOOK
// ═══════════════════════════════════════════════════════════════════════════════

router.post('/webhooks/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const sig = req.headers['stripe-signature'];
    
    // Verify webhook signature in production
    // const event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    
    const event = JSON.parse(req.body);
    
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        // Handle subscription changes
        break;
      case 'invoice.paid':
        // Handle successful payment
        break;
      case 'invoice.payment_failed':
        // Handle failed payment
        break;
    }
    
    res.json({ received: true });
  } catch (error) {
    res.status(400).json({ error: 'Webhook error' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// PAYMENTCLOUD WEBHOOK (Authorize.net)
// ═══════════════════════════════════════════════════════════════════════════════

router.post('/webhooks/paymentcloud', async (req, res) => {
  try {
    // Handle PaymentCloud/Authorize.net webhooks
    // Placeholder for when API keys are available
    
    res.json({ received: true });
  } catch (error) {
    res.status(400).json({ error: 'Webhook error' });
  }
});

export default router;
