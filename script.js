(function () {
  'use strict';

  var header = document.querySelector('.site-header');
  var menuToggle = document.querySelector('.menu-toggle');
  var navLinks = document.querySelector('.nav-links');

  function onScroll() {
    if (header) header.classList.toggle('scrolled', window.scrollY > 40);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', function () {
      var open = navLinks.classList.toggle('open');
      menuToggle.classList.toggle('open', open);
      menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      menuToggle.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
    });

    navLinks.addEventListener('click', function (e) {
      if (navLinks.classList.contains('open') && e.target.closest('a')) {
        navLinks.classList.remove('open');
        menuToggle.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          el.classList.add('visible');
          revealObserver.unobserve(el);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('visible'); });
  }

  var yearEls = document.querySelectorAll('[data-year]');
  yearEls.forEach(function (el) { el.textContent = String(new Date().getFullYear()); });

  var gallerySections = Array.prototype.slice.call(document.querySelectorAll('.gallery-block'));
  var filterBtns = Array.prototype.slice.call(document.querySelectorAll('.filter-btn'));

  function activateFilter(cat, skipScroll) {
    filterBtns.forEach(function (btn) {
      var active = btn.dataset.cat === cat;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
    gallerySections.forEach(function (section) {
      var show = cat === 'tout' || section.dataset.cat === cat;
      section.hidden = !show;
    });
    if (!skipScroll) {
      var visible = gallerySections.filter(function (s) { return !s.hidden; });
      if (visible.length) visible[0].scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    if (cat !== 'tout') {
      try { history.replaceState(null, '', '?cat=' + encodeURIComponent(cat)); } catch (e) {}
    } else {
      try { history.replaceState(null, '', window.location.pathname); } catch (e) {}
    }
  }

  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () { activateFilter(btn.dataset.cat); });
  });

  var urlCat = new URLSearchParams(window.location.search).get('cat');
  if (gallerySections.length && filterBtns.length) {
    var initial = 'tout';
    if (urlCat && filterBtns.some(function (b) { return b.dataset.cat === urlCat; })) initial = urlCat;
    activateFilter(initial, true);
  }

  var lightbox = document.querySelector('.lightbox');
  if (lightbox) {
    var lbImg = lightbox.querySelector('img');
    var lbCaption = lightbox.querySelector('.lightbox-caption');
    var items = Array.prototype.slice.call(document.querySelectorAll('.gallery-item'));
    var current = 0;
    var focusEl = null;

    function openLightbox(index) {
      current = index;
      focusEl = document.activeElement;
      var item = items[current];
      var img = item.querySelector('img');
      lbImg.src = img.currentSrc || img.src;
      lbImg.alt = img.alt || '';
      lbCaption.textContent = img.alt || '';
      lightbox.classList.add('open');
      lightbox.querySelector('.lightbox-close').focus();
      document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
      lightbox.classList.remove('open');
      document.body.style.overflow = '';
      lbImg.removeAttribute('src');
      if (focusEl && focusEl.focus) focusEl.focus();
    }

    function step(delta) {
      current = (current + delta + items.length) % items.length;
      openLightbox(current);
    }

    items.forEach(function (item, index) {
      item.addEventListener('click', function () { openLightbox(index); });
      item.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openLightbox(index);
        }
      });
    });

    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLightbox();
    });
    lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
    lightbox.querySelector('.lightbox-prev').addEventListener('click', function (e) { e.stopPropagation(); step(-1); });
    lightbox.querySelector('.lightbox-next').addEventListener('click', function (e) { e.stopPropagation(); step(1); });

    document.addEventListener('keydown', function (e) {
      if (!lightbox.classList.contains('open')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') step(-1);
      if (e.key === 'ArrowRight') step(1);
    });
  }

  document.addEventListener('contextmenu', function (e) {
    if (e.target.closest('.gallery-item') || e.target.closest('.cat-card') || e.target.closest('.hero-img')) {
      e.preventDefault();
    }
  });

  var form = document.querySelector('.contact-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = form.querySelector('#nom').value.trim();
      var email = form.querySelector('#email').value.trim();
      var subject = form.querySelector('#sujet').value.trim();
      var message = form.querySelector('#message').value.trim();
      var body = 'Nom : ' + name + '\nE-mail : ' + email + '\n\nMessage :\n' + message;
      var href = 'mailto:kadekeita277@gmail.com?subject=' + encodeURIComponent(subject || 'Demande de devis') + '&body=' + encodeURIComponent(body);
      window.location.href = href;
      var status = form.querySelector('.form-status');
      if (status) {
        status.hidden = false;
        status.textContent = 'Votre messagerie va s\u2019ouvrir pour confirmer l\u2019envoi. Merci !';
      }
    });
  }
})();