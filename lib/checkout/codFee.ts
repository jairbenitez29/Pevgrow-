// Cálculo de recargo por Contrareembolso (COD - Cash On Delivery)
// Basado en el módulo idxcodfees de PrestaShop

export interface CODFeeResult {
  fee: number;
  type: 'fixed' | 'percentage';
  percentage?: number;
}

/**
 * Calcula el recargo por contrareembolso
 * - Pedidos 0-100€ → Recargo fijo: 3.50€
 * - Pedidos 100-1000€ → Recargo porcentual: 3.5%
 * - Pedidos > 1000€ → Recargo porcentual: 3.5%
 *
 * @param orderTotal - Total del pedido (subtotal + envío)
 * @returns Objeto con el recargo, tipo y porcentaje aplicado
 */
export function calculateCODFee(orderTotal: number): CODFeeResult {
  if (orderTotal <= 0) {
    return { fee: 0, type: 'fixed' };
  }

  if (orderTotal <= 100) {
    // Recargo fijo para pedidos hasta 100€
    return {
      fee: 3.50,
      type: 'fixed'
    };
  }

  // Recargo porcentual del 3.5% para pedidos superiores a 100€
  const percentage = 3.5;
  const fee = orderTotal * (percentage / 100);

  return {
    fee: Math.round(fee * 100) / 100, // Redondear a 2 decimales
    type: 'percentage',
    percentage
  };
}

/**
 * Formatea el recargo COD para mostrar al usuario
 */
export function formatCODFee(orderTotal: number): string {
  const result = calculateCODFee(orderTotal);

  if (result.type === 'fixed') {
    return `+${result.fee.toFixed(2)} €`;
  }

  return `+${result.percentage}% (${result.fee.toFixed(2)} €)`;
}

/**
 * Verifica si el contrareembolso está disponible para el total dado
 * (Puede haber límites mínimos o máximos)
 */
export function isCODAvailable(orderTotal: number): boolean {
  // Por ahora, COD está disponible para todos los pedidos
  // Se puede ajustar si hay límites específicos
  return orderTotal > 0;
}

// Constantes de configuración
export const COD_CONFIG = {
  FIXED_FEE: 3.50,
  FIXED_FEE_THRESHOLD: 100,
  PERCENTAGE_FEE: 3.5,
  MIN_ORDER: 0,
  MAX_ORDER: 10000, // Límite máximo para COD
};
