/**
 * Aviko Media — Interactive Application Script
 * Features: Filterable Portfolio, Fullscreen Lightbox, Service Tabs,
 * Smooth Scroll, Mobile Drawer, Video Player Modal, Contact Form Handling
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initServiceTabs();
  initPortfolio();
  initLightbox();
  initVideoPlayer();
  initScrollAnimations();
  initContactForm();
});

/* --------------------------------------------------------------------------
   Sticky Navbar & Mobile Menu
   -------------------------------------------------------------------------- */
function initNavbar() {
  const header = document.querySelector('.site-header');
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('.nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  // Sticky header class toggle
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    highlightCurrentSection();
  }, { passive: true });

  // Mobile drawer toggle
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('open');
      navToggle.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        navToggle.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  // Active section indicator on scroll
  const sections = document.querySelectorAll('section[id]');
  function highlightCurrentSection() {
    const scrollPos = window.scrollY + 120;
    sections.forEach(sec => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      const id = sec.getAttribute('id');
      const matchingLink = document.querySelector(`.nav-link[href="#${id}"]`);

      if (matchingLink) {
        if (scrollPos >= top && scrollPos < top + height) {
          matchingLink.classList.add('active');
        } else {
          matchingLink.classList.remove('active');
        }
      }
    });
  }
}

/* --------------------------------------------------------------------------
   Services Section Tabs Switcher
   -------------------------------------------------------------------------- */
function initServiceTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanes = document.querySelectorAll('.tab-content');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-tab');

      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const targetPane = document.getElementById(targetId);
      if (targetPane) {
        targetPane.classList.add('active');
      }
    });
  });
}

/* --------------------------------------------------------------------------
   Portfolio Filter Logic
   -------------------------------------------------------------------------- */
let activePortfolioCards = [];
let currentLightboxIndex = 0;

function initPortfolio() {
  const filterBtns = document.querySelectorAll('.filter-pill');
  const cards = document.querySelectorAll('.portfolio-card');
  activePortfolioCards = Array.from(cards);

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterVal = btn.getAttribute('data-filter');
      activePortfolioCards = [];

      cards.forEach(card => {
        const cardCat = card.getAttribute('data-category');
        if (filterVal === 'all' || cardCat === filterVal) {
          card.style.display = 'block';
          card.classList.add('fade-up', 'visible');
          activePortfolioCards.push(card);
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/* --------------------------------------------------------------------------
   Lightbox Gallery Modal
   -------------------------------------------------------------------------- */
function initLightbox() {
  const modal = document.getElementById('lightboxModal');
  const modalImg = document.getElementById('lightboxImg');
  const modalTitle = document.getElementById('lightboxTitle');
  const modalCategory = document.getElementById('lightboxCategory');
  const closeBtn = document.querySelector('.lightbox-close');
  const prevBtn = document.querySelector('.lightbox-prev');
  const nextBtn = document.querySelector('.lightbox-next');

  if (!modal || !modalImg) return;

  function openLightbox(index) {
    if (!activePortfolioCards[index]) return;
    currentLightboxIndex = index;
    const card = activePortfolioCards[index];
    const imgEl = card.querySelector('img');
    const title = card.getAttribute('data-title') || '';
    const cat = card.getAttribute('data-category-label') || '';

    modalImg.src = imgEl.src;
    modalImg.alt = title;
    modalTitle.textContent = title;
    modalCategory.textContent = cat;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  function showNext() {
    if (activePortfolioCards.length === 0) return;
    currentLightboxIndex = (currentLightboxIndex + 1) % activePortfolioCards.length;
    openLightbox(currentLightboxIndex);
  }

  function showPrev() {
    if (activePortfolioCards.length === 0) return;
    currentLightboxIndex = (currentLightboxIndex - 1 + activePortfolioCards.length) % activePortfolioCards.length;
    openLightbox(currentLightboxIndex);
  }

  // Bind clicks on all portfolio cards
  const cards = document.querySelectorAll('.portfolio-card');
  cards.forEach(card => {
    card.addEventListener('click', () => {
      const idx = activePortfolioCards.indexOf(card);
      if (idx !== -1) {
        openLightbox(idx);
      }
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
  if (nextBtn) nextBtn.addEventListener('click', showNext);
  if (prevBtn) prevBtn.addEventListener('click', showPrev);

  modal.addEventListener('click', (e) => {
    if (e.target === modal || e.target.classList.contains('lightbox-dialog')) {
      closeLightbox();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') showNext();
    if (e.key === 'ArrowLeft') showPrev();
  });
}

/* --------------------------------------------------------------------------
   Video Showreel Enhancements
   -------------------------------------------------------------------------- */
function initVideoPlayer() {
  const videoCards = document.querySelectorAll('.video-card');

  videoCards.forEach(card => {
    const video = card.querySelector('video');
    if (!video) return;

    // Optional hover preview playback muted
    card.addEventListener('mouseenter', () => {
      if (video.paused && !card.classList.contains('playing-manual')) {
        video.muted = true;
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {});
        }
      }
    });

    card.addEventListener('mouseleave', () => {
      if (!card.classList.contains('playing-manual')) {
        video.pause();
        video.currentTime = 0;
      }
    });

    video.addEventListener('play', () => {
      card.classList.add('playing-manual');
    });

    video.addEventListener('pause', () => {
      card.classList.remove('playing-manual');
    });
  });
}

/* --------------------------------------------------------------------------
   Intersection Observer for Smooth Scroll Reveals
   -------------------------------------------------------------------------- */
function initScrollAnimations() {
  const animatedElements = document.querySelectorAll('.fade-up');

  if (!('IntersectionObserver' in window)) {
    animatedElements.forEach(el => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  animatedElements.forEach(el => observer.observe(el));
}

/* --------------------------------------------------------------------------
   Contact Form Validation & Feedback Toast
   -------------------------------------------------------------------------- */
function initContactForm() {
  const form = document.getElementById('contactForm');
  const toast = document.getElementById('toastNotice');

  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = form.querySelector('[name="name"]').value.trim();
    const email = form.querySelector('[name="email"]').value.trim();
    const service = form.querySelector('[name="service"]').value;
    const message = form.querySelector('[name="message"]').value.trim();

    if (!name || !email || !message) {
      showToast('Please fill out all required fields.');
      return;
    }

    // Compose mailto fallback or submit
    const subject = encodeURIComponent(`Aviko Media Project Inquiry: ${service}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\nService: ${service}\n\nMessage:\n${message}`);
    
    // Simulate instantaneous graceful submission
    showToast('Thank you! Your quote inquiry has been submitted. Our team will get back to you shortly.');
    form.reset();

    // Optional mailto trigger
    setTimeout(() => {
      window.location.href = `mailto:contact@avikocreative.com?subject=${subject}&body=${body}`;
    }, 1200);
  });

  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 4500);
  }
}
