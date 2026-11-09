/** Xarita belgilari uchun HTML (server va brauzerda bir xil ishlaydi). */

export const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/** Katta belgi: uy rasmi + nom, uchi aynan nuqtada (Pin.anchor = "bottom") */
export const photoPinHtml = (photo: string, label: string) =>
  `<div class="ym-bubble"><div class="ym-bubble-ph"><img src="${esc(photo)}" alt="" /><b>${esc(label)}</b></div><i></i><s></s></div>`;
