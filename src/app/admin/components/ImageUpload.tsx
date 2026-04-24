'use client';

import { Edit, Trash, Plus, GripVertical } from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { ImageCropModal } from './image-crop-modal';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface ImageUploadProps {
  onImagesSelected: (files: File[]) => void;
  onImagesUpdate?: (data: {
    newImages: File[];
    imagesToDelete: string[];
    imageOrder: Array<{ id: string; order: number }>;
  }) => void;
  defaultImages?: Array<{
    id: string;
    imageUrl: string;
    thumbnailUrl: string;
    order: number;
  }>;
  maxFiles?: number;
  accept?: string;
}

interface FileWithOrientation extends File {
  orientation?: number;
}

interface SortableImageProps {
  image: {
    id: string;
    imageUrl: string;
    thumbnailUrl: string;
  };
  index: number;
  onRemove: () => void;
}

const SortableImage = ({ image, index, onRemove }: SortableImageProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: image.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative border rounded-md overflow-hidden ${
        isDragging ? 'shadow-lg border-red-400 opacity-80' : ''
      }`}
    >
      <div
        className='absolute top-2 left-2 p-1.5 bg-white/80 rounded-full shadow-sm cursor-grab z-10 hover:bg-white'
        {...attributes}
        {...listeners}
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical size={16} className='text-gray-600' />
      </div>
      <div className='w-[110px] aspect-[4/3] relative'>
        <Image
          src={image.thumbnailUrl}
          alt={`Imagen ${index + 1}`}
          fill
          className='object-cover'
        />
      </div>
      <button
        className='absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-sm text-red-500 hover:text-red-700 z-10'
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        type='button'
        title='Eliminar imagen'
      >
        <Trash size={16} />
      </button>
    </div>
  );
};

interface SortableNewImageProps {
  id: string;
  src: string;
  index: number;
  onEdit: () => void;
  onRemove: () => void;
}

const SortableNewImage = ({
  id,
  src,
  onEdit,
  onRemove,
}: SortableNewImageProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative border rounded-md overflow-hidden ${
        isDragging ? 'shadow-lg border-red-400 opacity-80' : ''
      }`}
    >
      <div
        className='absolute top-2 left-2 p-1.5 bg-white/80 rounded-full shadow-sm cursor-grab z-10 hover:bg-white'
        {...attributes}
        {...listeners}
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical size={16} className='text-gray-600' />
      </div>
      <div className='w-[110px] aspect-[4/3] relative'>
        <Image
          priority
          src={src}
          alt='Nueva imagen'
          fill
          className='object-cover'
        />
      </div>
      <div className='absolute top-2 right-2 flex gap-1'>
        <button
          className='bg-white rounded-full p-1.5 shadow-sm text-blue-500 hover:text-blue-700 z-10'
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          type='button'
          title='Editar imagen'
        >
          <Edit size={16} />
        </button>
        <button
          className='bg-white rounded-full p-1.5 shadow-sm text-red-500 hover:text-red-700 z-10'
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          type='button'
          title='Eliminar imagen'
        >
          <Trash size={16} />
        </button>
      </div>
    </div>
  );
};

// Función para corregir la orientación EXIF
const correctImageOrientation = async (file: File): Promise<File> => {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(file);
        return;
      }

      // Obtener la orientación EXIF
      const fileWithOrientation = file as FileWithOrientation;
      const orientation = fileWithOrientation.orientation || 1;

      // Ajustar el canvas según la orientación
      if (orientation > 4) {
        canvas.width = img.height;
        canvas.height = img.width;
      } else {
        canvas.width = img.width;
        canvas.height = img.height;
      }

      // Transformar el contexto según la orientación
      switch (orientation) {
        case 2:
          ctx.transform(-1, 0, 0, 1, img.width, 0);
          break;
        case 3:
          ctx.transform(-1, 0, 0, -1, img.width, img.height);
          break;
        case 4:
          ctx.transform(1, 0, 0, -1, 0, img.height);
          break;
        case 5:
          ctx.transform(0, 1, 1, 0, 0, 0);
          break;
        case 6:
          ctx.transform(0, 1, -1, 0, img.height, 0);
          break;
        case 7:
          ctx.transform(0, -1, -1, 0, img.height, img.width);
          break;
        case 8:
          ctx.transform(0, -1, 1, 0, 0, img.width);
          break;
      }

      // Dibujar la imagen
      ctx.drawImage(img, 0, 0);

      // Convertir el canvas a blob
      canvas.toBlob((blob) => {
        if (blob) {
          const correctedFile = new File([blob], file.name, {
            type: file.type,
            lastModified: file.lastModified,
          });
          resolve(correctedFile);
        } else {
          resolve(file);
        }
      }, file.type);
    };
    img.src = URL.createObjectURL(file);
  });
};

export function ImageUpload({
  onImagesSelected,
  maxFiles = 10,
  accept = 'image/*',
  defaultImages = [],
  onImagesUpdate,
}: ImageUploadProps) {
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [tempImageUrl, setTempImageUrl] = useState<string>('');
  const [tempFile, setTempFile] = useState<File | null>(null);
  const [editingIndex, setEditingIndex] = useState<number>(-1);
  const [existingImages, setExistingImages] = useState(defaultImages);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);

  // Generar IDs únicos para las nuevas imágenes
  const [newImageIds, setNewImageIds] = useState<string[]>([]);

  // Sensores para detectar eventos de arrastre
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Distancia en píxeles que se debe mover antes de comenzar el arrastre
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFiles = Array.from(files).slice(
      0,
      maxFiles -
        (selectedFiles.length + existingImages.length - imagesToDelete.length)
    );
    if (newFiles.length === 0) return;

    // Corregir la orientación de cada archivo
    const correctedFiles = await Promise.all(
      newFiles.map((file) => correctImageOrientation(file))
    );

    // Crear nuevos IDs únicos para las nuevas imágenes
    const newIds = correctedFiles.map(
      () => `new-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    );
    setNewImageIds((prev) => [...prev, ...newIds]);

    // Procesar todas las imágenes directamente
    const updatedFiles = [...selectedFiles, ...correctedFiles];
    setSelectedFiles(updatedFiles);
    onImagesSelected(updatedFiles);

    // Crear previsualizaciones para todas las imágenes usando URL.createObjectURL
    correctedFiles.forEach((file) => {
      const url = URL.createObjectURL(file);
      setPreviewImages((prev) => [...prev, url]);
    });

    if (e.target) {
      e.target.value = '';
    }

    // Notificar cambios si hay un handler
    if (onImagesUpdate) {
      onImagesUpdate({
        newImages: updatedFiles,
        imagesToDelete,
        imageOrder: existingImages.map((img, idx) => ({
          id: img.id,
          order: idx,
        })),
      });
    }
  };

  const handleEditImage = (index: number) => {
    const file = selectedFiles[index];
    setEditingIndex(index);
    setTempFile(file);
    const url = URL.createObjectURL(file);
    setTempImageUrl(url);
    setCropModalOpen(true);
  };

  const handleCropComplete = async (croppedFile: File) => {
    if (!tempFile || editingIndex < 0) return;

    // Actualizar la imagen en el índice específico
    const newFiles = [...selectedFiles];
    newFiles[editingIndex] = croppedFile;
    setSelectedFiles(newFiles);
    onImagesSelected(newFiles);

    // Actualizar la previsualización
    const url = URL.createObjectURL(croppedFile);
    setPreviewImages((prev) => {
      const newPreviews = [...prev];
      newPreviews[editingIndex] = url;
      return newPreviews;
    });

    // Limpiar el estado temporal
    setTempFile(null);
    setTempImageUrl('');
    setEditingIndex(-1);
    setCropModalOpen(false);

    // Notificar cambios si hay un handler
    if (onImagesUpdate) {
      onImagesUpdate({
        newImages: newFiles,
        imagesToDelete,
        imageOrder: existingImages.map((img, idx) => ({
          id: img.id,
          order: idx,
        })),
      });
    }
  };

  const removeImage = (index: number, isExisting: boolean = false) => {
    if (isExisting) {
      const imageToDelete = existingImages[index];
      const updatedImagesToDelete = [...imagesToDelete, imageToDelete.id];
      setImagesToDelete(updatedImagesToDelete);
      setExistingImages(existingImages.filter((_, i) => i !== index));

      // Notificar cambios inmediatamente con el array actualizado si hay un handler
      if (onImagesUpdate) {
        const updatedExistingImages = existingImages.filter(
          (_, i) => i !== index
        );
        onImagesUpdate({
          newImages: selectedFiles,
          imagesToDelete: updatedImagesToDelete,
          imageOrder: updatedExistingImages.map((img, idx) => ({
            id: img.id,
            order: idx,
          })),
        });
      }
    } else {
      // Revocar la URL de objeto para liberar memoria
      URL.revokeObjectURL(previewImages[index]);

      const newFiles = selectedFiles.filter((_, i) => i !== index);
      const newPreviews = previewImages.filter((_, i) => i !== index);
      const newIds = newImageIds.filter((_, i) => i !== index);

      setSelectedFiles(newFiles);
      setPreviewImages(newPreviews);
      setNewImageIds(newIds);
      onImagesSelected(newFiles);

      // Notificar cambios con los archivos actualizados si hay un handler
      if (onImagesUpdate) {
        onImagesUpdate({
          newImages: newFiles,
          imagesToDelete,
          imageOrder: existingImages.map((img, idx) => ({
            id: img.id,
            order: idx,
          })),
        });
      }
    }
  };

  // Manejar eventos de drag and drop para imágenes existentes
  const handleExistingDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    if (active.id !== over.id) {
      const oldIndex = existingImages.findIndex(
        (item) => item.id === active.id
      );
      const newIndex = existingImages.findIndex((item) => item.id === over.id);

      const newArray = arrayMove(existingImages, oldIndex, newIndex);

      // Actualizar el estado después del renderizado
      setTimeout(() => {
        setExistingImages(newArray);

        // Notificar cambios si hay un handler
        if (onImagesUpdate) {
          const newOrder = newArray.map((img, idx) => ({
            id: img.id,
            order: idx,
          }));

          onImagesUpdate({
            newImages: selectedFiles,
            imagesToDelete,
            imageOrder: newOrder,
          });
        }
      }, 0);
    }
  };

  // Manejar eventos de drag and drop para nuevas imágenes
  const handleNewImagesDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    if (active.id !== over.id) {
      // Encontrar los índices correspondientes
      const oldIndex = newImageIds.findIndex((id) => id === active.id);
      const newIndex = newImageIds.findIndex((id) => id === over.id);

      if (oldIndex === -1 || newIndex === -1) return;

      // Reordenar los arrays
      const newIds = arrayMove(newImageIds, oldIndex, newIndex);
      const newPreviews = arrayMove(previewImages, oldIndex, newIndex);
      const newFiles = arrayMove(selectedFiles, oldIndex, newIndex);

      // Actualizar el estado después del renderizado
      setTimeout(() => {
        setNewImageIds(newIds);
        setPreviewImages(newPreviews);
        setSelectedFiles(newFiles);

        // Notificar el cambio en las imágenes seleccionadas
        onImagesSelected(newFiles);

        // Notificar cambios al componente padre si hay un handler
        if (onImagesUpdate) {
          onImagesUpdate({
            newImages: newFiles,
            imagesToDelete,
            imageOrder: existingImages.map((img, idx) => ({
              id: img.id,
              order: idx,
            })),
          });
        }
      }, 0);
    }
  };

  const triggerFileInput = () => {
    document.getElementById('images')?.click();
  };

  // Limpiar las URLs de objeto cuando el componente se desmonte
  useEffect(() => {
    return () => {
      previewImages.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewImages]);

  // Inicializar IDs únicos para nuevas imágenes si no existen aún
  useEffect(() => {
    if (selectedFiles.length > 0 && newImageIds.length === 0) {
      setNewImageIds(
        selectedFiles.map(
          () =>
            `new-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
        )
      );
    }
  }, [selectedFiles, newImageIds]);

  return (
    <div>
      <div className='mb-4'>
        {/* Imágenes actuales con reordenamiento */}
        {existingImages.length > 0 && (
          <div className='mb-6'>
            <label className='block text-base font-medium text-gray-700 mb-2'>
              Imágenes actuales{' '}
              <span className='text-gray-500 text-xs font-normal'>
                (Arrastra para reordenar)
              </span>
            </label>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleExistingDragEnd}
            >
              <SortableContext
                items={existingImages.map((img) => img.id)}
                strategy={horizontalListSortingStrategy}
              >
                <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-2 rounded-md'>
                  {existingImages.map((image, index) => (
                    <SortableImage
                      key={image.id}
                      image={image}
                      index={index}
                      onRemove={() => removeImage(index, true)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        )}

        {/* Sección de nuevas imágenes */}
        <div>
          <label className='block text-base font-medium text-gray-700 mb-2'>
            Nuevas imágenes{' '}
            <span className='text-gray-500 text-xs font-normal'>
              {selectedFiles.length > 0 ? '(Arrastra para reordenar)' : ''}
            </span>
            <span className='text-gray-500 text-xs font-normal ml-2'>
              ({selectedFiles.length}/
              {maxFiles - (existingImages.length - imagesToDelete.length)})
            </span>
          </label>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleNewImagesDragEnd}
          >
            <SortableContext
              items={newImageIds}
              strategy={horizontalListSortingStrategy}
            >
              <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-2 rounded-md'>
                {/* Área para subir nueva imagen */}
                {selectedFiles.length +
                  existingImages.length -
                  imagesToDelete.length <
                  maxFiles && (
                  <div
                    className='border-2 border-dashed border-gray-300 rounded-md w-[110px] aspect-[4/3] flex flex-col items-center justify-center cursor-pointer hover:border-red-400 transition-colors'
                    onClick={triggerFileInput}
                  >
                    <Plus className='h-8 w-8 text-gray-400 mb-2' />
                    <span className='text-base text-gray-500'>Agregar</span>
                  </div>
                )}

                {/* Vista previa de las nuevas imágenes con arrastrar y soltar */}
                {previewImages.map((src, index) => (
                  <SortableNewImage
                    key={newImageIds[index] || `temp-${index}`}
                    id={newImageIds[index] || `temp-${index}`}
                    src={src}
                    index={index}
                    onEdit={() => handleEditImage(index)}
                    onRemove={() => removeImage(index)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      </div>

      <input
        type='file'
        className='hidden'
        id='images'
        accept={accept}
        onChange={handleFileChange}
        multiple
      />

      {/* Modal de recorte de imágenes */}
      <ImageCropModal
        isOpen={cropModalOpen}
        onClose={() => {
          setCropModalOpen(false);
          setTempImageUrl('');
          setTempFile(null);
          setEditingIndex(-1);
        }}
        imageUrl={tempImageUrl}
        onCropComplete={handleCropComplete}
      />
    </div>
  );
}
