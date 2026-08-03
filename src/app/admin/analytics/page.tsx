'use client';

import { useEffect, useState } from 'react';
import {
  BarChart3,
  Users,
  Eye,
  Monitor,
  Smartphone,
  Tablet,
} from 'lucide-react';

type AnalyticsData = {
  summary: {
    users: number;
    pageViews: number;
  };
  devices: { device: string; users: number }[];
};

// Escala de opacidad sobre el color-primary-admin
// La porción más grande lleva la opacidad más alta
const PRIMARY_OPACITIES = [0.75, 0.45, 0.28, 0.18, 0.1];

const DEVICE_LABELS: Record<string, string> = {
  mobile: 'Mobile',
  desktop: 'Desktop',
  tablet: 'Tablet',
  smart_tv: 'Smart TV',
  other: 'Otros',
};

function labelFor(device: string) {
  return DEVICE_LABELS[device.toLowerCase()] ?? device;
}

function deviceIcon(device: string, size = 16, opacity = 1) {
  const d = device.toLowerCase();
  const style = { color: 'currentColor', opacity };
  if (d.includes('mobile')) return <Smartphone size={size} style={style} />;
  if (d.includes('tablet')) return <Tablet size={size} style={style} />;
  return <Monitor size={size} style={style} />;
}

function formatNumber(n: number) {
  return new Intl.NumberFormat('es-AR').format(Math.round(n));
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch('/api/admin/analytics')
      .then(async (res) => {
        const body = await res.json();
        if (!res.ok) throw new Error(body?.error || 'Error al cargar analytics');
        return body as AnalyticsData;
      })
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className='py-6 sm:py-8'>
      {/* Header */}
      <div className='flex items-center gap-3 mb-1'>
        <BarChart3 className='w-7 h-7 text-color-primary-admin' />
        <h1 className='text-2xl sm:text-3xl font-bold text-gray-900'>
          Analytics
        </h1>
      </div>
      <p className='text-sm text-gray-500 mb-6'>Últimos 30 días</p>

      {error && (
        <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6'>
          {error}
        </div>
      )}

      {loading && !data && <Skeleton />}

      {data && (
        <div className='space-y-6'>
          {/* Tarjetas de métricas principales */}
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <MetricCard
              icon={<Users className='w-6 h-6 text-color-primary-admin' />}
              label='Visitas usuarios únicos'
              value={formatNumber(data.summary.users)}
              hint='Personas distintas que entraron al sitio'
            />
            <MetricCard
              icon={<Eye className='w-6 h-6 text-color-primary-admin' />}
              label='Páginas vistas'
              value={formatNumber(data.summary.pageViews)}
              hint={
                data.summary.users > 0
                  ? `En promedio cada usuario visita ${(
                      data.summary.pageViews / data.summary.users
                    ).toLocaleString('es-AR', {
                      maximumFractionDigits: 1,
                    })} secciones de la web`
                  : undefined
              }
            />
          </div>

          {/* Pie de dispositivos */}
          <div className='bg-white rounded-lg border border-gray-200 p-5 sm:p-6'>
            <h2 className='text-base font-semibold text-gray-900 mb-1'>
              Dispositivos
            </h2>
            <p className='text-sm text-gray-500 mb-6'>
              Desde dónde acceden tus visitantes
            </p>

            <DevicesPie devices={data.devices} />
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Componentes auxiliares ---------- */

function MetricCard({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className='bg-white rounded-lg border border-gray-200 p-5'>
      <div className='flex items-center gap-2 text-gray-600 text-sm mb-3'>
        {icon}
        <span className='font-medium'>{label}</span>
      </div>
      <div className='text-4xl font-bold text-gray-900 leading-tight'>
        {value}
      </div>
      {hint && <div className='text-sm text-gray-400 mt-2'>{hint}</div>}
    </div>
  );
}

function Skeleton() {
  return (
    <div className='space-y-6'>
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
        <div className='bg-white rounded-lg border border-gray-200 p-5 h-32 animate-pulse' />
        <div className='bg-white rounded-lg border border-gray-200 p-5 h-32 animate-pulse' />
      </div>
      <div className='bg-white rounded-lg border border-gray-200 p-5 h-80 animate-pulse' />
    </div>
  );
}

/* ---------- Donut chart monocromático ---------- */

function DevicesPie({ devices }: { devices: { device: string; users: number }[] }) {
  const total = devices.reduce((acc, d) => acc + d.users, 0);

  if (total === 0) {
    return (
      <div className='text-sm text-gray-400 py-8 text-center'>
        Sin datos de dispositivos todavía
      </div>
    );
  }

  // Geometría del donut
  const size = 220;
  const cx = size / 2;
  const cy = size / 2;
  const outerR = 96;
  const innerR = 62;
  const gapDeg = devices.length > 1 ? 2 : 0; // separación entre segmentos

  // Ordenar de mayor a menor para que el tono más oscuro vaya al más grande
  const sorted = [...devices].sort((a, b) => b.users - a.users);

  let cumulativeDeg = -90; // empezar arriba

  const segments = sorted.map((d, i) => {
    const fraction = d.users / total;
    const sweep = fraction * 360;
    const startAngle = cumulativeDeg + gapDeg / 2;
    const endAngle = cumulativeDeg + sweep - gapDeg / 2;
    cumulativeDeg += sweep;

    const opacity =
      PRIMARY_OPACITIES[i] ??
      PRIMARY_OPACITIES[PRIMARY_OPACITIES.length - 1];

    return {
      device: d.device,
      users: d.users,
      fraction,
      startAngle,
      endAngle,
      opacity,
      label: labelFor(d.device),
    };
  });

  const topDevice = segments[0];

  return (
    <div className='flex flex-col md:flex-row items-center gap-8 md:gap-12'>
      {/* Donut SVG — usa currentColor + opacidades */}
      <div className='relative flex-shrink-0 text-color-primary-admin'>
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className='w-60 h-60 sm:w-72 sm:h-72'
        >
          <defs>
            <filter
              id='donut-shadow'
              x='-20%'
              y='-20%'
              width='140%'
              height='140%'
            >
              <feDropShadow
                dx='0'
                dy='1'
                stdDeviation='2'
                floodColor='currentColor'
                floodOpacity='0.08'
              />
            </filter>
          </defs>

          {/* Track de fondo sutil */}
          <circle
            cx={cx}
            cy={cy}
            r={(outerR + innerR) / 2}
            fill='none'
            stroke='currentColor'
            strokeOpacity={0.04}
            strokeWidth={outerR - innerR}
          />

          <g filter='url(#donut-shadow)'>
            {segments.map((s) => (
              <path
                key={s.device}
                d={donutSegmentPath(
                  cx,
                  cy,
                  outerR,
                  innerR,
                  s.startAngle,
                  s.endAngle
                )}
                fill='currentColor'
                fillOpacity={s.opacity}
              />
            ))}
          </g>

          {/* Texto central */}
          <text
            x={cx}
            y={cy - 10}
            textAnchor='middle'
            fontSize='11'
            fill='#9ca3af'
            fontWeight='600'
            letterSpacing='0.12em'
          >
            TOTAL
          </text>
          <text
            x={cx}
            y={cy + 14}
            textAnchor='middle'
            fontSize='30'
            fontWeight='800'
            fill='#111827'
          >
            {formatNumber(total)}
          </text>
          <text
            x={cx}
            y={cy + 32}
            textAnchor='middle'
            fontSize='11'
            fill='#9ca3af'
          >
            visitantes
          </text>
        </svg>
      </div>

      {/* Leyenda + insight (también usa currentColor) */}
      <div className='flex-1 w-full text-color-primary-admin'>
        <ul className='space-y-4 mb-5'>
          {segments.map((s) => (
            <li key={s.device} className='space-y-1.5'>
              <div className='flex items-center justify-between gap-3'>
                <div className='flex items-center gap-2 min-w-0'>
                  {deviceIcon(s.device, 18, s.opacity)}
                  <span className='text-sm font-medium text-gray-800 truncate'>
                    {s.label}
                  </span>
                </div>
                <div className='text-sm text-right shrink-0'>
                  <span className='font-semibold text-gray-900'>
                    {Math.round(s.fraction * 100)}%
                  </span>
                  <span className='text-gray-400 ml-2'>
                    {formatNumber(s.users)}
                  </span>
                </div>
              </div>
              {/* Barra de progreso del segmento */}
              <div className='h-1.5 rounded-full overflow-hidden bg-current/5'>
                <div
                  className='h-full rounded-full transition-all bg-current'
                  style={{
                    width: `${s.fraction * 100}%`,
                    opacity: s.opacity,
                  }}
                />
              </div>
            </li>
          ))}
        </ul>

        {/* Insight contextual */}
        {topDevice && topDevice.fraction >= 0.5 && (
          <div className='border border-current/10 bg-current/[0.04] rounded-md px-4 py-3 text-sm text-gray-700'>
            <span className='font-semibold text-color-primary-admin'>
              {Math.round(topDevice.fraction * 100)}%
            </span>{' '}
            de tus visitantes accede desde{' '}
            <span className='font-semibold text-gray-900'>
              {topDevice.label.toLowerCase()}
            </span>
            .
          </div>
        )}
      </div>
    </div>
  );
}

/** Construye el path SVG de un segmento de donut (annulus) entre dos ángulos en grados. */
function donutSegmentPath(
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  startAngleDeg: number,
  endAngleDeg: number
) {
  const startRad = (startAngleDeg * Math.PI) / 180;
  const endRad = (endAngleDeg * Math.PI) / 180;
  const sweep = endAngleDeg - startAngleDeg;
  const largeArc = sweep > 180 ? 1 : 0;

  // Si es un único segmento que cubre casi todo, lo dibujamos como dos arcos
  if (sweep >= 359.99) {
    return [
      `M ${cx + outerR} ${cy}`,
      `A ${outerR} ${outerR} 0 1 1 ${cx - outerR} ${cy}`,
      `A ${outerR} ${outerR} 0 1 1 ${cx + outerR} ${cy}`,
      `Z`,
      `M ${cx + innerR} ${cy}`,
      `A ${innerR} ${innerR} 0 1 0 ${cx - innerR} ${cy}`,
      `A ${innerR} ${innerR} 0 1 0 ${cx + innerR} ${cy}`,
      `Z`,
    ].join(' ');
  }

  const xOuterStart = cx + outerR * Math.cos(startRad);
  const yOuterStart = cy + outerR * Math.sin(startRad);
  const xOuterEnd = cx + outerR * Math.cos(endRad);
  const yOuterEnd = cy + outerR * Math.sin(endRad);
  const xInnerStart = cx + innerR * Math.cos(endRad);
  const yInnerStart = cy + innerR * Math.sin(endRad);
  const xInnerEnd = cx + innerR * Math.cos(startRad);
  const yInnerEnd = cy + innerR * Math.sin(startRad);

  return [
    `M ${xOuterStart} ${yOuterStart}`,
    `A ${outerR} ${outerR} 0 ${largeArc} 1 ${xOuterEnd} ${yOuterEnd}`,
    `L ${xInnerStart} ${yInnerStart}`,
    `A ${innerR} ${innerR} 0 ${largeArc} 0 ${xInnerEnd} ${yInnerEnd}`,
    `Z`,
  ].join(' ');
}
