const loginView = document.querySelector('[data-login-view]');
const dashboard = document.querySelector('[data-dashboard]');
const loginForm = document.querySelector('[data-login-form]');
const loginError = document.querySelector('[data-login-error]');
const settingsForm = document.querySelector('[data-settings-form]');
const settingsError = document.querySelector('[data-settings-error]');
const settingsStatus = document.querySelector('[data-settings-status]');
const inquiriesList = document.querySelector('[data-inquiries-list]');
const allContent = document.querySelector('[data-all-content]');
const contentLabels = {
  menu_label:'移动端菜单文字', brand_aria:'品牌无障碍描述', nav_aria:'导航无障碍描述', brand_seal:'品牌印章文字', brand_url:'品牌链接地址', hero_image_url:'首屏图片地址', portrait_image_url:'肖像图片地址', lawyer_name:'律师姓名', firm_name:'事务所名称', address:'底部地址', phone:'联系电话', email:'联系邮箱',
  nav_about:'导航：关于律师', nav_practice:'导航：执业领域', nav_approach:'导航：服务理念', nav_contact:'导航：预约咨询', nav_about_url:'关于律师跳转地址', nav_practice_url:'执业领域跳转地址', nav_approach_url:'服务理念跳转地址', nav_contact_url:'预约咨询跳转地址',
  hero_kicker:'首屏眉题', hero_line_one:'首屏标题第一行', hero_line_two:'首屏标题第二行', hero_desc:'首屏说明', hero_cta:'首屏按钮', hero_cta_url:'首屏按钮跳转地址', practice_cta_url:'执业经验按钮跳转地址', ui_arrow:'全站箭头符号', back_to_top:'返回顶部文字', footer_back_url:'返回顶部跳转地址', scroll_aria:'滚动提示无障碍描述', scroll_cue:'向下浏览', scroll_cue_url:'向下浏览跳转地址', hero_index_current:'首屏页码当前值', hero_index_total:'首屏页码总数', section_one_number:'第一部分编号', section_two_number:'第二部分编号', section_three_number:'第三部分编号', principle_one_number:'理念一编号', principle_two_number:'理念二编号', principle_three_number:'理念三编号',
  about_marker:'教育背景英文标识', about_label:'教育背景栏目眉题', about_title_one:'教育背景标题第一行', about_title_two:'教育背景标题第二行', about_lead:'教育背景简介', about_body:'教育背景正文', about_quote:'教育背景引言', about_caption:'照片说明',
  practice_marker:'执业经验英文标识', practice_label:'执业经验栏目眉题', practice_title_one:'执业经验标题第一行', practice_title_two:'执业经验标题第二行', practice_years:'经验数字', practice_note:'经验数字说明', practice_body_one:'执业经验正文一', practice_body_two:'执业经验正文二', practice_cta:'执业经验按钮',
  approach_marker:'服务理念英文标识', approach_label:'服务理念栏目眉题', approach_title_one:'服务理念标题第一行', approach_title_two:'服务理念标题第二行', approach_lead:'服务理念简介', principle_one_title:'理念一标题', principle_one_body:'理念一正文', principle_two_title:'理念二标题', principle_two_body:'理念二正文', principle_three_title:'理念三标题', principle_three_body:'理念三正文',
  contact_label:'联系栏目眉题', contact_title_one:'联系标题第一行', contact_title_two:'联系标题第二行', contact_desc:'联系栏目说明', whatsapp_label:'WhatsApp 按钮文字', telegram_label:'电报按钮文字',
  form_name_label:'表单姓名标签', form_name_placeholder:'表单姓名提示', form_email_label:'表单邮箱标签', form_email_placeholder:'表单邮箱提示', form_phone_label:'表单电话标签', form_phone_placeholder:'表单电话提示', form_message_label:'表单内容标签', form_message_placeholder:'表单内容提示', form_note:'表单声明', form_submit:'表单提交按钮', form_submitting:'提交中提示', form_error_required:'必填项错误提示（英文）', form_error_email:'邮箱错误提示（英文）', form_error_submit:'提交失败提示（英文）', form_success_title:'提交成功标题（英文）', form_success_body:'提交成功说明（英文）',
  footer_about:'页脚关于链接', footer_practice:'页脚执业链接', footer_approach:'页脚理念链接', footer_contact:'页脚联系链接', footer_about_url:'页脚关于跳转地址', footer_practice_url:'页脚执业跳转地址', footer_approach_url:'页脚理念跳转地址', footer_contact_url:'页脚联系跳转地址', footer_year:'页脚年份版权', disclaimer_link:'免责声明链接文字', disclaimer_url:'免责声明跳转地址', disclaimer:'免责声明正文'
};

function renderContentFields(settings) {
  if (!allContent) return;
  allContent.innerHTML = Object.entries(contentLabels).map(([key, label]) => {
    const value = settings[key] || '';
    const multiline = value.length > 90 || ['about_body','about_quote','practice_body_one','practice_body_two','approach_lead','principle_one_body','principle_two_body','principle_three_body','contact_desc','form_note','disclaimer'].includes(key);
    return `<label class="content-field">${label}${multiline ? `<textarea name="${key}" rows="3" required>${escapeHtml(value)}</textarea>` : `<input name="${key}" type="text" value="${escapeHtml(value)}" required />`}</label>`;
  }).join('');
}

async function request(url, options = {}) {
  const response = await fetch(url, { headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }, ...options });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || '请求失败。');
  return data;
}

function formatDate(value) {
  return new Intl.DateTimeFormat('zh-CN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[character]));
}

function renderInquiries(items) {
  if (!items.length) {
    inquiriesList.innerHTML = '<div class="empty-state">暂时还没有用户咨询。</div>';
    return;
  }
  inquiriesList.innerHTML = items.map((item) => `<article class="inquiry-card"><div class="inquiry-meta"><strong class="inquiry-name">${escapeHtml(item.name)}</strong><span class="inquiry-date">${formatDate(item.created_at)}</span></div><div class="inquiry-contact"><a href="mailto:${encodeURIComponent(item.email)}">${escapeHtml(item.email)}</a><a href="tel:${encodeURIComponent(item.phone)}">${escapeHtml(item.phone)}</a></div><p class="inquiry-message">${escapeHtml(item.message)}</p></article>`).join('');
}

async function loadDashboard() {
  const [settings, inquiries] = await Promise.all([request('/api/admin/settings'), request('/api/admin/inquiries')]);
  renderContentFields(settings);
  settingsForm.querySelectorAll('[name]').forEach((field) => {
    if (settings[field.name] !== undefined) field.value = settings[field.name];
  });
  renderInquiries(inquiries.inquiries || []);
}

async function showDashboard() {
  loginView.hidden = true;
  dashboard.hidden = false;
  try {
    await loadDashboard();
  } catch (error) {
    inquiriesList.innerHTML = `<div class="empty-state">${escapeHtml(error.message)}</div>`;
  }
}

loginForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  loginError.textContent = '';
  const formData = new FormData(loginForm);
  try {
    await request('/api/admin/login', { method: 'POST', body: JSON.stringify({ username: formData.get('username'), password: formData.get('password') }) });
    await showDashboard();
  } catch (error) {
    loginError.textContent = error.message;
  }
});

settingsForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  settingsError.textContent = '';
  settingsStatus.textContent = '';
  try {
    const values = Object.fromEntries([...new FormData(settingsForm).entries()].map(([key, value]) => [key, String(value).trim()]));
    await request('/api/admin/settings', { method: 'PUT', body: JSON.stringify(values) });
    settingsStatus.textContent = '已保存';
    setTimeout(() => { settingsStatus.textContent = ''; }, 3000);
  } catch (error) {
    settingsError.textContent = error.message;
  }
});

document.querySelector('[data-refresh]')?.addEventListener('click', async () => {
  inquiriesList.innerHTML = '<div class="empty-state">正在刷新…</div>';
  try { renderInquiries((await request('/api/admin/inquiries')).inquiries || []); } catch (error) { inquiriesList.innerHTML = `<div class="empty-state">${escapeHtml(error.message)}</div>`; }
});

document.querySelector('[data-logout]')?.addEventListener('click', async () => {
  await request('/api/admin/logout', { method: 'POST' }).catch(() => {});
  window.location.reload();
});

request('/api/admin/me').then((data) => { if (data.authenticated) showDashboard(); }).catch(() => {});
