import { getUrunById, getUrunler } from './firestore-service.js';

const params = new URLSearchParams(window.location.search);
const urunId = params.get('id');

let resimler = [];
let aktifIndex = 0;
let lbZoom = 1;

// ===== GALLERY YARDIMCILARI =====
function resimGuncelle(index, animate = true) {
  const anaResim = document.getElementById('ana-resim');
  if (!resimler.length) return;

  aktifIndex = ((index % resimler.length) + resimler.length) % resimler.length;

  if (animate) {
    anaResim.style.opacity = '0';
    setTimeout(() => {
      anaResim.src = resimler[aktifIndex];
      anaResim.style.opacity = '1';
    }, 200);
  } else {
    anaResim.src = resimler[aktifIndex];
  }

  // Thumbnail aktif güncelle
  document.querySelectorAll('#thumbnails button').forEach((btn, i) => {
    if (i === aktifIndex) {
      btn.classList.add('border-brand-500');
      btn.classList.remove('border-surface-700');
    } else {
      btn.classList.remove('border-brand-500');
      btn.classList.add('border-surface-700');
    }
  });

  // Sayaç güncelle
  const sayac = document.getElementById('resim-sayaci');
  if (sayac) sayac.textContent = `${aktifIndex + 1} / ${resimler.length}`;
}

// ===== ANA ÜRÜNÜ YÜKLE =====
async function urunDetayYukle() {
  if (!urunId) { window.location.href = 'index.html'; return; }

  try {
    const urun = await getUrunById(urunId);
    if (!urun) { window.location.href = 'index.html'; return; }

    document.title = `${urun.ad} | SPEED`;
    document.getElementById('detay-ad').textContent = urun.ad;
    document.getElementById('detay-kategori').textContent = urun.kategori;
    document.getElementById('detay-aciklama').textContent = urun.aciklama;

    // Fiyat
    const fiyatEl = document.getElementById('detay-fiyat');
    if (urun.eskiFiyat) {
      fiyatEl.innerHTML = `<span>${urun.fiyat}</span> <span class="old-price text-xl">${urun.eskiFiyat}</span>`;
    } else {
      fiyatEl.textContent = urun.fiyat;
    }

    // Resimler
    resimler = urun.resimler && urun.resimler.length > 0 ? urun.resimler : [];
    if (resimler.length > 0) {
      resimGuncelle(0, false);
    }

    // Ok butonları (2+ resim varsa göster)
    if (resimler.length > 1) {
      document.getElementById('ok-sol')?.classList.remove('hidden');
      document.getElementById('ok-sag')?.classList.remove('hidden');
      document.getElementById('resim-sayaci')?.classList.remove('hidden');
    }

    // Badge
    const badgeContainer = document.getElementById('badge-container');
    if (urun.etiket && badgeContainer) {
      const map = { 'Yeni': 'badge-new', 'Popüler': 'badge-popular', 'Sınırlı': 'badge-limited' };
      let cls;
      if (urun.etiket.includes('İndirim') || urun.etiket.includes('indirim')) {
        cls = 'badge-discount';
      } else {
        cls = map[urun.etiket] || 'badge-new';
      }
      badgeContainer.innerHTML = `<div class="badge ${cls}">${urun.etiket}</div>`;
    }

    // Thumbnail'ler
    const thumbContainer = document.getElementById('thumbnails');
    if (resimler.length > 1 && thumbContainer) {
      thumbContainer.innerHTML = resimler.map((resim, i) => `
        <button class="w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-300 flex-shrink-0
                       ${i === 0 ? 'border-brand-500' : 'border-surface-700 hover:border-surface-400'}"
                data-index="${i}">
          <img src="${resim}" alt="${urun.ad} ${i + 1}" class="w-full h-full object-cover">
        </button>
      `).join('');

      thumbContainer.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', () => resimGuncelle(parseInt(btn.dataset.index)));
      });
    }

    // WhatsApp linki
    const wpLink = document.getElementById('wp-link');
    if (wpLink) {
      const mesaj = encodeURIComponent(`Merhaba, SPEED mağazasından "${urun.ad}" modeli (${urun.fiyat}) için sipariş vermek istiyorum.`);
      wpLink.href = `https://wa.me/905555555555?text=${mesaj}`;
    }

    ilgiliUrunleriYukle(urun);
  } catch (err) {
    console.error('Ürün yüklenirken hata:', err);
  }
}

// ===== OK NAVİGASYONU =====
document.getElementById('ok-sol')?.addEventListener('click', (e) => {
  e.stopPropagation();
  resimGuncelle(aktifIndex - 1);
});
document.getElementById('ok-sag')?.addEventListener('click', (e) => {
  e.stopPropagation();
  resimGuncelle(aktifIndex + 1);
});

// ===== KAYDIRMA (SWIPE) =====
let touchStartX = 0;
const galeriContainer = document.getElementById('galeri-container');

galeriContainer?.addEventListener('touchstart', (e) => {
  touchStartX = e.changedTouches[0].screenX;
}, { passive: true });

galeriContainer?.addEventListener('touchend', (e) => {
  const diff = touchStartX - e.changedTouches[0].screenX;
  if (Math.abs(diff) > 50) {
    if (diff > 0) resimGuncelle(aktifIndex + 1); // Sola kaydır → sonraki
    else resimGuncelle(aktifIndex - 1); // Sağa kaydır → önceki
  }
});

// ===== KLAVYe OK TUŞLARI =====
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') resimGuncelle(aktifIndex - 1);
  if (e.key === 'ArrowRight') resimGuncelle(aktifIndex + 1);
  if (e.key === 'Escape') lightboxKapat();
});

// ===== LIGHTBOX (TAM EKRAN ZOOM) =====
let lbX = 0;
let lbY = 0;
let lbIsDragging = false;
let lbStartX = 0;
let lbStartY = 0;

function updateLightboxTransform() {
  const lbImg = document.getElementById('lightbox-img');
  if (!lbImg) return;
  if (lbIsDragging) {
    lbImg.style.transition = 'none';
  } else {
    lbImg.style.transition = 'transform 0.3s ease-out';
  }
  lbImg.style.transform = `translate(${lbX}px, ${lbY}px) scale(${lbZoom})`;
  if (lbZoom <= 1) {
    lbX = 0;
    lbY = 0;
    lbImg.style.transform = `scale(${lbZoom})`;
  }
}

function resetLightbox() {
  lbZoom = 1;
  lbX = 0;
  lbY = 0;
  updateLightboxTransform();
}

function lightboxAc() {
  if (!resimler.length) return;
  const lightbox = document.getElementById('lightbox');
  const lbImg = document.getElementById('lightbox-img');
  lbImg.src = resimler[aktifIndex];
  resetLightbox();
  lightbox.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  lbSayacGuncelle();
}

function lightboxKapat() {
  document.getElementById('lightbox').classList.add('hidden');
  document.body.style.overflow = '';
  resetLightbox();
}

function lbSayacGuncelle() {
  const sayac = document.getElementById('lb-sayac');
  if (sayac) sayac.textContent = `${aktifIndex + 1} / ${resimler.length}`;
}

function lbResimDegistir(yeni) {
  aktifIndex = ((yeni % resimler.length) + resimler.length) % resimler.length;
  const lbImg = document.getElementById('lightbox-img');
  lbImg.src = resimler[aktifIndex];
  resetLightbox();
  lbSayacGuncelle();
  // Ana galeriyi de güncelle
  resimGuncelle(aktifIndex, false);
}

// Lightbox açma - galeriye tıklayınca (ok butonları hariç)
galeriContainer?.addEventListener('click', (e) => {
  if (e.target.closest('button')) return; // Ok butonlarına tıklamayı yoksay
  lightboxAc();
});

document.getElementById('lb-kapat')?.addEventListener('click', lightboxKapat);
document.getElementById('lightbox')?.addEventListener('click', (e) => {
  if (e.target.id === 'lightbox' || e.target.closest('.absolute.inset-0.flex')) {
    if (!e.target.closest('button') && e.target.id !== 'lightbox-img') lightboxKapat();
  }
});

document.getElementById('lb-sol')?.addEventListener('click', () => lbResimDegistir(aktifIndex - 1));
document.getElementById('lb-sag')?.addEventListener('click', () => lbResimDegistir(aktifIndex + 1));

document.getElementById('lb-zoom-in')?.addEventListener('click', () => {
  lbZoom = Math.min(lbZoom + 0.5, 4);
  updateLightboxTransform();
  const lbImg = document.getElementById('lightbox-img');
  if (lbImg) lbImg.style.cursor = lbZoom > 1 ? 'grab' : 'default';
});

document.getElementById('lb-zoom-out')?.addEventListener('click', () => {
  lbZoom = Math.max(lbZoom - 0.5, 0.5);
  updateLightboxTransform();
  const lbImg = document.getElementById('lightbox-img');
  if (lbImg) lbImg.style.cursor = lbZoom > 1 ? 'grab' : 'default';
});

// Mouse wheel zoom
document.getElementById('lightbox')?.addEventListener('wheel', (e) => {
  e.preventDefault();
  if (e.deltaY < 0) lbZoom = Math.min(lbZoom + 0.2, 4);
  else lbZoom = Math.max(lbZoom - 0.2, 0.5);
  updateLightboxTransform();
  const lbImg = document.getElementById('lightbox-img');
  if (lbImg) lbImg.style.cursor = lbZoom > 1 ? 'grab' : 'default';
}, { passive: false });

// ===== SÜRÜKLE (PAN) DESTEĞİ =====
const lbImg = document.getElementById('lightbox-img');

function startDrag(clientX, clientY) {
  if (lbZoom <= 1) return;
  lbIsDragging = true;
  lbStartX = clientX - lbX;
  lbStartY = clientY - lbY;
  if (lbImg) lbImg.style.cursor = 'grabbing';
}

function drag(clientX, clientY) {
  if (!lbIsDragging) return;
  lbX = clientX - lbStartX;
  lbY = clientY - lbStartY;
  updateLightboxTransform();
}

function stopDrag() {
  lbIsDragging = false;
  if (lbImg) lbImg.style.cursor = lbZoom > 1 ? 'grab' : 'default';
}

lbImg?.addEventListener('mousedown', (e) => {
  e.preventDefault();
  startDrag(e.clientX, e.clientY);
});
window.addEventListener('mousemove', (e) => drag(e.clientX, e.clientY));
window.addEventListener('mouseup', stopDrag);

lbImg?.addEventListener('touchstart', (e) => {
  if (lbZoom > 1) e.preventDefault();
  startDrag(e.touches[0].clientX, e.touches[0].clientY);
}, {passive: false});
window.addEventListener('touchmove', (e) => {
  if (lbZoom > 1) {
    e.preventDefault();
    drag(e.touches[0].clientX, e.touches[0].clientY);
  }
}, {passive: false});
window.addEventListener('touchend', stopDrag);

// ===== İLGİLİ ÜRÜNLER =====
async function ilgiliUrunleriYukle(mevcutUrun) {
  const container = document.getElementById('ilgili-urunler');
  if (!container) return;

  try {
    const tumUrunler = await getUrunler();
    const diger = tumUrunler.filter(u => u.id !== mevcutUrun.id).slice(0, 4);

    if (diger.length === 0) {
      container.parentElement.style.display = 'none';
      return;
    }

    container.innerHTML = diger.map(u => {
      const resim = Array.isArray(u.resimler) ? u.resimler[0] : '';
      return `
        <a href="urun-detay.html?id=${u.id}" class="product-card group">
          <div class="relative overflow-hidden bg-surface-900 rounded-xl aspect-square mb-3">
            <img src="${resim}" alt="${u.ad}" class="product-img w-full h-full object-cover" loading="lazy">
          </div>
          <h3 class="text-white font-semibold text-sm">${u.ad}</h3>
          <p class="text-surface-500 text-xs mt-0.5">${u.kategori}</p>
          ${u.eskiFiyat
            ? `<div class="flex items-center gap-2 mt-1"><span class="text-white font-bold text-sm">${u.fiyat}</span><span class="old-price text-xs">${u.eskiFiyat}</span></div>`
            : `<p class="text-white font-bold mt-1 text-sm">${u.fiyat}</p>`
          }
        </a>`;
    }).join('');
  } catch (err) {
    console.error('İlgili ürünler yüklenirken hata:', err);
  }
}

// ===== BAŞLAT =====
document.addEventListener('DOMContentLoaded', urunDetayYukle);
