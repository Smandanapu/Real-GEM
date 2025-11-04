
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const sqftToAcres = (sqft: number): string => {
  const acres = sqft / 43560;
  return acres.toFixed(2);
};
