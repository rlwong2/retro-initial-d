const FONT = '"Press Start 2P", monospace';

// Copies the WebGL frame, adds a caption bar, and downloads it as a PNG.
export async function exportCarImage({ gl, scene, camera }, { carName, lines, fileName }) {
  gl.render(scene, camera);
  const src = gl.domElement;
  const scale = Math.max(1, Math.round(1600 / src.width));
  const w = src.width * scale;
  const h = src.height * scale;
  const bar = 26 * Math.max(2, Math.round(scale / 2));

  const out = document.createElement('canvas');
  out.width = w;
  out.height = h + bar;
  const ctx = out.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(src, 0, 0, w, h);

  try {
    await document.fonts.load(`16px ${FONT}`);
  } catch {
    // fall back to the monospace font
  }

  const unit = bar / 6;
  ctx.fillStyle = '#0b0b1a';
  ctx.fillRect(0, h, w, bar);
  ctx.fillStyle = '#ff2e88';
  ctx.fillRect(0, h, w, Math.max(4, Math.round(unit / 2)));

  ctx.textBaseline = 'middle';
  ctx.font = `${Math.round(unit * 1.6)}px ${FONT}`;
  ctx.fillStyle = '#ffd400';
  ctx.fillText(carName.toUpperCase(), unit * 2, h + bar * 0.38);
  ctx.font = `${Math.round(unit)}px ${FONT}`;
  ctx.fillStyle = '#00e5ff';
  ctx.fillText(lines.join('  /  ').toUpperCase(), unit * 2, h + bar * 0.75);
  ctx.textAlign = 'right';
  ctx.fillStyle = '#b6ff00';
  ctx.fillText('TOFU DELIVERY GARAGE', w - unit * 2, h + bar * 0.38);

  const blob = await new Promise((resolve) => out.toBlob(resolve, 'image/png'));
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
