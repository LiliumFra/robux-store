import Link from 'next/link';

export function Navbar() {
  return (
    <nav className="border-b bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-indigo-600">RobuxStore</span>
          </Link>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>💳 Pago con Cripto</span>
          <span className="hidden sm:inline">⚡ Entrega Automática</span>
        </div>
      </div>
    </nav>
  );
}
