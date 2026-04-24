import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { CheckCircle } from 'lucide-react';

interface SellConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  autoName: string;
}

const SellConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  autoName,
}: SellConfirmModalProps) => {
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
          <div className='fixed inset-0 bg-black/25' />
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
                <Dialog.Title
                  as='h3'
                  className='text-lg font-medium leading-6 text-gray-900 flex items-center gap-2'
                >
                  <CheckCircle className='text-slate-700' size={24} />
                  Confirmar Venta
                </Dialog.Title>
                <div className='mt-2'>
                  <p className='text-base text-gray-500'>
                    ¿Estás seguro de que deseas marcar como vendido el vehículo{' '}
                    <span className='font-semibold text-gray-700'>
                      {autoName}
                    </span>
                    ? Esta acción no se puede deshacer.
                  </p>
                </div>

                <div className='mt-4 flex justify-end gap-3'>
                  <button
                    type='button'
                    className='inline-flex justify-center rounded-md border border-transparent bg-gray-100 px-4 py-2 text-base font-medium text-gray-900 hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2'
                    onClick={onClose}
                  >
                    Cancelar
                  </button>
                  <button
                    type='button'
                    className='inline-flex justify-center rounded-md border border-transparent bg-slate-700 px-4 py-2 text-base font-medium text-white hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2'
                    onClick={onConfirm}
                  >
                    Confirmar Venta
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default SellConfirmModal;
