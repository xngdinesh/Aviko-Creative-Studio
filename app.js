/**
 * Aviko Media — Interactive Application Script
 * Features: Filterable Portfolio, Fullscreen Lightbox, Service Tabs,
 * Smooth Scroll, Mobile Drawer, Video Player Previews, Contact Form Handling
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initServiceTabs();
  initPortfolioAndLightbox();
  initDiagonalCarousel();
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

  // Highlight active page based on current URL path
  const currentFilename = window.location.pathname.split('/').pop() || 'index.html';
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentFilename || (currentFilename === '' && (href === 'index.html' || href === '/'))) {
      link.classList.add('active');
    } else if (href.indexOf('.html') !== -1 && href !== currentFilename) {
      link.classList.remove('active');
    }
  });

  // Active section observer for on-page hash links (e.g. index.html)
  const sections = document.querySelectorAll('section[id]');
  if (sections.length > 0 && 'IntersectionObserver' in window && currentFilename === 'index.html') {
    const navObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach(link => {
            if (link.getAttribute('href') === `#${id}`) {
              link.classList.add('active');
            } else if (link.getAttribute('href').startsWith('#')) {
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

  let currentFilter = 'all';
  let activeCards = [...allCards];
  let currentLightboxIndex = 0;

  function updateActiveCards() {
    activeCards = allCards.filter(card => {
      const cat = card.getAttribute('data-category');
      const sub = card.getAttribute('data-subservice');
      return currentFilter === 'all' || sub === currentFilter || cat === currentFilter;
    });
  }

  function applyFilter(filterKey, pushState = false) {
    currentFilter = filterKey || 'all';

    // Update active state on filter pills
    let matchedPill = null;
    filterBtns.forEach(btn => {
      const pillFilter = btn.getAttribute('data-filter');
      if (pillFilter === currentFilter) {
        btn.classList.add('active');
        matchedPill = btn;
      } else {
        btn.classList.remove('active');
      }
    });

    if (!matchedPill && filterBtns.length > 0) {
      filterBtns.forEach(btn => {
        if (btn.getAttribute('data-filter') === 'all') btn.classList.add('active');
      });
    }

    let matchCount = 0;
    allCards.forEach(card => {
      const cat = card.getAttribute('data-category');
      const sub = card.getAttribute('data-subservice');
      const isMatch = (currentFilter === 'all') || (sub === currentFilter) || (cat === currentFilter);
      if (isMatch) {
        card.style.display = 'block';
        card.classList.add('fade-up', 'visible');
        matchCount++;
      } else {
        card.style.display = 'none';
      }
    });

    updateActiveCards();

    // Toggle empty state if present
    const emptyState = document.getElementById('portfolioEmptyState');
    if (emptyState) {
      emptyState.style.display = matchCount === 0 ? 'block' : 'none';
    }

    if (pushState && window.history && window.history.replaceState) {
      const url = new URL(window.location);
      if (currentFilter === 'all') {
        url.searchParams.delete('filter');
      } else {
        url.searchParams.set('filter', currentFilter);
      }
      window.history.replaceState({}, '', url);
    }
  }

  // Filter click handler
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const selected = btn.getAttribute('data-filter');
      applyFilter(selected, true);
    });
  });

  // URL query parameter or hash detection for direct linking from Capabilities page
  const urlParams = new URLSearchParams(window.location.search);
  const filterFromParam = urlParams.get('filter') || (window.location.hash.startsWith('#filter-') ? window.location.hash.replace('#filter-', '') : null);
  if (filterFromParam) {
    applyFilter(filterFromParam, false);
    setTimeout(() => {
      const portfolioTarget = document.getElementById('portfolioGrid') || document.querySelector('.portfolio-filter-bar') || document.getElementById('portfolio');
      if (portfolioTarget) {
        portfolioTarget.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 200);
  } else {
    applyFilter('all', false);
  }

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

  // Allow external components (DiagonalCarousel) to open modal with custom image data
  window.openLightboxWithData = function(src, title, category) {
    if (!modal || !modalImg) return;
    resetZoom();
    modalImg.src = src;
    modalImg.alt = title || 'Portfolio Showcase';
    if (modalTitle) modalTitle.textContent = title || '';
    if (modalCategory) modalCategory.textContent = category || 'Featured Work';
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

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

  if (modal) {
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

/* --------------------------------------------------------------------------
   Diagonal Carousel (VengeanceUI Motion Engine)
   Based on VengeanceUI Diagonal Carousel:
   - Dynamic track translation
   - Diagonal rotation and vertical stepping physics
   - Active slide title transition
   - Floating pill with prev/next buttons and morphing indicator dots
   - Touch swipe & keyboard arrow navigation
   - Active slide click triggers high-res zoomable Lightbox
   -------------------------------------------------------------------------- */
function initDiagonalCarousel() {
  const container = document.getElementById('diagonalCarousel');
  if (!container) return;

  const track = container.querySelector('.diagonal-carousel-track');
  const slides = Array.from(container.querySelectorAll('.diagonal-slide'));
  const prevBtn = container.querySelector('.diagonal-prev-btn');
  const nextBtn = container.querySelector('.diagonal-next-btn');
  const dots = Array.from(container.querySelectorAll('.diagonal-dot'));

  if (!track || slides.length === 0) return;

  let currentIndex = 0;
  const totalSlides = slides.length;

  function getMetrics() {
    const width = window.innerWidth;
    if (width <= 640) {
      return { slideSize: 170, rotationStep: 18, verticalStep: 65, inactiveScale: 0.68 };
    } else if (width <= 992) {
      return { slideSize: 210, rotationStep: 22, verticalStep: 85, inactiveScale: 0.65 };
    } else {
      return { slideSize: 260, rotationStep: 28, verticalStep: 105, inactiveScale: 0.62 };
    }
  }

  function updateSlidePositions() {
    const { slideSize, rotationStep, verticalStep, inactiveScale } = getMetrics();
    const trackX = -(currentIndex * slideSize + slideSize / 2);

    track.style.transform = `translateX(${trackX}px)`;

    slides.forEach((slide, i) => {
      const distance = i - currentIndex;
      const isActive = i === currentIndex;
      const rotate = distance * rotationStep;
      const scale = isActive ? 1 : inactiveScale;
      const y = distance * verticalStep;

      slide.style.width = `${slideSize}px`;
      slide.style.transform = `translateY(${y}px) rotate(${rotate}deg) scale(${scale})`;
      slide.classList.toggle('active', isActive);
      slide.setAttribute('aria-current', isActive ? 'true' : 'false');

      const titleEl = slide.querySelector('.diagonal-slide-title');
      if (titleEl) {
        titleEl.style.opacity = isActive ? '1' : '0';
        titleEl.style.transform = isActive ? 'scale(1)' : 'scale(0.7)';
      }
    });

    dots.forEach((dot, i) => {
      const isActive = i === currentIndex;
      dot.classList.toggle('active', isActive);
      dot.setAttribute('aria-current', isActive ? 'true' : 'false');
    });

    if (prevBtn) prevBtn.disabled = currentIndex === 0;
    if (nextBtn) nextBtn.disabled = currentIndex === totalSlides - 1;
  }

  function selectSlide(nextIndex) {
    const clamped = Math.max(0, Math.min(nextIndex, totalSlides - 1));
    if (clamped !== currentIndex) {
      currentIndex = clamped;
      updateSlidePositions();
    }
  }

  // Prev / Next button clicks
  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      selectSlide(currentIndex - 1);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      selectSlide(currentIndex + 1);
    });
  }

  // Dots clicks
  dots.forEach((dot, i) => {
    dot.addEventListener('click', (e) => {
      e.stopPropagation();
      selectSlide(i);
    });
  });

  // Slide interactions (click active -> lightbox, click inactive -> select)
  slides.forEach((slide, i) => {
    slide.addEventListener('click', (e) => {
      if (currentIndex === i) {
        const img = slide.querySelector('img');
        const title = slide.getAttribute('data-title') || 'Featured Work';
        const category = slide.getAttribute('data-category') || 'Featured Work';
        if (typeof window.openLightboxWithData === 'function' && img) {
          window.openLightboxWithData(img.src, title, category);
        }
      } else {
        selectSlide(i);
      }
    });
  });

  // Keyboard navigation when container focused
  container.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      selectSlide(currentIndex - 1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      selectSlide(currentIndex + 1);
    }
  });

  // Touch swipe gesture support
  let touchStartX = 0;
  let touchStartY = 0;
  let touchStartTime = 0;

  container.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      touchStartTime = Date.now();
    }
  }, { passive: true });

  container.addEventListener('touchend', (e) => {
    if (e.changedTouches.length === 1) {
      const deltaX = e.changedTouches[0].clientX - touchStartX;
      const deltaY = e.changedTouches[0].clientY - touchStartY;
      const deltaTime = Date.now() - touchStartTime;

      if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY) && deltaTime < 500) {
        if (deltaX < 0) {
          selectSlide(currentIndex + 1);
        } else {
          selectSlide(currentIndex - 1);
        }
      }
    }
  }, { passive: true });

  // Resize listener with debounced recalculation
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(updateSlidePositions, 100);
  });

  // Initialize positions
  updateSlidePositions();
}

