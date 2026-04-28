'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { SectionTitleItaly } from '@/components/SectionTitleItaly';

const testimonios = [
  {
    id: 'delfina-trabalon',
    nombre: 'Delfina Trabalon',
    texto: 'Muy profesionales, excelente atención!',
  },
  {
    id: 'ariel-gomez',
    nombre: 'Ariel Gómez',
    texto:
      'Muy buena atención. Cordiales y con todos los detalles para dar tranquilidad en las elecciones. Muchas gracias.',
  },
  {
    id: 'roberto-adrian-gauto',
    nombre: 'Roberto Adrian Gauto',
    texto: 'Muy buena atención',
  },
  {
    id: 'camen-gomez',
    nombre: 'Camen Gomez',
    texto: 'Excelente atencion',
  },
  {
    id: 'patricio-delmonte',
    nombre: 'Patricio Delmonte',
    texto: 'Excelente atencion',
  },
  {
    id: 'alexandro-vidal',
    nombre: 'Alexandro Vidal',
    texto: 'Todo perfecto, los recomiendo!',
  },
] as const;

function FiveStars() {
  return (
    <div className='flex items-center gap-1' aria-label='5 estrellas'>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className='h-4 w-4 text-[#FBBC04]'
          fill='currentColor'
          viewBox='0 0 20 20'
          aria-hidden
        >
          <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.08 3.321a1 1 0 00.95.69h3.492c.969 0 1.371 1.24.588 1.81l-2.826 2.054a1 1 0 00-.364 1.118l1.08 3.321c.3.922-.755 1.688-1.538 1.118l-2.826-2.053a1 1 0 00-1.176 0L6.585 16.32c-.783.57-1.838-.196-1.539-1.118l1.08-3.32a1 1 0 00-.364-1.119L2.937 8.748c-.783-.57-.38-1.81.588-1.81h3.492a1 1 0 00.95-.69l1.08-3.321z' />
        </svg>
      ))}
    </div>
  );
}

const TestimoniosHome = () => {
  return (
    <section>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-10'>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className='mb-8 md:mb-10'
        >
          <SectionTitleItaly
            title='Testimonios'
            subtitle='Nuestro compromiso con el cliente'
            subtitleVariant='section'
            className='!mb-0'
          />
        </motion.div>

        <div className='grid gap-4 md:gap-5 md:grid-cols-2 lg:grid-cols-3'>
          {testimonios.map((item, i) => (
            <motion.article
              key={item.nombre}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true, margin: '0px 0px -100px 0px' }}
              className='relative overflow-hidden rounded-xl border border-white/15 bg-white/5 p-5 md:p-6 backdrop-blur-md'
            >
              <div className='absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent' />
              <div className='flex items-center justify-between gap-3 mb-3'>
                <div className='flex items-center gap-3 min-w-0'>
                  <div className='relative h-9 w-9 rounded-full overflow-hidden border border-white/20 bg-white/10 shrink-0'>
                    <Image
                      src={`/assets/testimonios/${item.id}.webp`}
                      alt={item.nombre}
                      fill
                      className='object-cover'
                      sizes='36px'
                    />
                  </div>
                  <p className='text-white font-medium text-sm md:text-base truncate'>
                    {item.nombre}
                  </p>
                </div>
              </div>
              <FiveStars />
              <p className='mt-3 text-white/80 text-sm md:text-base leading-relaxed'>
                {item.texto}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimoniosHome;
