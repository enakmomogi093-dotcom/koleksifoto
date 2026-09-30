module.exports = async (req, res) => {
  const { GITHUB_TOKEN: t, GITHUB_REPO: r, GITHUB_BRANCH: b = 'main' } = process.env;
  res.setHeader('Cache-Control', 'no-store');
  try {
    const x = await fetch(`https://api.github.com/repos/${r}/contents/photos?ref=${b}`, {
      headers: { Authorization: `Bearer ${t}`, 'User-Agent': 'koleksi-foto', Accept: 'application/vnd.github+json' }
    });
    if (x.status === 404) return res.status(200).json([]);
    if (!x.ok) return res.status(500).json({ error: 'GitHub error ' + x.status });
    const d = await x.json();
    const list = d
      .filter(f => /\.(jpe?g|png|webp|gif)$/i.test(f.name))
      .map(f => ({
        name: f.name,
        url: `https://raw.githubusercontent.com/${r}/${b}/photos/${encodeURIComponent(f.name)}`
      }))
      .reverse();
    res.status(200).json(list);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
