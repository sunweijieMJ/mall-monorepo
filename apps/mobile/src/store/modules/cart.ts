import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import {
  cartControllerListV1,
  cartControllerCreateV1,
  cartControllerUpdateQuantityV1,
  cartControllerUpdateAttrV1,
  cartControllerDeleteV1,
  cartControllerClearV1,
  cartControllerCountV1,
  cartControllerPromotionListV1,
  cartControllerCartProductV1,
} from '@/api';
import type { AddCartDto, CartControllerPromotionListV1Params } from '@/api';
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

    // ===== API 方法 =====

    /** 从服务端获取购物车列表 */
    async function fetchList() {
      const res = await cartControllerListV1();
      return res.data ?? [];
    }

    /** 加入购物车 */
    async function addItem(dto: AddCartDto) {
      const res = await cartControllerCreateV1(dto);
      return res.data ?? null;
    }

    /** 修改购物车商品数量 */
    async function updateQuantity(id: number, quantity: number) {
      const res = await cartControllerUpdateQuantityV1(id, {
        productQuantity: quantity,
      });
      return res.data ?? null;
    }

    /** 删除购物车商品（支持多选） */
    async function deleteItems(ids: number[]) {
      const res = await cartControllerDeleteV1({ ids });
      return res.data ?? null;
    }

    /** 清空购物车 */
    async function clearRemote() {
      const res = await cartControllerClearV1();
      return res.data ?? null;
    }

    /** 获取购物车商品数量 */
    async function fetchCount() {
      const res = await cartControllerCountV1();
      return res.data ?? 0;
    }

    /** 获取含促销信息的购物车列表（结算页用） */
    async function fetchPromotionList(
      params: CartControllerPromotionListV1Params,
    ) {
      const res = await cartControllerPromotionListV1(params);
      return res.data ?? null;
    }

    /** 获取购物车商品的可选规格列表（重选规格时用） */
    async function fetchCartProduct(productId: number) {
      const res = await cartControllerCartProductV1(productId);
      return res.data ?? null;
    }

    /** 修改购物车商品规格 */
    async function updateAttr(id: number, productSkuId: number) {
      const res = await cartControllerUpdateAttrV1(id, { productSkuId });
      return res.data ?? null;
    }

    return {
      cartItems,
      cartCount,
      cartTotal,
      addToCart,
      updateCartItem,
      removeFromCart,
      clearCart,
      fetchList,
      addItem,
      updateQuantity,
      deleteItems,
      clearRemote,
      fetchCount,
      fetchPromotionList,
      fetchCartProduct,
      updateAttr,
    };
  },
  {
    persist: {
      pick: ['cartItems'],
    },
  },
);
