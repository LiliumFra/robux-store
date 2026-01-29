'use client';

import { Navbar } from '@/components/custom/navbar';
import { Footer } from '@/components/custom/footer';
import { useI18n } from '@/i18n';

export default function PrivacyPage() {
  const { locale } = useI18n();
  
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-foreground mb-8">
            {locale === 'es' ? 'Política de Privacidad' : 'Privacy Policy'}
          </h1>
          
          <div className="prose prose-gray dark:prose-invert max-w-none space-y-6">
            <p className="text-muted-foreground">
              {locale === 'es' 
                ? 'Última actualización: Enero 2026'
                : 'Last updated: January 2026'}
            </p>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">
                {locale === 'es' ? '1. Información que Recopilamos' : '1. Information We Collect'}
              </h2>
              <p className="text-muted-foreground">
                {locale === 'es'
                  ? 'Recopilamos la siguiente información cuando usas nuestro servicio:'
                  : 'We collect the following information when you use our service:'}
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>
                  {locale === 'es'
                    ? 'Nombre de usuario de Roblox'
                    : 'Roblox username'}
                </li>
                <li>
                  {locale === 'es'
                    ? 'Place ID del juego'
                    : 'Game Place ID'}
                </li>
                <li>
                  {locale === 'es'
                    ? 'Dirección de wallet de criptomonedas (para procesamiento de pagos)'
                    : 'Cryptocurrency wallet address (for payment processing)'}
                </li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">
                {locale === 'es' ? '2. Uso de la Información' : '2. Use of Information'}
              </h2>
              <p className="text-muted-foreground">
                {locale === 'es'
                  ? 'Usamos tu información exclusivamente para:'
                  : 'We use your information exclusively to:'}
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>
                  {locale === 'es'
                    ? 'Procesar tu compra de Robux'
                    : 'Process your Robux purchase'}
                </li>
                <li>
                  {locale === 'es'
                    ? 'Validar tu cuenta de Roblox y el Gamepass'
                    : 'Validate your Roblox account and Gamepass'}
                </li>
                <li>
                  {locale === 'es'
                    ? 'Contactarte en caso de problemas con tu pedido'
                    : 'Contact you in case of issues with your order'}
                </li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">
                {locale === 'es' ? '3. Almacenamiento de Datos' : '3. Data Storage'}
              </h2>
              <p className="text-muted-foreground">
                {locale === 'es'
                  ? 'No almacenamos información de pago ni datos sensibles. Los pagos son procesados directamente por NowPayments, un procesador de pagos crypto de terceros.'
                  : 'We do not store payment information or sensitive data. Payments are processed directly by NowPayments, a third-party crypto payment processor.'}
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">
                {locale === 'es' ? '4. Cookies' : '4. Cookies'}
              </h2>
              <p className="text-muted-foreground">
                {locale === 'es'
                  ? 'Usamos cookies y almacenamiento local solo para guardar tus preferencias (idioma, tema claro/oscuro). No usamos cookies de seguimiento ni publicidad.'
                  : 'We use cookies and local storage only to save your preferences (language, light/dark theme). We do not use tracking or advertising cookies.'}
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">
                {locale === 'es' ? '5. Compartir Información' : '5. Sharing Information'}
              </h2>
              <p className="text-muted-foreground">
                {locale === 'es'
                  ? 'No vendemos ni compartimos tu información personal con terceros, excepto cuando sea necesario para procesar tu pedido (ej: servicios de pago, API de Roblox).'
                  : 'We do not sell or share your personal information with third parties, except when necessary to process your order (e.g., payment services, Roblox API).'}
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">
                {locale === 'es' ? '6. Tus Derechos' : '6. Your Rights'}
              </h2>
              <p className="text-muted-foreground">
                {locale === 'es'
                  ? 'Puedes solicitar la eliminación de tus datos en cualquier momento contactándonos. Como no requerimos registro, los datos de transacciones se eliminan automáticamente después de 30 días.'
                  : 'You can request deletion of your data at any time by contacting us. Since we do not require registration, transaction data is automatically deleted after 30 days.'}
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">
                {locale === 'es' ? '7. Contacto' : '7. Contact'}
              </h2>
              <p className="text-muted-foreground">
                {locale === 'es'
                  ? 'Para preguntas sobre privacidad, contáctanos en privacy@robuxstore.com'
                  : 'For privacy questions, contact us at privacy@robuxstore.com'}
              </p>
            </section>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
