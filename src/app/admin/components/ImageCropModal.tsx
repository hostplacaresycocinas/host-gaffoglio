'use client';

import { useState, useRef } from 'react';
import Cropper from 'react-cropper';
// CSS importado a través de link en layout.tsx

interface ImageCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  image: string | null;
  onCrop: (croppedImage: string) => void;
}

const ImageCropModal = ({
  isOpen,
  onClose,
  image,
  onCrop,
}: ImageCropModalProps) => {
  const [cropper, setCropper] = useState<Cropper>();
  const cropperRef = useRef<HTMLImageElement>(null);

  const handleCrop = () => {
    if (cropper) {
      const canvas = cropper.getCroppedCanvas();
      onCrop(canvas.toDataURL('image/jpeg', 1.0));
    }
  };

  if (!isOpen || !image) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg p-6 w-full max-w-4xl'>
        <div className='flex justify-between items-center mb-4'>
          <h2 className='text-xl font-semibold text-color-text'>
            Recortar Imagen
          </h2>
          <button
            onClick={onClose}
            className='text-gray-500 hover:text-gray-700'
          >
            <svg
              className='w-6 h-6'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M6 18L18 6M6 6l12 12'
              />
            </svg>
          </button>
        </div>

        <div className='h-[500px]'>
          <Cropper
            src={image}
            style={{ height: '100%', width: '100%' }}
            aspectRatio={16 / 9}
            guides={true}
            onInitialized={(instance) => setCropper(instance)}
            ref={cropperRef}
          />
        </div>

        <div className='flex justify-end space-x-3 mt-4'>
          <button
            onClick={onClose}
            className='px-4 py-2 border border-gray-300 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-color-primary'
          >
            Cancelar
          </button>
          <button
            onClick={handleCrop}
            className='px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-color-primary hover:bg-color-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-color-primary'
          >
            Recortar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageCropModal;
