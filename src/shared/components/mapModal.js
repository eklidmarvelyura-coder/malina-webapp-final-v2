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

  // OpenStreetMap embed
  const osmUrl =
    `https://www.openstreetmap.org/export/embed.html?bbox=` +
    `${lon - 0.01}%2C${lat - 0.01}%2C${lon + 0.01}%2C${lat + 0.01}` +
    `&layer=mapnik&marker=${lat}%2C${lon}`;

  const gmapsUrl = `https://www.google.com/maps?q=${lat},${lon}`;

  overlay.innerHTML = `
    <div class="modal-backdrop" id="mapBackdrop"></div>

    <div class="modal-sheet">
      <button class="modal-close" id="mapClose">✕</button>

      <div class="map-head">
        <div class="map-title">📍 ${name}</div>
        <div class="muted">${address}</div>
      </div>

      <div class="map-frame">
        <iframe
          title="Malina Cafe Map"
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

  document.body.appendChild(overlay);

  const close = () => {
    overlay.classList.remove("active");
    setTimeout(() => overlay.remove(), 220);
  };

  overlay.querySelector("#mapBackdrop").onclick = close;
  overlay.querySelector("#mapClose").onclick = close;

  overlay.querySelector("#openGoogleMaps").onclick = () => {
    // В WebView иногда лучше открывать в системном браузере
    try {
      window.open(gmapsUrl, "_blank");
    } catch {
      toast.info("Не удалось открыть ссылки, попробуй вручную", 2600);
    }
  };
}
