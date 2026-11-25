/* ============================================================
   Corporate Workspace site script
   ============================================================ */
(function () {
  'use strict';

  /* ==========================================================
     1. SITE CONFIG: the only block you normally need to edit
     ========================================================== */
  var CONFIG = {

    /* ---- Contact ---- */
    // Digits only, with country code. 91 = India.
    whatsappNumber: '919998202849',
    // Shown + used for the mailto: fallback.
    email: 'info@corporateworkspace.in',

    /* ---- Enquiry form delivery ----------------------------------
       provider options:

         'google'    (active)      Answers go straight into a Google
                                   Form, so every lead lands in a
                                   Google Sheet. Free and unlimited.
                                   SETUP: see googlePrefilledLink below.
                                   Until that link is filled in, the
                                   form falls back to WhatsApp so the
                                   site keeps working.

         'whatsapp'                No signup. The form opens WhatsApp
                                   with every answer pre-filled.

         'web3forms'               Free, 250 submissions/month, lands
                                   in an inbox. Get a key in 60s at
                                   https://web3forms.com
                                   Then: web3formsKey:'your-key-here'

         'formspree'               Free 50/month + a lead dashboard.
                                   Needs a signup at formspree.io
                                   Then: formspreeEndpoint:'https://formspree.io/f/xxxxxxx'

         'custom'                  Any endpoint that accepts a JSON
                                   POST (e.g. a Cloudflare Worker
                                   writing to a D1 database).
                                   Then: customEndpoint:'https://...'

       Nothing else in the site needs to change when you switch.
    -------------------------------------------------------------- */
    form: {
      provider: 'google',

      /* ---- Google Forms setup (one paste, no ID hunting) ----------

         1. Create a Google Form with these SEVEN questions, in any
            order. Make every one of them "Short answer" or
            "Paragraph" (NOT multiple choice or dropdown, or Google
            rejects any answer that is not an exact option match):

              Name
              Phone
              Email
              What do you need
              How many people
              Preferred start
              Message

         2. In the Form: Settings -> Responses -> make sure
            "Collect email addresses" is OFF and, on a Workspace
            account, that it is NOT restricted to your organisation.
            Otherwise visitors are asked to sign in and nothing
            reaches you.

         3. Click the three-dot menu (top right) -> "Get pre-filled
            link". Type these EXACT words as the answers:

              Name              ->  NAME
              Phone             ->  PHONE
              Email             ->  EMAIL
              What do you need  ->  SPACE
              How many people   ->  SEATS
              Preferred start   ->  MOVEIN
              Message           ->  MESSAGE

         4. Press "Get link", then "COPY LINK", and paste the whole
            thing between the quotes below.

         That is it. The script reads the field IDs out of that link
         by matching those words, so you never touch an "entry.xxxx"
         number yourself.
      ------------------------------------------------------------- */
      googlePrefilledLink: 'https://docs.google.com/forms/d/e/1FAIpQLSdBXsplhQ4PenoYQKnUzQGTUFX8-I91Ys8_1dbUGZvdawg3EQ/viewform?usp=pp_url' +
        '&entry.1199287607=NAME' +
        '&entry.2141065898=PHONE' +
        '&entry.1600174500=EMAIL' +
        '&entry.234337404=SPACE' +
        '&entry.11557545=SEATS' +
        '&entry.1115235294=MOVEIN' +
        '&entry.935538839=MESSAGE',

      /* Every question in the CW-Web-Entries form is currently marked
         Required, but Email, How many people, Preferred start and
         Message are optional on the website. Google rejects the whole
         submission if a required answer is blank, and a no-cors POST
         cannot report that back, so the lead would vanish silently.
         Sending this placeholder for blanks keeps every enquiry safe.
         If you un-tick Required on those four questions in the Google
         Form, set this to '' and blanks will stay genuinely empty. */
      googleFillEmpty: '-',

      web3formsKey: '',
      formspreeEndpoint: '',
      customEndpoint: '',
      subject: 'New enquiry from corporateworkspace website',
      // Where to send the visitor after a successful submit.
      // Set to null to show an inline success message instead.
      redirectTo: 'thank-you.html'
    }
  };

  var $  = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ==========================================================
     2. Wire up every phone / WhatsApp / email link from CONFIG
     ========================================================== */
  function applyContactLinks() {
    var waBase = 'https://wa.me/' + CONFIG.whatsappNumber;

    $$('[data-wa]').forEach(function (el) {
      var msg = el.getAttribute('data-wa') ||
                'Hi Corporate Workspace, I would like to know more about your coworking plans.';
      el.setAttribute('href', waBase + '?text=' + encodeURIComponent(msg));
      el.setAttribute('target', '_blank');
      el.setAttribute('rel', 'noopener');
    });

    $$('[data-email]').forEach(function (el) {
      el.setAttribute('href', 'mailto:' + CONFIG.email);
      if (el.hasAttribute('data-email-text')) el.textContent = CONFIG.email;
    });
  }

  /* ==========================================================
     3. Navigation
     ========================================================== */
  function initNav() {
    var nav    = $('.nav');
    var links  = $('.nav__links');
    var burger = $('.burger');
    var scrim  = $('.nav-scrim');
    if (!nav) return;

    var onScroll = function () {
      nav.classList.toggle('is-stuck', window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    if (!burger || !links) return;

    var setOpen = function (open) {
      links.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', String(open));
      if (scrim) scrim.classList.toggle('is-on', open);
      document.body.style.overflow = open ? 'hidden' : '';
    };

    burger.addEventListener('click', function () {
      setOpen(burger.getAttribute('aria-expanded') !== 'true');
    });
    if (scrim) scrim.addEventListener('click', function () { setOpen(false); });
    $$('a', links).forEach(function (a) {
      a.addEventListener('click', function () { setOpen(false); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setOpen(false);
    });
    // Reset the drawer if the viewport grows past the mobile breakpoint.
    window.addEventListener('resize', function () {
      if (window.innerWidth > 860) setOpen(false);
    });
  }

  /* ==========================================================
     4. Scroll reveal
     ========================================================== */
  function initReveal() {
    var items = $$('.rv');
    if (!items.length) return;

    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('in'); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var delay = parseInt(el.getAttribute('data-delay') || '0', 10);
        setTimeout(function () { el.classList.add('in'); }, delay);
        io.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    items.forEach(function (el) { io.observe(el); });
  }

  /* ==========================================================
     5. Enquiry form
     ========================================================== */
  var FIELD_LABELS = {
    name:      'Name',
    phone:     'Phone',
    email:     'Email',
    space:     'Workspace needed',
    seats:     'Number of seats',
    movein:    'Preferred start',
    message:   'Message'
  };

  function initForm() {
    var form = $('#enquiry-form');
    if (!form) return;

    var note   = $('#form-note');
    var submit = $('#form-submit');
    var label  = submit ? submit.querySelector('[data-label]') : null;
    var originalLabel = label ? label.textContent : '';

    function showNote(kind, text) {
      if (!note) return;
      note.className = 'formnote is-on formnote--' + kind;
      note.innerHTML =
        (kind === 'ok'
          ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>'
          : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>') +
        '<span></span>';
      note.querySelector('span').textContent = text;
    }

    function clearNote() {
      if (note) note.className = 'formnote';
    }

    function setBusy(busy) {
      if (!submit) return;
      submit.setAttribute('aria-busy', String(busy));
      submit.disabled = busy;
      if (!label) return;
      if (busy) {
        label.textContent = 'Sending…';
        if (!submit.querySelector('.spin')) {
          var s = document.createElement('span');
          s.className = 'spin';
          submit.insertBefore(s, submit.firstChild);
        }
      } else {
        label.textContent = originalLabel;
        var sp = submit.querySelector('.spin');
        if (sp) sp.remove();
      }
    }

    /* ---- validation ---- */
    function fieldWrap(input) { return input.closest('.field'); }

    function setError(input, msg) {
      var wrap = fieldWrap(input);
      if (!wrap) return;
      wrap.classList.toggle('is-bad', !!msg);
      var err = wrap.querySelector('.err');
      if (err) err.textContent = msg || '';
      if (msg) input.setAttribute('aria-invalid', 'true');
      else input.removeAttribute('aria-invalid');
    }

    function validateField(input) {
      var v = (input.value || '').trim();
      var name = input.name;

      if (input.required && !v) {
        setError(input, 'Please fill this in.');
        return false;
      }
      if (name === 'phone' && v) {
        // Accept 10-digit Indian mobiles, optionally with +91 / 0 / spaces.
        var digits = v.replace(/[^\d]/g, '');
        if (digits.length < 10 || digits.length > 13) {
          setError(input, 'Enter a valid 10-digit mobile number.');
          return false;
        }
      }
      if (name === 'email' && v) {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) {
          setError(input, 'Enter a valid email address.');
          return false;
        }
      }
      setError(input, '');
      return true;
    }

    var controls = $$('input, select, textarea', form).filter(function (el) {
      return el.type !== 'hidden' && !el.closest('.hp');
    });

    controls.forEach(function (el) {
      el.addEventListener('blur', function () { validateField(el); });
      el.addEventListener('input', function () {
        if (fieldWrap(el) && fieldWrap(el).classList.contains('is-bad')) validateField(el);
      });
    });

    /* ---- data ---- */
    function collect() {
      var data = {};
      controls.forEach(function (el) {
        if (!el.name) return;
        data[el.name] = (el.value || '').trim();
      });
      return data;
    }

    function asText(data) {
      var lines = ['New enquiry: Corporate Workspace', ''];
      Object.keys(FIELD_LABELS).forEach(function (k) {
        if (data[k]) lines.push(FIELD_LABELS[k] + ': ' + data[k]);
      });
      lines.push('', 'Sent from the website.');
      return lines.join('\n');
    }

    /* ---- delivery ---- */
    // NOTE: window.open(url, '_blank', 'noopener') always returns null by
    // spec, so testing its result would send the visitor's own tab to
    // WhatsApp as well as opening a new one. Click a real anchor instead:
    // it inherits the submit gesture, so it is not treated as a popup.
    function openExternal(url) {
      var a = document.createElement('a');
      a.href = url;
      a.target = '_blank';
      a.rel = 'noopener';
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }

    function sendWhatsApp(data) {
      openExternal('https://wa.me/' + CONFIG.whatsappNumber +
                   '?text=' + encodeURIComponent(asText(data)));
      return Promise.resolve();
    }

    function postJSON(url, payload) {
      return fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      }).then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res;
      });
    }

    /* ---- Google Forms --------------------------------------------
       The pre-filled link carries one "entry.NNNN=TOKEN" pair per
       question. We match the TOKEN back to one of our field names, so
       the owner never has to copy entry IDs by hand.
    ---------------------------------------------------------------- */
    var GOOGLE_TOKENS = {
      NAME: 'name',
      PHONE: 'phone',
      EMAIL: 'email',
      SPACE: 'space',
      SEATS: 'seats',
      MOVEIN: 'movein',
      MESSAGE: 'message'
    };

    var googleCfg = null;
    function parseGoogleLink() {
      if (googleCfg !== null) return googleCfg;      // parse once
      googleCfg = false;

      var raw = (CONFIG.form.googlePrefilledLink || '').trim();
      if (!raw) return googleCfg;

      var url;
      try { url = new URL(raw); } catch (e) { return googleCfg; }
      if (!/docs\.google\.com$/.test(url.hostname)) return googleCfg;

      var entries = {};
      var found = 0;
      url.searchParams.forEach(function (value, key) {
        if (key.indexOf('entry.') !== 0) return;
        var field = GOOGLE_TOKENS[(value || '').trim().toUpperCase()];
        if (field && !entries[field]) { entries[field] = key; found++; }
      });
      if (!found) return googleCfg;

      googleCfg = {
        action: url.origin + url.pathname.replace(/\/(viewform|formResponse)\/?$/, '/formResponse'),
        entries: entries
      };
      return googleCfg;
    }

    function sendGoogle(data, cfg) {
      var fill = CONFIG.form.googleFillEmpty;
      var body = new URLSearchParams();
      Object.keys(cfg.entries).forEach(function (field) {
        var v = data[field];
        if (!v && fill) v = fill;        // see googleFillEmpty in CONFIG
        if (v) body.append(cfg.entries[field], v);
      });
      // Google Forms sends no CORS headers, so this has to go as a
      // no-cors POST. The request IS delivered, but the response is
      // opaque: we cannot read a status back, so a resolved promise
      // means "sent", not "accepted". Test once after setup.
      return fetch(cfg.action, {
        method: 'POST',
        mode: 'no-cors',
        body: body
      });
    }

    function send(data) {
      var cfg = CONFIG.form;

      if (cfg.provider === 'google') {
        var g = parseGoogleLink();
        if (g) return sendGoogle(data, g);
        // Not set up yet: keep the form usable instead of losing a lead.
        if (window.console && console.warn) {
          console.warn('[enquiry] provider is "google" but googlePrefilledLink ' +
                       'is missing or unreadable. Falling back to WhatsApp. ' +
                       'See the setup notes at the top of main.js.');
        }
        return sendWhatsApp(data);
      }

      if (cfg.provider === 'web3forms') {
        if (!cfg.web3formsKey) return Promise.reject(new Error('Missing web3formsKey in CONFIG.'));
        var w3 = Object.assign({}, data, {
          access_key: cfg.web3formsKey,
          subject: cfg.subject,
          from_name: 'Corporate Workspace website'
        });
        return postJSON('https://api.web3forms.com/submit', w3);
      }

      if (cfg.provider === 'formspree') {
        if (!cfg.formspreeEndpoint) return Promise.reject(new Error('Missing formspreeEndpoint in CONFIG.'));
        return postJSON(cfg.formspreeEndpoint, Object.assign({}, data, { _subject: cfg.subject }));
      }

      if (cfg.provider === 'custom') {
        if (!cfg.customEndpoint) return Promise.reject(new Error('Missing customEndpoint in CONFIG.'));
        return postJSON(cfg.customEndpoint, data);
      }

      return sendWhatsApp(data);
    }

    /* ---- submit ---- */
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      clearNote();

      // Honeypot: real people never fill this in.
      var pot = form.querySelector('[name="company_website"]');
      if (pot && pot.value) return;

      var ok = true;
      controls.forEach(function (el) { if (!validateField(el)) ok = false; });
      if (!ok) {
        showNote('bad', 'Please check the highlighted fields and try again.');
        var first = form.querySelector('.field.is-bad input, .field.is-bad select, .field.is-bad textarea');
        if (first) first.focus();
        return;
      }

      var data = collect();
      // 'google' silently falls back to WhatsApp until the pre-filled
      // link is configured, so work out the real route, not the label.
      var viaWhatsApp = CONFIG.form.provider === 'whatsapp' ||
                        (CONFIG.form.provider === 'google' && !parseGoogleLink());
      setBusy(true);

      send(data)
        .then(function () {
          form.reset();
          controls.forEach(function (el) { setError(el, ''); });

          if (viaWhatsApp) {
            showNote('ok', 'WhatsApp is opening with your enquiry ready to send. Just press send and we will reply shortly.');
            setBusy(false);
            return;
          }
          if (CONFIG.form.redirectTo) {
            window.location.href = CONFIG.form.redirectTo;
            return;
          }
          showNote('ok', 'Thank you. Your enquiry has reached us and we will get back to you within one working day.');
          setBusy(false);
        })
        .catch(function (err) {
          setBusy(false);
          showNote('bad',
            'Sorry, that did not go through. Please call us on +91 99982 02849 or message us on WhatsApp.');
          if (window.console && console.warn) console.warn('[enquiry]', err);
        });
    });
  }

  /* ==========================================================
     6. Footer year
     ========================================================== */
  function initYear() {
    $$('[data-year]').forEach(function (el) {
      el.textContent = String(new Date().getFullYear());
    });
  }

  /* ---------------------------------------------------------- */
  function boot() {
    applyContactLinks();
    initNav();
    initReveal();
    initForm();
    initYear();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
