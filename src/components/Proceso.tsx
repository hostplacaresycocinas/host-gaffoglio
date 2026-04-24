'use client';

import { motion } from 'framer-motion';

const beneficios = [
  {
    titulo: 'Mejor precio garantizado',
    descripcion:
      'Con nuestro modelo de negocios y trayectoria en el mercado nos ahorramos costos operativos para garantizarte un precio acorde.',
    icono: (
      <svg
        xmlns='http://www.w3.org/2000/svg'
        className='w-full h-full'
        fill='currentColor'
        viewBox='0 0 24 24'
      >
        <path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z' />
      </svg>
    ),
  },
  {
    titulo: 'Revisión vehicular',
    descripcion:
      'Todos los vehículos pasan por una exhaustiva inspección para garantizar un óptimo funcionamiento de los vehículos.',
    icono: (
      <svg
        xmlns='http://www.w3.org/2000/svg'
        className='w-full h-full'
        fill='currentColor'
        viewBox='0 0 24 24'
      >
        <path d='M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' />
      </svg>
    ),
  },
  {
    titulo: 'Documentación ágil',
    descripcion:
      'Te ofrecemos operaciones rápidas para que puedas disfrutar de tu nuevo vehículo sin preocupaciones extra.',
    icono: (
      <svg
        xmlns='http://www.w3.org/2000/svg'
        className='w-full h-full'
        fill='currentColor'
        viewBox='0 0 24 24'
      >
        <path d='M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z' />
      </svg>
    ),
  },
];

const Proceso = () => {
  return (
    <section className='py-16 md:py-24 lg:py-28'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-10'>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className='text-center mb-10 md:mb-12'
        >
          <div className='inline-flex items-center gap-4 mb-3'>
            <div className='w-10 h-px bg-color-primary/70' />
            <span className='text-white text-xs tracking-[0.5em] uppercase font-semibold'>
              Proceso
            </span>
            <div className='w-10 h-px bg-color-primary/70' />
          </div>
          <h2 className='text-white/90 text-2xl sm:text-3xl md:text-4xl font-semibold leading-tight tracking-tight max-w-3xl mx-auto'>
            Una experiencia simple, transparente y profesional
          </h2>
        </motion.div>

        <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 md:gap-6'>
          {beneficios.map((b, i) => (
            <motion.article
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
              viewport={{ once: true, margin: '0px 0px -80px 0px' }}
              className='relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-md border border-white/15 p-6 md:p-7 text-center'
            >
              <div className='absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent' />

              <div className='flex items-center justify-between mb-5'>
                <span className='text-color-primary-light/80 text-xs font-semibold tracking-[0.3em]'>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className='flex w-11 h-11 items-center justify-center rounded-xl bg-color-primary/15 border border-color-primary/40 text-color-primary-light'>
                  <span className='w-5 h-5'>{b.icono}</span>
                </span>
              </div>

              <h3 className='text-white/90 text-xl md:text-2xl font-semibold leading-tight mb-3'>
                {b.titulo}
              </h3>
              <p className='text-white/75 text-sm md:text-base leading-relaxed'>
                {b.descripcion}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Proceso;
