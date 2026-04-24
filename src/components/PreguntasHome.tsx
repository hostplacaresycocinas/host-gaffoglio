'use client';

import { company, preguntas } from '@/app/constants/constants';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PreguntasHome = () => {
  const [activeAnswer, setActiveAnswer] = useState<string | null>('preg-1');

  const toggleAnswer = (id: string) => {
    if (activeAnswer !== id) {
      setActiveAnswer(id);
    }
  };

  return (
    <section
      id='preguntasSection'
      className='py-16 md:py-24 lg:py-32 relative overflow-hidden'
    >
      <div className='flex justify-center w-full'>
        <div className='max-w-6xl w-full flex flex-col mx-4 sm:mx-6 md:mx-8 lg:mx-10'>
          {/* Título y subtítulo */}
          <div className='text-center mb-10 md:mb-12'>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true, margin: '0px 0px -100px 0px' }}
            >
              <div className='inline-flex items-center gap-4 mb-3'>
                <div className='w-10 h-px bg-color-primary/70' />
                <span className='text-white text-xs tracking-[0.5em] uppercase font-semibold'>
                  FAQ
                </span>
                <div className='w-10 h-px bg-color-primary/70' />
              </div>
              <h2 className='text-white/90 text-2xl sm:text-3xl md:text-4xl leading-tight font-semibold tracking-tight'>
                Preguntas frecuentes
              </h2>
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true, margin: '0px 0px -100px 0px' }}
              className='text-sm sm:text-base md:text-lg text-white/80 max-w-3xl mx-auto leading-relaxed'
            >
              Resolvemos todas tus dudas sobre nuestros servicios y procesos de
              compra
            </motion.p>
          </div>

          {/* Grid de preguntas */}
          <div className='space-y-3 md:space-y-4'>
            {preguntas.map((pregunta, index) => (
              <motion.div
                key={pregunta.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '0px 0px -100px 0px' }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <div
                  onClick={() => toggleAnswer(pregunta.id)}
                  className={`relative rounded-2xl transition-colors duration-300 cursor-pointer overflow-hidden
                    ${
                      activeAnswer === pregunta.id
                        ? 'bg-white/10 backdrop-blur-md border border-white/25'
                        : 'bg-white/5 backdrop-blur-md border border-white/15 hover:bg-white/10 hover:border-white/25'
                    }`}
                >
                  <div className='absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent' />
                  {/* Contenido principal */}
                  <div className='p-5 md:p-6'>
                    <div className='flex items-start justify-between gap-4'>
                      <h4
                        className={`flex-1 text-base sm:text-lg md:text-xl font-semibold transition-colors duration-300
                         ${
                           activeAnswer === pregunta.id
                             ? 'text-white'
                             : 'text-white/90'
                         }`}
                      >
                        {pregunta.question}
                      </h4>

                      {/* Botón de toggle */}
                      <div className='flex-shrink-0'>
                        <div
                          className={`w-9 h-9 md:w-10 md:h-10 rounded-lg flex items-center justify-center transition-all duration-300 bg-color-primary hover:bg-color-primary-dark ${
                            company.dark
                              ? 'text-color-title'
                              : 'text-color-title-light'
                          }`}
                        >
                          <motion.svg
                            animate={{
                              rotate: activeAnswer === pregunta.id ? 180 : 0,
                            }}
                            transition={{
                              duration: 0.3,
                              ease: 'easeInOut',
                            }}
                            className='w-5 h-5'
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M19 9l-7 7-7-7'
                            />
                          </motion.svg>
                        </div>
                      </div>
                    </div>

                    {/* Contenido expandible */}
                    <AnimatePresence>
                      {activeAnswer === pregunta.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{
                            duration: 0.4,
                            ease: 'easeInOut',
                          }}
                          className='overflow-hidden'
                        >
                          <div className='mt-4 pt-4 border-t border-white/20'>
                            <p className='text-sm sm:text-base leading-relaxed text-white/80'>
                              {pregunta.answer}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PreguntasHome;
