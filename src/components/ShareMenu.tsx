'use client';

import { useState, useEffect, useRef } from 'react';
import ShareIcon from '@/components/icons/ShareIcon';
import CopyIcon from '@/components/icons/CopyIcon';

interface ShareMenuProps {
  url: string;
  title: string;
}

const ShareMenu = ({ url, title }: ShareMenuProps) => {
  const [canNativeShare, setCanNativeShare] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    setCanNativeShare(!!navigator.share);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleNativeShare = async () => {
    try {
      await navigator.share({
        title: title,
        text: `${title}`,
        url: url,
      });
    } catch (err) {
      console.error('Error al compartir:', err);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopySuccess(true);
      setTimeout(() => {
        setCopySuccess(false);
        setIsOpen(false);
      }, 2000);
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  };

  // Si es móvil y tiene share nativo, usamos el share del sistema
  if (canNativeShare && isMobile) {
    return (
      <button
        onClick={handleNativeShare}
        className='flex items-center justify-center gap-2  text-white rounded transition-colors h-full w-full'
      >
        <ShareIcon className='w-5 h-5' />
        <span>Compartir</span>
      </button>
    );
  }

  return (
    <div className='relative h-full' ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='flex items-center justify-center gap-2  text-white rounded transition-colors h-full w-full'
      >
        <ShareIcon className='w-5 h-5' />
        <span>Compartir</span>
      </button>

      {isOpen && (
        <div className='absolute right-0 mt-2 w-[400px] bg-neutral-800 rounded-lg shadow-lg overflow-hidden z-50 p-3'>
          <div className='flex gap-2 items-center'>
            <input
              type='text'
              readOnly
              value={url}
              className='flex-1 bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white'
              onClick={(e) => (e.target as HTMLInputElement).select()}
            />
            <button
              onClick={handleCopy}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                copySuccess
                  ? 'bg-green-600 text-white'
                  : 'bg-neutral-700 hover:bg-neutral-600 text-white'
              }`}
            >
              <CopyIcon className='w-4 h-4' />
              <span>{copySuccess ? '¡Copiado!' : 'Copiar'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShareMenu;
