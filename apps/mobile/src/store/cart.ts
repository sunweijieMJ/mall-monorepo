import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { CartItem } from '@/interface';

export const useCartStore = defineStore(
  'cart',
  () => {
    const cartItems = ref<CartItem[]>([]);

    const cartCount = computed(() =>
      cartItems.value.reduce((total, item) => total + item.quantity, 0),
    );

    const cartTotal = computed(() =>
      cartItems.value.reduce(
        (total, item) => total + item.price * item.quantity,
        0,
      ),
    );

    const addToCart = (item: CartItem) => {
      const existing = cartItems.value.find(
        (c) =>
          c.productId === item.productId &&
          c.productSkuId === item.productSkuId,
      );
      if (existing) {
        existing.quantity += item.quantity;
      } else {
        cartItems.value.push({ ...item });
      }
    };

    const updateCartItem = (itemId: number, quantity: number) => {
      const item = cartItems.value.find((c) => c.id === itemId);
      if (item) item.quantity = quantity;
    };

    const removeFromCart = (itemId: number) => {
      const index = cartItems.value.findIndex((c) => c.id === itemId);
      if (index > -1) cartItems.value.splice(index, 1);
    };

    const clearCart = () => {
      cartItems.value = [];
    };

    return {
      cartItems,
      cartCount,
      cartTotal,
      addToCart,
      updateCartItem,
      removeFromCart,
      clearCart,
    };
  },
  {
    persist: {
      pick: ['cartItems'],
    },
  },
);
