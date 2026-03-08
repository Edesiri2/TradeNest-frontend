import type { BusinessSettings } from '../../types/settings';
import type { CartItem } from '../../types/sales';

export interface CheckoutLineSummary {
  subtotal: number;
  vatAmount: number;
  total: number;
  vatMode: 'inclusive' | 'exclusive' | 'non-vatable';
}

export interface CheckoutSummary {
  subtotal: number;
  totalVat: number;
  total: number;
  vatableSubtotal: number;
  nonVatableSubtotal: number;
  loyaltyBonusAmount: number;
  lines: Record<string, CheckoutLineSummary>;
}

export const computeCheckoutSummary = (
  items: CartItem[],
  settings: BusinessSettings,
  loyaltyApplied = false
): CheckoutSummary => {
  const vatRate = settings.sales.enableVat ? settings.sales.vatRate / 100 : 0;

  const base = items.reduce<CheckoutSummary>(
    (acc, item) => {
      const subtotal = item.unitPrice * item.quantity;
      let vatAmount = 0;
      let total = subtotal;
      let vatMode: CheckoutLineSummary['vatMode'] = 'non-vatable';

      if (item.isVatable && vatRate > 0) {
        if (item.isVatInclusive) {
          vatAmount = subtotal - subtotal / (1 + vatRate);
          total = subtotal;
          vatMode = 'inclusive';
        } else {
          vatAmount = subtotal * vatRate;
          total = subtotal + vatAmount;
          vatMode = 'exclusive';
        }
      }

      acc.subtotal += subtotal;
      acc.totalVat += vatAmount;
      acc.total += total;
      if (item.isVatable) {
        acc.vatableSubtotal += subtotal;
      } else {
        acc.nonVatableSubtotal += subtotal;
      }
      acc.lines[item.productId] = {
        subtotal,
        vatAmount,
        total,
        vatMode
      };

      return acc;
    },
    {
      subtotal: 0,
      totalVat: 0,
      total: 0,
      vatableSubtotal: 0,
      nonVatableSubtotal: 0,
      loyaltyBonusAmount: 0,
      lines: {}
    }
  );

  if (loyaltyApplied && settings.sales.loyaltyEnabled && settings.sales.loyaltyBonusPercentage > 0) {
    base.loyaltyBonusAmount = (base.total * settings.sales.loyaltyBonusPercentage) / 100;
  }

  return base;
};
