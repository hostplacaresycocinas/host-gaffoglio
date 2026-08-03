import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { BetaAnalyticsDataClient } from '@google-analytics/data';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getClient() {
  const raw = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
  if (!raw) throw new Error('GOOGLE_APPLICATION_CREDENTIALS_JSON no configurado');
  const credentials = JSON.parse(raw);
  if (credentials.private_key) {
    credentials.private_key = credentials.private_key.replace(/\\n/g, '\n');
  }
  return new BetaAnalyticsDataClient({
    credentials,
    // Forzar transporte HTTP/REST en vez de gRPC nativo
    // (gRPC binario rompe con el bundler de Next.js)
    fallback: true,
  });
}

/**
 * Analytics simplificado para /admin/analytics — siempre últimos 30 días.
 * Devuelve usuarios únicos, páginas vistas y breakdown por dispositivo.
 */
export async function GET() {
  const cookieStore = await cookies();
  if (!cookieStore.get('admin-auth')) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const propertyId = process.env.GA4_PROPERTY_ID;
  if (!propertyId) {
    return NextResponse.json(
      { error: 'GA4_PROPERTY_ID no configurado' },
      { status: 500 }
    );
  }

  const property = `properties/${propertyId}`;
  const dateRanges = [{ startDate: '30daysAgo', endDate: 'today' }];

  try {
    const client = getClient();

    const [summaryRes, devicesRes] = await Promise.all([
      client.runReport({
        property,
        dateRanges,
        metrics: [{ name: 'activeUsers' }, { name: 'screenPageViews' }],
      }),
      client.runReport({
        property,
        dateRanges,
        dimensions: [{ name: 'deviceCategory' }],
        metrics: [{ name: 'activeUsers' }],
        orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
      }),
    ]);

    const summaryRow = summaryRes[0].rows?.[0]?.metricValues ?? [];
    const summary = {
      users: Number(summaryRow[0]?.value ?? 0),
      pageViews: Number(summaryRow[1]?.value ?? 0),
    };

    const devices = (devicesRes[0].rows ?? []).map((r) => ({
      device: r.dimensionValues?.[0]?.value ?? '',
      users: Number(r.metricValues?.[0]?.value ?? 0),
    }));

    return NextResponse.json({ summary, devices });
  } catch (err: unknown) {
    console.error('GA Analytics error:', err);
    const e = err as {
      message?: string;
      details?: string;
      code?: number | string;
      status?: string;
      reason?: string;
    };
    const message =
      e?.details ||
      e?.message ||
      e?.reason ||
      (err instanceof Error ? err.message : 'Error desconocido');
    return NextResponse.json(
      { error: message, code: e?.code, status: e?.status },
      { status: 500 }
    );
  }
}
