/**
 * Delivery fee rules for the demo. Kept simple and centralized so the
 * cart page, checkout page, and the create-order API route (which
 * recomputes the total server-side) all agree on the same numbers.
 */
export const DELIVERY_FEE = 20;
export const FREE_DELIVERY_THRESHOLD = 499;

export function getDeliveryFee(subtotal: number): number {
  return subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
}

export function getOrderTotals(subtotal: number) {
  const deliveryFee = getDeliveryFee(subtotal);
  return {
    subtotal,
    deliveryFee,
    total: subtotal + deliveryFee,
  };
}
