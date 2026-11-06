const API_URL = import.meta.env.VITE_API_URL || "";

const fetchOriginal = globalThis.fetch.bind(globalThis);

export function urlMaterial(caminho) {
  return `${API_URL.replace(/\/+$/, "")}/api/biblioteca/arquivos/conteudo?caminho=${encodeURIComponent(caminho)}`;
}

export function apiFetch(url, options = {}) {
  const destino =
    typeof url === "string" && url.startsWith("/api/")
      ? `${API_URL}${url}`
      : url;

  return fetchOriginal(destino, options);
}

export function configurarApi() {
  if (!API_URL) return;

  globalThis.fetch = (url, options) => apiFetch(url, options);
}
