// ===== SPEED CHATBOT =====
// Hazır sorular ve cevaplarla çalışan AI destekli chatbot widget

const CHATBOT_DATA = {
  karsilama: "Merhaba! 👋 Ben SPEED'in yapay zekâ asistanıyım. Size nasıl yardımcı olabilirim?",
  sorular: [
    {
      id: "kargo",
      soru: "🚚 Kargo ücretsiz mi?",
      cevap: "Evet! SPEED mağazasında tüm siparişlerde kargo tamamen ücretsizdir. Siparişiniz 1-3 iş günü içinde kapınıza teslim edilir. 📦"
    },
    {
      id: "iade",
      soru: "🔄 İade ve değişim politikası nedir?",
      cevap: "Ürünlerimizi teslim aldıktan sonra 14 gün içinde ücretsiz iade veya değişim yapabilirsiniz. Ürünün kullanılmamış ve orijinal ambalajında olması yeterlidir. İade süreciniz 3-5 iş günü içinde tamamlanır. ✅"
    },
    {
      id: "orijinal",
      soru: "✅ Ürünler orijinal mi?",
      cevap: "Kesinlikle! SPEED'de satılan tüm ayakkabılar %100 orijinal ve garantilidir. Her ürün yetkili distribütörlerden temin edilmektedir. Orijinallik belgesi ile birlikte gönderilir. 🏆"
    },
    {
      id: "beden",
      soru: "📏 Beden tablosu nasıl?",
      cevap: "Ayakkabılarımız standart Avrupa numaralandırması (EU) ile üretilmektedir.\n\n👟 Erkek: 39-45 arası bedenler\n👠 Kadın: 36-41 arası bedenler\n👦 Çocuk: 28-35 arası bedenler\n\nEğer iki beden arasında kalıyorsanız, bir üst bedeni tercih etmenizi öneriyoruz."
    },
    {
      id: "siparis",
      soru: "🛒 Nasıl sipariş verebilirim?",
      cevap: "Sipariş vermek çok kolay! Beğendiğiniz ürünün detay sayfasına gidin ve \"WhatsApp ile Sipariş Ver\" butonuna tıklayın. Ürün bilgileri otomatik olarak mesajınıza eklenir. Temsilcimiz en kısa sürede sizinle iletişime geçecektir. 💬"
    },
    {
      id: "odeme",
      soru: "💳 Ödeme seçenekleri nelerdir?",
      cevap: "Aşağıdaki ödeme yöntemlerini kabul ediyoruz:\n\n💳 Kredi / Banka Kartı\n🏦 Havale / EFT\n📱 Kapıda ödeme (Nakit veya Kart)\n\nTüm ödemeleriniz 256-bit SSL şifreleme ile güvence altındadır. 🔒"
    },
    {
      id: "indirim",
      soru: "🏷️ İndirimlerden nasıl haberdar olabilirim?",
      cevap: "İndirimli ürünlerimiz koleksiyon sayfamızda \"İndirim\" etiketi ile gösterilmektedir. Yeni kampanyalardan anında haberdar olmak için sitemizi düzenli olarak ziyaret edebilirsiniz. Sınırlı sayıda ürünlerimizi kaçırmayın! 🔥"
    },
    {
      id: "iletisim",
      soru: "📞 Müşteri hizmetlerine nasıl ulaşırım?",
      cevap: "Bize aşağıdaki kanallardan ulaşabilirsiniz:\n\n📱 WhatsApp: 0555 555 55 55\n📧 E-posta: info@speedshoes.com\n⏰ Çalışma saatleri: Hafta içi 09:00 - 18:00\n\nEn hızlı yanıt için WhatsApp'ı tercih edebilirsiniz! 💬"
    }
  ]
};

function initChatbot() {
  // Widget HTML'ini oluştur
  const chatbotHTML = `
    <!-- Chatbot Toggle Button -->
    <button id="chatbot-toggle" aria-label="Chatbot'u aç" class="chatbot-toggle">
      <svg id="chatbot-icon-open" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
      </svg>
      <svg id="chatbot-icon-close" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="hidden">
        <path d="M18 6L6 18M6 6l12 12"/>
      </svg>
      <span class="chatbot-badge hidden" id="chatbot-badge">1</span>
    </button>

    <!-- Chatbot Panel -->
    <div id="chatbot-panel" class="chatbot-panel chatbot-hidden">
      <!-- Header -->
      <div class="chatbot-header">
        <div class="chatbot-header-info">
          <div class="chatbot-avatar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 8V4H8"/>
              <rect width="16" height="12" x="4" y="8" rx="2"/>
              <path d="M2 14h2"/>
              <path d="M20 14h2"/>
              <path d="M15 13v2"/>
              <path d="M9 13v2"/>
            </svg>
          </div>
          <div>
            <h3 class="chatbot-title">SPEED Asistan</h3>
            <p class="chatbot-status">
              <span class="chatbot-status-dot"></span>
              Çevrimiçi
            </p>
          </div>
        </div>
        <button id="chatbot-close" class="chatbot-close-btn" aria-label="Chatbot'u kapat">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- Messages -->
      <div id="chatbot-messages" class="chatbot-messages"></div>

      <!-- Quick Replies -->
      <div id="chatbot-replies" class="chatbot-replies"></div>
    </div>
  `;

  // Widget'ı DOM'a ekle
  const container = document.createElement('div');
  container.id = 'chatbot-widget';
  container.innerHTML = chatbotHTML;
  document.body.appendChild(container);

  // DOM elemanlarını seç
  const toggle = document.getElementById('chatbot-toggle');
  const panel = document.getElementById('chatbot-panel');
  const closeBtn = document.getElementById('chatbot-close');
  const messagesDiv = document.getElementById('chatbot-messages');
  const repliesDiv = document.getElementById('chatbot-replies');
  const iconOpen = document.getElementById('chatbot-icon-open');
  const iconClose = document.getElementById('chatbot-icon-close');
  const badge = document.getElementById('chatbot-badge');

  let isOpen = false;
  let isFirstOpen = true;

  // Toggle chatbot
  function toggleChatbot() {
    isOpen = !isOpen;
    if (isOpen) {
      panel.classList.remove('chatbot-hidden');
      panel.classList.add('chatbot-visible');
      iconOpen.classList.add('hidden');
      iconClose.classList.remove('hidden');
      badge.classList.add('hidden');
      toggle.classList.add('chatbot-toggle-active');

      if (isFirstOpen) {
        isFirstOpen = false;
        showWelcome();
      }
    } else {
      panel.classList.add('chatbot-hidden');
      panel.classList.remove('chatbot-visible');
      iconOpen.classList.remove('hidden');
      iconClose.classList.add('hidden');
      toggle.classList.remove('chatbot-toggle-active');
    }
  }

  toggle.addEventListener('click', toggleChatbot);
  closeBtn.addEventListener('click', toggleChatbot);

  // Karşılama mesajı göster
  function showWelcome() {
    addBotMessage(CHATBOT_DATA.karsilama);
    setTimeout(() => {
      showQuickReplies();
    }, 800);
  }

  // Bot mesajı ekle (yazıyor animasyonlu)
  function addBotMessage(text) {
    // Typing indicator
    const typingDiv = document.createElement('div');
    typingDiv.className = 'chatbot-msg chatbot-msg-bot';
    typingDiv.innerHTML = `
      <div class="chatbot-msg-avatar">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 8V4H8"/>
          <rect width="16" height="12" x="4" y="8" rx="2"/>
          <path d="M2 14h2"/>
          <path d="M20 14h2"/>
          <path d="M15 13v2"/>
          <path d="M9 13v2"/>
        </svg>
      </div>
      <div class="chatbot-bubble chatbot-bubble-bot">
        <div class="chatbot-typing">
          <span></span><span></span><span></span>
        </div>
      </div>
    `;
    messagesDiv.appendChild(typingDiv);
    scrollToBottom();

    // Simüle edilmiş düşünme süresi
    setTimeout(() => {
      const bubble = typingDiv.querySelector('.chatbot-bubble-bot');
      bubble.innerHTML = formatMessage(text);
      bubble.classList.add('chatbot-bubble-appear');
      scrollToBottom();
    }, 600 + Math.random() * 400);
  }

  // Kullanıcı mesajı ekle
  function addUserMessage(text) {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'chatbot-msg chatbot-msg-user';
    msgDiv.innerHTML = `
      <div class="chatbot-bubble chatbot-bubble-user chatbot-bubble-appear">
        ${formatMessage(text)}
      </div>
    `;
    messagesDiv.appendChild(msgDiv);
    scrollToBottom();
  }

  // Mesaj formatlama (\n → <br>)
  function formatMessage(text) {
    return text.replace(/\n/g, '<br>');
  }

  // Quick reply butonlarını göster
  function showQuickReplies() {
    repliesDiv.innerHTML = '';
    CHATBOT_DATA.sorular.forEach((s, i) => {
      const btn = document.createElement('button');
      btn.className = 'chatbot-quick-btn';
      btn.textContent = s.soru;
      btn.style.animationDelay = `${i * 0.05}s`;
      btn.addEventListener('click', () => handleQuestion(s));
      repliesDiv.appendChild(btn);
    });
  }

  // Soru tıklanınca
  function handleQuestion(soruObj) {
    addUserMessage(soruObj.soru);

    // Butonları geçici olarak devre dışı bırak
    repliesDiv.querySelectorAll('.chatbot-quick-btn').forEach(b => {
      b.disabled = true;
      b.classList.add('chatbot-btn-disabled');
    });

    setTimeout(() => {
      addBotMessage(soruObj.cevap);
      // Tekrar cevap verdikten sonra butonları göster
      setTimeout(() => {
        showQuickReplies();
      }, 1200);
    }, 300);
  }

  // Otomatik scroll
  function scrollToBottom() {
    setTimeout(() => {
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }, 50);
  }

  // İlk açılış badge
  setTimeout(() => {
    if (!isOpen) {
      badge.classList.remove('hidden');
    }
  }, 2000);
}

// Stil ekle
function injectChatbotStyles() {
  const style = document.createElement('style');
  style.textContent = `
    /* ===== CHATBOT WIDGET ===== */

    /* Toggle Button */
    .chatbot-toggle {
      position: fixed;
      bottom: 1.5rem;
      right: 1.5rem;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: linear-gradient(135deg, #22c55e, #16a34a);
      color: white;
      border: none;
      cursor: pointer;
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 24px rgba(34, 197, 94, 0.4);
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .chatbot-toggle:hover {
      transform: scale(1.1);
      box-shadow: 0 6px 32px rgba(34, 197, 94, 0.5);
    }

    .chatbot-toggle:active {
      transform: scale(0.95);
    }

    .chatbot-toggle-active {
      background: linear-gradient(135deg, #333, #555) !important;
      box-shadow: 0 4px 16px rgba(0,0,0,0.3) !important;
    }

    /* Badge */
    .chatbot-badge {
      position: absolute;
      top: -2px;
      right: -2px;
      width: 20px;
      height: 20px;
      background: #ef4444;
      color: white;
      border-radius: 50%;
      font-size: 11px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: chatbotPop 0.3s ease;
    }

    /* Panel */
    .chatbot-panel {
      position: fixed;
      bottom: 6rem;
      right: 1.5rem;
      width: 380px;
      max-height: 520px;
      background: rgba(15, 15, 15, 0.95);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 24px;
      z-index: 9998;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      box-shadow:
        0 25px 50px -12px rgba(0,0,0,0.6),
        0 0 0 1px rgba(255,255,255,0.05);
      transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .chatbot-hidden {
      opacity: 0;
      transform: translateY(20px) scale(0.95);
      pointer-events: none;
    }

    .chatbot-visible {
      opacity: 1;
      transform: translateY(0) scale(1);
      pointer-events: all;
    }

    /* Header */
    .chatbot-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
      border-bottom: 1px solid rgba(255,255,255,0.06);
      background: rgba(255,255,255,0.03);
    }

    .chatbot-header-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .chatbot-avatar {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      background: linear-gradient(135deg, #22c55e, #16a34a);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }

    .chatbot-title {
      font-size: 14px;
      font-weight: 700;
      color: white;
      margin: 0;
    }

    .chatbot-status {
      font-size: 11px;
      color: rgba(255,255,255,0.5);
      display: flex;
      align-items: center;
      gap: 5px;
      margin: 2px 0 0 0;
    }

    .chatbot-status-dot {
      width: 7px;
      height: 7px;
      background: #22c55e;
      border-radius: 50%;
      display: inline-block;
      animation: chatbotPulse 2s ease-in-out infinite;
    }

    .chatbot-close-btn {
      width: 32px;
      height: 32px;
      border-radius: 10px;
      background: rgba(255,255,255,0.06);
      border: none;
      color: rgba(255,255,255,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
    }

    .chatbot-close-btn:hover {
      background: rgba(255,255,255,0.12);
      color: white;
    }

    /* Messages Area */
    .chatbot-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px 16px 8px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      max-height: 300px;
      min-height: 120px;
      scrollbar-width: thin;
      scrollbar-color: rgba(255,255,255,0.1) transparent;
    }

    .chatbot-messages::-webkit-scrollbar {
      width: 4px;
    }

    .chatbot-messages::-webkit-scrollbar-thumb {
      background: rgba(255,255,255,0.1);
      border-radius: 2px;
    }

    /* Message Bubbles */
    .chatbot-msg {
      display: flex;
      gap: 8px;
      align-items: flex-end;
    }

    .chatbot-msg-bot {
      justify-content: flex-start;
    }

    .chatbot-msg-user {
      justify-content: flex-end;
    }

    .chatbot-msg-avatar {
      width: 28px;
      height: 28px;
      border-radius: 8px;
      background: linear-gradient(135deg, #22c55e, #16a34a);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      flex-shrink: 0;
    }

    .chatbot-bubble {
      padding: 10px 14px;
      font-size: 13px;
      line-height: 1.5;
      max-width: 85%;
      word-wrap: break-word;
    }

    .chatbot-bubble-bot {
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.05);
      border-radius: 16px 16px 16px 4px;
      color: rgba(255,255,255,0.85);
    }

    .chatbot-bubble-user {
      background: linear-gradient(135deg, #22c55e, #16a34a);
      border-radius: 16px 16px 4px 16px;
      color: white;
      font-weight: 500;
    }

    .chatbot-bubble-appear {
      animation: chatbotMsgAppear 0.3s ease;
    }

    /* Typing Indicator */
    .chatbot-typing {
      display: flex;
      gap: 4px;
      padding: 4px 2px;
    }

    .chatbot-typing span {
      width: 6px;
      height: 6px;
      background: rgba(255,255,255,0.3);
      border-radius: 50%;
      animation: chatbotTyping 1.4s ease-in-out infinite;
    }

    .chatbot-typing span:nth-child(2) {
      animation-delay: 0.2s;
    }

    .chatbot-typing span:nth-child(3) {
      animation-delay: 0.4s;
    }

    /* Quick Replies */
    .chatbot-replies {
      padding: 8px 16px 16px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      max-height: 200px;
      overflow-y: auto;
      scrollbar-width: thin;
      scrollbar-color: rgba(255,255,255,0.1) transparent;
    }

    .chatbot-replies::-webkit-scrollbar {
      width: 4px;
    }

    .chatbot-replies::-webkit-scrollbar-thumb {
      background: rgba(255,255,255,0.1);
      border-radius: 2px;
    }

    .chatbot-quick-btn {
      width: 100%;
      padding: 10px 14px;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 12px;
      color: rgba(255,255,255,0.8);
      font-size: 12.5px;
      font-weight: 500;
      text-align: left;
      cursor: pointer;
      transition: all 0.2s;
      font-family: inherit;
      animation: chatbotSlideUp 0.3s ease backwards;
    }

    .chatbot-quick-btn:hover {
      background: rgba(34, 197, 94, 0.1);
      border-color: rgba(34, 197, 94, 0.3);
      color: #22c55e;
      transform: translateX(4px);
    }

    .chatbot-quick-btn:active {
      transform: scale(0.98);
    }

    .chatbot-btn-disabled {
      opacity: 0.4;
      pointer-events: none;
    }

    /* Animations */
    @keyframes chatbotPop {
      0% { transform: scale(0); }
      50% { transform: scale(1.2); }
      100% { transform: scale(1); }
    }

    @keyframes chatbotPulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }

    @keyframes chatbotTyping {
      0%, 100% { opacity: 0.3; transform: translateY(0); }
      50% { opacity: 1; transform: translateY(-3px); }
    }

    @keyframes chatbotMsgAppear {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes chatbotSlideUp {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Mobile Responsive */
    @media (max-width: 480px) {
      .chatbot-panel {
        right: 0;
        bottom: 0;
        width: 100%;
        max-height: 100%;
        height: 100dvh;
        border-radius: 0;
      }

      .chatbot-messages {
        max-height: none;
        flex: 1;
      }

      .chatbot-toggle {
        bottom: 1rem;
        right: 1rem;
      }
    }

    /* Safe Area */
    @supports (padding-bottom: env(safe-area-inset-bottom)) {
      .chatbot-toggle {
        bottom: calc(env(safe-area-inset-bottom) + 1.5rem);
      }

      .chatbot-replies {
        padding-bottom: calc(env(safe-area-inset-bottom) + 16px);
      }
    }

    /* Hidden utility */
    .hidden {
      display: none !important;
    }
  `;
  document.head.appendChild(style);
}

// DOM hazır olduğunda başlat
document.addEventListener('DOMContentLoaded', () => {
  injectChatbotStyles();
  initChatbot();
});
