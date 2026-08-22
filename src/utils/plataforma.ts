export function ehIOS(): boolean {
  const ua = navigator.userAgent;
  const iOSClassico = /iPad|iPhone|iPod/.test(ua);
  // iPadOS 13+ finge ser Mac, mas tem touch
  const iPadOSComoMac = ua.includes('Macintosh') && navigator.maxTouchPoints > 1;
  return iOSClassico || iPadOSComoMac;
}

export function ehStandalone(): boolean {
  const nav = navigator as Navigator & { standalone?: boolean };
  return nav.standalone === true || window.matchMedia('(display-mode: standalone)').matches;
}
