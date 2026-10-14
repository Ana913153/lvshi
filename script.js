const header = document.querySelector('[data-header]');
const menuToggle = document.querySelector('[data-menu-toggle]');
const mobileMenu = document.querySelector('[data-mobile-menu]');

if (menuToggle && mobileMenu) {
  menuToggle.addEventListener('click', () => {
    const open = mobileMenu.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(open));
  });
  mobileMenu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
  }));
}

const updateHeader = () => header?.classList.toggle('scrolled', window.scrollY > 24);
updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

const revealItems = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealItems.forEach((item) => revealObserver.observe(item));
} else revealItems.forEach((item) => item.classList.add('visible'));

let siteSettings = {};

async function loadSiteSettings() {
  try {
    const response = await fetch('/api/site-settings');
    if (!response.ok) return;
    const settings = await response.json();
    siteSettings = settings;
    document.querySelectorAll('[data-site]').forEach((element) => {
      const key = element.dataset.site;
      if (settings[key] !== undefined) element.textContent = settings[key];
    });
    document.querySelectorAll('[data-placeholder]').forEach((element) => {
      const key = element.dataset.placeholder;
      if (settings[key] !== undefined) element.placeholder = settings[key];
    });
    document.querySelectorAll('[data-site-meta]').forEach((element) => {
      const key = element.dataset.siteMeta;
      if (settings[key] !== undefined) element.setAttribute('content', settings[key]);
    });
    document.querySelectorAll('[data-site-aria]').forEach((element) => {
      const key = element.dataset.siteAria;
      if (settings[key] !== undefined) element.setAttribute('aria-label', settings[key]);
    });
    document.querySelectorAll('[data-site-href]').forEach((element) => {
      const key = element.dataset.siteHref;
      if (settings[key] !== undefined) element.setAttribute('href', settings[key]);
    });
    if (settings.page_title) document.title = settings.page_title;
    if (settings.hero_image_url) document.documentElement.style.setProperty('--hero-image', `url("${settings.hero_image_url.replace(/"/g, '')}")`);
    if (settings.portrait_image_url) document.documentElement.style.setProperty('--portrait-image', `url("${settings.portrait_image_url.replace(/"/g, '')}")`);
    const whatsapp = document.querySelector('[data-contact-link="whatsapp"]');
    const telegram = document.querySelector('[data-contact-link="telegram"]');
    if (whatsapp && settings.whatsapp_url) whatsapp.href = settings.whatsapp_url;
    if (telegram && settings.telegram_url) telegram.href = settings.telegram_url;
  } catch (error) {
    console.warn('Site settings unavailable', error);
  }
}
loadSiteSettings();

const form = document.querySelector('[data-contact-form]');
const success = document.querySelector('[data-form-success]');
const formError = document.querySelector('[data-form-error]');
const submitButton = form?.querySelector('button[type="submit"]');

function showFormError(message) {
  if (formError) formError.textContent = message;
  formError?.classList.add('show');
}

function clearFormMessages() {
  if (formError) formError.textContent = '';
  formError?.classList.remove('show');
}

form?.addEventListener('submit', async (event) => {
  event.preventDefault();
  clearFormMessages();
  const formData = new FormData(form);
  const email = String(formData.get('email') || '').trim();
  if (![formData.get('name'), email, formData.get('phone'), formData.get('message')].every((value) => String(value || '').trim())) {
    showFormError(siteSettings.form_error_required || 'Please complete all required fields.');
    return;
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    showFormError(siteSettings.form_error_email || 'Please enter a valid email address.');
    form.querySelector('[name="email"]')?.focus();
    return;
  }
  if (submitButton) {
    submitButton.disabled = true;
    submitButton.innerHTML = siteSettings.form_submitting || 'Submitting…';
  }
  try {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.fromEntries(formData.entries()))
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error('Submission failed. Please try again later.');
    form.querySelectorAll('input, textarea').forEach((field) => { field.disabled = true; });
    const successTitle = success?.querySelector('strong');
    const successBody = success?.querySelector('span');
    if (successTitle) successTitle.textContent = siteSettings.form_success_title || 'Thank you for your message.';
    if (successBody) successBody.textContent = siteSettings.form_success_body || 'We will contact you shortly.';
    success?.classList.add('show');
    success?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  } catch (error) {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.innerHTML = `${siteSettings.form_submit || 'Submit Inquiry'} <span>${siteSettings.ui_arrow || '↗'}</span>`;
    }
    showFormError(siteSettings.form_error_submit || 'Submission failed. Please try again later.');
  }
});
