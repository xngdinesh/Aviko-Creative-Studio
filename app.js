/**
 * Aviko Media — Interactive Application Script
 * Features: Filterable Portfolio, Fullscreen Lightbox, Service Tabs,
 * Smooth Scroll, Mobile Drawer, Video Player Previews, Contact Form Handling
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initServiceTabs();
  initPortfolioAndLightbox();
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

  // Sticky header transition
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        if (window.scrollY > 15) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
        ticking = false;
      });
      ticking = true;
    }
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

  // Active section observer
  const sections = document.querySelectorAll('section[id]');
  if ('IntersectionObserver' in window) {
    const navObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach(link => {
            if (link.getAttribute('href') === `#${id}`) {
              link.classList.add('active');
            } else {
              link.classList.remove('active');
            }
          });
        }
      });
    }, { rootMargin: '-20% 0px -70% 0px' });

    sections.forEach(sec => navObserver.observe(sec));
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

      tabBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      tabPanes.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      const targetPane = document.getElementById(targetId);
      if (targetPane) {
        targetPane.classList.add('active');
      }
    });
  });
}

/* --------------------------------------------------------------------------
   Portfolio Filter Logic & Full Lightbox Modal
   -------------------------------------------------------------------------- */
function initPortfolioAndLightbox() {
  const filterBtns = document.querySelectorAll('.filter-pill');
  const allCards = Array.from(document.querySelectorAll('.portfolio-card'));
  
  const modal = document.getElementById('lightboxModal');
  const modalImg = document.getElementById('lightboxImg');
  const modalTitle = document.getElementById('lightboxTitle');
  const modalCategory = document.getElementById('lightboxCategory');
  const closeBtn = document.querySelector('.lightbox-close');
  const prevBtn = document.querySelector('.lightbox-prev');
  const nextBtn = document.querySelector('.lightbox-next');

  let currentCategory = 'all';
  let activeCards = [...allCards];
  let currentLightboxIndex = 0;

  function updateActiveCards() {
    activeCards = allCards.filter(card => {
      const cat = card.getAttribute('data-category');
      return currentCategory === 'all' || cat === currentCategory;
    });
  }

  // Filter click handler
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      currentCategory = btn.getAttribute('data-filter');
      
      allCards.forEach(card => {
        const cat = card.getAttribute('data-category');
        if (currentCategory === 'all' || cat === currentCategory) {
          card.style.display = 'block';
          card.classList.add('fade-up', 'visible');
        } else {
          card.style.display = 'none';
        }
      });

      updateActiveCards();
    });
  });

  // Zoom and Pan State
  let currentZoom = 1;
  let panX = 0;
  let panY = 0;
  let isDragging = false;
  let startX = 0;
  let startY = 0;

  const zoomInBtn = document.getElementById('lightboxZoomIn');
  const zoomOutBtn = document.getElementById('lightboxZoomOut');
  const zoomResetBtn = document.getElementById('lightboxZoomReset');
  const zoomLevelLabel = document.getElementById('lightboxZoomLevel');
  const imgWrapper = document.getElementById('lightboxImgWrapper');

  function applyZoom(newZoom, updatePan = false) {
    currentZoom = Math.min(Math.max(newZoom, 1), 3.5);
    if (currentZoom === 1 || !updatePan) {
      panX = 0;
      panY = 0;
    }
    modalImg.style.transform = `scale(${currentZoom}) translate(${panX}px, ${panY}px)`;
    if (zoomLevelLabel) zoomLevelLabel.textContent = `${Math.round(currentZoom * 100)}%`;
    if (imgWrapper) {
      if (currentZoom > 1) {
        imgWrapper.classList.add('is-zoomed');
      } else {
        imgWrapper.classList.remove('is-zoomed', 'is-panning');
      }
    }
  }

  function resetZoom() {
    applyZoom(1);
  }

  if (zoomInBtn) zoomInBtn.addEventListener('click', () => applyZoom(currentZoom + 0.3));
  if (zoomOutBtn) zoomOutBtn.addEventListener('click', () => applyZoom(currentZoom - 0.3));
  if (zoomResetBtn) zoomResetBtn.addEventListener('click', resetZoom);

  // Mouse wheel zoom
  if (imgWrapper) {
    imgWrapper.addEventListener('wheel', (e) => {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 0.25 : -0.25;
      applyZoom(currentZoom + delta);
    }, { passive: false });

    // Double-click toggle zoom
    imgWrapper.addEventListener('dblclick', () => {
      applyZoom(currentZoom > 1 ? 1 : 2);
    });

    // Drag to pan when zoomed
    imgWrapper.addEventListener('mousedown', (e) => {
      if (currentZoom <= 1) return;
      isDragging = true;
      startX = e.clientX - panX * currentZoom;
      startY = e.clientY - panY * currentZoom;
      imgWrapper.classList.add('is-panning');
      e.preventDefault();
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging || currentZoom <= 1) return;
      panX = (e.clientX - startX) / currentZoom;
      panY = (e.clientY - startY) / currentZoom;
      modalImg.style.transform = `scale(${currentZoom}) translate(${panX}px, ${panY}px)`;
    });

    window.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        if (imgWrapper) imgWrapper.classList.remove('is-panning');
      }
    });

    // Touch support (pinch to zoom & drag)
    let touchStartDist = 0;
    let initialZoomOnTouch = 1;
    let touchStartX = 0;
    let touchStartY = 0;

    imgWrapper.addEventListener('touchstart', (e) => {
      if (e.touches.length === 2) {
        touchStartDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        initialZoomOnTouch = currentZoom;
      } else if (e.touches.length === 1 && currentZoom > 1) {
        isDragging = true;
        touchStartX = e.touches[0].clientX - panX * currentZoom;
        touchStartY = e.touches[0].clientY - panY * currentZoom;
      }
    }, { passive: true });

    imgWrapper.addEventListener('touchmove', (e) => {
      if (e.touches.length === 2 && touchStartDist > 0) {
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const factor = dist / touchStartDist;
        applyZoom(initialZoomOnTouch * factor);
      } else if (e.touches.length === 1 && isDragging && currentZoom > 1) {
        panX = (e.touches[0].clientX - touchStartX) / currentZoom;
        panY = (e.touches[0].clientY - touchStartY) / currentZoom;
        modalImg.style.transform = `scale(${currentZoom}) translate(${panX}px, ${panY}px)`;
      }
    }, { passive: true });

    imgWrapper.addEventListener('touchend', () => {
      isDragging = false;
      touchStartDist = 0;
    });
  }

  // Lightbox functions
  function openLightbox(index) {
    if (activeCards.length === 0 || !activeCards[index]) return;
    resetZoom();
    currentLightboxIndex = index;
    const card = activeCards[index];
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
    resetZoom();
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  function showNext() {
    if (activeCards.length === 0) return;
    resetZoom();
    currentLightboxIndex = (currentLightboxIndex + 1) % activeCards.length;
    openLightbox(currentLightboxIndex);
  }

  function showPrev() {
    if (activeCards.length === 0) return;
    resetZoom();
    currentLightboxIndex = (currentLightboxIndex - 1 + activeCards.length) % activeCards.length;
    openLightbox(currentLightboxIndex);
  }

  // Card click triggers lightbox
  allCards.forEach(card => {
    card.addEventListener('click', () => {
      const idx = activeCards.indexOf(card);
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
    if (e.key === '+' || e.key === '=') applyZoom(currentZoom + 0.3);
    if (e.key === '-' || e.key === '_') applyZoom(currentZoom - 0.3);
    if (e.key === '0') resetZoom();
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

    // Hover preview (muted)
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
    threshold: 0.1,
    rootMargin: '0px 0px -30px 0px'
  });

  animatedElements.forEach(el => observer.observe(el));
}

/* --------------------------------------------------------------------------
   Contact Form Validation, Security & Feedback Toast
   -------------------------------------------------------------------------- */
function initContactForm() {
  const form = document.getElementById('contactForm');
  const toast = document.getElementById('toastNotice');

  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Sanitize user inputs
    const name = form.querySelector('[name="name"]').value.trim();
    const email = form.querySelector('[name="email"]').value.trim();
    const service = form.querySelector('[name="service"]').value;
    const message = form.querySelector('[name="message"]').value.trim();
    const consent = form.querySelector('[name="consent"]');

    if (!name || !email || !message) {
      showToast('Please complete all required fields.');
      return;
    }

    if (consent && !consent.checked) {
      showToast('Please confirm agreement to the Terms and Privacy Policy.');
      return;
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showToast('Please provide a valid business email address.');
      return;
    }

    const cleanName = name.replace(/[<>]/g, '');
    const cleanEmail = email.replace(/[<>]/g, '');
    const cleanMessage = message.replace(/[<>]/g, '');

    showToast('Inquiry received. Our creative team will prepare your proposal.');
    form.reset();

    // Optional mailto fallback trigger
    const subject = encodeURIComponent(`Aviko Media Project Inquiry: ${service}`);
    const body = encodeURIComponent(`Client: ${cleanName}\nEmail: ${cleanEmail}\nService: ${service}\n\nProject Scope:\n${cleanMessage}`);
    setTimeout(() => {
      window.location.href = `mailto:contact@avikocreative.com?subject=${subject}&body=${body}`;
    }, 1400);
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
