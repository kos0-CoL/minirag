import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-300 dark:text-gray-700">404</h1>
        <p className="text-gray-500 mt-4 mb-6">Página no encontrada</p>
        <Link to="/chat"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 transition">
          <Home className="w-4 h-4" /> Volver al inicio
        </Link>
      </div>
    </div>
  );
}
