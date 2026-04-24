'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import ReactCrop, {
  Crop,
  PixelCrop,
  centerCrop,
  makeAspectCrop,
} from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface ImageCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  onCropComplete: (croppedImage: File) => void;
}

// Función para crear un crop centrado con relación de aspecto
function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

// Función para generar una imagen recortada a partir del canvas
function canvasPreview(
  image: HTMLImageElement,
  canvas: HTMLCanvasElement,
  crop: PixelCrop
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('No 2d context');
  }

  // Obtener las dimensiones reales de la imagen
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  // Calcular las dimensiones del área de recorte en píxeles reales
  const cropX = crop.x * scaleX;
  const cropY = crop.y * scaleY;
  const cropWidth = crop.width * scaleX;
  const cropHeight = crop.height * scaleY;

  // Configurar el tamaño del canvas para usar las dimensiones reales de la imagen recortada
  canvas.width = cropWidth;
  canvas.height = cropHeight;

  // Asegurarse de que el contexto esté limpio y configurado para alta calidad
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Dibujar la imagen recortada directamente en el canvas a tamaño completo
  ctx.drawImage(
    image,
    cropX,
    cropY,
    cropWidth,
    cropHeight,
    0,
    0,
    cropWidth,
    cropHeight
  );
}

export function ImageCropModal({
  isOpen,
  onClose,
  imageUrl,
  onCropComplete,
}: ImageCropModalProps) {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [aspect] = useState<number>(4 / 3);
  const imgRef = useRef<HTMLImageElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [imgSrc, setImgSrc] = useState<string>(imageUrl);

  // Limpiar el estado cuando se cierra el modal o cambia la imagen
  useEffect(() => {
    if (!isOpen) {
      setCrop(undefined);
      setCompletedCrop(undefined);
      setIsImageLoaded(false);
      if (previewCanvasRef.current) {
        const ctx = previewCanvasRef.current.getContext('2d');
        if (ctx) {
          ctx.clearRect(
            0,
            0,
            previewCanvasRef.current.width,
            previewCanvasRef.current.height
          );
        }
      }
    }
  }, [isOpen, imageUrl]);

  // Cuando la imagen se carga, establecer un recorte inicial
  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    const initialCrop = centerAspectCrop(width, height, aspect);
    setCrop(initialCrop);
    setCompletedCrop(undefined);
    setIsImageLoaded(true);
    setImgSrc(e.currentTarget.src);
  };

  // Actualizar el canvas de vista previa cuando cambia el recorte
  useEffect(() => {
    if (
      isImageLoaded &&
      imgRef.current &&
      previewCanvasRef.current &&
      completedCrop
    ) {
      canvasPreview(imgRef.current, previewCanvasRef.current, completedCrop);
    }
  }, [completedCrop, isImageLoaded]);

  const handleClose = () => {
    setCrop(undefined);
    setCompletedCrop(undefined);
    setIsImageLoaded(false);
    onClose();
  };

  const handleCropApply = useCallback(() => {
    if (
      completedCrop?.width &&
      completedCrop?.height &&
      imgRef.current &&
      previewCanvasRef.current
    ) {
      canvasPreview(imgRef.current, previewCanvasRef.current, completedCrop);

      let mimeType = 'image/jpeg';
      if (imgSrc.includes('image/png')) {
        mimeType = 'image/png';
      } else if (imgSrc.includes('image/webp')) {
        mimeType = 'image/webp';
      } else if (imgSrc.includes('image/gif')) {
        mimeType = 'image/gif';
      }

      const canvas = previewCanvasRef.current;

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            console.error('No se pudo crear el blob');
            return;
          }

          const fileExtension = mimeType.split('/')[1];
          const fileName = `cropped-image-${new Date().getTime()}.${fileExtension}`;
          const croppedFile = new File([blob], fileName, { type: mimeType });

          onCropComplete(croppedFile);
          onClose();
        },
        mimeType,
        1.0
      );
    }
  }, [completedCrop, onCropComplete, onClose, imgSrc]);

  if (!isOpen) return null;

  return (
    <div 
      className='fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50' 
      onClick={(e) => {
        e.stopPropagation();
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <div className='bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-auto' onClick={(e) => e.stopPropagation()}>
        <div className='flex justify-between items-center mb-4'>
          <h2 className='text-xl font-semibold'>Recortar imagen</h2>
          <button
            onClick={handleClose}
            className='text-gray-500 hover:text-gray-700'
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-6 w-6'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
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

        <div className='flex flex-col md:flex-row gap-4'>
          <div className='flex-1 overflow-hidden'>
            <ReactCrop
              crop={crop}
              onChange={(c) => setCrop(c)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={aspect}
              className='max-h-[60vh] mx-auto'
            >
              <img
                ref={imgRef}
                src={imageUrl}
                alt='Imagen a recortar'
                onLoad={onImageLoad}
                className='max-w-full max-h-[60vh] object-contain'
              />
            </ReactCrop>
          </div>

          <div className='w-full md:w-64 flex flex-col'>
            <p className='text-base font-medium text-gray-700 mb-2'>
              Vista previa
            </p>
            <div
              className='border border-gray-300 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center'
              style={{
                width: '250px',
                height: '187.5px', // Mantiene relación 4:3
                aspectRatio: '4/3',
              }}
            >
              <canvas
                ref={previewCanvasRef}
                className='w-full h-full object-contain'
              />
            </div>
          </div>
        </div>

        <div className='mt-6 flex justify-end space-x-2'>
          <button
            type='button'
            onClick={handleClose}
            className='px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50'
          >
            Cancelar
          </button>
          <button
            type='button'
            onClick={handleCropApply}
            className='px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600'
          >
            Aplicar recorte
          </button>
        </div>
      </div>
    </div>
  );
}

export default ImageCropModal;
