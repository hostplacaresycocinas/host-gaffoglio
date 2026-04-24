import { type CSSProperties, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

const italyLineMask: CSSProperties = {
  WebkitMaskImage:
    'linear-gradient(90deg, transparent 0%, #000 18%, #000 82%, transparent 100%)',
  WebkitMaskSize: '100% 100%',
  WebkitMaskRepeat: 'no-repeat',
  maskImage:
    'linear-gradient(90deg, transparent 0%, #000 18%, #000 82%, transparent 100%)',
  maskSize: '100% 100%',
  maskRepeat: 'no-repeat',
};

const titleBaseClass =
  'text-white/90 text-2xl sm:text-3xl md:text-4xl leading-tight font-semibold tracking-tight';

const subtitleVariantClass = {
  section:
    'text-white/80 text-sm sm:text-base md:text-lg leading-relaxed',
  banner:
    'text-white/90 text-lg sm:text-xl md:text-2xl font-semibold tracking-tight [text-shadow:0px_0px_10px_rgba(0,0,0,0.6)]',
} as const;

type SectionTitleItalyProps = {
  title: ReactNode;
  as?: 'h1' | 'h2' | 'h3';
  className?: string;
  titleClassName?: string;
  subtitle?: ReactNode;
  subtitleClassName?: string;
  subtitleVariant?: 'section' | 'banner';
};

export function SectionTitleItaly({
  title,
  as: Tag = 'h2',
  className,
  titleClassName,
  subtitle,
  subtitleClassName,
  subtitleVariant = 'section',
}: SectionTitleItalyProps) {
  const showSubtitle =
    subtitle != null && subtitle !== false && subtitle !== '';

  return (
    <div
      className={cn('text-center mb-4 md:mb-6 lg:mb-8', className)}
    >
      <Tag className={cn(titleBaseClass, titleClassName)}>{title}</Tag>
      <div
        className='mx-auto mt-2 h-0.5 w-full max-w-[16rem] sm:max-w-xs rounded-full'
        style={italyLineMask}
        role='presentation'
        aria-hidden
      >
        <div className='flex h-full w-full overflow-hidden rounded-full'>
          <div className='min-w-0 flex-1 bg-[#009246]' />
          <div className='min-w-0 flex-1 bg-white/80' />
          <div className='min-w-0 flex-1 bg-[#CE2B37]' />
        </div>
      </div>
      {showSubtitle &&
        (typeof subtitle === 'string' || typeof subtitle === 'number' ? (
          <p
            className={cn(
              'mt-3 max-w-3xl mx-auto text-center',
              subtitleVariantClass[subtitleVariant],
              subtitleClassName,
            )}
          >
            {subtitle}
          </p>
        ) : (
          <div
            className={cn('mt-3 max-w-3xl mx-auto text-center', subtitleClassName)}
          >
            {subtitle}
          </div>
        ))}
    </div>
  );
}
