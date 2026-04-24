'use client';

import { navigation, company } from '@/app/constants/constants';
import { useNavbarStore } from '@/store/navbarStore';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';

import HamburguerIcon from './icons/HamburguerIcon';
import CloseIcon from './icons/CloseIcon';

const Header = () => {
  const { isMenuOpen, setIsMenuOpen } = useNavbarStore();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isFilledHeader = isScrolled || isMenuOpen;
  const isHome = pathname === '/';

  return (
    <header
      className={`${
        isHome ? 'fixed' : 'sticky'
      } top-0 left-0 w-full z-30 flex justify-center h-24 ${
        isHome
          ? 'bg-gradient-to-b from-color-bg-secondary-dark to-transparent'
          : 'bg-color-bg-secondary-dark'
      }`}
    >
      {isHome && (
        <div
          className={`absolute inset-0 bg-color-bg-secondary-dark transition-opacity duration-500 ease-out ${
            isFilledHeader ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}

      <section className='relative z-10 flex justify-between items-center gap-3 md:gap-8 lg:gap-20 py-5 max-w-7xl w-full mx-4 sm:mx-6 md:mx-8 lg:mx-10'>
        <article className='flex w-full'>
          <Link
            className='flex items-center gap-3 md:gap-4'
            href='/'
            onClick={() => setIsMenuOpen(false)}
          >
            {company.favicon ? (
              <>
                <Image
                  priority
                  className='w-[90px] h-[65px] sm:w-[95px] sm:h-[70px] lg:w-[110px] lg:h-[80px] object-contain'
                  // className={`w-[65px] h-[65px] sm:w-[70px] sm:h-[70px] lg:w-[75px] lg:h-[75px] ring-[1.5px] ${
                  //   company.darkmode
                  //     ? 'ring-color-bg-primary'
                  //     : company.dark
                  //     ? 'ring-color-bg-secondary'
                  //     : 'ring-color-bg-primary'
                  // }  rounded-full`}
                  src='/assets/company/favicon.webp'
                  alt={`${company.name} favicon`}
                  width={64}
                  height={64}
                />
                <div className='h-14 w-44 sm:w-48 md:w-56'>
                  <Image
                    priority
                    className='h-full w-full object-contain object-left'
                    src='/assets/company/logo.webp'
                    alt={`${company.name} logo`}
                    width={116}
                    height={56}
                  />
                </div>
              </>
            ) : (
              <div className='h-14 md:h-16 w-52 sm:w-56 lg:w-64'>
                <Image
                  priority
                  className='h-full w-full object-contain object-left'
                  src='/assets/company/logo.webp'
                  alt={`${company.name} logo`}
                  width={116}
                  height={56}
                />
              </div>
            )}
          </Link>
        </article>
        <nav className='hidden md:block'>
          <ul className='flex items-center gap-8 lg:gap-12'>
            {navigation.map((nav) => {
              const isActive = pathname === nav.url;
              return (
                <li key={nav.id} className='relative'>
                  <Link
                    className={`${
                      company.darkmode
                        ? `text-color-text-light hover:text-color-title-light ${
                            isActive && 'text-color-title-light'
                          }`
                        : `text-color-text hover:text-color-title ${
                            isActive && 'text-color-title'
                          }`
                    } font-medium transition-all duration-300`}
                    href={nav.url}
                  >
                    {nav.title}
                  </Link>
                  {isActive && (
                    <span
                      className={`absolute -bottom-2 left-0 w-full scale-x-110 h-0.5 ${
                        company.dark
                          ? 'bg-color-primary-dark'
                          : 'bg-color-primary'
                      } transition-all duration-300`}
                    ></span>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
        <article className='md:hidden flex justify-end items-center gap-2 sm:gap-3 lg:gap-5'>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`${
              company.darkmode
                ? 'text-color-text-light hover:text-color-title-light'
                : 'text-color-text hover:text-color-title'
            } transition-all`}
          >
            {isMenuOpen ? (
              <CloseIcon className='w-8 h-8' />
            ) : (
              <HamburguerIcon className='w-8 h-8' />
            )}
          </button>
        </article>
        <div className='md:hidden overflow-hidden absolute top-24 left-1/2 -translate-x-1/2 h-svh w-screen pointer-events-none'>
          <nav
            className={`${
              isMenuOpen ? 'right-0' : '-right-full'
            } absolute top-0 h-full w-1/2 ${
              company.darkmode
                ? 'bg-color-bg-secondary-dark'
                : 'bg-color-bg-primary'
            }  transition-all duration-300 pointer-events-auto`}
          >
            <ul className='flex flex-col gap-2 p-5'>
              {navigation.map((nav) => {
                const isActive = pathname === nav.url;
                return (
                  <li key={nav.id} className='relative'>
                    <Link
                      className={`${
                        company.darkmode
                          ? 'text-color-text-light hover:text-color-title-light'
                          : 'text-color-text font-medium hover:text-color-title'
                      } text-lg transition-colors block py-2`}
                      href={nav.url}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {nav.title}
                      {isActive && (
                        <span className='absolute left-0 -bottom-1 w-8 h-0.5 bg-color-primary'></span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <div
            onClick={() => setIsMenuOpen(false)}
            className={`${
              isMenuOpen
                ? 'opacity-100 pointer-events-auto'
                : 'opacity-0 pointer-events-none'
            } absolute top-0 left-0 h-full w-full bg-black/50 -z-10 transition-opacity`}
          ></div>
        </div>
      </section>
    </header>
  );
};

export default Header;
