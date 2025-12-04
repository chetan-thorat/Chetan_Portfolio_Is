const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
const themeToggle = document.querySelector('.theme-toggle');
const fadeElements = document.querySelectorAll('.fade-in');
const yearSpan = document.getElementById('year');
const form = document.querySelector('.contact-form');
const statusEl = document.querySelector('.form-status');
const THEME_KEY = 'ct-portfolio-theme';

const getEmailConfig = () => {
  if (!form) return null;
  const serviceId = form.dataset.emailService;
  const templateId = form.dataset.emailTemplate;
  const publicKey = form.dataset.emailKey;
  if (
    !serviceId ||
    !templateId ||
    !publicKey ||
    publicKey.includes('PUBLIC_KEY')
  ) {
    return null;
  }
  return { serviceId, templateId, publicKey };
};

const setCurrentYear = () => {
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }
};

const handleScrollGradient = () => {
  const doc = document.documentElement;
  const scrollTop = doc.scrollTop || document.body.scrollTop;
  const max = (doc.scrollHeight - doc.clientHeight) || 1;
  const ratio = Math.min(1, Math.max(0, scrollTop / max));
  document.documentElement.style.setProperty('--scroll', ratio.toString());
};

const handleNavToggle = () => {
  navLinks.classList.toggle('open');
  navToggle.classList.toggle('active');
};

const closeNavOnLinkClick = () => {
  if (window.innerWidth <= 768) {
    navLinks.classList.remove('open');
    navToggle.classList.remove('active');
  }
};

const observeFadeIns = () => {
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  fadeElements.forEach(el => observer.observe(el));
};

const applyTheme = theme => {
  document.body.dataset.theme = theme;
  if (themeToggle) {
    themeToggle.setAttribute('aria-pressed', theme === 'light');
  }
};

const initTheme = () => {
  const stored = localStorage.getItem(THEME_KEY) || 'dark';
  applyTheme(stored);
};

const toggleTheme = () => {
  const nextTheme = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
  applyTheme(nextTheme);
  localStorage.setItem(THEME_KEY, nextTheme);
};

const validateEmail = email => {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(String(email).toLowerCase());
};

const showError = (input, message) => {
  const control = input.parentElement;
  const small = control.querySelector('small');
  small.textContent = message;
  input.classList.add('invalid');
};

const clearError = input => {
  const control = input.parentElement;
  const small = control.querySelector('small');
  small.textContent = '';
  input.classList.remove('invalid');
};

const handleFormSubmit = event => {
  event.preventDefault();
  const nameInput = form.querySelector('#name');
  const emailInput = form.querySelector('#email');
  const messageInput = form.querySelector('#message');

  let isValid = true;

  if (!nameInput.value.trim()) {
    showError(nameInput, 'Name is required.');
    isValid = false;
  } else {
    clearError(nameInput);
  }

  if (!validateEmail(emailInput.value)) {
    showError(emailInput, 'Enter a valid email.');
    isValid = false;
  } else {
    clearError(emailInput);
  }

  if (messageInput.value.trim().length < 10) {
    showError(messageInput, 'Please include at least 10 characters.');
    isValid = false;
  } else {
    clearError(messageInput);
  }

  if (!isValid) {
    statusEl.textContent = 'Please fix the highlighted fields.';
    setTimeout(() => {
      statusEl.textContent = '';
    }, 3000);
    return;
  }

  const emailConfig = getEmailConfig();
  if (!emailConfig || typeof emailjs === 'undefined') {
    statusEl.textContent =
      'Email service not configured. Update data attributes to enable sending.';
    return;
  }

  statusEl.textContent = 'Sending...';
  const submitBtn = form.querySelector('button[type="submit"]');
  submitBtn.disabled = true;

  const templateParams = {
    from_name: nameInput.value,
    reply_to: emailInput.value,
    message: messageInput.value,
  };

  emailjs
    .send(emailConfig.serviceId, emailConfig.templateId, templateParams)
    .then(() => {
      statusEl.textContent = 'Thanks! Your message is on its way.';
      form.reset();
      setTimeout(() => {
        statusEl.textContent = '';
      }, 4000);
    })
    .catch(() => {
      statusEl.textContent =
        'Something went wrong. Please try again in a moment.';
    })
    .finally(() => {
      submitBtn.disabled = false;
    });
};

document.addEventListener('DOMContentLoaded', () => {
  setCurrentYear();
  observeFadeIns();
  initTheme();
  handleScrollGradient();

  if (navToggle) {
    navToggle.addEventListener('click', handleNavToggle);
  }

  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', closeNavOnLinkClick);
  });

  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }

  if (form) {
    const emailConfig = getEmailConfig();
    if (emailConfig && typeof emailjs !== 'undefined') {
      emailjs.init(emailConfig.publicKey);
    }
    form.addEventListener('submit', handleFormSubmit);
  }

  window.addEventListener('scroll', handleScrollGradient, { passive: true });
});

