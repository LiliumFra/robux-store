import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function Navbar() {
  return (
    <nav className="border-b bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-indigo-600">RobuxStore</span>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
             <Button variant="ghost">Dashboard</Button>
          </Link>
          <Link href="/dashboard">
             <Button className="bg-indigo-600 hover:bg-indigo-700">Comprar Ahora</Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
