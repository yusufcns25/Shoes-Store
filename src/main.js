import { getUrunler, getUrunlerByKategori } from './firestore-service.js';

const kategoriler = ['Tümü', 'Erkek', 'Kadın', 'Çocuk'];
let aktifKategori = 'Tümü';

// ===== SKELETON LOADING =====
function skeletonGoster(adet = 6) {
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

// ===== KATEGORİ BAŞLIĞI VE LİNKİ GÜNCELLE =====
function kategoriBaslikGuncelle() {
  const baslik = document.getElementById('koleksiyon-baslik');
  const link = document.getElementById('daha-fazla-link');
  
  if (baslik) {
    baslik.style.opacity = '0';
    setTimeout(() => {
      baslik.textContent = aktifKategori === 'Tümü' ? 'Koleksiyon' : aktifKategori;
      baslik.style.opacity = '1';
    }, 150);
  }
  
  if (link) {
    link.href = `kategori.html?kategori=${aktifKategori}`;
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
  // İndirim etiketleri (hem "İndirim" hem "%X İndirim")
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

// ===== ÜRÜNLERI RENDER ET =====
async function urunleriYukle(kategori = 'Tümü') {
  const liste = document.getElementById('urun-listesi');
  if (!liste) return;

  skeletonGoster(4); // Sadece 4 ürün göstereceğimiz için

  try {
    const urunler = kategori === 'Tümü'
      ? await getUrunler()
      : await getUrunlerByKategori(kategori);

    // Kısa gecikme ile skeleton'ın görünmesini sağla
    await new Promise(r => setTimeout(r, 300));

    // Ana sayfa için (Tümü), sadece admin tarafından seçilenleri göster
    // Eğer kategori seçilmişse o kategorinin ürünlerini göster.
    let gosterilecekler = urunler;
    if (kategori === 'Tümü') {
      const secilenler = urunler.filter(u => u.anaSayfaSira >= 1 && u.anaSayfaSira <= 4)
                                .sort((a, b) => a.anaSayfaSira - b.anaSayfaSira);
      gosterilecekler = secilenler.length > 0 ? secilenler : urunler;
    }

    const sinirliUrunler = gosterilecekler.slice(0, 4);

    if (sinirliUrunler.length === 0) {
      liste.innerHTML = `
        <div class="col-span-full text-center py-20">
          <p class="text-surface-500 text-lg">Bu kategoride henüz ürün bulunmuyor.</p>
        </div>`;
      return;
    }

    liste.innerHTML = sinirliUrunler.map(u => urunKartiHTML(u)).join('');
  } catch (err) {
    console.error('Ürünler yüklenirken hata:', err);
    liste.innerHTML = `
      <div class="col-span-full text-center py-20">
        <p class="text-red-400 text-lg">Ürünler yüklenirken bir hata oluştu.</p>
      </div>`;
  }
}

// ===== FİLTRE CHİP'LERİ =====
function filtreleriOlustur() {
  const container = document.getElementById('filter-chips');
  if (!container) return;

  container.innerHTML = kategoriler.map(k => `
    <button class="filter-chip ${k === aktifKategori ? 'filter-chip-active' : 'filter-chip-inactive'}"
            data-kategori="${k}">${k}</button>
  `).join('');

  container.querySelectorAll('.filter-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      aktifKategori = btn.dataset.kategori;
      filtreleriOlustur();
      kategoriBaslikGuncelle();
      urunleriYukle(aktifKategori);
    });
  });
}

// ===== HEADER SCROLL =====
function headerScrollSetup() {
  const header = document.getElementById('site-header');
  if (!header) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 80) {
      header.classList.add('bg-black/90', 'backdrop-blur-xl', 'shadow-lg');
      header.classList.remove('bg-transparent');
    } else {
      header.classList.remove('bg-black/90', 'backdrop-blur-xl', 'shadow-lg');
      header.classList.add('bg-transparent');
    }
  });
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

  // Menü linklerine tıklayınca kapat
  menu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      if (acik) toggle();
      // Filtre varsa uygula
      const filter = a.dataset.filter;
      if (filter) {
        aktifKategori = filter;
        filtreleriOlustur();
        kategoriBaslikGuncelle();
        urunleriYukle(aktifKategori);
      }
    });
  });
}

// ===== NAV FİLTRE LİNKLERİ =====
function navFilterSetup() {
  document.querySelectorAll('nav a[data-filter]').forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      aktifKategori = a.dataset.filter;
      filtreleriOlustur();
      kategoriBaslikGuncelle();
      urunleriYukle(aktifKategori);
      document.getElementById('koleksiyon')?.scrollIntoView({ behavior: 'smooth' });
    });
  });
}

// ===== BAŞLAT =====
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

document.addEventListener('DOMContentLoaded', () => {
  if (window.location.hash) {
    const target = document.querySelector(window.location.hash);
    if (target) {
      setTimeout(() => target.scrollIntoView({ behavior: 'auto' }), 10);
    }
  } else {
    window.scrollTo(0, 0);
  }

  // Anchor linklere smooth scroll ekle (CSS'ten kaldırdık)
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  headerScrollSetup();
  mobilMenuSetup();
  navFilterSetup();
  filtreleriOlustur();
  urunleriYukle();
});