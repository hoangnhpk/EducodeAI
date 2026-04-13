import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCartStore = defineStore('cart', () => {
  const items = ref([])
  const tableId = ref(null)
  const sessionId = ref(null)

  const maDonDat = ref(null)

  const totalItems = computed(() => {
    return items.value.reduce((sum, item) => sum + item.quantity, 0)
  })

  const totalPrice = computed(() => {
    return items.value.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  })

  const addItem = (product, options = {}) => {
    const existingItem = items.value.find(item => 
      item.id === product.id && 
      item.size === options.size &&
      item.sugar === options.sugar &&
      item.ice === options.ice
    )

    if (existingItem) {
      existingItem.quantity += options.quantity || 1
    } else {
      items.value.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        size: options.size || 'M',
        sugar: options.sugar || '100%',
        ice: options.ice || '100%',
        quantity: options.quantity || 1,
        notes: options.notes || ''
      })
    }
  }

  const removeItem = (index) => {
    items.value.splice(index, 1)
  }

  const updateQuantity = (index, quantity) => {
    if (quantity <= 0) {
      removeItem(index)
    } else {
      items.value[index].quantity = quantity
    }
  }

  const clearCart = () => {
    items.value = []
    tableId.value = null
    sessionId.value = null
    maDonDat.value = null
  }

  const setMaDonDat = (maDon) => {
    maDonDat.value = maDon
  }

  const setTable = (table) => {
    tableId.value = table
  }

  const setSession = (session) => {
    sessionId.value = session
  }

  return {
    items,
    tableId,
    sessionId,
    maDonDat, 
    totalItems,
    totalPrice,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    setTable,
    setSession,
    setMaDonDat 
  }
})

