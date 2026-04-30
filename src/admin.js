import {
  isFirebaseConfigured,
  adminGiris,
  adminCikis,
  authDurumunuDinle,
  getUrunler,
  urunEkle,
  urunGuncelle,
  urunSil,
  resimYukle,
} from './firestore-service.js';

const MAX_RESIM = 5;

// ===== DOM =====
const loginScreen = document.getElementById('login-screen');
const dashboard = document.getElementById('dashboard');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const firebaseWarning = document.getElementById('firebase-warning');
const logoutBtn = document.getElementById('logout-btn');

const urunTablosu = document.getElementById('urun-tablosu');
const tabloBos = document.getElementById('tablo-bos');
const urunEkleBtn = document.getElementById('urun-ekle-btn');

const urunModal = document.getElementById('urun-modal');
const modalBaslik = document.getElementById('modal-baslik');
const modalKapat = document.getElementById('modal-kapat');
const modalOverlay = document.getElementById('modal-overlay');
const urunForm = document.getElementById('urun-form');
const formIptal = document.getElementById('form-iptal');
const formResimler = document.getElementById('form-resimler');
const resimOnizleme = document.getElementById('resim-onizleme');

const formFiyat = document.getElementById('form-fiyat');
const formEskiFiyat = document.getElementById('form-eski-fiyat');
const indirimOnizleme = document.getElementById('indirim-onizleme');
const indirimYuzdeText = document.getElementById('indirim-yuzde-text');
const btnIndirimSabit = document.getElementById('btn-indirim-sabit');
const btnIndirimYuzde = document.getElementById('btn-indirim-yuzde');
const formIndirimTipi = document.getElementById('form-indirim-tipi');
const resimSayac = document.getElementById('resim-sayac');

const dosyaYukleAlan = document.getElementById('dosya-yukle-alan');
const formDosya = document.getElementById('form-dosya');
const yuklemeDurumu = document.getElementById('yukleme-durumu');
const yuklemeBar = document.getElementById('yukleme-bar');
const yuklemeText = document.getElementById('yukleme-text');

const silmeModal = document.getElementById('silme-modal');
const silmeOverlay = document.getElementById('silme-overlay');
const silmeOnayla = document.getElementById('silme-onayla');
const silmeIptal = document.getElementById('silme-iptal');
const silmeMesaj = document.getElementById('silme-mesaj');

let silinecekId = null;
let hesaplananYuzde = 0;

// ===== YARDIMCI: Fiyat parse =====
function parseFiyat(str) {
  if (!str) return 0;
  return parseFloat(str.replace(/[^\d]/g, '')) || 0;
}

// ===== Firebase Kontrol =====
if (!isFirebaseConfigured) {
  firebaseWarning?.classList.remove('hidden');
}

// ===== AUTH DURUMU =====
function ekranGoster(girisYapildi) {
  if (girisYapildi) {
    loginScreen.classList.add('hidden');
    dashboard.classList.remove('hidden');
    urunleriListele();
  } else {
    loginScreen.classList.remove('hidden');
    dashboard.classList.add('hidden');
  }
}

authDurumunuDinle((user) => {
  ekranGoster(!!user);
});

// ===== GİRİŞ =====
loginForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  loginError.classList.add('hidden');

  if (!isFirebaseConfigured) {
    loginError.textContent = 'Firebase yapılandırılmamış. Lütfen firebase-config.js dosyasını düzenleyin.';
    loginError.classList.remove('hidden');
    return;
  }

  const email = document.getElementById('login-email').value;
  const sifre = document.getElementById('login-sifre').value;

  try {
    await adminGiris(email, sifre);
  } catch (err) {
    console.error('Giriş hatası:', err);
    loginError.textContent = 'Email veya şifre hatalı.';
    loginError.classList.remove('hidden');
  }
});

// ===== ÇIKIŞ =====
logoutBtn?.addEventListener('click', async () => {
  await adminCikis();
});

// ===== İNDİRİM HESAPLAMA =====
function indirimHesapla() {
  const yeniFiyat = parseFiyat(formFiyat?.value);
  const eskiFiyat = parseFiyat(formEskiFiyat?.value);

  if (eskiFiyat > 0 && yeniFiyat > 0 && eskiFiyat > yeniFiyat) {
    hesaplananYuzde = Math.floor(((eskiFiyat - yeniFiyat) / eskiFiyat) * 100);
    indirimYuzdeText.textContent = `%${hesaplananYuzde} indirim hesaplandı`;
    indirimOnizleme.classList.remove('hidden');

    // Varsayılan olarak yüzde seç
    if (!formIndirimTipi.value) {
      indirimTipiSec('yuzde');
    }
  } else {
    hesaplananYuzde = 0;
    indirimOnizleme.classList.add('hidden');
    formIndirimTipi.value = '';
    indirimButonlariGuncelle();
  }
}

function indirimTipiSec(tip) {
  formIndirimTipi.value = tip;
  indirimButonlariGuncelle();
}

function indirimButonlariGuncelle() {
  const tip = formIndirimTipi.value;
  // Sabit buton
  if (tip === 'sabit') {
    btnIndirimSabit.className = 'text-xs px-3 py-1 rounded-full border border-orange-500 bg-orange-500 text-white transition-all';
    btnIndirimYuzde.className = 'text-xs px-3 py-1 rounded-full border border-surface-600 text-surface-400 transition-all';
  } else if (tip === 'yuzde') {
    btnIndirimYuzde.className = 'text-xs px-3 py-1 rounded-full border border-orange-500 bg-orange-500 text-white transition-all';
    btnIndirimSabit.className = 'text-xs px-3 py-1 rounded-full border border-surface-600 text-surface-400 transition-all';
  } else {
    btnIndirimSabit.className = 'text-xs px-3 py-1 rounded-full border border-surface-600 text-surface-400 transition-all';
    btnIndirimYuzde.className = 'text-xs px-3 py-1 rounded-full border border-surface-600 text-surface-400 transition-all';
  }
}

formFiyat?.addEventListener('input', indirimHesapla);
formEskiFiyat?.addEventListener('input', indirimHesapla);
btnIndirimSabit?.addEventListener('click', () => indirimTipiSec('sabit'));
btnIndirimYuzde?.addEventListener('click', () => indirimTipiSec('yuzde'));

// ===== RESİM SAYACI =====
function resimSayacGuncelle() {
  const urls = formResimler.value.split('\n').filter(u => u.trim());
  const sayi = Math.min(urls.length, MAX_RESIM);
  resimSayac.textContent = `${sayi} / ${MAX_RESIM}`;
  resimSayac.className = sayi >= MAX_RESIM ? 'text-xs text-red-400' : 'text-xs text-surface-500';
}

// ===== DOSYA YÜKLEME =====
dosyaYukleAlan?.addEventListener('click', () => formDosya?.click());

formDosya?.addEventListener('change', async (e) => {
  const files = Array.from(e.target.files);
  if (!files.length) return;

  const mevcutUrls = formResimler.value.split('\n').filter(u => u.trim());
  const kalanSlot = MAX_RESIM - mevcutUrls.length;

  if (kalanSlot <= 0) {
    alert(`En fazla ${MAX_RESIM} resim ekleyebilirsiniz.`);
    return;
  }

  const yuklenecekler = files.slice(0, kalanSlot);

  if (!isFirebaseConfigured) {
    alert('Dosya yükleme için Firebase Storage gerekli.\nŞimdilik resim URL\'si yapıştırabilirsiniz.');
    return;
  }

  // Yükleme UI göster
  yuklemeDurumu.classList.remove('hidden');
  let yuklenen = 0;

  for (const dosya of yuklenecekler) {
    try {
      yuklemeText.textContent = `${dosya.name} yükleniyor...`;
      const yuzde = Math.round((yuklenen / yuklenecekler.length) * 100);
      yuklemeBar.style.width = `${yuzde}%`;

      const timestamp = Date.now();
      // 30 saniye timeout ekle
      const uploadPromise = resimYukle(dosya, `${timestamp}-${dosya.name}`);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Yükleme zaman aşımına uğradı. Firebase Storage kurallarını kontrol edin.')), 30000)
      );
      const url = await Promise.race([uploadPromise, timeoutPromise]);

      if (url) {
        const mevcut = formResimler.value.trim();
        formResimler.value = mevcut ? `${mevcut}\n${url}` : url;
      }
      yuklenen++;
    } catch (err) {
      console.error('Yükleme hatası:', err);
      alert(`${dosya.name}: ${err.message || 'Yükleme hatası.'}\n\nFirebase Console → Storage → Rules bölümünden kuralları ayarlayın.`);
    }
  }

  yuklemeBar.style.width = '100%';
  yuklemeText.textContent = `${yuklenen} resim yüklendi!`;

  setTimeout(() => {
    yuklemeDurumu.classList.add('hidden');
    yuklemeBar.style.width = '0%';
  }, 2000);

  // Önizlemeyi güncelle
  formResimler.dispatchEvent(new Event('input'));
  formDosya.value = '';
});

// ===== RESİM ÖNİZLEME =====
formResimler?.addEventListener('input', () => {
  const urls = formResimler.value.split('\n').filter(u => u.trim()).slice(0, MAX_RESIM);
  resimOnizleme.innerHTML = urls.map((url, i) => `
    <div class="relative group/thumb">
      <div class="w-16 h-16 rounded-lg overflow-hidden bg-surface-800">
        <img src="${url.trim()}" alt="Önizleme" class="w-full h-full object-cover" onerror="this.style.display='none'">
      </div>
      <button type="button" data-index="${i}" class="remove-img absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-opacity">×</button>
    </div>
  `).join('');

  // Resim silme butonları
  resimOnizleme.querySelectorAll('.remove-img').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.index);
      const urls = formResimler.value.split('\n').filter(u => u.trim());
      urls.splice(idx, 1);
      formResimler.value = urls.join('\n');
      formResimler.dispatchEvent(new Event('input'));
    });
  });

  resimSayacGuncelle();
});

// ===== ÜRÜN LİSTELEME =====
async function urunleriListele() {
  try {
    const urunler = await getUrunler();
    istatistikleriGuncelle(urunler);

    if (urunler.length === 0) {
      urunTablosu.innerHTML = '';
      tabloBos?.classList.remove('hidden');
      return;
    }

    tabloBos?.classList.add('hidden');

    urunTablosu.innerHTML = urunler.map(u => {
      const resim = Array.isArray(u.resimler) && u.resimler.length > 0 ? u.resimler[0] : '';
      const fiyatGosterim = u.eskiFiyat
        ? `<span class="font-semibold">${u.fiyat}</span> <span class="text-surface-500 line-through text-xs">${u.eskiFiyat}</span>`
        : `<span class="font-semibold">${u.fiyat}</span>`;
      return `
        <tr class="border-b border-surface-800/50 hover:bg-surface-800/30 transition-colors">
          <td class="px-6 py-4">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-xl bg-surface-800 overflow-hidden flex-shrink-0">
                ${resim ? `<img src="${resim}" alt="${u.ad}" class="w-full h-full object-cover">` : ''}
              </div>
              <div>
                <p class="font-semibold text-sm">${u.ad}</p>
                <p class="text-surface-500 text-xs md:hidden">${u.kategori}</p>
              </div>
            </div>
          </td>
          <td class="px-6 py-4 hidden md:table-cell">
            <span class="text-sm text-surface-400 bg-surface-800 px-3 py-1 rounded-full">${u.kategori}</span>
          </td>
          <td class="px-6 py-4 text-sm">${fiyatGosterim}</td>
          <td class="px-6 py-4 text-right">
            <div class="flex justify-end gap-2">
              <button onclick="window.urunDuzenle('${u.id}')" class="p-2 rounded-lg hover:bg-surface-700 transition-colors text-surface-400 hover:text-white" title="Düzenle">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
              <button onclick="window.urunSilOnay('${u.id}', '${u.ad}')" class="p-2 rounded-lg hover:bg-red-500/10 transition-colors text-surface-400 hover:text-red-400" title="Sil">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </div>
          </td>
        </tr>`;
    }).join('');
  } catch (err) {
    console.error('Ürünler listelenirken hata:', err);
  }
}

// ===== İSTATİSTİKLER =====
function istatistikleriGuncelle(urunler) {
  document.getElementById('stat-toplam').textContent = urunler.length;
  document.getElementById('stat-erkek').textContent = urunler.filter(u => u.kategori === 'Erkek').length;
  document.getElementById('stat-kadin').textContent = urunler.filter(u => u.kategori === 'Kadın').length;
  document.getElementById('stat-spor').textContent = urunler.filter(u => u.kategori === 'Spor').length;
}

// ===== MODAL AÇMA/KAPAMA =====
function modalAc(duzenle = false) {
  urunModal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  modalBaslik.textContent = duzenle ? 'Ürünü Düzenle' : 'Yeni Ürün Ekle';
}

function modalKapatFn() {
  urunModal.classList.add('hidden');
  document.body.style.overflow = '';
  urunForm.reset();
  document.getElementById('form-id').value = '';
  formIndirimTipi.value = '';
  hesaplananYuzde = 0;
  indirimOnizleme.classList.add('hidden');
  indirimButonlariGuncelle();
  resimOnizleme.innerHTML = '';
  resimSayacGuncelle();
}

urunEkleBtn?.addEventListener('click', () => modalAc(false));
modalKapat?.addEventListener('click', modalKapatFn);
modalOverlay?.addEventListener('click', modalKapatFn);
formIptal?.addEventListener('click', modalKapatFn);

// ===== ETİKET BELİRLEME =====
function etiketBelirle() {
  const indirimTipi = formIndirimTipi.value;
  const formEtiket = document.getElementById('form-etiket').value;

  // İndirim varsa indirim etiketi öncelikli
  if (indirimTipi === 'sabit' && hesaplananYuzde > 0) {
    return 'İndirim';
  }
  if (indirimTipi === 'yuzde' && hesaplananYuzde > 0) {
    return `%${hesaplananYuzde} İndirim`;
  }
  // İndirim yoksa normal etiket
  return formEtiket;
}

// ===== FORM KAYDET =====
urunForm?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const id = document.getElementById('form-id').value;
  const resimlerRaw = document.getElementById('form-resimler').value
    .split('\n').filter(u => u.trim()).map(u => u.trim()).slice(0, MAX_RESIM);

  const veri = {
    ad: document.getElementById('form-ad').value,
    fiyat: document.getElementById('form-fiyat').value,
    eskiFiyat: document.getElementById('form-eski-fiyat').value || '',
    kategori: document.getElementById('form-kategori').value,
    aciklama: document.getElementById('form-aciklama').value,
    etiket: etiketBelirle(),
    sira: parseInt(document.getElementById('form-sira').value) || 1,
    resimler: resimlerRaw,
  };

  try {
    if (id) {
      await urunGuncelle(id, veri);
    } else {
      await urunEkle(veri);
    }
    modalKapatFn();
    await urunleriListele();
  } catch (err) {
    console.error('Kaydetme hatası:', err);
    alert('Ürün kaydedilirken bir hata oluştu.');
  }
});

// ===== ÜRÜN DÜZENLE =====
window.urunDuzenle = async function (id) {
  try {
    const { getUrunById } = await import('./firestore-service.js');
    const urun = await getUrunById(id);
    if (!urun) return;

    document.getElementById('form-id').value = urun.id;
    document.getElementById('form-ad').value = urun.ad || '';
    document.getElementById('form-fiyat').value = urun.fiyat || '';
    document.getElementById('form-eski-fiyat').value = urun.eskiFiyat || '';
    document.getElementById('form-kategori').value = urun.kategori || '';
    document.getElementById('form-aciklama').value = urun.aciklama || '';
    document.getElementById('form-sira').value = urun.sira || 1;
    document.getElementById('form-resimler').value = (urun.resimler || []).join('\n');

    // Etiket: İndirim etiketleri ayrı handle
    const etiket = urun.etiket || '';
    if (etiket.includes('İndirim')) {
      if (etiket === 'İndirim') {
        formIndirimTipi.value = 'sabit';
      } else {
        formIndirimTipi.value = 'yuzde';
      }
      document.getElementById('form-etiket').value = '';
    } else {
      document.getElementById('form-etiket').value = etiket;
      formIndirimTipi.value = '';
    }

    // İndirim hesapla ve önizlemeyi güncelle
    indirimHesapla();
    indirimButonlariGuncelle();

    // Resim önizleme
    formResimler.dispatchEvent(new Event('input'));

    modalAc(true);
  } catch (err) {
    console.error('Düzenleme hatası:', err);
  }
};

// ===== ÜRÜN SİLME =====
window.urunSilOnay = function (id, ad) {
  silinecekId = id;
  silmeMesaj.textContent = `"${ad}" ürününü silmek istediğinize emin misiniz?`;
  silmeModal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
};

function silmeModalKapat() {
  silmeModal.classList.add('hidden');
  document.body.style.overflow = '';
  silinecekId = null;
}

silmeIptal?.addEventListener('click', silmeModalKapat);
silmeOverlay?.addEventListener('click', silmeModalKapat);

silmeOnayla?.addEventListener('click', async () => {
  if (!silinecekId) return;
  try {
    await urunSil(silinecekId);
    silmeModalKapat();
    await urunleriListele();
  } catch (err) {
    console.error('Silme hatası:', err);
    alert('Ürün silinirken bir hata oluştu.');
  }
});
