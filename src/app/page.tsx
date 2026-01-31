'use client';

import { Navbar } from '@/components/custom/navbar';
import { Footer } from '@/components/custom/footer';
import { RobuxCalculator } from '@/components/custom/robux-calculator';
import { motion } from 'framer-motion';
import { useI18n } from '@/i18n';

export default function Home() {
  const { t } = useI18n();
  
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-background pb-12 pt-16 sm:pb-16 sm:pt-20 lg:pt-32">
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
                <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-6xl">
                  {t.hero.title}
                  <span className="block text-indigo-600 dark:text-indigo-400">{t.hero.subtitle}</span>
                </h1>
                <p className="mt-6 text-lg leading-8 text-muted-foreground">
                  {t.hero.description}
                </p>
                <div className="mt-6 sm:mt-8 flex items-center gap-x-4 sm:gap-x-6">
                   <div className="text-xl sm:text-2xl font-bold text-foreground">
                     $6.50 USD <span className="text-xs sm:text-sm font-normal text-muted-foreground">= {t.hero.price}</span>
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
        <section className="py-12 sm:py-16 lg:py-24 bg-muted/50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10 sm:mb-16">
              <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
                {t.howItWorks.title}
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                {t.howItWorks.subtitle}
              </p>
            </div>
            
            <div className="grid gap-6 sm:gap-8 md:grid-cols-3">
              {[
                { title: t.howItWorks.step1, desc: t.howItWorks.step1Desc, icon: '🎮' },
                { title: t.howItWorks.step2, desc: t.howItWorks.step2Desc, icon: '💳' },
                { title: t.howItWorks.step3, desc: t.howItWorks.step3Desc, icon: '⚡' },
              ].map((step, i) => (
                <div key={i} className="relative rounded-2xl bg-card p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-border mt-8">
                  <div className="absolute -top-5 left-6 sm:-top-6 sm:left-8 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-indigo-600 text-xl sm:text-2xl text-white shadow-lg">
                    {step.icon}
                  </div>
                  <h3 className="mt-4 text-xl font-semibold text-card-foreground">{step.title}</h3>
                  <p className="mt-2 text-muted-foreground">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-12 sm:py-16 lg:py-24 bg-background">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10 sm:mb-16">
              <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
                {t.faq.title}
              </h2>
            </div>
            
            <div className="space-y-6">
              {[
                { q: t.faq.q1, a: t.faq.a1 },
                { q: t.faq.q2, a: t.faq.a2 },
                { q: t.faq.q3, a: t.faq.a3 },
                { q: t.faq.q4, a: t.faq.a4 },
                { q: t.faq.q5, a: t.faq.a5 },
                { q: t.faq.q6, a: t.faq.a6 },
              ].map((faq, i) => (
                <div key={i} className="rounded-xl border border-border bg-muted/50 p-6">
                  <h3 className="font-semibold text-foreground">{faq.q}</h3>
                  <p className="mt-2 text-muted-foreground">{faq.a}</p>
                </div>
              ))}
            </div>

            {/* Quick Instructions */}
            <div className="mt-8 sm:mt-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 p-4 sm:p-8 border border-indigo-200 dark:border-indigo-800">
              <h3 className="text-lg sm:text-xl font-bold text-indigo-900 dark:text-indigo-100 mb-3 sm:mb-4">{t.instructions.title}</h3>
              <ol className="space-y-3 text-indigo-800 dark:text-indigo-200">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 font-bold">1.</span>
                  <span>{t.instructions.step1}</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 font-bold">2.</span>
                  <span>{t.instructions.step2}</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 font-bold">3.</span>
                  <span><strong>{t.instructions.step3}</strong></span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 font-bold">4.</span>
                  <span>{t.instructions.step4}</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 font-bold">5.</span>
                  <span>{t.instructions.step5}</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 font-bold">6.</span>
                  <span>{t.instructions.step6}</span>
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
