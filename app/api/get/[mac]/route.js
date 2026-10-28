import { supabase } from '@/lib/supabase';
import { decryptIptvFields } from '@/lib/iptv-crypto';

export async function GET(_request, { params }) {
  try {
    const { mac } = await params;

    if (!mac?.trim()) {
      return Response.json(
        { success: false, error: 'mac is required.' },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from('iptv_users')
      .select('*')
      .eq('mac_address', mac.trim())
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return Response.json(
        { success: false, error: 'IPTV user not found.' },
        { status: 404 },
      );
    }

    return Response.json({ success: true, data: decryptIptvFields(data) });
  } catch (error) {
    console.error('Failed to get IPTV user:', error);

    return Response.json(
      { success: false, error: 'Failed to get IPTV user.' },
      { status: 500 },
    );
  }
}
