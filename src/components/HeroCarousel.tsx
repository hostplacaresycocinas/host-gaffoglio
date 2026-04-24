'use client';

const HeroCarousel = () => {
  return (
    <div className='absolute inset-0 -z-30 bg-black'>
      {/* Video para mobile */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className='absolute inset-0 w-full h-full object-cover object-center md:hidden'
      >
        <source src='/assets/inicio/background-mobile.mp4' type='video/mp4' />
      </video>
      {/* Video para desktop */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className='absolute inset-0 w-full h-full object-cover object-center hidden md:block'
      >
        <source src='/assets/inicio/background-desktop.mp4' type='video/mp4' />
      </video>
    </div>
  );
};

export default HeroCarousel;
