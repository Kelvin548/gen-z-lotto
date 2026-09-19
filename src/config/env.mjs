// src/config/env.mjs
export const IS_REAL_MONEY_ENABLED = 
  process.env.NODE_ENV === 'production' &&
  process.env.ENABLE_REAL_MONEY_TRANSACTIONS === 'true' &&
  process.env.PAYMENT_PROVIDER_MODE === 'LIVE';