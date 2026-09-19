export interface MtnMoMoProviderConfig {
  baseUrl: string;
  targetEnvironment: string;
  subscriptionKey: string;
  apiUser: string;
  apiKey: string;
  callbackUrl: string;
}

export interface RequestToPayInput {
  reference: string; // Internal transaction reference (UUID)
  amount: number;    // Minor units (pesewas)
  currency: string;  // Must be "GHS"
  payerPhone: string;
  payerNote?: string;
}

export interface PaymentStatusResult {
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  financialTransactionId?: string;
  amount: number;
  currency: string;
  reason?: string;
}

export class MtnMoMoSandboxMockProvider {
  private config: MtnMoMoProviderConfig;

  constructor(config: MtnMoMoProviderConfig) {
    this.config = config;
  }

  async getAccessToken(): Promise<{ accessToken: string; expiresIn: number }> {
    // Mock OAuth 2.0 token response
    return {
      accessToken: `mock-access-token-${Date.now()}`,
      expiresIn: 3600,
    };
  }

  async requestToPay(input: RequestToPayInput): Promise<{ providerRef: string; status: 'PENDING' }> {
    if (input.currency !== 'GHS') {
      throw new Error('INVALID_CURRENCY: Only GHS is supported');
    }
    if (!Number.isInteger(input.amount) || input.amount <= 0) {
      throw new Error('INVALID_AMOUNT: Amount must be a positive integer in pesewas');
    }

    return {
      providerRef: `mtn-sandbox-ref-${input.reference}`,
      status: 'PENDING',
    };
  }

  async verifyTransactionStatus(reference: string): Promise<PaymentStatusResult> {
    // Server-side status verification engine
    if (reference.includes('fail')) {
      return { status: 'FAILED', amount: 1000, currency: 'GHS', reason: 'INSUFFICIENT_FUNDS' };
    }
    if (reference.includes('pending')) {
      return { status: 'PENDING', amount: 1000, currency: 'GHS' };
    }

    // Default mock success payload
    return {
      status: 'SUCCESS',
      financialTransactionId: `mtn-tx-${Date.now()}`,
      amount: 1000,
      currency: 'GHS',
    };
  }
}