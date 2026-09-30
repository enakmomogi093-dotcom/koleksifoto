module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method tidak diizinkan' });
  const { GITHUB_TOKEN: t, GITHUB_REPO: r, GITHUB_BRANCH: b = 'main', ADMIN_PASSWORD: pw } = process.env;
  const { password, image } = req.body || {};

  if (!pw || password !== pw) return res.status(401).json({ error: 'Password salah' });
  if (!image || !image.startsWith('data:image/')) return res.status(400).json({ error: 'Gambar tidak valid' });

  const content = image.split(',')[1];
  const name = `${Date.now()}.jpg`;

  try {
    const x = await fetch(`https://api.github.com/repos/${r}/contents/photos/${name}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${t}`,
        'User-Agent': 'koleksi-foto',
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message: `Tambah foto ${name}`, content, branch: b })
    });
    if (!x.ok) {
      const err = await x.json().catch(() => ({}));
      return res.status(500).json({ error: err.message || 'GitHub error ' + x.status });
    }
    res.status(200).json({ ok: true, name });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
