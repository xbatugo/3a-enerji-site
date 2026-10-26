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
      document.documentElement.classList.toggle('menu-acik', acik);
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
    // hizmete göre ölçü alanı ve ipucu (build.py IPUCU_GRUP ile eşleşir)
    var IPUCU = {
      alan:   ['Alan ve tavan yüksekliği', 'ör. 2.400 m², 9 m tavan', 'Radyant ısıtma için alan ölçüsü ve tavan yüksekliği iyi bir başlangıçtır.'],
      isi:    ['Sistem / kapasite bilgisi', 'ör. buhar hattı, mevcut kazan', 'Kullanım amacı ve mevcut kazan veya hat bilgisi ön değerlendirmeyi hızlandırır.'],
      iklim:  ['Alan ve kullanım', 'ör. 600 m² atölye, mevcut cihaz', 'Alan ölçüsü, kullanım amacı ve mevcut cihaz bilgisi yeterlidir.'],
      boru:   ['Boru çapı, malzeme ve uzunluk', 'ör. DN50 paslanmaz, 40 m', 'Boru çapı, malzemesi ve yaklaşık uzunluğu yeterlidir.'],
      kaynak: ['Malzeme, kalınlık ve adet', 'ör. AISI 304, 3 mm, 20 adet', 'Malzeme, kalınlık ve adet bilgisi yeterlidir; fotoğrafı WhatsApp sohbetine ekleyebilirsiniz.'],
      makine: ['Çizim / ölçü ve adet', 'ör. çizim mevcut, 1200×800 mm, 2 adet', 'Çizim veya ölçüler ile adet bilgisi yeterlidir; çizimi WhatsApp sohbetine ekleyebilirsiniz.'],
      genel:  ['Ölçü / miktar bilgisi', 'ör. alan, adet veya uzunluk', 'Ne yapılmasını istediğinizi birkaç cümleyle yazın.']
    };
    var ADLAR = { ad: 'Ad soyad', tel: 'Telefon', eposta: 'E-posta', hizmet: 'Hizmet', aciklama: 'Kısa ihtiyaç', kvkk: 'KVKK onayı' };
    $$('form.talep').forEach(function (f) {
      var kutu = f.closest('.form-kutu'), basari = $('.basari', kutu), ozet = $('pre', basari);
      var hataOzet = $('.form-hata-ozet', f), durum = $('.kopya-durum', basari);
      var E = f.elements, metin = '';
      var lOlcu = $('#l-olcu', f), ipucu = $('#ipucu', f);
      function ipucuGuncelle() {
        var o = E.hizmet.selectedOptions[0], g = IPUCU[(o && o.getAttribute('data-ipucu')) || 'genel'] || IPUCU.genel;
        lOlcu.innerHTML = '';
        lOlcu.appendChild(document.createTextNode(g[0] + ' '));
        var i = document.createElement('i'); i.textContent = '(isteğe bağlı)'; lOlcu.appendChild(i);
        E.olcu.placeholder = g[1];
        ipucu.textContent = g[2];
      }
      var secili = f.getAttribute('data-secili') || (new URLSearchParams(location.search).get('hizmet') || '');
      if (secili) { var o = f.querySelector('option[data-slug="' + secili.replace(/[^a-z]/g, '') + '"]'); if (o) o.selected = true; }
      ipucuGuncelle();
      E.hizmet.addEventListener('change', ipucuGuncelle);
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
        var hatalar = [];
        function k(el, ok) { isaretle(el, !ok); if (!ok) hatalar.push(el); }
        var ad = E.ad.value.trim();
        k(E.ad, ad.length >= 3 && /\S\s+\S/.test(ad));
        var t = telTemiz(E.tel.value); k(E.tel, t.length === 10 && /^[2-5]/.test(t));
        var ep = E.eposta.value.trim(); k(E.eposta, !ep || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(ep));
        k(E.hizmet, !!E.hizmet.value);
        k(E.aciklama, E.aciklama.value.trim().length >= 10);
        k(E.kvkk, E.kvkk.checked);
        return hatalar;
      }
      ['ad', 'tel', 'eposta', 'hizmet', 'aciklama', 'kvkk'].forEach(function (n) {
        var el = E[n];
        el.addEventListener(el.tagName === 'SELECT' || el.type === 'checkbox' ? 'change' : 'input', function () {
          if (alan(el).classList.contains('hata')) {
            var h = kontrol();
            if (!h.length) hataOzet.hidden = true;
          }
        });
      });
      function goster(el, acik) { el.hidden = !acik; }
      f.addEventListener('submit', function (e) {
        e.preventDefault();
        var hatalar = kontrol();
        if (hatalar.length) {
          hataOzet.textContent = hatalar.length === 1
            ? 'Bir alanı kontrol edin: ' + ADLAR[hatalar[0].name] + '.'
            : hatalar.length + ' alanı kontrol edin: ' + hatalar.map(function (x) { return ADLAR[x.name]; }).join(', ') + '.';
          hataOzet.hidden = false;
          hatalar[0].focus();
          return;
        }
        hataOzet.hidden = true;
        var t = telTemiz(E.tel.value), s = [];
        function ekle(etiket, el) { var v = el && el.value.trim(); if (v) s.push(etiket + ': ' + v); }
        ekle('Ad soyad', E.ad);
        s.push('Telefon: 0' + t.slice(0, 3) + ' ' + t.slice(3, 6) + ' ' + t.slice(6, 8) + ' ' + t.slice(8));
        ekle('E-posta', E.eposta); ekle('Firma', E.firma); ekle('Görev / departman', E.gorev); ekle('Tesis konumu', E.konum);
        s.push('');
        ekle('Hizmet', E.hizmet); ekle('Talep türü', E.tur);
        ekle(lOlcu.firstChild.textContent.trim(), E.olcu); ekle('Planlanan zaman', E.zaman);
        s.push('', 'İhtiyaç:', E.aciklama.value.trim().slice(0, 1500));  // maxlength'e ek güvence
        metin = s.join('\n');
        ozet.textContent = metin;
        $('.wa-gonder', basari).href = 'https://wa.me/' + f.getAttribute('data-wa') + '?text=' + encodeURIComponent('Merhaba, web sitesi üzerinden teklif talebi:\n\n' + metin);
        $('.posta-gonder', basari).href = 'mailto:' + f.getAttribute('data-posta') + '?subject=' + encodeURIComponent('Teklif talebi: ' + E.hizmet.value + (E.firma.value.trim() ? ' — ' + E.firma.value.trim() : '')) + '&body=' + encodeURIComponent(metin.replace(/\n/g, '\r\n'));
        durum.textContent = '';
        goster(f, false);
        $$('.form-giris', kutu).forEach(function (x) { goster(x, false); });
        basari.classList.add('acik');
        kutu.scrollIntoView({ block: 'start', behavior: azHareket() ? 'auto' : 'smooth' });
        basari.focus({ preventScroll: true });
      });
      function formaDon(sifirla) {
        if (sifirla) { f.reset(); ipucuGuncelle(); $$('.hata', f).forEach(function (x) { x.classList.remove('hata'); }); $$('[aria-invalid]', f).forEach(function (x) { x.removeAttribute('aria-invalid'); }); }
        goster(f, true); basari.classList.remove('acik');
        $$('.form-giris', kutu).forEach(function (x) { goster(x, true); });
        E.ad.focus();
      }
      $('.yeni-talep', basari).addEventListener('click', function () { formaDon(true); });
      $('.duzenle', basari).addEventListener('click', function () { formaDon(false); });
      $('.kopyala', basari).addEventListener('click', function () {
        function basarili() { durum.textContent = 'Metin kopyalandı. WhatsApp veya e-postaya yapıştırabilirsiniz.'; }
        function elle() {
          // eski yöntem; o da olmazsa metni seçili bırak, kullanıcı elle kopyalasın
          var ok = false;
          try {
            var r = document.createRange(); r.selectNodeContents(ozet);
            var sec = getSelection(); sec.removeAllRanges(); sec.addRange(r);
            ok = document.execCommand && document.execCommand('copy');
          } catch (h) { ok = false; }
          if (ok) basarili();
          else durum.textContent = 'Otomatik kopyalanamadı. Metin seçildi; Ctrl+C ile veya basılı tutarak kopyalayın.';
        }
        if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(metin).then(basarili, elle);
        else elle();
      });
    });
  });

  dene('klavye', function () {
    // mobilde form alanı odaktayken sabit alt çubuk gizlenir; ekran klavyesi odaklı alanı örtmez
    var alanMi = function (el) { return el && /^(INPUT|SELECT|TEXTAREA)$/.test(el.tagName) && el.type !== 'checkbox'; };
    document.addEventListener('focusin', function (e) { if (alanMi(e.target)) document.documentElement.classList.add('klavye'); });
    document.addEventListener('focusout', function () {
      setTimeout(function () { if (!alanMi(document.activeElement)) document.documentElement.classList.remove('klavye'); }, 50);
    });
  });

  dene('yil', function () { $$('[data-yil]').forEach(function (x) { x.textContent = new Date().getFullYear(); }); });
})();
