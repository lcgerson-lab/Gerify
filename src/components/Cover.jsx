function hashSeed(seed) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function ProceduralArt({ seed = 'default', hue = 195, size }) {
  const px = size === 'lg' ? 240 : size === 'md' ? 80 : size === 'sm' ? 48 : 36;
  const variant = hashSeed(seed) % 5;
  const c1 = `oklch(0.55 0.20 ${hue})`;
  const c2 = `oklch(0.35 0.15 ${(hue + 60) % 360})`;
  const c3 = `oklch(0.70 0.18 ${(hue + 120) % 360})`;
  const id = `g${hashSeed(seed + 'svg')}`;

  const artVariants = [
    // 0: concentric arcs
    <svg key={0} width={px} height={px} viewBox="0 0 100 100">
      <rect width="100" height="100" fill={c2}/>
      {[80, 60, 40, 20].map((r, i) => (
        <circle key={i} cx="50" cy="100" r={r} fill="none" stroke={i % 2 === 0 ? c1 : c3} strokeWidth="14" opacity="0.8"/>
      ))}
    </svg>,
    // 1: diagonal stripes
    <svg key={1} width={px} height={px} viewBox="0 0 100 100">
      <rect width="100" height="100" fill={c2}/>
      {Array.from({ length: 8 }, (_, i) => (
        <line key={i} x1={i * 15 - 10} y1="0" x2={i * 15 + 50} y2="100" stroke={i % 2 === 0 ? c1 : c3} strokeWidth="12" opacity="0.7"/>
      ))}
    </svg>,
    // 2: half-circle composition
    <svg key={2} width={px} height={px} viewBox="0 0 100 100">
      <rect width="100" height="100" fill={c2}/>
      <circle cx="50" cy="50" r="45" fill={c1} opacity="0.9"/>
      <rect x="50" y="5" width="45" height="90" fill={c2}/>
      <circle cx="50" cy="50" r="25" fill={c3} opacity="0.85"/>
    </svg>,
    // 3: dot grid
    <svg key={3} width={px} height={px} viewBox="0 0 100 100">
      <rect width="100" height="100" fill={c2}/>
      {Array.from({ length: 5 }, (_, r) =>
        Array.from({ length: 5 }, (_, c) => (
          <circle key={`${r}-${c}`} cx={10 + c * 20} cy={10 + r * 20} r={(hashSeed(seed + r + c) % 7) + 4} fill={r % 2 === c % 2 ? c1 : c3} opacity="0.85"/>
        ))
      )}
    </svg>,
    // 4: wave lines
    <svg key={4} width={px} height={px} viewBox="0 0 100 100">
      <rect width="100" height="100" fill={c2}/>
      {Array.from({ length: 6 }, (_, i) => {
        const y = 10 + i * 16;
        const amp = 8;
        return <path key={i} d={`M0 ${y} Q25 ${y - amp} 50 ${y} Q75 ${y + amp} 100 ${y}`} fill="none" stroke={i % 2 === 0 ? c1 : c3} strokeWidth="4" opacity="0.8"/>;
      })}
    </svg>,
  ];

  return artVariants[variant];
}

const SIZES = { lg: 240, md: 80, sm: 48, xs: 36 };
const RADIUS = { lg: 16, md: 10, sm: 8, xs: 6 };

export default function Cover({ item, seed = 'default', hue = 195, size = 'sm', rounded = true, style }) {
  const px = SIZES[size] || SIZES.sm;
  const r = rounded ? RADIUS[size] || 8 : 0;
  const containerStyle = {
    width: px, height: px, borderRadius: r, overflow: 'hidden', flexShrink: 0,
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    ...style,
  };

  if (item?.snippet?.thumbnails) {
    const thumb = size === 'lg'
      ? (item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default.url)
      : item.snippet.thumbnails.default.url;
    return (
      <div style={containerStyle}>
        <img src={thumb} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <ProceduralArt seed={seed} hue={hue} size={size} />
    </div>
  );
}
