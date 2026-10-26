/* 3A Enerji Sistemleri — her özellik ayrı korunur; biri hata verirse diğerleri çalışmaya devam eder.
   Sunucu tarafı yoktur: teklif formu talebi hazırlar, kullanıcı WhatsApp ya da e-postayla gönderir. */
(function () {
  'use strict';
  var $ = function (s, k) { return (k || document).querySelector(s); };
  var $$ = function (s, k) { return Array.prototype.slice.call((k || document).querySelectorAll(s)); };
  function dene(ad, fn) { try { fn(); } catch (h) { if (window.console) console.warn('[' + ad + ']', h); } }
  function azHareket() { return window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches; }
  var IKON_MENU = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>';
  var IKON_KAPAT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>';

  dene('menu', function () {
    var dg = $('[data-menu]'), c = $('#cekmece');
    if (!dg || !c) return;
    function ayarla(acik) {
      c.classList.toggle('acik', acik);
      dg.setAttribute('aria-expanded', acik ? 'true' : 'false');
      dg.setAttribute('aria-label', acik ? 'Menüyü kapat' : 'Menüyü aç');
      dg.innerHTML = acik ? IKON_KAPAT : IKON_MENU;
      document.documentElement.style.overflow = acik ? 'hidden' : '';
    }
    dg.addEventListener('click', function () { ayarla(!c.classList.contains('acik')); });
    $$('a', c).forEach(function (a) { a.addEventListener('click', function () { ayarla(false); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && c.classList.contains('acik')) { ayarla(false); dg.focus(); } });
    window.addEventListener('resize', function () { if (window.innerWidth > 1023) ayarla(false); });
  });

  dene('filtre', function () {
    var g = $('#galeri');
    if (!g) return;
    var dugmeler = $$('.filtre button');
    dugmeler.forEach(function (d) {
      d.addEventListener('click', function () {
        var k = d.getAttribute('data-kat');
        dugmeler.forEach(function (x) { x.setAttribute('aria-pressed', x === d ? 'true' : 'false'); });
        $$('[data-kat]', g).forEach(function (li) { li.hidden = !(k === 'hepsi' || li.getAttribute('data-kat') === k); });
      });
    });
  });

  dene('buyutec', function () {
    var b = $('#buyutec');
    if (!b) return;
    var img = $('#by-img'), yazi = $('#by-yazi'), liste = [], i = 0, son = null;
    function goster() {
      var p = liste[i];
      img.src = p.getAttribute('data-buyuk');
      img.alt = p.getAttribute('data-yazi');
      yazi.textContent = p.getAttribute('data-yazi') + '  ·  ' + (i + 1) + ' / ' + liste.length;
    }
    function ac(p) {
      liste = $$('.proje').filter(function (x) { return !x.closest('[hidden]'); });
      i = Math.max(0, liste.indexOf(p)); son = p; goster();
      b.classList.add('acik'); b.setAttribute('aria-hidden', 'false');
      $('.by-kapat', b).focus({ preventScroll: true });
    }
    function kapat() {
      b.classList.remove('acik'); b.setAttribute('aria-hidden', 'true');
      if (son) son.focus({ preventScroll: true });
    }
    function git(n) { i = (i + n + liste.length) % liste.length; goster(); }
    $$('.proje').forEach(function (p) { p.addEventListener('click', function () { ac(p); }); });
    b.addEventListener('click', function (e) {
      var d = e.target.closest('[data-by]');
      if (d) { var v = d.getAttribute('data-by'); return v === 'kapat' ? kapat() : git(Number(v)); }
      if (e.target === b) kapat();
    });
    document.addEventListener('keydown', function (e) {
      if (!b.classList.contains('acik')) return;
      if (e.key === 'Escape') kapat();
      else if (e.key === 'ArrowRight') git(1);
      else if (e.key === 'ArrowLeft') git(-1);
      else if (e.key === 'Tab') { /* odak büyüteç içinde kalsın */
        var o = $$('button', b), ilk = o[0], son2 = o[o.length - 1];
        if (e.shiftKey && document.activeElement === ilk) { e.preventDefault(); son2.focus(); }
        else if (!e.shiftKey && document.activeElement === son2) { e.preventDefault(); ilk.focus(); }
      }
    });
  });

  dene('form', function () {
    $$('form.talep').forEach(function (f) {
      var kutu = f.closest('.form-kutu'), basari = $('.basari', kutu), ozet = $('pre', basari);
      var E = f.elements;
      var secili = f.getAttribute('data-secili') || (new URLSearchParams(location.search).get('hizmet') || '');
      if (secili) { var o = f.querySelector('option[data-slug="' + secili.replace(/[^a-z]/g, '') + '"]'); if (o) o.selected = true; }
      function alan(el) { return el.closest('.alan') || el.closest('.onay'); }
      function isaretle(el, hatali) {
        alan(el).classList.toggle('hata', hatali);
        if (hatali) el.setAttribute('aria-invalid', 'true'); else el.removeAttribute('aria-invalid');
      }
      function telTemiz(v) {
        var d = v.replace(/\D/g, '');
        if (d.indexOf('90') === 0 && d.length === 12) d = d.slice(2);
        if (d.charAt(0) === '0') d = d.slice(1);
        return d;
      }
      function kontrol() {
        var ilk = null;
        function k(el, ok) { isaretle(el, !ok); if (!ok && !ilk) ilk = el; }
        var ad = E.ad.value.trim();
        k(E.ad, ad.length >= 3 && /\s/.test(ad));
        var t = telTemiz(E.tel.value); k(E.tel, t.length === 10 && /^[2-5]/.test(t));
        var ep = E.eposta.value.trim(); k(E.eposta, !ep || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(ep));
        k(E.hizmet, !!E.hizmet.value);
        k(E.aciklama, E.aciklama.value.trim().length >= 10);
        k(E.kvkk, E.kvkk.checked);
        return ilk;
      }
      ['ad', 'tel', 'eposta', 'hizmet', 'aciklama', 'kvkk'].forEach(function (n) {
        var el = E[n];
        el.addEventListener(el.tagName === 'SELECT' || el.type === 'checkbox' ? 'change' : 'input', function () {
          if (alan(el).classList.contains('hata')) kontrol();
        });
      });
      f.addEventListener('submit', function (e) {
        e.preventDefault();
        var ilk = kontrol();
        if (ilk) { ilk.focus(); return; }
        var t = telTemiz(E.tel.value), s = [];
        function ekle(etiket, el) { var v = el && el.value.trim(); if (v) s.push(etiket + ': ' + v); }
        ekle('Firma', E.firma); ekle('Yetkili', E.ad); ekle('Görev / departman', E.gorev);
        s.push('Telefon: 0' + t.slice(0, 3) + ' ' + t.slice(3, 6) + ' ' + t.slice(6, 8) + ' ' + t.slice(8));
        ekle('E-posta', E.eposta); ekle('Tesis konumu', E.konum);
        s.push('');
        ekle('Hizmet', E.hizmet); ekle('Talep türü', E.tur); ekle('Alan / tavan yüksekliği', E.olcu); ekle('Planlanan zaman', E.zaman);
        s.push('', 'Açıklama:', E.aciklama.value.trim());
        var metin = s.join('\n');
        ozet.textContent = metin;
        $('.wa-gonder', basari).href = 'https://wa.me/' + f.getAttribute('data-wa') + '?text=' + encodeURIComponent('Merhaba, web sitesi üzerinden teklif talebi:\n\n' + metin);
        $('.posta-gonder', basari).href = 'mailto:' + f.getAttribute('data-posta') + '?subject=' + encodeURIComponent('Teklif talebi: ' + E.hizmet.value + (E.firma.value.trim() ? ' — ' + E.firma.value.trim() : '')) + '&body=' + encodeURIComponent(metin);
        f.hidden = true;
        $$('.form-giris', kutu).forEach(function (x) { x.hidden = true; });
        basari.classList.add('acik');
        basari.focus({ preventScroll: true });
        kutu.scrollIntoView({ block: 'start', behavior: azHareket() ? 'auto' : 'smooth' });
      });
      $('.yeni-talep', basari).addEventListener('click', function () {
        f.reset(); f.hidden = false; basari.classList.remove('acik');
        $$('.form-giris', kutu).forEach(function (x) { x.hidden = false; });
        $$('.hata', f).forEach(function (x) { x.classList.remove('hata'); });
        E.firma.focus();
      });
    });
  });

  dene('yil', function () { $$('[data-yil]').forEach(function (x) { x.textContent = new Date().getFullYear(); }); });
})();
