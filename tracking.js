'use strict';

// Pick compact, bright details that have moved against their immediate surroundings.
// Sizes are in pixels of the analysis image, never of the digital crop.
function compactCandidates(image, previous, width, height, roi, threshold) {
  const left = Math.max(5, Math.ceil(roi.left * width));
  const right = Math.min(width - 5, Math.floor(roi.right * width));
  const top = Math.max(5, Math.ceil(roi.top * height));
  const bottom = Math.min(height - 5, Math.floor(roi.bottom * height));
  const candidates = [];
  for (let y = top; y < bottom; y++) {
    for (let x = left; x < right; x++) {
      const i = y * width + x, value = image[i];
      if (value < 125 || value - previous[i] < Math.max(8, threshold)) continue;
      if (value < image[i-1] || value <= image[i+1] || value < image[i-width] || value <= image[i+width]) continue;
      const r = 4, dy = r * width;
      const surround = Math.max(image[i-r], image[i+r], image[i-dy], image[i+dy]);
      const isolation = value - surround;
      if (isolation < 24) continue;
      // Flat spots on floor markings and edges often extend along a diagonal.
      const diagonal = Math.max(image[i-3*width-3], image[i+3*width+3],
        image[i-3*width+3], image[i+3*width-3]);
      if (value - diagonal < 15) continue;
      candidates.push({x:x/width, y:y/height, score:isolation});
    }
  }
  return candidates.sort((a,b) => b.score-a.score).slice(0,40);
}

class CompactTracker {
  constructor() { this.paths = []; }
  update(points, time) {
    const next = [], claimed = new Set();
    // Give established paths the first opportunity to continue.
    for (const path of this.paths) {
      const dt = time-path.time;
      if (dt <= 0 || dt > .35) continue;
      const px = path.x+path.vx*dt, py = path.y+path.vy*dt;
      let distance = Math.min(.09, .016 + dt*(path.count > 1 ? .35 : .55)), match = -1;
      for (let i=0; i<points.length; i++) {
        if (claimed.has(i)) continue;
        const d = Math.hypot(points[i].x-px, (points[i].y-py)*.65);
        if (d < distance) { distance = d; match = i; }
      }
      if (match < 0) { next.push(path); continue; }
      claimed.add(match);
      const p = points[match];
      next.push({...path, ...p, time, count:path.count+1,
        vx:.35*path.vx+.65*(p.x-path.x)/dt, vy:.35*path.vy+.65*(p.y-path.y)/dt});
    }
    points.forEach((p,i) => {
      if (!claimed.has(i)) next.push({...p,time,count:1,vx:0,vy:0,startX:p.x,startY:p.y});
    });
    this.paths = next.sort((a,b) => b.count-a.count || b.score-a.score).slice(0,60);
    const plausible = this.paths.filter(p => p.time===time && p.count>=3 &&
      Math.hypot(p.x-p.startX,(p.y-p.startY)*.65)>.012);
    if (!plausible.length) return null;
    const best = plausible[0];
    if (plausible.some(p => Math.hypot(p.x-best.x,p.y-best.y)>.09)) return null;
    return best;
  }
}
