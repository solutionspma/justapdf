import express from 'express';

const router = express.Router();

function buildNativeEditUrl(base) {
  const trimmed = base.endsWith('/') ? base.slice(0, -1) : base;
  return `${trimmed}/native-edit`;
}

router.post('/', async (req, res) => {
  const nativeEditUrl = process.env.NATIVE_EDIT_URL;
  if (!nativeEditUrl) {
    res.status(503).json({ ok: false, error: 'Native edit service not configured.' });
    return;
  }

  try {
    const payload = {
      ...req.body,
      engine: req.body?.engine || process.env.NATIVE_EDIT_ENGINE || 'pdfium'
    };

    const response = await fetch(buildNativeEditUrl(nativeEditUrl), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      res.status(response.status).json({ ok: false, error: data.error || 'Native edit failed.' });
      return;
    }

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ ok: false, error: error?.message || 'Native edit failed.' });
  }
});

export default router;
