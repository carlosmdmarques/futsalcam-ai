'use strict';

// Compare the entire original frame before any digital crop or zoom.
function measureMotion(frame, previous, width, height, roi, threshold, minimumPercent) {
  const left = Math.floor(roi.left * width), right = Math.ceil(roi.right * width);
  const top = Math.floor(roi.top * height), bottom = Math.ceil(roi.bottom * height);
  const pixels = (right - left) * (bottom - top);
  const columns = Math.ceil(width / 12);
  const rows = Math.ceil(height / 12);
  const cells = Array.from({length: columns * rows}, () => ({count: 0, weight: 0, x: 0, y: 0}));
  let active = 0;
  for (let y = top; y < bottom; y++) {
    for (let x = left; x < right; x++) {
      const index = y * width + x;
      const delta = Math.abs(frame[index] - previous[index]);
      if (delta < threshold) continue;
      active++;
      const cell = cells[Math.floor(y / 12) * columns + Math.floor(x / 12)];
      const weight = Math.min(80, delta);
      cell.count++;
      cell.weight += weight;
      cell.x += (x + 0.5) * weight;
      cell.y += (y + 0.5) * weight;
    }
  }
  const percent = active * 100 / pixels;
  const minimum = Math.max(4, Math.ceil(pixels * minimumPercent / 100));
  if (percent > 55) return {percent, reason: 'Alteração global da imagem'};
  let best = {weight: 0};
  // Overlapping 2×2 neighbourhoods keep a small moving group together across tile edges.
  if (active >= minimum) {
    for (let y = 0; y < rows - 1; y++) {
      for (let x = 0; x < columns - 1; x++) {
        const i = y * columns + x;
        const group = [cells[i], cells[i+1], cells[i+columns], cells[i+columns+1]];
        const count = group.reduce((sum, cell) => sum + cell.count, 0);
        if (count < minimum) continue;
        const weight = group.reduce((sum, cell) => sum + cell.weight, 0);
        if (weight > best.weight) best = {
          weight,
          x: group.reduce((sum, cell) => sum + cell.x, 0) / weight / width,
          y: group.reduce((sum, cell) => sum + cell.y, 0) / weight / height
        };
      }
    }
  }
  return best.weight ? {percent, target: best} : {percent, reason: 'Movimento local abaixo do mínimo'};
}
