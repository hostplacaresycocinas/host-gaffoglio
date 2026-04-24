'use client';

import { motion } from 'framer-motion';
import { SectionTitleItaly } from '@/components/SectionTitleItaly';
import { cn } from '@/lib/utils';

const pasos = [
  {
    key: 'verde',
    titulo: 'Te asesoramos',
    descripcion:
      'Te ayudamos a encontrar el auto ideal según tu presupuesto y necesidad.',
  },
  {
    key: 'blanco',
    titulo: 'Armamos tu plan',
    descripcion:
      'Tasamos tu usado y diseñamos la financiación que mejor se adapte a vos.',
  },
  {
    key: 'rojo',
    titulo: 'Te acompañamos',
    descripcion:
      'Gestionamos toda la documentación y seguimos a tu lado después de la entrega.',
  },
] as const;

const cardByKey = {
  verde: {
    stripe:
      'bg-gradient-to-r from-[#009246] via-[#009246]/85 to-[#009246]/35 shadow-[0_6px_20px_-4px_rgba(0,146,70,0.35)]',
    kicker: 'text-[#7ED9A8]/90',
  },
  blanco: {
    stripe:
      'bg-gradient-to-r from-white/85 via-white/45 to-white/15 shadow-[0_4px_18px_-6px_rgba(255,255,255,0.12)]',
    kicker: 'text-white/45',
  },
  rojo: {
    stripe:
      'bg-gradient-to-r from-[#CE2B37] via-color-primary to-color-primary/45 shadow-[0_6px_20px_-4px_rgba(206,43,55,0.3)]',
    kicker: 'text-color-primary-light/90',
  },
} as const;

const Proceso = () => {
  return (
    <section className='py-16 md:py-24 lg:py-28'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-10'>
        <div className='text-center mb-12 md:mb-16'>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <SectionTitleItaly
              title='Proceso'
              className='!mb-0'
              subtitle='Una experiencia simple, transparente y profesional'
              subtitleVariant='section'
            />
          </motion.div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 lg:gap-8'>
          {pasos.map((paso, i) => {
            const v = cardByKey[paso.key];
            return (
              <motion.article
                key={paso.key}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true, margin: '0px 0px -80px 0px' }}
                className='relative overflow-hidden rounded-2xl border border-white/15 bg-white/5 p-7 backdrop-blur-md md:p-8'
              >
                <div className='absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent' />

                <div className='relative text-left'>
                  <span
                    className={cn(
                      'mb-3 block text-[10px] font-semibold uppercase tracking-[0.35em]',
                      v.kicker,
                    )}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3 className='mb-4 text-xl font-semibold tracking-tight text-white md:text-2xl'>
                    {paso.titulo}
                  </h3>
                  <div
                    className={cn(
                      'mb-5 h-0.5 w-full max-w-[7rem] rounded-full md:max-w-[8rem]',
                      v.stripe,
                    )}
                    aria-hidden
                  />
                  <p className='text-sm leading-relaxed text-white/70 md:text-base md:leading-relaxed'>
                    {paso.descripcion}
                  </p>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Proceso;
