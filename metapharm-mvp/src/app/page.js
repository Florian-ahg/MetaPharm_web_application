import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Search, MapPin, ShieldCheck, Store } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      
      {/* --- NAVBAR --- */}
      <nav className="flex items-center justify-between p-6 max-w-7xl mx-auto w-full">
        <div className="text-2xl font-bold text-green-700 flex items-center gap-2">
          🏥 MetaPharm
        </div>
        <div className="flex gap-4">
          <Link href="/auth/login">
            <Button variant="ghost" className="text-gray-600 hover:text-green-700">
              Espace Pharmacien
            </Button>
          </Link>
          <Link href="/search">
            <Button className="bg-green-700 hover:bg-green-800 rounded-full px-6">
              Trouver un médicament
            </Button>
          </Link>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 bg-gradient-to-b from-green-50 to-white">
        <div className="bg-green-100 text-green-800 px-4 py-1.5 rounded-full text-sm font-semibold mb-6 flex items-center justify-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          Disponible à Cotonou & Calavi
        </div>
        
        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-6 max-w-4xl">
          Ne cherchez plus vos médicaments, <br/>
          <span className="text-green-700">trouvez-les instantanément.</span>
        </h1>
        
        <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl">
          Fini le tour de la ville inutile. Localisez les pharmacies de garde qui ont 
          <strong> réellement</strong> votre ordonnance en stock et faites-vous livrer.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
          <Link href="/search" className="w-full">
            <Button size="lg" className="w-full bg-green-700 hover:bg-green-800 h-14 text-lg rounded-xl shadow-lg shadow-green-200">
              <Search className="mr-2" /> Rechercher un produit
            </Button>
          </Link>
          <Link href="/pharmacies-de-garde" className="w-full">
            <Button size="lg" variant="outline" className="w-full h-14 text-lg rounded-xl border-green-200 text-green-800 hover:bg-green-50">
              <Store className="mr-2" /> Pharmacies de Garde
            </Button>
          </Link>
        </div>
      </section>

      {/* --- FEATURES --- */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-3 gap-12">
          <FeatureCard 
            icon={<MapPin className="h-10 w-10 text-green-600" />}
            title="Localisation Précise"
            desc="Trouvez la pharmacie de garde la plus proche de votre position exacte."
          />
          <FeatureCard 
            icon={<Search className="h-10 w-10 text-blue-600" />}
            title="Stock en Temps Réel"
            desc="Ne vous déplacez plus pour rien. Vérifiez si le médicament est disponible avant de partir."
          />
          <FeatureCard 
            icon={<ShieldCheck className="h-10 w-10 text-purple-600" />}
            title="Pharmacies Agréées"
            desc="Nous travaillons uniquement avec des officines certifiées pour garantir votre santé."
          />
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-gray-50 py-8 text-center text-gray-500 text-sm">
        <p>© 2025 MetaPharm. Un projet pour la santé au Bénin 🇧🇯.</p>
        <div className="flex justify-center gap-4 mt-4">
          <Link href="/admin/login" className="hover:text-green-700">Admin</Link>
          <Link href="/auth/login" className="hover:text-green-700">Pharmaciens</Link>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="flex flex-col items-center text-center p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="bg-gray-50 p-4 rounded-full mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2 text-gray-800">{title}</h3>
      <p className="text-gray-500">{desc}</p>
    </div>
  )
}
