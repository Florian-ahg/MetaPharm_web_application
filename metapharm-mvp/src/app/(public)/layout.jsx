import Link from 'next/link'

export default function PublicLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header simple avec une bande verte */}
      <header className="bg-emerald-600 text-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">🏥 MetaPharm</h1>
          <p className="text-sm text-emerald-100">
            Trouvez vos médicaments près de chez vous
          </p>
        </div>
      </header>
      
      {/* Contenu de la page publique */}
      <main className="flex-1">{children}</main>
      
      {/* Footer avec accès professionnels */}
      <footer className="bg-gray-900 text-gray-300 py-8 mt-auto">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-white font-bold text-lg mb-4">🏥 MetaPharm</h3>
            <p className="text-sm">La première plateforme de recherche et livraison de médicaments au Bénin.</p>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-4">Accès Professionnels</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/auth/login" className="hover:text-green-400 transition-colors flex items-center gap-2">
                  🔐 Espace Pharmacie
                </Link>
              </li>
              <li>
                <Link href="/admin/login" className="hover:text-blue-400 transition-colors flex items-center gap-2">
                  🛡️ Espace Super-Admin
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4">Légal</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white">Mentions légales</a></li>
              <li><a href="#" className="hover:text-white">Confidentialité</a></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  )
}
