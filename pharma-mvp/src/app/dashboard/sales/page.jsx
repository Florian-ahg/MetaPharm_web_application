'use client'
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ShoppingCart, Plus, Trash2, CreditCard } from 'lucide-react'

export default function SalesPage() {
  const [cart, setCart] = useState([])
  const [searchProduct, setSearchProduct] = useState('')
  const [quantity, setQuantity] = useState(1)

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  const handleAddToCart = () => {
    // Simulation - À connecter avec Supabase
    if (searchProduct.trim()) {
      const newItem = {
        id: Date.now(),
        name: searchProduct,
        price: 5.50,
        quantity: quantity,
      }
      setCart([...cart, newItem])
      setSearchProduct('')
      setQuantity(1)
    }
  }

  const handleRemoveItem = (id) => {
    setCart(cart.filter(item => item.id !== id))
  }

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert('Le panier est vide')
      return
    }
    // Simulation de paiement
    alert(`Vente enregistrée : ${total.toFixed(2)}€`)
    setCart([])
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Caisse / Ventes</h1>
        <p className="text-gray-500 mt-1">
          Enregistrez les ventes de votre pharmacie
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Formulaire d'ajout */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Nouvelle vente
              </CardTitle>
              <CardDescription>
                Scannez ou recherchez un produit
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="product">Produit</Label>
                  <Input
                    id="product"
                    placeholder="Rechercher un produit..."
                    value={searchProduct}
                    onChange={(e) => setSearchProduct(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddToCart()}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantité</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  />
                </div>
              </div>
              <Button onClick={handleAddToCart} className="w-full gap-2">
                <Plus className="h-4 w-4" />
                Ajouter au panier
              </Button>

              {/* Panier */}
              <div className="rounded-md border mt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produit</TableHead>
                      <TableHead className="text-center">Qté</TableHead>
                      <TableHead className="text-right">Prix</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cart.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                          Le panier est vide
                        </TableCell>
                      </TableRow>
                    ) : (
                      cart.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell className="text-center">{item.quantity}</TableCell>
                          <TableCell className="text-right">{item.price.toFixed(2)}€</TableCell>
                          <TableCell className="text-right font-medium">
                            {(item.price * item.quantity).toFixed(2)}€
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveItem(item.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Résumé et paiement */}
        <div>
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Résumé</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Articles</span>
                  <span className="font-medium">{cart.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Sous-total</span>
                  <span className="font-medium">{total.toFixed(2)}€</span>
                </div>
                <div className="border-t pt-2 flex justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="text-2xl font-bold text-emerald-600">
                    {total.toFixed(2)}€
                  </span>
                </div>
              </div>

              <Button
                onClick={handleCheckout}
                className="w-full gap-2"
                size="lg"
                disabled={cart.length === 0}
              >
                <CreditCard className="h-5 w-5" />
                Encaisser
              </Button>

              <div className="space-y-2 pt-4 border-t">
                <p className="text-sm text-gray-600 font-medium">Méthodes de paiement</p>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" className="text-xs">
                    Carte
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs">
                    Espèces
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
