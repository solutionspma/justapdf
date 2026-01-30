export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const baseUrl = process.env.NATIVE_EDIT_URL || '';
  if (!baseUrl) {
    return { statusCode: 500, body: 'Native edit service not configured.' };
  }

  try {
    const response = await fetch(`${baseUrl}/native-edit`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: event.body || '{}'
    });
    const body = await response.text();
    return {
      statusCode: response.status,
      headers: { 'content-type': response.headers.get('content-type') || 'application/json' },
      body
    };
  } catch (error) {
    return {
      statusCode: 502,
      body: JSON.stringify({ ok: false, error: error?.message || 'Native edit proxy failed.' })
    };
  }
};
