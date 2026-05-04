import { getUrunler, getUrunlerByKategori } from './firestore-service.js';

// ===== SKELETON LOADING =====
function skeletonGoster(adet = 8) {
  const liste = document.getElementById('urun-listesi');
  if (!liste) return;
  liste.innerHTML = '';
  for (let i = 0; i < adet; i++) {
    liste.innerHTML += `
      <div class="skeleton-card">
        <div class="skeleton-img"></div>
        <div class="skeleton-text"></div>
        <div class="skeleton-text-sm"></div>
        <div class="skeleton-price"></div>
      </div>`;
  }
}

// ===== ÜRÜN BADGE =====
function badgeHTML(etiket) {
  if (!etiket) return '';
  const map = {
    'Yeni': 'badge-new',
    'Popüler': 'badge-popular',
    'Sınırlı': 'badge-limited',
  };
  if (etiket.includes('İndirim') || etiket.includes('indirim')) {
    return `<div class="badge badge-discount">${etiket}</div>`;
  }
  const cls = map[etiket] || 'badge-new';
  return `<div class="badge ${cls}">${etiket}</div>`;
}

// ===== FİYAT HTML =====
function fiyatHTML(urun) {
  if (urun.eskiFiyat) {
    return `<div class="flex items-center gap-2 mt-2">
      <span class="text-white font-black text-lg">${urun.fiyat}</span>
      <span class="old-price">${urun.eskiFiyat}</span>
    </div>`;
  }
  return `<p class="text-white font-black mt-2 text-lg">${urun.fiyat}</p>`;
}

// ===== ÜRÜN KARTI =====
function urunKartiHTML(urun) {
  const resim = Array.isArray(urun.resimler) ? urun.resimler[0] : '';
  return `
    <a href="urun-detay.html?id=${urun.id}" class="product-card stagger-item">
      <div class="relative overflow-hidden bg-surface-900 rounded-2xl aspect-square mb-3 sm:mb-4">
        <img src="${resim}" alt="${urun.ad}" class="product-img w-full h-full object-cover" loading="lazy">
        ${badgeHTML(urun.etiket)}
      </div>
      <h3 class="text-white font-bold text-sm sm:text-base lg:text-lg leading-tight line-clamp-1">${urun.ad}</h3>
      <p class="text-surface-500 text-xs sm:text-sm mt-0.5">${urun.kategori}</p>
      ${fiyatHTML(urun)}
    </a>`;
}

// ===== MOBİL MENÜ =====
function mobilMenuSetup() {
  const btn = document.getElementById('hamburger-btn');
  const menu = document.getElementById('mobile-menu');
  const inner = document.getElementById('mobile-menu-inner');
  if (!btn || !menu || !inner) return;

  let acik = false;

  function toggle() {
    acik = !acik;
    if (acik) {
      menu.classList.remove('opacity-0', 'invisible');
      menu.classList.add('opacity-100', 'visible');
      inner.classList.remove('translate-x-full');
      inner.classList.add('translate-x-0');
      document.body.style.overflow = 'hidden';
    } else {
      menu.classList.add('opacity-0', 'invisible');
      menu.classList.remove('opacity-100', 'visible');
      inner.classList.add('translate-x-full');
      inner.classList.remove('translate-x-0');
      document.body.style.overflow = '';
    }
  }

  btn.addEventListener('click', toggle);
  menu.addEventListener('click', (e) => {
    if (e.target === menu) toggle();
  });

  menu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      if (acik) toggle();
    });
  });
}

// ===== URL'DEN PARAMETRE OKUMA VE SAYFAYI DOLDURMA =====
async function sayfaYukle() {
  const params = new URLSearchParams(window.location.search);
  const kategori = params.get('kategori') || 'Tümü';
  
  // Başlık Güncelle
  const baslikEl = document.getElementById('kategori-sayfa-baslik');
  if (baslikEl) {
    baslikEl.textContent = kategori === 'Tümü' ? 'Tüm Ürünler' : kategori;
  }
  
  // Aktif menü linklerini renklendir
  document.querySelectorAll('.nav-kategori').forEach(link => {
    if (link.dataset.kategori === kategori) {
      link.classList.remove('text-white/60');
      link.classList.add('text-brand-400');
    }
  });

  const liste = document.getElementById('urun-listesi');
  const sayac = document.getElementById('urun-sayisi');
  if (!liste) return;

  skeletonGoster(8);

  try {
    const urunler = (kategori === 'Tümü' || kategori === '')
      ? await getUrunler()
      : await getUrunlerByKategori(kategori);

    await new Promise(r => setTimeout(r, 300)); // Smooth yükleme

    if (sayac) {
      sayac.textContent = `${urunler.length} ürün bulundu`;
      sayac.classList.remove('hidden');
    }

    // Kategoriye ve sıraya göre sırala (Erkek -> Kadın -> Çocuk)
    const katSira = { 'Erkek': 1, 'Kadın': 2, 'Çocuk': 3 };
    urunler.sort((a, b) => {
      const k1 = katSira[a.kategori] || 99;
      const k2 = katSira[b.kategori] || 99;
      if (k1 !== k2) return k1 - k2;
      return (a.sira || 0) - (b.sira || 0);
    });

    if (urunler.length === 0) {
      liste.innerHTML = `
        <div class="col-span-full text-center py-20">
          <div class="w-20 h-20 bg-surface-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="text-surface-400"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
          </div>
          <p class="text-surface-300 text-xl font-bold mb-2">Bu kategoride henüz ürün bulunmuyor</p>
          <p class="text-surface-500 text-sm">Lütfen daha sonra tekrar kontrol edin veya diğer kategorilere göz atın.</p>
        </div>`;
      return;
    }

    liste.innerHTML = urunler.map(u => urunKartiHTML(u)).join('');
  } catch (err) {
    console.error('Ürünler yüklenirken hata:', err);
    liste.innerHTML = `
      <div class="col-span-full text-center py-20">
        <p class="text-red-400 text-lg">Ürünler yüklenirken bir hata oluştu.</p>
      </div>`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.scrollTo(0, 0);
  mobilMenuSetup();
  sayfaYukle();
});
