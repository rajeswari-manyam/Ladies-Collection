export interface MarketplaceSettings {
  currency: 'INR'
  currencySymbol: string
  payoutFrequency: 'bi-weekly' | 'weekly' | 'monthly'
  defaultCommission: number
  marketplaceName: string
}

export const settings: MarketplaceSettings = {
  currency: 'INR',
  currencySymbol: '₹',
  payoutFrequency: 'bi-weekly',
  defaultCommission: 0.12,
  marketplaceName: 'Ladies Collection',
}