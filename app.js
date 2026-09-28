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
  const closeBtn = modal ? modal.querySelector('.lightbox-close') : null;
  const zoomInBtn = document.getElementById('lightboxZoomIn');
  const zoomOutBtn = document.getElementById('lightboxZoomOut');
  const zoomResetBtn = document.getElementById('lightboxZoomReset');
  const zoomLevelLabel = document.getElementById('lightboxZoomLevel');
  const fullscreenBtn = document.getElementById('lightboxFullscreen');

  const carousel = document.getElementById('perspectiveCarousel');
  const viewport = document.getElementById('perspectiveViewport');
  const track = document.getElementById('perspectiveTrack');
  const prevBtn = document.getElementById('perspectivePrev');
  const nextBtn = document.getElementById('perspectiveNext');
  const dotsContainer = document.getElementById('perspectiveDots');

  let currentFilter = 'all';
  let activeCards = [...allCards];

  // Carousel Configuration & State
  let carouselItems = [];
  let currentIndex = 0;
  const rotationStep = 60;
  const inactiveScale = 0.85;
  const loop = false;

  // Zoom & Pan State
  let currentZoom = 1;
  let panX = 0;
  let panY = 0;
  let isDragging = false;
  let startX = 0;
  let startY = 0;

  // Swipe & Drag Swap State
  let isSwiping = false;
  let wasSwiping = false;
  let swipeStartX = 0;
  let swipeStartY = 0;
  let swipeDeltaX = 0;
  let swipeStartTime = 0;
  let cachedSlideWidth = 520;

  function updateActiveCards() {
    activeCards = allCards.filter(card => {
      const cat = card.getAttribute('data-category');
      const sub = card.getAttribute('data-subservice');
      return currentFilter === 'all' || sub === currentFilter || cat === currentFilter;
    });
  }

  function applyFilter(filterKey, pushState = false) {
    currentFilter = filterKey || 'all';

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

  // Fullscreen support
  function toggleFullscreen() {
    if (!modal) return;
    const isFs = document.fullscreenElement || modal.classList.contains('fullscreen-mode');
    if (!isFs) {
      if (modal.requestFullscreen) {
        modal.requestFullscreen().catch(() => {
          modal.classList.add('fullscreen-mode');
          updateFsUI(true);
        });
      } else {
        modal.classList.add('fullscreen-mode');
        updateFsUI(true);
      }
    } else {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      modal.classList.remove('fullscreen-mode');
      updateFsUI(false);
    }
  }

  function updateFsUI(isFs) {
    const expandIcons = modal ? modal.querySelectorAll('.fs-expand-icon') : [];
    const compressIcons = modal ? modal.querySelectorAll('.fs-compress-icon') : [];
    expandIcons.forEach(icon => icon.style.display = isFs ? 'none' : 'block');
    compressIcons.forEach(icon => icon.style.display = isFs ? 'block' : 'none');
    if (fullscreenBtn) {
      fullscreenBtn.setAttribute('title', isFs ? 'Exit Fullscreen (F)' : 'Fullscreen (F)');
      fullscreenBtn.setAttribute('aria-label', isFs ? 'Exit Fullscreen' : 'Toggle fullscreen');
    }
    requestAnimationFrame(() => {
      selectSlide(currentIndex, true);
    });
  }

  document.addEventListener('fullscreenchange', () => {
    const isFs = !!document.fullscreenElement;
    if (!isFs) {
      modal.classList.remove('fullscreen-mode');
    } else {
      modal.classList.add('fullscreen-mode');
    }
    updateFsUI(isFs);
  });

  if (fullscreenBtn) fullscreenBtn.addEventListener('click', toggleFullscreen);

  // Calculate Responsive Slide Width
  function getSafeSlideWidth() {
    const isFs = document.fullscreenElement || (modal && modal.classList.contains('fullscreen-mode'));
    const vpWidth = viewport ? viewport.clientWidth : window.innerWidth;
    if (isFs) {
      if (vpWidth < 768) return Math.min(Math.round(vpWidth * 0.88), 640);
      if (vpWidth < 1200) return Math.min(Math.round(vpWidth * 0.75), 880);
      return Math.min(Math.round(vpWidth * 0.65), 1100);
    }
    if (vpWidth < 480) return Math.max(220, Math.min(vpWidth - 56, 310));
    if (vpWidth < 768) return Math.min(Math.round(vpWidth * 0.65), 380);
    if (vpWidth < 1200) return 460;
    return 520;
  }

  function getActiveSlideImg() {
    if (!track) return null;
    const activeSlide = track.querySelector(`.perspective-carousel-slide[data-index="${currentIndex}"]`);
    return activeSlide ? activeSlide.querySelector('.perspective-carousel-img') : null;
  }

  function getActiveSlideImgWrap() {
    if (!track) return null;
    const activeSlide = track.querySelector(`.perspective-carousel-slide[data-index="${currentIndex}"]`);
    return activeSlide ? activeSlide.querySelector('.perspective-carousel-img-wrap') : null;
  }

  function applyZoom(newZoom, updatePan = false) {
    currentZoom = Math.min(Math.max(newZoom, 1), 3.5);
    if (currentZoom === 1 || !updatePan) {
      panX = 0;
      panY = 0;
    }
    const activeImg = getActiveSlideImg();
    if (activeImg) {
      activeImg.style.transform = `scale(${currentZoom}) translate(${panX}px, ${panY}px)`;
    }
    if (zoomLevelLabel) zoomLevelLabel.textContent = `${Math.round(currentZoom * 100)}%`;

    const activeWrap = getActiveSlideImgWrap();
    if (activeWrap) {
      if (currentZoom > 1) {
        activeWrap.classList.add('is-zoomed');
      } else {
        activeWrap.classList.remove('is-zoomed', 'is-panning');
      }
    }
  }

  function resetZoom() {
    currentZoom = 1;
    panX = 0;
    panY = 0;
    isDragging = false;
    const activeImg = getActiveSlideImg();
    if (activeImg) {
      activeImg.style.transform = 'scale(1) translate(0px, 0px)';
    }
    const activeWrap = getActiveSlideImgWrap();
    if (activeWrap) {
      activeWrap.classList.remove('is-zoomed', 'is-panning');
    }
    if (zoomLevelLabel) zoomLevelLabel.textContent = '100%';
  }

  if (zoomInBtn) zoomInBtn.addEventListener('click', () => applyZoom(currentZoom + 0.3));
  if (zoomOutBtn) zoomOutBtn.addEventListener('click', () => applyZoom(currentZoom - 0.3));
  if (zoomResetBtn) zoomResetBtn.addEventListener('click', resetZoom);

  // Wheel, Drag Panning, and Swipe Swap for Perspective Carousel
  if (viewport) {
    viewport.addEventListener('wheel', (e) => {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 0.25 : -0.25;
      applyZoom(currentZoom + delta);
    }, { passive: false });

    viewport.addEventListener('dblclick', (e) => {
      if (e.target.closest('.perspective-control-btn') || e.target.closest('.perspective-dot') || e.target.closest('.lightbox-toolbar')) return;
      applyZoom(currentZoom > 1 ? 1 : 2);
    });

    function endDragOrSwipe() {
      if (isDragging) {
        isDragging = false;
        const activeWrap = getActiveSlideImgWrap();
        if (activeWrap) activeWrap.classList.remove('is-panning');
      }

      if (isSwiping) {
        isSwiping = false;
        if (track) {
          track.classList.remove('is-dragging');
          track.style.transition = '';
          const slideInners = track.querySelectorAll('.perspective-carousel-slide-inner');
          slideInners.forEach(inner => {
            inner.style.transition = '';
          });
        }

        const maxIndex = Math.max(0, carouselItems.length - 1);
        const deltaTime = Math.max(1, Date.now() - swipeStartTime);
        const velocity = Math.abs(swipeDeltaX) / deltaTime;
        const threshold = Math.min(cachedSlideWidth * 0.16, 45);
        const isFlick = velocity > 0.3 && Math.abs(swipeDeltaX) > 16;
        const isPastThreshold = Math.abs(swipeDeltaX) > threshold;

        if (isPastThreshold || isFlick) {
          if (swipeDeltaX < 0) {
            selectSlide(loop || currentIndex < maxIndex ? currentIndex + 1 : currentIndex);
          } else {
            selectSlide(loop || currentIndex > 0 ? currentIndex - 1 : currentIndex);
          }
        } else {
          selectSlide(currentIndex);
        }

        setTimeout(() => {
          wasSwiping = false;
        }, 80);
      }
    }

    // Mouse drag handlers
    viewport.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;
      if (e.target.closest('.perspective-control-btn') || e.target.closest('.perspective-dot') || e.target.closest('.lightbox-toolbar') || e.target.closest('.lightbox-close')) {
        return;
      }

      if (currentZoom > 1) {
        const activeWrap = getActiveSlideImgWrap();
        if (!activeWrap || !activeWrap.contains(e.target)) return;
        isDragging = true;
        startX = e.clientX - panX * currentZoom;
        startY = e.clientY - panY * currentZoom;
        activeWrap.classList.add('is-panning');
        e.preventDefault();
      } else {
        if (!carouselItems.length || !track) return;
        isSwiping = true;
        wasSwiping = false;
        swipeStartX = e.clientX;
        swipeStartY = e.clientY;
        swipeDeltaX = 0;
        swipeStartTime = Date.now();
        cachedSlideWidth = getSafeSlideWidth();
        track.classList.add('is-dragging');
        track.style.transition = 'none';
        track.querySelectorAll('.perspective-carousel-slide-inner').forEach(inner => {
          inner.style.transition = 'none';
        });
      }
    });

    window.addEventListener('mousemove', (e) => {
      if (isDragging && currentZoom > 1) {
        panX = (e.clientX - startX) / currentZoom;
        panY = (e.clientY - startY) / currentZoom;
        const activeImg = getActiveSlideImg();
        if (activeImg) {
          activeImg.style.transform = `scale(${currentZoom}) translate(${panX}px, ${panY}px)`;
        }
        return;
      }

      if (isSwiping && currentZoom <= 1) {
        swipeDeltaX = e.clientX - swipeStartX;
        if (Math.abs(swipeDeltaX) > 4) {
          wasSwiping = true;
          if (e.cancelable) e.preventDefault();
        }

        const maxIndex = Math.max(0, carouselItems.length - 1);
        let effectiveDelta = swipeDeltaX;
        if (!loop) {
          if ((currentIndex === 0 && effectiveDelta > 0) || (currentIndex === maxIndex && effectiveDelta < 0)) {
            effectiveDelta *= 0.28;
          }
        }

        const baseOffset = -(currentIndex * cachedSlideWidth + cachedSlideWidth / 2);
        track.style.transform = `translate3d(${baseOffset + effectiveDelta}px, -50%, 0)`;

        const progress = effectiveDelta / cachedSlideWidth;
        const slides = track.querySelectorAll('.perspective-carousel-slide');
        slides.forEach((slide, idx) => {
          const inner = slide.querySelector('.perspective-carousel-slide-inner');
          if (!inner) return;
          const dist = (currentIndex - progress) - idx;
          const rotY = dist * rotationStep;
          const absDist = Math.abs(dist);
          const scale = Math.max(0.72, Math.min(1, 1 - absDist * (1 - inactiveScale)));
          inner.style.transform = `translate3d(0, 0, 0) rotateY(${rotY}deg) scale(${scale})`;
        });
      }
    });

    window.addEventListener('mouseup', endDragOrSwipe);

    // Touch support (1-finger swap / pan, 2-finger pinch-zoom)
    let touchStartDist = 0;
    let initialZoomOnTouch = 1;
    let touchStartX = 0;
    let touchStartY = 0;

    viewport.addEventListener('touchstart', (e) => {
      if (e.target.closest('.perspective-control-btn') || e.target.closest('.perspective-dot') || e.target.closest('.lightbox-toolbar') || e.target.closest('.lightbox-close')) {
        return;
      }

      if (e.touches.length === 2) {
        if (isSwiping) {
          isSwiping = false;
          if (track) {
            track.classList.remove('is-dragging');
            track.style.transition = '';
            selectSlide(currentIndex);
          }
        }
        touchStartDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        initialZoomOnTouch = currentZoom;
      } else if (e.touches.length === 1) {
        if (currentZoom > 1) {
          isDragging = true;
          touchStartX = e.touches[0].clientX - panX * currentZoom;
          touchStartY = e.touches[0].clientY - panY * currentZoom;
        } else {
          if (!carouselItems.length || !track) return;
          isSwiping = true;
          wasSwiping = false;
          swipeStartX = e.touches[0].clientX;
          swipeStartY = e.touches[0].clientY;
          swipeDeltaX = 0;
          swipeStartTime = Date.now();
          cachedSlideWidth = getSafeSlideWidth();
          track.classList.add('is-dragging');
          track.style.transition = 'none';
          track.querySelectorAll('.perspective-carousel-slide-inner').forEach(inner => {
            inner.style.transition = 'none';
          });
        }
      }
    }, { passive: true });

    viewport.addEventListener('touchmove', (e) => {
      if (e.touches.length === 2 && touchStartDist > 0) {
        if (e.cancelable) e.preventDefault();
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const factor = dist / touchStartDist;
        applyZoom(initialZoomOnTouch * factor);
      } else if (e.touches.length === 1 && isDragging && currentZoom > 1) {
        if (e.cancelable) e.preventDefault();
        panX = (e.touches[0].clientX - touchStartX) / currentZoom;
        panY = (e.touches[0].clientY - touchStartY) / currentZoom;
        const activeImg = getActiveSlideImg();
        if (activeImg) {
          activeImg.style.transform = `scale(${currentZoom}) translate(${panX}px, ${panY}px)`;
        }
      } else if (e.touches.length === 1 && isSwiping && currentZoom <= 1) {
        swipeDeltaX = e.touches[0].clientX - swipeStartX;
        const swipeDeltaY = e.touches[0].clientY - swipeStartY;

        if (Math.abs(swipeDeltaX) > 6 || Math.abs(swipeDeltaX) > Math.abs(swipeDeltaY)) {
          if (e.cancelable) e.preventDefault();
          wasSwiping = true;
        }

        const maxIndex = Math.max(0, carouselItems.length - 1);
        let effectiveDelta = swipeDeltaX;
        if (!loop) {
          if ((currentIndex === 0 && effectiveDelta > 0) || (currentIndex === maxIndex && effectiveDelta < 0)) {
            effectiveDelta *= 0.28;
          }
        }

        const baseOffset = -(currentIndex * cachedSlideWidth + cachedSlideWidth / 2);
        track.style.transform = `translate3d(${baseOffset + effectiveDelta}px, -50%, 0)`;

        const progress = effectiveDelta / cachedSlideWidth;
        const slides = track.querySelectorAll('.perspective-carousel-slide');
        slides.forEach((slide, idx) => {
          const inner = slide.querySelector('.perspective-carousel-slide-inner');
          if (!inner) return;
          const dist = (currentIndex - progress) - idx;
          const rotY = dist * rotationStep;
          const absDist = Math.abs(dist);
          const scale = Math.max(0.72, Math.min(1, 1 - absDist * (1 - inactiveScale)));
          inner.style.transform = `translate3d(0, 0, 0) rotateY(${rotY}deg) scale(${scale})`;
        });
      }
    }, { passive: false });

    viewport.addEventListener('touchend', (e) => {
      if (e.touches.length < 2) {
        touchStartDist = 0;
      }
      endDragOrSwipe();
    });

    viewport.addEventListener('touchcancel', () => {
      touchStartDist = 0;
      endDragOrSwipe();
    });
  }

  // Perspective Carousel Navigation Engine
  function selectSlide(nextIndex, isInitial = false) {
    if (!carouselItems.length || !track) return;

    const maxIndex = Math.max(0, carouselItems.length - 1);
    const resolvedIndex = loop
      ? (nextIndex + carouselItems.length) % carouselItems.length
      : Math.min(Math.max(nextIndex, 0), maxIndex);

    currentIndex = resolvedIndex;
    resetZoom();

    cachedSlideWidth = getSafeSlideWidth();
    const slides = Array.from(track.querySelectorAll('.perspective-carousel-slide'));

    slides.forEach(slide => {
      slide.style.width = `${cachedSlideWidth}px`;
    });

    const trackOffset = -(currentIndex * cachedSlideWidth + cachedSlideWidth / 2);
    if (isInitial) {
      track.style.transition = 'none';
      track.style.transform = `translate3d(${trackOffset}px, -50%, 0)`;
      void track.offsetWidth;
      track.style.transition = '';
    } else {
      track.style.transform = `translate3d(${trackOffset}px, -50%, 0)`;
    }

    slides.forEach((slide, idx) => {
      const inner = slide.querySelector('.perspective-carousel-slide-inner');
      const labelWrap = slide.querySelector('.perspective-carousel-label-wrap');
      const btn = slide.querySelector('.perspective-carousel-card-btn');
      const isActive = idx === currentIndex;
      const rotY = (currentIndex - idx) * rotationStep;
      const scale = isActive ? 1 : inactiveScale;

      if (inner) {
        if (isInitial) {
          inner.style.transition = 'none';
          inner.style.transform = `translate3d(0, 0, 0) rotateY(${rotY}deg) scale(${scale})`;
          void inner.offsetWidth;
          inner.style.transition = '';
        } else {
          inner.style.transform = `translate3d(0, 0, 0) rotateY(${rotY}deg) scale(${scale})`;
        }
      }

      if (isActive) {
        slide.classList.add('active');
        if (btn) btn.setAttribute('aria-current', 'true');
        if (labelWrap) {
          labelWrap.style.opacity = '1';
          labelWrap.style.transform = 'translate3d(0, 0, 0)';
        }
      } else {
        slide.classList.remove('active');
        if (btn) btn.removeAttribute('aria-current');
        if (labelWrap) {
          labelWrap.style.opacity = '0';
          labelWrap.style.transform = 'translate3d(0, 8px, 0)';
        }
      }
    });

    if (prevBtn) prevBtn.disabled = !loop && currentIndex === 0;
    if (nextBtn) nextBtn.disabled = !loop && currentIndex === maxIndex;

    if (dotsContainer) {
      const dots = Array.from(dotsContainer.querySelectorAll('.perspective-dot'));
      dots.forEach((dot, idx) => {
        if (idx === currentIndex) {
          dot.classList.add('active');
          dot.setAttribute('aria-current', 'true');
          dot.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        } else {
          dot.classList.remove('active');
          dot.removeAttribute('aria-current');
        }
      });
    }
  }

  function renderCarouselDOM() {
    if (!track || !dotsContainer) return;

    track.innerHTML = carouselItems.map((item, idx) => `
      <div class="perspective-carousel-slide" data-index="${idx}">
        <div class="perspective-carousel-slide-inner">
          <button type="button" class="perspective-carousel-card-btn" aria-label="Show ${item.title}">
            <div class="perspective-carousel-img-wrap">
              <img src="${item.src}" alt="${item.alt}" draggable="false" class="perspective-carousel-img">
            </div>
          </button>
          <div class="perspective-carousel-label-wrap">
            <div class="perspective-carousel-title">${item.title}</div>
            ${item.category ? `<span class="perspective-carousel-category">${item.category}</span>` : ''}
          </div>
        </div>
      </div>
    `).join('');

    dotsContainer.innerHTML = carouselItems.map((item, idx) => `
      <button type="button" class="perspective-dot" data-index="${idx}" aria-label="Show slide ${idx + 1}: ${item.title}"></button>
    `).join('');

    track.querySelectorAll('.perspective-carousel-card-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        if (wasSwiping) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        const slide = btn.closest('.perspective-carousel-slide');
        if (slide) {
          const idx = parseInt(slide.getAttribute('data-index'), 10);
          if (!isNaN(idx)) selectSlide(idx);
        }
      });
    });

    dotsContainer.querySelectorAll('.perspective-dot').forEach(dot => {
      dot.addEventListener('click', () => {
        const idx = parseInt(dot.getAttribute('data-index'), 10);
        if (!isNaN(idx)) selectSlide(idx);
      });
    });
  }

  function openLightbox(index) {
    if (!modal || activeCards.length === 0 || !activeCards[index]) return;

    carouselItems = activeCards.map(card => {
      const img = card.querySelector('img');
      return {
        src: img ? (img.currentSrc || img.getAttribute('src') || '') : '',
        title: card.getAttribute('data-title') || card.querySelector('.portfolio-title')?.textContent?.trim() || 'Portfolio Work',
        alt: (img ? img.alt : '') || card.getAttribute('data-title') || 'Portfolio Work',
        category: card.getAttribute('data-category-label') || ''
      };
    });

    renderCarouselDOM();
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    requestAnimationFrame(() => {
      selectSlide(index, true);
      if (carousel) carousel.focus();
    });
  }

  window.openLightboxWithData = function(src, title, category) {
    if (!modal) return;
    carouselItems = [{
      src: src,
      title: title || 'Portfolio Showcase',
      alt: title || 'Portfolio Showcase',
      category: category || 'Featured Work'
    }];
    renderCarouselDOM();
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => {
      selectSlide(0, true);
      if (carousel) carousel.focus();
    });
  };

  function closeLightbox() {
    resetZoom();
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }
    if (modal) {
      modal.classList.remove('fullscreen-mode');
      modal.classList.remove('active');
    }
    updateFsUI(false);
    document.body.style.overflow = '';
  }

  if (prevBtn) prevBtn.addEventListener('click', () => selectSlide(currentIndex - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => selectSlide(currentIndex + 1));
  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);

  allCards.forEach(card => {
    card.addEventListener('click', () => {
      const idx = activeCards.indexOf(card);
      if (idx !== -1) {
        openLightbox(idx);
      }
    });
  });

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal || e.target.classList.contains('lightbox-dialog')) {
        closeLightbox();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (!modal.classList.contains('active')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFullscreen();
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        selectSlide(currentIndex + 1);
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        selectSlide(currentIndex - 1);
      }
      if (e.key === '+' || e.key === '=') applyZoom(currentZoom + 0.3);
      if (e.key === '-' || e.key === '_') applyZoom(currentZoom - 0.3);
      if (e.key === '0') resetZoom();
    });

    window.addEventListener('resize', () => {
      if (modal.classList.contains('active')) {
        selectSlide(currentIndex, true);
      }
    }, { passive: true });
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
      window.location.href = `mailto:avikomedia07@gmail.com?subject=${subject}&body=${body}`;
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



