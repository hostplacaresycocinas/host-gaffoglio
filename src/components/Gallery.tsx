'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { SectionTitleItaly } from '@/components/SectionTitleItaly';

const Gallery = () => {
  return (
    <section className='py-16 md:py-24 lg:py-28'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-10'>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true, margin: '0px 0px -100px 0px' }}
          className='mb-8 md:mb-10'
        >
          <SectionTitleItaly
            title='Transporte propio'
            subtitle='Entrega ágil, segura y coordinada de punta a punta'
            subtitleVariant='section'
            className='!mb-0'
          />
        </motion.div>

        <div className='grid lg:grid-cols-[1.15fr_0.85fr] gap-6 md:gap-8 lg:gap-10 items-stretch'>
          {/* Imagen protagonista */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true, margin: '0px 0px -100px 0px' }}
            className='relative w-full aspect-[4/3] md:min-h-[420px] lg:min-h-[520px] overflow-hidden rounded-lg md:rounded-xl border border-white/15'
          >
            <Image
              src='/assets/gallery/gallery-1000-1.webp'
              alt='Transporte propio'
              fill
              className='object-cover'
              priority
              sizes='(max-width: 1024px) 100vw, 800px'
            />
            <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent' />
          </motion.div>

          {/* Bloques informativos */}
          <div className='grid grid-rows-3 gap-4 md:gap-5'>
            {[
              {
                title: 'Sin intermediarios',
                text: 'Desde que sale hasta que llega, la unidad se traslada con nuestro equipo.',
              },
              {
                title: 'Tiempos definidos',
                text: 'Planificamos rutas y horarios para una entrega ordenada y previsible.',
              },
              {
                title: 'Cuidado de la unidad',
                text: 'Priorizamos manipulación responsable y seguimiento durante todo el trayecto.',
              },
            ].map((item, idx) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.12 + idx * 0.08 }}
                viewport={{ once: true, margin: '0px 0px -80px 0px' }}
                className='relative overflow-hidden rounded-xl border border-white/15 bg-white/5 backdrop-blur-md p-5 md:p-6'
              >
                <div className='absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent' />
                <p className='text-color-primary-light/85 text-[10px] uppercase tracking-[0.28em] mb-2'>
                  {`0${idx + 1}`}
                </p>
                <h3 className='text-white text-lg md:text-xl font-semibold mb-2'>
                  {item.title}
                </h3>
                <p className='text-white/75 text-sm md:text-base leading-relaxed'>
                  {item.text}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Gallery;
