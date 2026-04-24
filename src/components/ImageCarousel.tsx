'use client';

import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import Image from 'next/image';

interface ImageCarouselProps {
  images: string[];
  basePath?: string;
  altText: string;
  width?: number;
  height?: number;
  autoplayDelay?: number;
  priority?: boolean;
}

const ImageCarousel = ({
  images,
  basePath = '',
  altText,
  width = 600,
  height = 350,
  autoplayDelay = 3000,
  priority = false,
}: ImageCarouselProps) => {
  const [emblaRef] = useEmblaCarousel(
    {
      loop: true,
      align: 'center',
      dragFree: false,
      containScroll: 'trimSnaps',
    },
    [
      Autoplay({
        delay: autoplayDelay,
        stopOnInteraction: false,
      }),
    ]
  );

  return (
    <div className='overflow-hidden aspect-video'>
      <div ref={emblaRef} className='overflow-hidden'>
        <div className='flex'>
          {images.map((image, index) => (
            <div
              key={index}
              className='flex-[0_0_100%] min-w-0 relative overflow-hidden'
            >
              <div className='group-hover:scale-110 transition-transform duration-700 h-full'>
                <Image
                  priority={priority}
                  className='w-full h-full object-cover'
                  src={`${basePath}${image}`}
                  alt={`${altText} - Imagen ${index + 1}`}
                  width={width}
                  height={height}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ImageCarousel;
