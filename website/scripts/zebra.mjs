// Generates public/zebra.svg, the seamless zebra tile behind the home hero.
//   bun run zebra          (seed 23, the current pattern)
//   node scripts/zebra.mjs 7 > public/zebra.svg   (try another seed)
//   ZEBRA_BRANCHES=1 bun run zebra                 (add forked branches)
//
// Seamless zebra tile. Main stripes run top to bottom, drifting and swelling
// along layered sine waves; every wave completes a whole number of periods over
// the tile height. Tapered branches fork off into the gaps. Edges are smooth
// cubic curves (Catmull-Rom). Any shape that crosses an edge is drawn again on
// the opposite side, and stripes run a little past the top and bottom, so the
// tile repeats with no visible seams or corners.
const W = 640,
  H = 640,
  // Fewer, bolder stripes with wide gaps between them.
  N = 5,
  STEPS = 28,
  // Fraction of the tile height each stripe extends past the top and bottom, so
  // the curve flows through the seam instead of ending at it.
  OVERRUN = 0.1,
  // Draw forked branches off the stripes. Off gives clean, uninterrupted waves.
  BRANCHES = process.env.ZEBRA_BRANCHES === '1';
let seed = Number(process.argv[2] ?? 5);
// Park–Miller PRNG, so a seed always produces the same pattern.
const rnd = () => {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
};
const TAU = Math.PI * 2;
const wave = (terms, y) =>
  terms.reduce((s, [a, k, p]) => s + a * Math.sin((TAU * k * y) / H + p), 0);
const gap = W / N;
const shapes = [];
const n = (v) => Math.round(v * 10) / 10;
// Smooth curve through points (Catmull-Rom converted to cubic Béziers).
const curve = (pts) => {
  let d = '';
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const [p1, p2] = [pts[i], pts[i + 1]];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${n(c1[0])} ${n(c1[1])} ${n(c2[0])} ${n(c2[1])} ${n(p2[0])} ${n(p2[1])}`;
  }
  return d;
};
// A shape is two edges: one running down, the other back up.
const poly = ([a, b]) => {
  const back = b.slice().reverse();
  return `M${n(a[0][0])} ${n(a[0][1])}${curve(a)}L${n(back[0][0])} ${n(back[0][1])}${curve(back)}Z`;
};
// Only keep copies that actually overlap the tile.
const overlaps = (pts) =>
  pts.some(([x]) => x > -2) &&
  pts.some(([x]) => x < W + 2) &&
  pts.some(([, y]) => y > -2) &&
  pts.some(([, y]) => y < H + 2);
const shifted = (pts, dx, dy) => pts.map(([x, y]) => [x + dx, y + dy]);
// Smooth closed outline (Catmull-Rom wrapping around), for branches.
const loop = (pts) => {
  const m = pts.length;
  const at = (i) => pts[(i + m) % m];
  let d = `M${n(pts[0][0])} ${n(pts[0][1])}`;
  for (let i = 0; i < m; i++) {
    const [p0, p1, p2, p3] = [at(i - 1), at(i), at(i + 1), at(i + 2)];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${n(c1[0])} ${n(c1[1])} ${n(c2[0])} ${n(c2[1])} ${n(p2[0])} ${n(p2[1])}`;
  }
  return `${d}Z`;
};
const emitLoop = (pts) => {
  for (const dx of [-W, 0, W])
    for (const dy of [-H, 0, H]) {
      const p = shifted(pts, dx, dy);
      if (overlaps(p)) shapes.push(loop(p));
    }
};
const emit = (a, b) => {
  for (const dx of [-W, 0, W])
    for (const dy of [-H, 0, H]) {
      const [sa, sb] = [shifted(a, dx, dy), shifted(b, dx, dy)];
      if (overlaps([...sa, ...sb])) shapes.push(poly([sa, sb]));
    }
};

// A wave every stripe shares, so neighbours swing together and keep their white
// gap instead of colliding; each stripe then adds a smaller wave of its own.
const shared = [
  [30, 2, rnd() * TAU],
  [10, 3, rnd() * TAU],
];

for (let i = 0; i < N; i++) {
  const cx = (i + 0.5) * gap + (rnd() - 0.5) * 10;
  const centre = [
    ...shared,
    [10 + rnd() * 8, 1, rnd() * TAU],
    [6 + rnd() * 5, 3, rnd() * TAU],
    [2, 4, rnd() * TAU],
  ];
  // Stripe width as a share of the stripe spacing; the rest is white.
  const base = gap * (0.45 + rnd() * 0.06);
  const swell = [
    [0.32, 1 + Math.floor(rnd() * 2), rnd() * TAU],
    [0.08, 3, rnd() * TAU],
  ];
  const at = (y) => ({
    c: cx + wave(centre, y),
    w: Math.max(gap * 0.06, base * (0.85 + wave(swell, y))),
  });

  const left = [],
    right = [];
  for (let s = 0; s <= STEPS; s++) {
    const y = (-OVERRUN + (s / STEPS) * (1 + 2 * OVERRUN)) * H;
    const { c, w } = at(y);
    left.push([c - w / 2, y]);
    right.push([c + w / 2, y]);
  }
  emit(left, right);

  // One or two branches. Each starts as the full stripe, following the
  // stripe's own curve, then peels away gradually and narrows to a rounded tip,
  // so it grows out of the stripe with a smooth V instead of a notch.
  const branches = 1 + Math.floor(rnd() * 2);
  for (let b = 0; b < branches; b++) {
    const y0 = rnd() * H;
    const dir = rnd() < 0.5 ? -1 : 1;
    const len = H * (0.16 + rnd() * 0.14);
    // Reach stays well short of the next stripe so branches read as forks.
    const reach = gap * (0.28 + rnd() * 0.14) * dir;
    // Width at the tip, as a share of the stripe's width where it starts.
    const tipShare = 0.22 + rnd() * 0.1;
    const SEG = 12;
    const centre = [];
    for (let s = 0; s <= SEG; s++) {
      const t = s / SEG;
      const y = y0 + t * len;
      // Peels away over the first 70% of its length, then carries on parallel.
      const u = Math.min(1, t / 0.7);
      const peel = u * u * (3 - 2 * u);
      const { c, w } = at(y);
      // Starts a little narrower than the stripe so its root stays hidden inside.
      centre.push([c + reach * peel, y, w * (0.8 - (0.8 - tipShare) * t ** 0.8)]);
    }
    const side = centre.map(([x, y, w]) => [x - w / 2, y]);
    const other = centre.map(([x, y, w]) => [x + w / 2, y]);
    // Round the tip: one extra point just past the end of the centre line.
    const [xe, ye, we] = centre[SEG];
    const [xp, yp] = centre[SEG - 1];
    const len2 = Math.hypot(xe - xp, ye - yp) || 1;
    const tip = [xe + ((xe - xp) / len2) * we * 0.6, ye + ((ye - yp) / len2) * we * 0.6];
    // Close the root with a point tucked inside the stripe, just above the start.
    const [x0, y0c, w0] = centre[0];
    const root = [x0, y0c - w0 * 0.5];
    if (BRANCHES) emitLoop([root, ...side, tip, ...other.reverse()]);
  }
}
process.stdout.write(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><title>Zebra pattern</title><path fill="#000" d="${shapes.join('')}"/></svg>\n`,
);
