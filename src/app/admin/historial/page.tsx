'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Cookies from 'js-cookie';
import { RefreshCw, Trash2 } from 'lucide-react';
import { ConfirmModal } from '../components/ConfirmModal';
import { Notification } from '../components/Notification';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { useRouter } from 'next/navigation';
import { API_BASE_URL, TENANT } from '@/app/constants/constants';

interface AutoVendido {
  id: string;
  brand: string;
  model: string;
  year: number;
  price: string;
  thumbnailUrl: string;
  sellDate: string;
  createdAt: string;
  updatedAt: string;
  currency: string;
}

interface ApiResponse {
  total: number;
  totalPages: number;
  currentPage: number;
  sells: AutoVendido[];
}

export default function HistorialPage() {
  const router = useRouter();
  const [autosVendidos, setAutosVendidos] = useState<AutoVendido[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [eliminando, setEliminando] = useState<string | null>(null);
  const [ventaAEliminar, setVentaAEliminar] = useState<AutoVendido | null>(
    null
  );
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAutos, setTotalAutos] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [notification, setNotification] = useState({
    isOpen: false,
    message: '',
    type: 'success' as 'success' | 'error',
  });

  const handleUnauthorized = () => {
    // Remover el token
    Cookies.remove('admin-auth');
    // Redirigir al login
    router.push('/admin/login');
  };

  const fetchAutosVendidos = async (page = 1, append = false) => {
    if (page === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    setError(null);
    try {
      const token = Cookies.get('admin-auth');
      const response = await fetch(
        `${API_BASE_URL}/api/sells?page=${page}&limit=12&tenant=${TENANT}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 403) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        throw new Error(
          `Error ${response.status}: No se pudieron cargar los autos vendidos`
        );
      }

      const data: ApiResponse = await response.json();

      setAutosVendidos((prev) =>
        append ? [...prev, ...data.sells] : data.sells
      );
      setCurrentPage(data.currentPage);
      setTotalPages(data.totalPages);
      setTotalAutos(data.total);
    } catch (error) {
      console.error('Error al cargar los autos vendidos:', error);
      setError(
        error instanceof Error
          ? error.message
          : 'Error al cargar los autos vendidos'
      );
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = () => {
    if (currentPage < totalPages && !loadingMore) {
      fetchAutosVendidos(currentPage + 1, true);
    }
  };

  const observer = useInfiniteScroll({
    onLoadMore: loadMore,
    hasMore: currentPage < totalPages,
    loading: loadingMore,
  });

  // Crear una referencia para el elemento observado
  const observerRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (node !== null && currentPage < totalPages && !loadingMore) {
        observer.current?.observe(node);
      }
    },
    [currentPage, totalPages, loadingMore]
  );

  const confirmarEliminarVenta = (auto: AutoVendido) => {
    setVentaAEliminar(auto);
    setDeleteModalOpen(true);
  };

  const eliminarVenta = async () => {
    if (!ventaAEliminar) return;

    setEliminando(ventaAEliminar.id);
    try {
      const token = Cookies.get('admin-auth');
      const response = await fetch(
        `${API_BASE_URL}/api/sells/${ventaAEliminar.id}?tenant=${TENANT}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        }
      );

      if (response.status === 403) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        throw new Error('Error al eliminar la venta');
      }

      // Eliminar la venta de la lista
      setAutosVendidos((prev) =>
        prev.filter((auto) => auto.id !== ventaAEliminar.id)
      );

      // Actualizar el contador total
      setTotalAutos((prev) => prev - 1);

      // Mostrar notificación de éxito
      setNotification({
        isOpen: true,
        type: 'success',
        message: 'Venta eliminada con éxito',
      });

      // Cerrar el modal
      setDeleteModalOpen(false);
      setVentaAEliminar(null);
    } catch (error) {
      console.error('Error al eliminar la venta:', error);
      setNotification({
        isOpen: true,
        type: 'error',
        message:
          error instanceof Error ? error.message : 'Error al eliminar la venta',
      });
    } finally {
      setEliminando(null);
    }
  };

  useEffect(() => {
    fetchAutosVendidos();
  }, []);

  if (loading && autosVendidos.length === 0) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-color-primary-admin'></div>
      </div>
    );
  }

  return (
    <div className='max-w-7xl my-10'>
      <div className='flex justify-between items-center mb-6'>
        <div className='flex flex-col'>
          <h1 className='text-2xl font-semibold text-color-text'>
            Historial de Ventas{' '}
            {loading && (
              <RefreshCw className='inline ml-2 h-5 w-5 animate-spin' />
            )}
          </h1>
          <p className='text-gray-500'>
            Total: <span className='font-medium'>{totalAutos}</span> ventas
          </p>
        </div>
      </div>

      {error && (
        <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6'>
          {error}
        </div>
      )}

      {autosVendidos.length === 0 && !loading && !error ? (
        <div className='text-center py-10 bg-gray-50 rounded-lg'>
          <p className='text-gray-500'>No hay autos vendidos para mostrar</p>
        </div>
      ) : (
        <div className='space-y-6'>
          {autosVendidos.map((auto, idx) => (
            <motion.div
              key={auto.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className='bg-white rounded-lg [box-shadow:0_0_10px_rgba(0,0,0,0.07)] p-6'
            >
              <div className='flex flex-col md:flex-row gap-6'>
                <div className='relative w-[135px] aspect-[4/3] md:w-[150px] flex-shrink-0'>
                  {auto.thumbnailUrl ? (
                    <Image
                      priority={idx < 4 ? true : false}
                      src={auto.thumbnailUrl}
                      alt={`${auto.model}`}
                      fill
                      className='object-cover rounded-lg'
                    />
                  ) : (
                    <div className='w-full h-full flex items-center justify-center bg-gray-100 rounded-lg'>
                      <span className='text-gray-400'>Sin imagen</span>
                    </div>
                  )}
                  <div className='absolute top-3 right-3 bg-red-500 text-white px-3 py-1.5 rounded-full text-base font-medium'>
                    Vendido
                  </div>
                </div>
                <div className='flex-grow'>
                  <div className='space-y-4'>
                    <div className='flex justify-between items-start'>
                      <div>
                        <h3 className='text-xl font-semibold text-color-text'>
                          {auto.model}
                        </h3>
                        <p className='text-gray-600 mt-1'>{auto.year}</p>
                      </div>
                      <button
                        onClick={() => confirmarEliminarVenta(auto)}
                        disabled={eliminando === auto.id}
                        className='text-red-500 hover:text-red-700 p-2 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-red-200'
                        title='Eliminar venta'
                      >
                        {eliminando === auto.id ? (
                          <div className='h-5 w-5 border-t-2 border-red-500 border-solid rounded-full animate-spin'></div>
                        ) : (
                          <Trash2 size={20} />
                        )}
                      </button>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                      {auto.price && parseFloat(auto.price) > 0 ? (
                        <div>
                          <p className='text-base text-gray-500'>
                            Precio de venta
                          </p>
                          {auto.price && parseFloat(auto.price) > 0 ? (
                            <p className='text-xl font-bold text-color-primary-admin mt-1'>
                              {auto.currency === 'ARS' ? '$' : 'US$'}
                              {parseFloat(auto.price).toLocaleString(
                                auto.currency === 'ARS' ? 'es-AR' : 'en-US'
                              )}
                            </p>
                          ) : (
                            ''
                          )}
                        </div>
                      ) : (
                        ''
                      )}

                      <div>
                        <p className='text-base text-gray-500'>
                          Fecha de venta
                        </p>
                        <p className='text-lg font-medium text-gray-700 mt-1'>
                          {new Date(auto.sellDate).toLocaleDateString('es-AR')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          {currentPage < totalPages && !loadingMore && (
            <div ref={observerRef} className='h-10'></div>
          )}
          {loadingMore && (
            <div className='py-6 flex justify-center items-center'>
              <div className='animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-color-primary-admin'></div>
              <span className='ml-3 text-gray-600'>Cargando más ventas...</span>
            </div>
          )}
        </div>
      )}

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setVentaAEliminar(null);
        }}
        onConfirm={eliminarVenta}
        title='Eliminar Venta'
        message={`¿Estás seguro de que deseas eliminar la venta del ${ventaAEliminar?.model} ${ventaAEliminar?.year}? Esta acción no se puede deshacer.`}
        confirmText='Eliminar'
      />

      <Notification
        isOpen={notification.isOpen}
        onClose={() => setNotification((prev) => ({ ...prev, isOpen: false }))}
        type={notification.type}
        message={notification.message}
      />
    </div>
  );
}
