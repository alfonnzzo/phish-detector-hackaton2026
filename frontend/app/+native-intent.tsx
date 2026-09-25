// Cuando la app se elige como navegador (Android), cada link tocado en WhatsApp, SMS o mail
// llega aca como URL http/https y se manda a revisar antes de abrirlo.
export function redirectSystemPath({ path }: { path: string; initial: boolean }) {
  try {
    if (/^https?:\/\//i.test(path)) {
      return `/analizar?url=${encodeURIComponent(path)}`;
    }
    return path;
  } catch {
    return '/';
  }
}
