'use client';

import { useState } from 'react';
import { useDropzone, FileWithPath } from 'react-dropzone';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from 'react-beautiful-dnd';
import Image from 'next/image';
import { Image as ImageType } from '@/types/auto';
import { Trash2 } from 'lucide-react';

interface CarImageManagerProps {
  images: ImageType[];
  onUpdate: (formData: FormData) => Promise<void>;
}

export const CarImageManager: React.FC<CarImageManagerProps> = ({
  images: initialImages,
  onUpdate,
}) => {
  const [images, setImages] = useState<ImageType[]>(initialImages);
  const [files, setFiles] = useState<File[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
    },
    onDrop: (acceptedFiles: FileWithPath[]) => {
      setFiles([...files, ...acceptedFiles]);
    },
  });

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(images);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setImages(items);
  };

  const handleDelete = (imageId: string) => {
    setImages(images.filter((img) => img.id !== imageId));
    setImagesToDelete([...imagesToDelete, imageId]);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const formData = new FormData();

      // Agregar nuevas imágenes
      files.forEach((file) => {
        formData.append('images', file);
      });

      // Agregar nuevo orden de imágenes
      const newOrder = images.map((img, index) => ({
        id: img.id,
        order: index,
      }));
      formData.append('imageOrder', JSON.stringify(newOrder));

      // Agregar imágenes a eliminar
      if (imagesToDelete.length > 0) {
        formData.append('imagesToDelete', JSON.stringify(imagesToDelete));
      }

      await onUpdate(formData);

      // Limpiar estados después de guardar
      setFiles([]);
      setImagesToDelete([]);
    } catch (error) {
      console.error('Error al guardar las imágenes:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className='space-y-4'>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId='images' direction='horizontal'>
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4'
            >
              {images.map((image, index) => (
                <Draggable key={image.id} draggableId={image.id} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className='relative aspect-[4/3] group'
                    >
                      <Image
                        src={image.thumbnailUrl}
                        alt={`Imagen ${index + 1}`}
                        fill
                        className='object-cover rounded-lg'
                      />
                      <button
                        onClick={() => handleDelete(image.id)}
                        className='absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity'
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-color-primary bg-color-primary/5'
            : 'border-gray-300 hover:border-color-primary'
        }`}
      >
        <input {...getInputProps()} />
        <p className='text-gray-600'>
          {isDragActive
            ? 'Suelta las imágenes aquí'
            : 'Arrastra imágenes aquí o haz clic para seleccionar'}
        </p>
      </div>

      {(files.length > 0 || imagesToDelete.length > 0) && (
        <div className='flex justify-end'>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className='px-4 py-2 bg-color-primary text-white rounded-lg hover:bg-color-primary/90 transition-colors disabled:opacity-50'
          >
            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      )}
    </div>
  );
};
