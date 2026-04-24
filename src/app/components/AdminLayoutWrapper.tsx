'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';

const AdminLayoutWrapper = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith('/admin');

  return (
    <>
      {!isAdminRoute && <Header />}
      {children}
    </>
  );
};

export default AdminLayoutWrapper;
