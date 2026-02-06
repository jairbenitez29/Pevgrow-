'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { calculateCODFee, CODFeeResult } from '@/lib/checkout/codFee';

// Tipos para dirección de envío
export interface ShippingAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

// Métodos de envío disponibles
export type ShippingMethod = 'standard' | 'express' | 'pickup';

export interface ShippingOption {
  id: ShippingMethod;
  name: string;
  description: string;
  price: number;
  estimatedDays: string;
}

// Métodos de pago disponibles
export type PaymentMethod = 'transfer' | 'paypal' | 'bizum' | 'cod';

export interface PaymentOption {
  id: PaymentMethod;
  name: string;
  description: string;
  icon: string;
  fee?: number;
  feeType?: 'fixed' | 'percentage';
}

// Estado del checkout
export interface CheckoutState {
  step: number;
  shippingAddress: ShippingAddress | null;
  shippingMethod: ShippingMethod | null;
  paymentMethod: PaymentMethod | null;
  notes: string;
  acceptTerms: boolean;
}

// Contexto
interface CheckoutContextType {
  state: CheckoutState;
  setStep: (step: number) => void;
  setShippingAddress: (address: ShippingAddress) => void;
  setShippingMethod: (method: ShippingMethod) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  setNotes: (notes: string) => void;
  setAcceptTerms: (accept: boolean) => void;
  resetCheckout: () => void;
  getShippingCost: () => number;
  getPaymentFee: (subtotal: number, shippingCost: number) => CODFeeResult;
  getTotalWithFees: (subtotal: number) => number;
  canProceedToStep: (targetStep: number) => boolean;
}

const CheckoutContext = createContext<CheckoutContextType | undefined>(undefined);

// Estado inicial
const initialState: CheckoutState = {
  step: 1,
  shippingAddress: null,
  shippingMethod: null,
  paymentMethod: null,
  notes: '',
  acceptTerms: false,
};

// Opciones de envío
export const SHIPPING_OPTIONS: ShippingOption[] = [
  {
    id: 'standard',
    name: 'Envío Estándar',
    description: 'Entrega en 3-5 días laborables',
    price: 5.95,
    estimatedDays: '3-5 días',
  },
  {
    id: 'express',
    name: 'Envío Express',
    description: 'Entrega en 24-48 horas',
    price: 9.95,
    estimatedDays: '24-48 h',
  },
  {
    id: 'pickup',
    name: 'Recogida en Tienda',
    description: 'Recoge tu pedido sin coste adicional',
    price: 0,
    estimatedDays: '24 h',
  },
];

// Opciones de pago
export const PAYMENT_OPTIONS: PaymentOption[] = [
  {
    id: 'transfer',
    name: 'Transferencia Bancaria',
    description: 'Realiza una transferencia a nuestra cuenta',
    icon: 'bank',
  },
  {
    id: 'paypal',
    name: 'PayPal',
    description: 'Paga de forma segura con PayPal',
    icon: 'paypal',
  },
  {
    id: 'bizum',
    name: 'Bizum',
    description: 'Pago instantáneo con Bizum',
    icon: 'bizum',
  },
  {
    id: 'cod',
    name: 'Contrareembolso',
    description: 'Paga cuando recibas tu pedido',
    icon: 'cash',
    feeType: 'percentage',
  },
];

// Provider
export function CheckoutProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CheckoutState>(initialState);

  const setStep = useCallback((step: number) => {
    setState(prev => ({ ...prev, step }));
  }, []);

  const setShippingAddress = useCallback((address: ShippingAddress) => {
    setState(prev => ({ ...prev, shippingAddress: address }));
  }, []);

  const setShippingMethod = useCallback((method: ShippingMethod) => {
    setState(prev => ({ ...prev, shippingMethod: method }));
  }, []);

  const setPaymentMethod = useCallback((method: PaymentMethod) => {
    setState(prev => ({ ...prev, paymentMethod: method }));
  }, []);

  const setNotes = useCallback((notes: string) => {
    setState(prev => ({ ...prev, notes }));
  }, []);

  const setAcceptTerms = useCallback((acceptTerms: boolean) => {
    setState(prev => ({ ...prev, acceptTerms }));
  }, []);

  const resetCheckout = useCallback(() => {
    setState(initialState);
  }, []);

  const getShippingCost = useCallback((): number => {
    if (!state.shippingMethod) return 0;
    const option = SHIPPING_OPTIONS.find(o => o.id === state.shippingMethod);
    return option?.price || 0;
  }, [state.shippingMethod]);

  const getPaymentFee = useCallback((subtotal: number, shippingCost: number): CODFeeResult => {
    if (state.paymentMethod !== 'cod') {
      return { fee: 0, type: 'fixed' };
    }
    // El recargo COD se calcula sobre el total (subtotal + envío)
    return calculateCODFee(subtotal + shippingCost);
  }, [state.paymentMethod]);

  const getTotalWithFees = useCallback((subtotal: number): number => {
    const shippingCost = getShippingCost();
    const paymentFee = getPaymentFee(subtotal, shippingCost);
    return subtotal + shippingCost + paymentFee.fee;
  }, [getShippingCost, getPaymentFee]);

  const canProceedToStep = useCallback((targetStep: number): boolean => {
    switch (targetStep) {
      case 1:
        return true;
      case 2:
        return state.shippingAddress !== null;
      case 3:
        return state.shippingAddress !== null && state.shippingMethod !== null;
      case 4:
        return (
          state.shippingAddress !== null &&
          state.shippingMethod !== null &&
          state.paymentMethod !== null
        );
      default:
        return false;
    }
  }, [state.shippingAddress, state.shippingMethod, state.paymentMethod]);

  const value: CheckoutContextType = {
    state,
    setStep,
    setShippingAddress,
    setShippingMethod,
    setPaymentMethod,
    setNotes,
    setAcceptTerms,
    resetCheckout,
    getShippingCost,
    getPaymentFee,
    getTotalWithFees,
    canProceedToStep,
  };

  return (
    <CheckoutContext.Provider value={value}>
      {children}
    </CheckoutContext.Provider>
  );
}

export function useCheckout() {
  const context = useContext(CheckoutContext);
  if (context === undefined) {
    throw new Error('useCheckout must be used within a CheckoutProvider');
  }
  return context;
}
