export default function Icon({ name, size = 20, stroke = 1.6, color = 'currentColor' }) {
  const s = { width: size, height: size, display: 'inline-block', flexShrink: 0 };
  const p = { fill: 'none', stroke: color, strokeWidth: stroke, strokeLinecap: 'round', strokeLinejoin: 'round' };

  switch (name) {
    case 'home':
      return <svg style={s} viewBox="0 0 24 24"><path {...p} d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/><path {...p} d="M9 21V12h6v9"/></svg>;
    case 'search':
      return <svg style={s} viewBox="0 0 24 24"><circle {...p} cx="11" cy="11" r="7"/><path {...p} d="M16.5 16.5L21 21"/></svg>;
    case 'library':
      return <svg style={s} viewBox="0 0 24 24"><path {...p} d="M4 4h4v16H4zM10 4h4v16h-4zM18 4l-2 16"/></svg>;
    case 'plus':
      return <svg style={s} viewBox="0 0 24 24"><path {...p} d="M12 5v14M5 12h14"/></svg>;
    case 'heart':
      return <svg style={s} viewBox="0 0 24 24"><path {...p} d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>;
    case 'heart-fill':
      return <svg style={s} viewBox="0 0 24 24"><path fill={color} stroke="none" d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>;
    case 'play':
      return <svg style={s} viewBox="0 0 24 24"><polygon {...p} points="5 3 19 12 5 21 5 3"/></svg>;
    case 'pause':
      return <svg style={s} viewBox="0 0 24 24"><rect {...p} x="6" y="4" width="4" height="16" rx="1"/><rect {...p} x="14" y="4" width="4" height="16" rx="1"/></svg>;
    case 'prev':
      return <svg style={s} viewBox="0 0 24 24"><polygon {...p} points="19 20 9 12 19 4 19 20"/><line {...p} x1="5" y1="19" x2="5" y2="5"/></svg>;
    case 'next':
      return <svg style={s} viewBox="0 0 24 24"><polygon {...p} points="5 4 15 12 5 20 5 4"/><line {...p} x1="19" y1="5" x2="19" y2="19"/></svg>;
    case 'shuffle':
      return <svg style={s} viewBox="0 0 24 24"><polyline {...p} points="16 3 21 3 21 8"/><line {...p} x1="4" y1="20" x2="21" y2="3"/><polyline {...p} points="21 16 21 21 16 21"/><line {...p} x1="15" y1="15" x2="21" y2="21"/><line {...p} x1="4" y1="4" x2="9" y2="9"/></svg>;
    case 'repeat':
      return <svg style={s} viewBox="0 0 24 24"><polyline {...p} points="17 1 21 5 17 9"/><path {...p} d="M3 11V9a4 4 0 014-4h14"/><polyline {...p} points="7 23 3 19 7 15"/><path {...p} d="M21 13v2a4 4 0 01-4 4H3"/></svg>;
    case 'repeat-one':
      return <svg style={s} viewBox="0 0 24 24"><polyline {...p} points="17 1 21 5 17 9"/><path {...p} d="M3 11V9a4 4 0 014-4h14"/><polyline {...p} points="7 23 3 19 7 15"/><path {...p} d="M21 13v2a4 4 0 01-4 4H3"/><line {...p} x1="12" y1="8" x2="12" y2="16"/></svg>;
    case 'queue':
      return <svg style={s} viewBox="0 0 24 24"><line {...p} x1="8" y1="6" x2="21" y2="6"/><line {...p} x1="8" y1="12" x2="21" y2="12"/><line {...p} x1="8" y1="18" x2="21" y2="18"/><circle fill={color} stroke="none" cx="3" cy="6" r="1.5"/><circle fill={color} stroke="none" cx="3" cy="12" r="1.5"/><circle fill={color} stroke="none" cx="3" cy="18" r="1.5"/></svg>;
    case 'volume':
      return <svg style={s} viewBox="0 0 24 24"><polygon {...p} points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path {...p} d="M15.54 8.46a5 5 0 010 7.07M19.07 4.93a10 10 0 010 14.14"/></svg>;
    case 'volume-mute':
      return <svg style={s} viewBox="0 0 24 24"><polygon {...p} points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line {...p} x1="23" y1="9" x2="17" y2="15"/><line {...p} x1="17" y1="9" x2="23" y2="15"/></svg>;
    case 'expand':
      return <svg style={s} viewBox="0 0 24 24"><path {...p} d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3"/></svg>;
    case 'minimize':
      return <svg style={s} viewBox="0 0 24 24"><path {...p} d="M8 3v3a2 2 0 01-2 2H3m18 0h-3a2 2 0 01-2-2V3m0 18v-3a2 2 0 012-2h3M3 16h3a2 2 0 012 2v3"/></svg>;
    case 'down':
      return <svg style={s} viewBox="0 0 24 24"><path {...p} d="M19 9l-7 7-7-7"/></svg>;
    case 'more':
      return <svg style={s} viewBox="0 0 24 24"><circle fill={color} stroke="none" cx="12" cy="5" r="1.5"/><circle fill={color} stroke="none" cx="12" cy="12" r="1.5"/><circle fill={color} stroke="none" cx="12" cy="19" r="1.5"/></svg>;
    case 'history':
      return <svg style={s} viewBox="0 0 24 24"><polyline {...p} points="1 4 1 10 7 10"/><path {...p} d="M3.51 15a9 9 0 102.13-9.36L1 10"/><polyline {...p} points="12 7 12 12 16 14"/></svg>;
    case 'check':
      return <svg style={s} viewBox="0 0 24 24"><polyline {...p} points="20 6 9 17 4 12"/></svg>;
    case 'add':
      return <svg style={s} viewBox="0 0 24 24"><circle {...p} cx="12" cy="12" r="9"/><line {...p} x1="12" y1="8" x2="12" y2="16"/><line {...p} x1="8" y1="12" x2="16" y2="12"/></svg>;
    case 'mic':
      return <svg style={s} viewBox="0 0 24 24"><rect {...p} x="9" y="2" width="6" height="12" rx="3"/><path {...p} d="M5 10a7 7 0 0014 0"/><line {...p} x1="12" y1="17" x2="12" y2="21"/><line {...p} x1="9" y1="21" x2="15" y2="21"/></svg>;
    case 'close':
      return <svg style={s} viewBox="0 0 24 24"><line {...p} x1="18" y1="6" x2="6" y2="18"/><line {...p} x1="6" y1="6" x2="18" y2="18"/></svg>;
    case 'devices':
      return <svg style={s} viewBox="0 0 24 24"><rect {...p} x="2" y="4" width="14" height="10" rx="2"/><path {...p} d="M8 18h8a2 2 0 002-2V9"/><line {...p} x1="6" y1="21" x2="10" y2="21"/><line {...p} x1="8" y1="18" x2="8" y2="21"/></svg>;
    case 'logo':
      return (
        <svg style={s} viewBox="0 0 32 32">
          <rect width="32" height="32" rx="9" fill="oklch(0.78 0.17 155)"/>
          {/* G letterform */}
          <path fill="#0a1a12" d="M16 7C11.03 7 7 11.03 7 16s4.03 9 9 9c4.42 0 8.1-3.2 8.87-7.4H15.5v2.8h6.1C20.7 22.7 18.5 24.2 16 24.2c-4.53 0-8.2-3.67-8.2-8.2s3.67-8.2 8.2-8.2c2.27 0 4.32.92 5.81 2.4l2-2A11.1 11.1 0 0016 7z"/>
        </svg>
      );
    default:
      return <svg style={s} viewBox="0 0 24 24"><circle {...p} cx="12" cy="12" r="9"/></svg>;
  }
}
