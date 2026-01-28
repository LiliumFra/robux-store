'use client';

import { Navbar } from '@/components/custom/navbar';
import { Footer } from '@/components/custom/footer';
import { RobuxCalculator } from '@/components/custom/robux-calculator';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-white pb-16 pt-20 lg:pt-32">
          <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
             <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
          </div>
          
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-2xl"
              >
                <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-6xl">
                  Compra Robux 
                  <span className="block text-indigo-600">Fácil y Seguro</span>
                </h1>
                <p className="mt-6 text-lg leading-8 text-gray-600">
                  La forma más rápida de conseguir Robux. Paga con criptomonedas y recibe tus Robux en minutos. Sin registro, sin complicaciones.
                </p>
                <div className="mt-8 flex items-center gap-x-6">
                   <div className="text-2xl font-bold text-gray-900">
                     $6.50 USD <span className="text-sm font-normal text-gray-500">= 1000 Robux</span>
                   </div>
                </div>
              </motion.div>

              <motion.div 
                 initial={{ opacity: 0, scale: 0.9 }}
                 animate={{ opacity: 1, scale: 1 }}
                 transition={{ duration: 0.5, delay: 0.2 }}
                 className="flex justify-center lg:justify-end"
              >
                <RobuxCalculator />
              </motion.div>
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section className="py-24 bg-gray-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                ¿Cómo funciona?
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Consigue tus Robux en 3 pasos simples
              </p>
            </div>
            
            <div className="grid gap-8 md:grid-cols-3">
              {[
                { title: '1. Calcula', desc: 'Ingresa la cantidad de Robux que necesitas.', icon: '🎮' },
                { title: '2. Paga', desc: 'Paga con LTC, BTC, ETH o USDT.', icon: '💳' },
                { title: '3. Recibe', desc: 'Entrega automática en minutos.', icon: '⚡' },
              ].map((step, i) => (
                <div key={i} className="relative rounded-2xl bg-white p-8 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                  <div className="absolute -top-6 left-8 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-2xl text-white shadow-lg">
                    {step.icon}
                  </div>
                  <h3 className="mt-4 text-xl font-semibold text-gray-900">{step.title}</h3>
                  <p className="mt-2 text-gray-600">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-24 bg-white">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Preguntas Frecuentes
              </h2>
            </div>
            
            <div className="space-y-6">
              {[
                {
                  q: '¿Cómo recibo mis Robux?',
                  a: 'Creas un Gamepass en tu juego de Roblox con el precio indicado. Nosotros compramos ese Gamepass y tú recibes los Robux automáticamente en tu cuenta.'
                },
                {
                  q: '¿Qué es el Place ID?',
                  a: 'Es el número único de tu juego en Roblox. Lo encuentras en la URL cuando abres tu juego en Roblox Creator Hub (ej: create.roblox.com/dashboard/creations/experiences/1234567890).'
                },
                {
                  q: '¿Qué precio debe tener mi Gamepass?',
                  a: 'El sistema te muestra el precio exacto. Por ejemplo, para recibir 1000 Robux, tu Gamepass debe costar 1,429 R$ (incluye el 30% de impuesto de Roblox).'
                },
                {
                  q: '¿Por qué debo desactivar Regional Pricing?',
                  a: 'El Regional Pricing cambia el precio del Gamepass según la ubicación. Para que el sistema funcione correctamente, debe estar desactivado.'
                },
                {
                  q: '¿Cuánto tiempo tarda?',
                  a: 'Después de confirmar el pago crypto (2-30 min dependiendo de la moneda), la entrega de Robux es automática en minutos.'
                },
                {
                  q: '¿Es seguro?',
                  a: 'Sí. Validamos tu Place ID antes de aceptar el pago. Si el Place ID es inválido, no se procesa el pago.'
                },
              ].map((faq, i) => (
                <div key={i} className="rounded-xl border border-gray-200 bg-gray-50 p-6">
                  <h3 className="font-semibold text-gray-900">{faq.q}</h3>
                  <p className="mt-2 text-gray-600">{faq.a}</p>
                </div>
              ))}
            </div>

            {/* Quick Instructions */}
            <div className="mt-12 rounded-2xl bg-indigo-50 p-8">
              <h3 className="text-xl font-bold text-indigo-900 mb-4">📋 Instrucciones Rápidas</h3>
              <ol className="space-y-3 text-indigo-800">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 font-bold">1.</span>
                  <span>Ve a <strong>Roblox Creator Hub</strong> → Tu experiencia → Monetization → Passes</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 font-bold">2.</span>
                  <span>Crea un Gamepass con el precio que te indica el calculador</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 font-bold">3.</span>
                  <span><strong>Desactiva Regional Pricing</strong> en la configuración del Gamepass</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 font-bold">4.</span>
                  <span>Copia el <strong>Place ID</strong> de tu juego (está en la URL)</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 font-bold">5.</span>
                  <span>Completa la compra en esta página con tu usuario y Place ID</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 font-bold">6.</span>
                  <span>Paga con crypto y recibe tus Robux automáticamente ⚡</span>
                </li>
              </ol>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
