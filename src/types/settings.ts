export interface BusinessSettings {
  brand: {
    primaryFrom: string;
    primaryTo: string;
  };
  sales: {
    vatRate: number;
    enableVat: boolean;
    loyaltyEnabled: boolean;
    loyaltyBonusPercentage: number;
  };
  products: {
    requireApproval: boolean;
    allowNegativeStock: boolean;
  };
}

export const defaultBusinessSettings: BusinessSettings = {
  brand: {
    primaryFrom: '#4f46e5',
    primaryTo: '#7c3aed'
  },
  sales: {
    vatRate: 7.5,
    enableVat: true,
    loyaltyEnabled: false,
    loyaltyBonusPercentage: 0
  },
  products: {
    requireApproval: true,
    allowNegativeStock: false
  }
};
