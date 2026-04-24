'use client';

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Zap, Star } from 'lucide-react';

interface LimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'destacado' | 'favorito';
}

export function LimitModal({ isOpen, onClose, type }: LimitModalProps) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as='div' className='relative z-50' onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter='ease-out duration-300'
          enterFrom='opacity-0'
          enterTo='opacity-100'
          leave='ease-in duration-200'
          leaveFrom='opacity-100'
          leaveTo='opacity-0'
        >
          <div className='fixed inset-0 bg-black bg-opacity-25' />
        </Transition.Child>

        <div className='fixed inset-0 overflow-y-auto'>
          <div className='flex min-h-full items-center justify-center p-4 text-center'>
            <Transition.Child
              as={Fragment}
              enter='ease-out duration-300'
              enterFrom='opacity-0 scale-95'
              enterTo='opacity-100 scale-100'
              leave='ease-in duration-200'
              leaveFrom='opacity-100 scale-100'
              leaveTo='opacity-0 scale-95'
            >
              <Dialog.Panel className='w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all'>
                <div className='flex items-center gap-4'>
                  <div
                    className={`flex-shrink-0 w-12 h-12 rounded-full ${
                      type === 'destacado' ? 'bg-blue-100' : 'bg-yellow-100'
                    } flex items-center justify-center`}
                  >
                    {type === 'destacado' ? (
                      <Zap
                        className='h-6 w-6 text-blue-600'
                        fill='currentColor'
                      />
                    ) : (
                      <Star
                        className='h-6 w-6 text-yellow-600'
                        fill='currentColor'
                      />
                    )}
                  </div>
                  <div>
                    <Dialog.Title
                      as='h3'
                      className='text-lg font-medium leading-6 text-gray-900'
                    >
                      {type === 'destacado'
                        ? 'Límite de ingresos alcanzado'
                        : 'Límite de destacados alcanzado'}
                    </Dialog.Title>
                    <p className='mt-2 text-base text-gray-500'>
                      Ya tenés 10/10 vehículos{' '}
                      {type === 'destacado' ? 'en ingresos' : 'destacados'}.
                      Para agregar uno nuevo, primero tenés que quitar otro de
                      la lista.
                    </p>
                  </div>
                </div>

                <div className='mt-6 flex justify-end'>
                  <button
                    type='button'
                    className={`inline-flex justify-center rounded-md border border-transparent ${
                      type === 'destacado'
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : 'bg-yellow-600 hover:bg-yellow-700'
                    } px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      type === 'destacado'
                        ? 'focus:ring-blue-500'
                        : 'focus:ring-yellow-500'
                    }`}
                    onClick={onClose}
                  >
                    Entendido
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
