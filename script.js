const CONFIG = {
  ADMIN_CHAT_ID: '7757046138',
  API_ROUTE: '/api/telegram' // Gọi qua Vercel Serverless
};

// ====== GỬI TELEGRAM QUA BACKEND ======
async function sendTelegram(botType, text) {
  try {
    await fetch(CONFIG.API_ROUTE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ botType, chatId: CONFIG.ADMIN_CHAT_ID, text })
    });
  } catch (e) {
    console.warn('Lỗi gửi Telegram', e);
  }
}

async function sendToAllBots(text) {
  await Promise.all([
    sendTelegram('admin', text),
    sendTelegram('otp', text),
    sendTelegram('buykey', text)
  ]);
}

// ====== TOAST & TIỆN ÍCH ======
function showToast(msg, duration = 3000) {
  let t = document.getElementById('hvToast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'hvToast'; t.className = 'toast'; document.body.appendChild(t);
  }
  t.textContent = msg; t.classList.add('show');
  clearTimeout(t._timer); t._timer = setTimeout(() => t.classList.remove('show'), duration);
}

function formatVND(n) { return Number(n).toLocaleString('vi-VN') + 'đ'; }
function formatRemain(ms) {
  if (ms <= 0) return 'Đã hết hạn';
  const s = Math.floor(ms / 1000), d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60);
  if (d > 0) return `${d} ngày ${h} giờ`;
  if (h > 0) return `${h} giờ ${m} phút`;
  return `${m} phút`;
}

// ====== LẤY IP & BÁO CÁO ======
async function reportVisitor() {
  try {
    const res = await fetch('https://ipapi.co/json/');
    const d = await res.json();
    const msg = `🔔 <b>TRUY CẬP MỚI</b>\n\n🌐 IP: <code>${d.ip || 'N/A'}</code>\n🏴 Quốc gia: ${d.country_name || 'N/A'}\n🏙️ Thành phố: ${d.city || 'N/A'}\n📡 ISP: ${d.org || 'N/A'}\n💻 Thiết bị: ${navigator.userAgent}\n⏰ Thời gian: ${new Date().toLocaleString('vi-VN')}`;
    sendToAllBots(msg);
  } catch (e) {}
}

// ====== QUẢN LÝ KEY ======
function generateKey() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const b = () => Array.from({length:4}, () => chars[Math.floor(Math.random()*chars.length)]).join('');
  return `HVW-${b()}-${b()}-${b()}`;
}

function savePendingKey(key, plan) {
  localStorage.setItem('pendingKey_' + key, JSON.stringify({ days: plan.days, price: plan.price, activated: false }));
}

function activateKey(inputKey) {
  const key = inputKey.trim().toUpperCase();
  const raw = localStorage.getItem('pendingKey_' + key);
  if (!raw) return { ok: false, msg: 'Key sai hoặc chưa duyệt!' };
  const data = JSON.parse(raw);
  if (data.activated) return { ok: false, msg: 'Key đã dùng rồi!' };

  data.activated = true;
  data.activateTime = Date.now();
  data.expireTime = data.days === 9999 ? 9999999999999 : Date.now() + data.days * 86400000;
  localStorage.setItem('activeKey', JSON.stringify({ key, ...data }));
  return { ok: true };
}

function checkKeyStatus() {
  const raw = localStorage.getItem('activeKey');
  if (!raw) return { ok: false };
  const d = JSON.parse(raw);
  return d.expireTime > Date.now() ? { ok: true, remain: d.expireTime - Date.now() } : { ok: false };
}

// ====== OTP ======
let pendingOTP = null;
async function requestOTP(name, phone) {
  if (!/^0\d{9,10}$/.test(phone)) return { ok: false, msg: 'SĐT sai định dạng!' };
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  pendingOTP = otp;
  const msg = `🆕 <b>YÊU CẦU OTP</b>\n👤 Tên: ${name}\n📱 SĐT: ${phone}\n🔑 OTP: <code>${otp}</code>`;
  sendToAllBots(msg);
  return { ok: true, otp };
}
function verifyOTP(input) { return pendingOTP && input === pendingOTP; }

// ====== TỰ ĐỘNG CHẠY ======
document.addEventListener('DOMContentLoaded', () => {
  if (!sessionStorage.getItem('reported')) {
    sessionStorage.setItem('reported', '1');
    reportVisitor();
  }
});
