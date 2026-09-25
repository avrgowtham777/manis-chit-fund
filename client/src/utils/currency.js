export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

export const parseCurrency = (str) => {
  if (!str) return 0;
  return Number(str.replace(/[^0-9.-]+/g, ""));
};
