'use client';

import { Navbar } from '@/components/custom/navbar';
import { Footer } from '@/components/custom/footer';
import { useI18n } from '@/i18n';

export default function TermsPage() {
  const { locale } = useI18n();
  
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-foreground mb-8">
            {locale === 'es' ? 'Términos de Servicio' : 'Terms of Service'}
          </h1>
          
          <div className="prose prose-gray dark:prose-invert max-w-none space-y-6">
            <p className="text-muted-foreground">
              {locale === 'es' 
                ? 'Última actualización: Enero 2026'
                : 'Last updated: January 2026'}
            </p>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">
                {locale === 'es' ? '1. Aceptación de Términos' : '1. Acceptance of Terms'}
              </h2>
              <p className="text-muted-foreground">
                {locale === 'es'
                  ? 'Al usar RobuxStore, aceptas estos términos de servicio. Si no estás de acuerdo, no uses nuestro servicio.'
                  : 'By using RobuxStore, you agree to these terms of service. If you do not agree, do not use our service.'}
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">
                {locale === 'es' ? '2. Descripción del Servicio' : '2. Service Description'}
              </h2>
              <p className="text-muted-foreground">
                {locale === 'es'
                  ? 'RobuxStore facilita la compra de Robux mediante la compra de Gamepasses creados por los usuarios. Actuamos como intermediarios entre compradores y el sistema de Gamepasses de Roblox.'
                  : 'RobuxStore facilitates the purchase of Robux through the purchase of user-created Gamepasses. We act as intermediaries between buyers and the Roblox Gamepass system.'}
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">
                {locale === 'es' ? '3. Requisitos del Usuario' : '3. User Requirements'}
              </h2>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>
                  {locale === 'es'
                    ? 'Debes tener al menos 18 años o contar con permiso de un tutor legal.'
                    : 'You must be at least 18 years old or have permission from a legal guardian.'}
                </li>
                <li>
                  {locale === 'es'
                    ? 'Debes proporcionar información precisa (usuario de Roblox, Place ID).'
                    : 'You must provide accurate information (Roblox username, Place ID).'}
                </li>
                <li>
                  {locale === 'es'
                    ? 'Eres responsable de crear el Gamepass con el precio correcto y desactivar Regional Pricing.'
                    : 'You are responsible for creating the Gamepass with the correct price and disabling Regional Pricing.'}
                </li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">
                {locale === 'es' ? '4. Pagos y Reembolsos' : '4. Payments and Refunds'}
              </h2>
              <p className="text-muted-foreground">
                {locale === 'es'
                  ? 'Los pagos son procesados a través de criptomonedas. Debido a la naturaleza irreversible de las transacciones crypto y la entrega automática de Robux, no ofrecemos reembolsos una vez que el pago ha sido confirmado.'
                  : 'Payments are processed through cryptocurrency. Due to the irreversible nature of crypto transactions and automatic Robux delivery, we do not offer refunds once payment has been confirmed.'}
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">
                {locale === 'es' ? '5. Limitación de Responsabilidad' : '5. Limitation of Liability'}
              </h2>
              <p className="text-muted-foreground">
                {locale === 'es'
                  ? 'No somos responsables por errores del usuario (Place ID incorrecto, precio de Gamepass incorrecto, Regional Pricing activado) ni por acciones de Roblox Corporation sobre tu cuenta.'
                  : 'We are not responsible for user errors (incorrect Place ID, incorrect Gamepass price, Regional Pricing enabled) or for actions by Roblox Corporation on your account.'}
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">
                {locale === 'es' ? '6. Marca Registrada' : '6. Trademark Notice'}
              </h2>
              <p className="text-muted-foreground">
                {locale === 'es'
                  ? 'Roblox y Robux son marcas registradas de Roblox Corporation. RobuxStore no está afiliado, patrocinado ni respaldado por Roblox Corporation.'
                  : 'Roblox and Robux are trademarks of Roblox Corporation. RobuxStore is not affiliated with, sponsored by, or endorsed by Roblox Corporation.'}
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">
                {locale === 'es' ? '7. Contacto' : '7. Contact'}
              </h2>
              <p className="text-muted-foreground">
                {locale === 'es'
                  ? 'Para preguntas sobre estos términos, contáctanos en support@robuxstore.com'
                  : 'For questions about these terms, contact us at support@robuxstore.com'}
              </p>
            </section>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
