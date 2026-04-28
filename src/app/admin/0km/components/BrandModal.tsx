'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Image from 'next/image';

interface Brand {
  id?: string;
  name: string;
  description?: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  active?: boolean;
  position?: number;
}

interface BrandModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    brand: { name: string },
    imageFile?: File
  ) => Promise<void>;
  initialData?: Brand | null;
}

export default function BrandModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: BrandModalProps) {
  const [formData, setFormData] = useState<{ name: string }>({
    name: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
      });
      setImagePreview(initialData.imageUrl || null);
      setImageFile(null);
    } else {
      setFormData({
        name: '',
      });
      setImagePreview(null);
      setImageFile(null);
    }
    setError(null);
  }, [initialData, isOpen]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        setError('Por favor, selecciona un archivo de imagen válido');
        return;
      }
      // Validar tamaño (max 12MB)
      if (file.size > 12 * 1024 * 1024) {
        setError('La imagen no debe superar los 12MB');
        return;
      }
      setImageFile(file);
      setError(null);
      // Crear preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim()) {
      setError('El nombre de la marca es requerido');
      return;
    }

    setLoading(true);
    try {
      await onSubmit(
        formData,
        imageFile || undefined
      );
      // Reset form
      setFormData({
        name: '',
      });
      setImageFile(null);
      setImagePreview(null);
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error al guardar la marca'
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
      <div className='bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto'>
        <div className='sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center'>
          <h2 className='text-xl font-semibold text-gray-900'>
            {initialData ? 'Editar Marca' : 'Agregar Marca'}
          </h2>
          <button
            onClick={onClose}
            className='p-1 hover:bg-gray-100 rounded-full transition-colors'
          >
            <X size={20} className='text-gray-500' />
          </button>
        </div>

        <form onSubmit={handleSubmit} className='p-6 space-y-6'>
          {error && (
            <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded'>
              {error}
            </div>
          )}

          {/* Nombre de la marca */}
          <div>
            <label
              htmlFor='name'
              className='block text-sm font-medium text-gray-700 mb-2'
            >
              Nombre de la Marca <span className='text-red-500'>*</span>
            </label>
            <input
              type='text'
              id='name'
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-color-primary-admin focus:border-transparent'
              placeholder='Ej: Fiat, Peugeot, Renault...'
              required
            />
          </div>

          {/* Imagen de la marca */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Imagen de la Marca
            </label>
            {imagePreview ? (
              <div className='relative'>
                <div className='relative w-full aspect-square max-w-64 mx-auto mb-4 border-2 border-gray-200 rounded-lg overflow-hidden bg-gray-50'>
                  <Image
                    src={imagePreview}
                    alt='Preview de la imagen'
                    fill
                    className='object-contain'
                  />
                </div>
                <button
                  type='button'
                  onClick={handleRemoveImage}
                  className='block mx-auto text-sm text-red-600 hover:text-red-700'
                >
                  Eliminar imagen
                </button>
              </div>
            ) : (
              <div className='border-2 border-dashed border-gray-300 rounded-lg p-6 text-center'>
                <label htmlFor='image' className='cursor-pointer block'>
                  <div className='text-gray-400 mb-2'>
                    <svg
                      className='mx-auto h-12 w-12'
                      stroke='currentColor'
                      fill='none'
                      viewBox='0 0 48 48'
                    >
                      <path
                        d='M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02'
                        strokeWidth={2}
                        strokeLinecap='round'
                        strokeLinejoin='round'
                      />
                    </svg>
                  </div>
                  <span className='text-sm text-gray-600'>
                    Haz clic para subir una imagen
                  </span>
                  <span className='text-xs text-gray-500 block mt-1'>
                    PNG, JPG, WebP (máx. 12MB)
                  </span>
                </label>
                <input
                  type='file'
                  id='image'
                  accept='image/*'
                  onChange={handleImageChange}
                  className='hidden'
                />
              </div>
            )}
          </div>

          {/* Botones */}
          <div className='flex gap-3 pt-4 border-t border-gray-200'>
            <button
              type='button'
              onClick={onClose}
              className='flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors'
            >
              Cancelar
            </button>
            <button
              type='submit'
              disabled={loading}
              className='flex-1 px-4 py-2 bg-color-primary-admin text-white rounded-lg hover:bg-color-primary-admin/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {loading ? 'Guardando...' : initialData ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
