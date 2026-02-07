// src/shared/components/mapModal.js
// Модалка с картой (OSM iframe + ссылка на Google Maps)

import { CAFE } from "../../config.js";
import { toast } from "./toast.js";

export function openCafeMapModal() {
  // если уже открыта — не плодим
  if (document.getElementById("mapModal")) return;

  const { lat, lon, name, address } = CAFE;

  const overlay = document.createElement("div");
  overlay.id = "mapModal";
  overlay.className = "modal active";

  // ✅ Жёсткая фиксация overlay (чтобы не “уезжало” в WebView/мобиле)
  // Даже если CSS где-то конфликтует, инлайн победит.
  overlay.style.position = "fixed";
  overlay.style.inset = "0";
  overlay.style.left = "0";
  overlay.style.right = "0";
  overlay.style.top = "0";
  overlay.style.bottom = "0";
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.display = "flex";
  overlay.style.alignItems = "center";
  overlay.style.justifyContent = "center";
  overlay.style.padding = "14px";
  overlay.style.margin = "0";
  overlay.style.zIndex = "9999";

  // OpenStreetMap embed (превью)
  const osmUrl =
    `https://www.openstreetmap.org/export/embed.html?bbox=` +
    `${lon - 0.01}%2C${lat - 0.01}%2C${lon + 0.01}%2C${lat + 0.01}` +
    `&layer=mapnik&marker=${lat}%2C${lon}`;

  // Google maps link (по query — чаще открывает карточку заведения)
  const gmapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    CAFE.googleQuery || `${lat},${lon}`
  )}`;

  overlay.innerHTML = `
    <div class="modal-backdrop" id="mapBackdrop"></div>

    <div class="modal-sheet" id="mapSheet">
      <button class="modal-close" id="mapClose">✕</button>

      <div class="map-head">
        <div class="map-title">📍 ${name}</div>
        <div class="muted">${address}</div>
      </div>

      <div class="map-frame">
        <iframe
          title="Cafe Map"
          src="${osmUrl}"
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>

      <div class="map-actions">
        <button class="primary" id="openGoogleMaps">Открыть в Google Maps</button>
      </div>
    </div>
  `;

  // ✅ ВАЖНО: всегда в document.body
  document.body.appendChild(overlay);

  // ✅ Жёстко фиксируем sheet, чтобы он реально был по центру
  const sheet = overlay.querySelector("#mapSheet");
  if (sheet) {
    sheet.style.position = "relative";
    sheet.style.left = "auto";
    sheet.style.right = "auto";
    sheet.style.bottom = "auto";
    sheet.style.top = "auto";
    sheet.style.transform = "none"; // если общий .modal-sheet был bottom-sheet — убираем
    sheet.style.margin = "0";
    sheet.style.width = "min(720px, calc(100% - 28px))";
    sheet.style.maxWidth = "720px";
  }

  const close = () => {
    overlay.classList.remove("active");
    setTimeout(() => overlay.remove(), 220);
  };

  overlay.querySelector("#mapBackdrop").onclick = close;
  overlay.querySelector("#mapClose").onclick = close;

  overlay.querySelector("#openGoogleMaps").onclick = () => {
    const tg = window.Telegram?.WebApp;

    try {
      if (tg?.openLink) tg.openLink(gmapsUrl);
      else window.open(gmapsUrl, "_blank");
      close();
    } catch {
      toast.info("Не удалось открыть Google Maps. Попробуй ещё раз.", 2600);
    }
  };
}
