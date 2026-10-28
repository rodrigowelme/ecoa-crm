const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

export function formatCurrency(valueCents: number): string {
  return currencyFormatter.format(valueCents / 100);
}
