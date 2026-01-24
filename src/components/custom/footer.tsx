export function Footer() {
  return (
    <footer className="bg-gray-50 border-t">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            © {new Date().getFullYear()} RobuxStore. Todos los derechos reservados.
          </div>
          <div className="flex gap-6">
            <a href="#" className="text-gray-400 hover:text-gray-500">
              Términos
            </a>
            <a href="#" className="text-gray-400 hover:text-gray-500">
              Privacidad
            </a>
            <a href="#" className="text-gray-400 hover:text-gray-500">
              Contacto
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
