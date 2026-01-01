'use client'
import { createContext, useContext, useState, useEffect } from 'react'
import { toast } from 'sonner' // Pour les jolies notifications

const CartContext = createContext()

export function CartProvider({ children }) {
  const [cart, setCart] = useState([])
  const [isCartOpen, setIsCartOpen] = useState(false)

  // Sauvegarder dans le localStorage (pour ne pas perdre le panier au refresh)
  useEffect(() => {
    const savedCart = localStorage.getItem('pharmaCart')
    if (savedCart) setCart(JSON.parse(savedCart))
  }, [])

  useEffect(() => {
    localStorage.setItem('pharmaCart', JSON.stringify(cart))
  }, [cart])

  // --- ACTIONS ---

  const addToCart = (product, pharmacy, price) => {
    // Vérifier si le produit est déjà dans le panier pour cette pharmacie
    const existingItem = cart.find(item => item.product.id === product.id && item.pharmacy.id === pharmacy.id)

    if (existingItem) {
      toast.info("Déjà dans le panier !")
      return
    }

    const newItem = {
      id: `${pharmacy.id}-${product.id}`, // ID unique
      product,
      pharmacy,
      price,
      quantity: 1
    }

    setCart([...cart, newItem])
    toast.success(`${product.name} ajouté au panier !`)
    setIsCartOpen(true) // Ouvrir le panier automatiquement
  }

  const removeFromCart = (itemId) => {
    setCart(cart.filter(item => item.id !== itemId))
  }

  const clearCart = () => {
    setCart([])
    localStorage.removeItem('pharmaCart')
  }

  // Calcul du total
  const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0)

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, isCartOpen, setIsCartOpen, total }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
