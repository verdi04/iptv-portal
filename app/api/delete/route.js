import { supabase } from '@/lib/supabase';

export async function DELETE(request) {
  try {
    const body = await request.json();

    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return Response.json(
        { error: 'Request body must be a JSON object.' },
        { status: 400 },
      );
    }

    const { mac_address } = body;

    if (typeof mac_address !== 'string' || !mac_address.trim()) {
      return Response.json(
        { error: 'mac_address is required.' },
        { status: 400 },
      );
    }

    const { error } = await supabase
      .from('iptv_users')
      .delete()
      .eq('mac_address', mac_address.trim());

    if (error) {
      throw error;
    }

    return Response.json({ message: 'IPTV user deleted successfully.' });
  } catch (error) {
    console.error('Failed to delete IPTV user:', error);

    return Response.json(
      { error: 'Failed to delete IPTV user.' },
      { status: 500 },
    );
  }
}
