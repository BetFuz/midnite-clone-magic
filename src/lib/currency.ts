// Currency utility for displaying amounts in Naira
// Future: Use geolocation to detect user's country and display appropriate currency

export const formatCurrency = (amount: number): string => {
  return `₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const getCurrencySymbol = (): string => {
  // Future: Implement geolocation-based currency detection
  // For now, default to Naira
  return '₦';
};

export const formatOddsWithCurrency = (odds: string, stake: number = 1000): string => {
  const oddsValue = parseFloat(odds);
  const potentialWin = stake * oddsValue;
  return formatCurrency(potentialWin);
};
