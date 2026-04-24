'use client';

const WhyChooseUs = () => {
  const benefits = [
    {
      id: 1,
      title: 'Amplia Variedad',
      description:
        'Gran selección de vehículos usados y nuevos de diferentes marcas y modelos para encontrar el auto que mejor se adapte a tus necesidades.',
      icon: '/assets/icons/selection.svg',
    },
    {
      id: 2,
      title: 'Garantía Confiable',
      description:
        'Todos nuestros vehículos pasan por una revisión técnica completa y cuentan con garantía para tu tranquilidad.',
      icon: '/assets/icons/guarantee.svg',
    },
    {
      id: 3,
      title: 'Financiación Accesible',
      description:
        'Opciones de financiación flexibles y planes de pago adaptados a tu presupuesto, facilitando la compra de tu vehículo.',
      icon: '/assets/icons/finance.svg',
    },
  ];

  return (
    <section className='flex justify-center py-16 md:py-24 bg-color-bg-primary relative overflow-hidden'>
      {/* Gradiente de fondo */}
      <div className='absolute inset-0 bg-gradient-to-b from-black via-black/95 to-black'></div>

      {/* Patrón decorativo */}
      <div className='absolute inset-0 opacity-10 bg-grid-pattern'></div>

      <div className='max-w-6xl flex relative z-10'>
        <div className='mx-4 sm:mx-6 md:mx-8 lg:mx-10'>
          <div className='text-center mb-16'>
            <h3 className='text-xs text-white/60 uppercase tracking-[0.3em] mb-3'>
              Experiencia
            </h3>
            <h2 className='text-3xl md:text-4xl lg:text-5xl font-light text-white mb-5'>
              ¿Por qué elegirnos?
            </h2>
            <div className='w-16 md:w-24 h-0.5 bg-color-primary mx-auto'></div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
            {benefits.map((benefit) => (
              <div
                key={benefit.id}
                className='bg-gradient-to-b from-black to-neutral-900 rounded border border-white/15'
              >
                <div className='flex flex-col w-80 h-96 p-5 md:p-7'>
                  <div className='mb-6 w-12 h-12 flex items-center justify-center rounded-full bg-color-primary transition-colors'>
                    <div className='text-color-title-light text-xl  transition-colors'>
                      {benefit.id}
                    </div>
                  </div>

                  <h3 className='text-white text-xl mb-4 font-medium text-nowrap'>
                    {benefit.title}
                  </h3>
                  <p className='text-white/70 leading-relaxed flex-grow mb-6'>
                    {benefit.description}
                  </p>

                  <div className='w-10 md:w-16 h-0.5 bg-color-primary'></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
