import type { Metadata } from 'next';
import { Anton, Archivo, Exo } from 'next/font/google';
import './globals.css';
import { metadataCompany } from './constants/constants';
import { ScrollToTopProvider } from '../components/ScrollToTopProvider';

const archivo = Archivo({ subsets: ['latin'], variable: '--font-archivo' });

const anton = Anton({
  subsets: ['latin'],
  variable: '--font-anton',
  weight: ['400'],
});

const exo = Exo({
  subsets: ['latin'],
  variable: '--font-exo',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  metadataBase: new URL(metadataCompany.metadataBase),
  title: metadataCompany.title,
  description: metadataCompany.description,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='es'>
      <body
        className={`${archivo.variable} ${anton.variable} ${exo.variable} font-archivo font-anton bg-color-bg-primary text-color-text antialiased`}
      >
        <ScrollToTopProvider />
        {children}
      </body>
    </html>
  );
}
