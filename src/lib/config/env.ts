// Production guard for demo deposits
export function isDemoDepositAllowed(): boolean {
  return process.env.NODE_ENV !== 'production' && process.env.DEMO_DEPOSIT_ENABLED === 'true';
}