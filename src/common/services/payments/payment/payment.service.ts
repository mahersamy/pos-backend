import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class PaymentService {
  private stripe: Stripe;
  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  }

  async checkOutSession({
    cancel_url = process.env.CANCEL_URL,
    success_url = process.env.SUCCESS_URL,
    line_items,
    metadata = {},
    discounts = [],
    mode = 'payment',
    customer_email,
  }: Stripe.Checkout.SessionCreateParams) {
    const session = await this.stripe.checkout.sessions.create({
      cancel_url,
      success_url,
      line_items,
      metadata,
      discounts,
      mode,
      customer_email,
    });
    return session;
  }

  constructEvent(rawBody: Buffer, signature: string): Stripe.Event {
    return this.stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  }

  async refundPayment(
    payment_intent: string,
    reason: Stripe.RefundCreateParams.Reason,
  ) {
    const refund = await this.stripe.refunds.create({
      payment_intent,
      reason,
    });
    return refund;
  }
}
