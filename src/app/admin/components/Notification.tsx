import { Fragment, useEffect } from 'react';
import { Transition } from '@headlessui/react';
import { CheckCircle, XCircle, X } from 'lucide-react';

interface NotificationProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'success' | 'error';
  message: string;
  duration?: number;
}

export const Notification = ({
  isOpen,
  onClose,
  type,
  message,
  duration = 2000,
}: NotificationProps) => {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);

  return (
    <Transition
      show={isOpen}
      as={Fragment}
      enter='transition ease-out duration-300'
      enterFrom='opacity-0 scale-95'
      enterTo='opacity-100 scale-100'
      leave='transition ease-in duration-200'
      leaveFrom='opacity-100 scale-100'
      leaveTo='opacity-0 scale-95'
    >
      <div className='fixed inset-0 flex items-center justify-center z-50 pointer-events-none'>
        <div className='bg-white shadow-2xl rounded-lg pointer-events-auto transform transition-all max-w-sm w-full mx-4'>
          <div className='p-6'>
            <div className='flex items-center'>
              <div className='flex-shrink-0'>
                {type === 'success' ? (
                  <div className='bg-green-100 rounded-full p-2'>
                    <CheckCircle className='h-8 w-8 text-green-600' />
                  </div>
                ) : (
                  <div className='bg-red-100 rounded-full p-2'>
                    <XCircle className='h-8 w-8 text-red-600' />
                  </div>
                )}
              </div>
              <div className='ml-4 flex-1'>
                <p className='text-base font-medium text-gray-900'>{message}</p>
              </div>
              <div className='ml-4 flex-shrink-0'>
                <button
                  type='button'
                  className='inline-flex text-gray-400 hover:text-gray-500 focus:outline-none'
                  onClick={onClose}
                >
                  <span className='sr-only'>Cerrar</span>
                  <X className='h-5 w-5' />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  );
};
