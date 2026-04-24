'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

const Gallery = () => {
  return (
    <section className='py-16 md:py-24 lg:py-28'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-10'>
        <div className='grid lg:grid-cols-2 gap-8 md:gap-10 lg:gap-12 items-center'>
          {/* Columna izquierda */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            viewport={{ once: true, margin: '0px 0px -80px 0px' }}
            className='relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-md border border-white/15 p-7 md:p-9 md:min-h-[520px] flex flex-col gap-6 md:gap-8'
          >
            <div className='absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent' />

            <div>
              <div className='inline-flex items-center gap-4 mb-5'>
                <div className='w-10 h-px bg-color-primary/70' />
                <span className='text-white text-xs tracking-[0.5em] uppercase font-semibold'>
                  Experiencia
                </span>
                <div className='w-10 h-px bg-color-primary/70' />
              </div>

              <h2 className='text-white/90 text-2xl sm:text-3xl md:text-4xl leading-tight font-semibold tracking-tight mb-3 md:mb-4'>
                Elegí con calma.
                <br />
                <span className='text-color-primary-light'>
                  Decidí con seguridad.
                </span>
              </h2>

              <p className='text-white/80 text-sm sm:text-base md:text-lg leading-relaxed mb-5'>
                Te acompañamos en cada paso para que encontrar tu próximo auto
                sea una experiencia clara, simple y sin presión.
              </p>

              <blockquote className='relative rounded-xl bg-white/5 border border-white/15 px-5 py-4'>
                <span className='absolute -top-3 left-4 text-color-primary/40 text-4xl leading-none'>
                  "
                </span>
                <p className='text-white/80 text-sm md:text-base leading-relaxed italic'>
                  Asesoramiento real, opciones concretas y una decisión tomada
                  con tranquilidad.
                </p>
              </blockquote>
            </div>

            <div className='space-y-3'>
              <div className='flex items-center justify-between border-b border-white/15 pb-3'>
                <span className='text-white text-sm md:text-base font-medium'>
                  Asesoramiento personalizado
                </span>
                <span className='text-color-primary-light/80 text-[10px] tracking-[0.2em] uppercase'>
                  humano
                </span>
              </div>
              <div className='flex items-center justify-between border-b border-white/15 pb-3'>
                <span className='text-white text-sm md:text-base font-medium'>
                  Operación clara y ágil
                </span>
                <span className='text-color-primary-light/80 text-[10px] tracking-[0.2em] uppercase'>
                  simple
                </span>
              </div>
              <div className='flex items-center justify-between pb-1'>
                <span className='text-white text-sm md:text-base font-medium'>
                  Unidades seleccionadas
                </span>
                <span className='text-color-primary-light/80 text-[10px] tracking-[0.2em] uppercase'>
                  calidad
                </span>
              </div>
            </div>
          </motion.div>

          {/* Columna derecha - imagen 1:1 (800x800) */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.08 }}
            viewport={{ once: true, margin: '0px 0px -80px 0px' }}
            className='relative w-full max-w-[800px] mx-auto aspect-[6/5] overflow-hidden rounded-2xl border border-white/15'
          >
            <Image
              src='/assets/gallery/gallery-1000-1.webp'
              alt='Showroom'
              fill
              className='object-cover'
              priority
              sizes='(max-width: 1024px) 100vw, 800px'
            />
            <div className='absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/10' />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Gallery;
