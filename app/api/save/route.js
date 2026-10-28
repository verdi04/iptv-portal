import { supabase } from '@/lib/supabase';
import { encryptIptvFields } from '@/lib/iptv-crypto';

export async function POST(request) {
  let body;

  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: 'Request body must be valid JSON.' },
      { status: 400 },
    );
  }

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return Response.json(
      { error: 'Request body must be a JSON object.' },
      { status: 400 },
    );
  }

  const {
    mac_address,
    m3u_link,
    xtream_url,
    xtream_username,
    xtream_password,
  } = body;

  if (typeof mac_address !== 'string' || !mac_address.trim()) {
    return Response.json(
      { error: 'mac_address is required.' },
      { status: 400 },
    );
  }

  const optionalFields = {
    m3u_link,
    xtream_url,
    xtream_username,
    xtream_password,
  };

  for (const [field, value] of Object.entries(optionalFields)) {
    if (value !== undefined && value !== null && typeof value !== 'string') {
      return Response.json(
        { error: `${field} must be a string or null.` },
        { status: 400 },
      );
    }
  }

  try {
    const record = {
      mac_address: mac_address.trim(),
      m3u_link: m3u_link ?? null,
      xtream_url: xtream_url ?? null,
      xtream_username: xtream_username ?? null,
      xtream_password: xtream_password ?? null,
    };
    const { error } = await supabase.from('iptv_users').upsert(
      { ...record, ...encryptIptvFields(record) },
      { onConflict: 'mac_address' },
    );

    if (error) {
      throw error;
    }

    return Response.json({ message: 'IPTV user saved successfully.' });
  } catch (error) {
    console.error('Failed to save IPTV user:', error);

    return Response.json(
      { error: 'Failed to save IPTV user.' },
      { status: 500 },
    );
  }
}
