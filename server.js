const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const mysql = require('mysql2/promise');

const root = __dirname;
const port = Number(process.env.PORT || 3000);
const sessions = new Map();
const DEFAULT_SETTINGS = {
  meta_description: 'James Joseph Benjamin Jr. 纽约律师事务所，为跨境家庭、企业与个人提供清晰、稳健、值得托付的法律服务。',
  menu_label: '菜单', brand_aria: '律师事务所首页',
  whatsapp_url: 'https://wa.me/12125550188',
  telegram_url: 'https://t.me/chenlawnyc',
  lawyer_name: 'James Joseph Benjamin Jr.',
  firm_name: '纽约律师事务所',
  address: '纽约州纽约市曼哈顿',
  phone: '+1 (212) 555-0188',
  email: 'consult@chenlaw.nyc',
  hero_kicker: '纽约 · 法律服务',
  hero_line_one: '把复杂的事，',
  hero_line_two: '交给有判断力的人。',
  hero_desc: '以纽约法律实践为基础，为每一项重要决定提供清晰方向。',
  nav_about: '关于律师', nav_practice: '执业领域', nav_approach: '服务理念', nav_contact: '预约咨询',
  hero_cta: '预约一次初步沟通', scroll_cue: '向下浏览', hero_index_current: '01', hero_index_total: '04',
  about_marker: 'BACKGROUND', practice_marker: 'EXPERIENCE', approach_marker: 'OUR APPROACH',
  about_label: '专业背景', about_title_one: '深厚的教育背景，', about_title_two: '让判断更有根基。',
  about_lead: '毕业于美国纽约著名的卡多佐法学院（Cardozo School of Law），获得法律博士学位。',
  about_body: '在卡多佐法学院期间，接受了严格而系统的法学教育，也参与多个与法律实务相关的项目和实习。扎实的理论训练与真实案件经验，让每一次分析都建立在充分理解之上。',
  about_quote: '法律不是把问题说得更复杂，而是让重要的选择变得更清楚。', about_caption: 'New York · NY',
  practice_label: '执业经验', practice_title_one: '经验，是面对复杂局面时的', practice_title_two: '安定感。',
  practice_years: '多年', practice_note: '纽约执业经验\n持续深耕专业领域',
  practice_body_one: '曾供职于纽约知名律所，积累了大量实际操作经验。复杂的法律问题往往没有标准答案，真正重要的是迅速理解处境，找到可执行、可解释、适合当事人的路径。',
  practice_body_two: '以“术业有专攻”为理念，不断深化在商业、诉讼、家庭与跨境事务领域的知识与技能，力求让每一位客户都获得高效、个性化的法律解决方案。',
  practice_cta: '了解如何帮助您', approach_label: '客户至上', approach_title_one: '保障权益，', approach_title_two: '也守护您的从容。',
  approach_lead: '每一份托付都值得被认真对待。我们从倾听开始，以清晰的沟通和坚定的行动，陪伴您走过重要决定。',
  principle_one_title: '先理解，再行动', principle_one_body: '先完整理解您的目标、顾虑与时间线，再给出可行的法律路径。',
  principle_two_title: '让沟通保持清晰', principle_two_body: '不堆砌术语，不回避风险。每一步都解释清楚，让您拥有判断的依据。',
  principle_three_title: '为结果负责', principle_three_body: '无论案件大小，我们都以专业、及时和细致，争取并守护您的合法权益。',
  contact_label: '开始一次对话', contact_title_one: '有些问题，', contact_title_two: '值得尽早问清楚。',
  contact_desc: '请留下您的联系方式与简单情况，我们会在工作时间内与您联系，安排一次初步沟通。',
  whatsapp_label: 'WhatsApp', telegram_label: '电报 / Telegram',
  form_name_label: '姓名', form_name_placeholder: '您的姓名', form_email_label: '电子邮件', form_email_placeholder: 'you@example.com',
  form_phone_label: '电话号码', form_phone_placeholder: '+1', form_message_label: '想咨询的内容', form_message_placeholder: '请简要描述您希望了解的事项',
  form_note: '提交即表示您了解：此表单不构成律师代理关系。', form_submit: '提交咨询', form_success_title: '感谢您的留言。', form_success_body: '我们会尽快与您联系。',
  footer_about: '关于律师', footer_practice: '执业领域', footer_approach: '服务理念', footer_contact: '联系我们',
  footer_year: '© 2026 CHEN LAW OFFICE · NEW YORK', disclaimer_link: '免责声明', disclaimer: '律师广告。网站信息仅供参考，不构成法律意见或律师代理关系。之前成功案例不保证类似案件结果。'
};
const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon'
};

const pool = process.env.DATABASE_URL
  ? mysql.createPool({ uri: process.env.DATABASE_URL, waitForConnections: true, connectionLimit: 5, queueLimit: 0 })
  : null;
let databasePromise;

async function initializeDatabase() {
  if (!pool) throw new Error('DATABASE_URL is not configured');
  await pool.query(`
    CREATE TABLE IF NOT EXISTS site_settings (
      setting_key VARCHAR(64) PRIMARY KEY,
      setting_value TEXT NOT NULL,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS inquiries (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      email VARCHAR(190) NOT NULL,
      phone VARCHAR(80) NOT NULL,
      message TEXT NOT NULL,
      status VARCHAR(24) NOT NULL DEFAULT 'new',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX inquiries_created_at_idx (created_at),
      INDEX inquiries_status_idx (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  const seedEntries = Object.entries(DEFAULT_SETTINGS);
  const seedPlaceholders = seedEntries.map(() => '(?, ?)').join(', ');
  await pool.query(`INSERT IGNORE INTO site_settings (setting_key, setting_value) VALUES ${seedPlaceholders}`, seedEntries.flat());
}

function ensureDatabase() {
  if (!databasePromise) {
    databasePromise = initializeDatabase().catch((error) => {
      databasePromise = null;
      throw error;
    });
  }
  return databasePromise;
}

ensureDatabase().catch((error) => {
  console.error(`Database initialization unavailable: ${error.message}`);
});

function json(res, status, payload) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store'
  });
  res.end(JSON.stringify(payload));
}

function parseCookies(req) {
  return Object.fromEntries((req.headers.cookie || '').split(';').filter(Boolean).map((part) => {
    const index = part.indexOf('=');
    return [part.slice(0, index).trim(), decodeURIComponent(part.slice(index + 1).trim())];
  }));
}

function setSessionCookie(res, token, maxAge = 60 * 60 * 8) {
  res.setHeader('Set-Cookie', `admin_session=${encodeURIComponent(token)}; Max-Age=${maxAge}; Path=/; HttpOnly; SameSite=None; Secure`);
}

function clearSessionCookie(res) {
  res.setHeader('Set-Cookie', 'admin_session=; Max-Age=0; Path=/; HttpOnly; SameSite=None; Secure');
}

function getSession(req) {
  const token = parseCookies(req).admin_session;
  if (!token) return null;
  const session = sessions.get(token);
  if (!session || session.expiresAt < Date.now()) {
    sessions.delete(token);
    return null;
  }
  return session;
}

function isAdmin(req) {
  return Boolean(getSession(req));
}

function safeEqual(left, right) {
  const leftBuffer = Buffer.from(String(left || ''));
  const rightBuffer = Buffer.from(String(right || ''));
  return leftBuffer.length > 0 && leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function validUrl(value) {
  try {
    const parsed = new URL(String(value));
    return ['http:', 'https:'].includes(parsed.protocol) && parsed.hostname.length > 0;
  } catch {
    return false;
  }
}

async function readBody(req) {
  let body = '';
  for await (const chunk of req) {
    body += chunk;
    if (body.length > 1024 * 128) throw new Error('Request body too large');
  }
  if (!body) return {};
  return JSON.parse(body);
}

function safePath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0]);
  const normalized = path.normalize(decoded).replace(/^([.][.][/\\])+/, '');
  if (normalized.includes('..')) throw new Error('Invalid path');
  if (normalized === '/admin' || normalized === '/admin/') return path.join(root, 'admin.html');
  if (normalized === '/manus-routes.json') return path.join(root, 'public', 'manus-routes.json');
  if (normalized.startsWith('/images/')) return path.join(root, 'public', normalized);
  return path.join(root, normalized === '/' ? 'index.html' : normalized);
}

async function getSettings() {
  await ensureDatabase();
  const [rows] = await pool.query('SELECT setting_key, setting_value FROM site_settings');
  return rows.reduce((settings, row) => ({ ...settings, [row.setting_key]: row.setting_value }), { ...DEFAULT_SETTINGS });
}

async function handleApi(req, res, pathname) {
  if (pathname === '/api/site-settings' && req.method === 'GET') {
    try {
      const settings = await getSettings();
      return json(res, 200, settings);
    } catch (error) {
      return json(res, 503, { error: '服务暂时不可用，请稍后再试。' });
    }
  }

  if (pathname === '/api/contact' && req.method === 'POST') {
    try {
      const data = await readBody(req);
      const name = String(data.name || '').trim();
      const email = String(data.email || '').trim();
      const phone = String(data.phone || '').trim();
      const message = String(data.message || '').trim();
      if (!name || !email || !phone || !message || name.length > 120 || email.length > 190 || phone.length > 80 || message.length > 5000) {
        return json(res, 400, { error: '请完整填写有效的联系信息。' });
      }
      if (!/^\S+@\S+\.\S+$/.test(email)) return json(res, 400, { error: '请填写有效的电子邮件地址。' });
      await ensureDatabase();
      await pool.query('INSERT INTO inquiries (name, email, phone, message) VALUES (?, ?, ?, ?)', [name, email, phone, message]);
      return json(res, 201, { ok: true });
    } catch (error) {
      return json(res, error.message === 'Request body too large' ? 413 : 503, { error: '提交失败，请稍后再试。' });
    }
  }

  if (pathname === '/api/admin/login' && req.method === 'POST') {
    try {
      const data = await readBody(req);
      if (!process.env.ADMIN_PASSWORD) return json(res, 503, { error: '后台密码尚未配置。' });
      if (String(data.username || '') !== 'admin' || !safeEqual(data.password, process.env.ADMIN_PASSWORD)) {
        return json(res, 401, { error: '账户名或密码不正确。' });
      }
      const token = crypto.randomBytes(32).toString('hex');
      sessions.set(token, { username: 'admin', expiresAt: Date.now() + 8 * 60 * 60 * 1000 });
      setSessionCookie(res, token);
      return json(res, 200, { ok: true, username: 'admin' });
    } catch {
      return json(res, 400, { error: '登录请求无效。' });
    }
  }

  if (pathname === '/api/admin/logout' && req.method === 'POST') {
    const token = parseCookies(req).admin_session;
    if (token) sessions.delete(token);
    clearSessionCookie(res);
    return json(res, 200, { ok: true });
  }

  if (pathname === '/api/admin/me' && req.method === 'GET') {
    return json(res, 200, { authenticated: isAdmin(req), username: getSession(req)?.username || null });
  }

  if (pathname.startsWith('/api/admin/')) {
    if (!isAdmin(req)) return json(res, 401, { error: '请先登录后台。' });
    try {
      await ensureDatabase();
      if (pathname === '/api/admin/settings' && req.method === 'GET') {
        return json(res, 200, await getSettings());
      }
      if (pathname === '/api/admin/settings' && req.method === 'PUT') {
        const data = await readBody(req);
        const current = await getSettings();
        const next = { ...current };
        Object.keys(DEFAULT_SETTINGS).forEach((key) => {
          if (data[key] !== undefined) next[key] = String(data[key]).trim();
        });
        if (!validUrl(next.whatsapp_url) || !validUrl(next.telegram_url)) return json(res, 400, { error: 'WhatsApp 和电报必须是有效的 http 或 https 链接。' });
        const contentKeys = Object.keys(DEFAULT_SETTINGS).filter((key) => !['whatsapp_url', 'telegram_url'].includes(key));
        if (contentKeys.some((key) => !next[key] || next[key].length > 500)) return json(res, 400, { error: '前端内容不能为空，且每项不能超过 500 个字符。' });
        const entries = Object.entries(next);
        const placeholders = entries.map(() => '(?, ?)').join(', ');
        await pool.query(`INSERT INTO site_settings (setting_key, setting_value) VALUES ${placeholders} ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`, entries.flat());
        return json(res, 200, { ok: true, ...next });
      }
      if (pathname === '/api/admin/inquiries' && req.method === 'GET') {
        const [rows] = await pool.query('SELECT id, name, email, phone, message, status, created_at FROM inquiries ORDER BY created_at DESC LIMIT 200');
        return json(res, 200, { inquiries: rows });
      }
      return json(res, 404, { error: '接口不存在。' });
    } catch (error) {
      return json(res, 503, { error: '后台数据暂时不可用，请稍后再试。' });
    }
  }
  return false;
}

const server = http.createServer(async (req, res) => {
  const requestPath = req.url || '/';
  const pathname = requestPath.split('?')[0];
  if (pathname === '/health') return res.end('ok');
  if (pathname.startsWith('/api/')) {
    try {
      const handled = await handleApi(req, res, pathname);
      if (handled !== false) return;
    } catch {
      return json(res, 400, { error: '请求无效。' });
    }
  }

  let filePath;
  try {
    filePath = safePath(requestPath);
  } catch {
    res.writeHead(400);
    return res.end('Bad request');
  }
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) filePath = path.join(root, 'index.html');
  const ext = path.extname(filePath).toLowerCase();
  fs.readFile(filePath, (error, content) => {
    if (error) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('Server error');
    }
    res.writeHead(200, {
      'Content-Type': types[ext] || 'application/octet-stream',
      'Cache-Control': ext === '.html' || ext === '.json' ? 'no-cache' : 'public, max-age=3600'
    });
    res.end(content);
  });
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Chen Law website listening on http://0.0.0.0:${port}`);
});
