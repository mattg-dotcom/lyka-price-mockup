// Guided walk-through host. Runs in tour.html; the mock-up pages load inside the iframe and are never modified.
(function(){
  var q = new URLSearchParams(location.search);
  var S = {
    'index.html': [
      {sel:'h1', cap:'This is the working mock-up behind the plan. The walk follows Chloe, a convinced first-time buyer, from the question she asks to the price she can see.'},
      {sel:'.path', cap:'The strip at the top shows where you are on her path. You can pause at any time and click around yourself.'},
      {sel:'a.step[href^="tiktok"]', cap:'Chloe starts on TikTok. She asks the price in a comment under a Lyka video.', click:true}
    ],
    'tiktok.html': [
      {sel:'.reply', cap:'Tactic 1. A real price question in the thread: how much is it for a 30 kilo dog?'},
      {sel:'.cap', cap:'A named team member answers on camera with a labelled example price, in public, so everyone reading the thread sees it.'},
      {sel:'.pin', cap:'TikTok comments cannot carry live links, so the address sits in a pinned comment and the profile link. Every reply is counted toward the 90 per cent reply-coverage measure.'},
      {sel:'.bio a', cap:'Chloe taps the bio link. The tag u t m source equals tiktok travels with her, which is how the plan attributes the visit.', say:'Chloe taps the bio link. A TikTok source tag travels with her, which is how the plan attributes the visit.', click:true}
    ],
    'price.html': [
      {sel:'#route', cap:'Tactic 2. The page records the route she arrived by. Nothing about her is collected.'},
      {sel:'#weight', cap:'She enters her dog\'s weight, age and activity. No email field appears before the answer.', type:{sel:'#weight', value:'30'}},
      {sel:'.plan.best', cap:'The ongoing price, with the billing period and total shown at least as prominently as the per-day figure. This is the main goal: can she state this number within five minutes?'},
      {sel:'.email', cap:'Email comes after the price, and only if she wants it. That is the trade-off the plan tests against the gated quote.'},
      {sel:'.faq details:nth-of-type(3) a', cap:'Still weighing it up? Tactic 3 compares fresh and dry food for the same dog.', open:'.faq details:nth-of-type(3)', click:true}
    ],
    'price.html|compare': [
      {sel:'#route', cap:'Back on the price page, now tagged from the comparison. The two digital routes are done. One route is left: the vet clinic.'},
      {sel:'.path a[href^="clinic"]', cap:'Chloe\'s vet raises diet. Follow the offline route.', click:true}
    ],
    'price.html|clinic': [
      {sel:'#route', cap:'The clinic code arrived with her: clinic I W zero one. A scan shows movement to the page, not confidence or purchase, which is why it is only a supporting measure.', say:'The clinic code arrived with her. A scan shows movement to the page, not confidence or purchase, which is why it is only a supporting measure.'},
      {sel:'.plan.best a.btn', cap:'From here the outcome the plan measures is an order placed.', click:true}
    ],
    'compare.html': [
      {sel:'table.cmp', cap:'Tactic 3. A vet-reviewed comparison with dated prices and a clear note on what Half Bowl does and does not cover. Found through search, AI assistants and one capped search ad.'},
      {sel:'.card', cap:'How she finds it: the search ad mirrors her own question and lands here, not on a sales page.'},
      {sel:'a.btn[href^="price"]', cap:'Every route ends at the same destination. Back to the price page, now tagged from the comparison.', click:true}
    ],
    'clinic.html': [
      {sel:'.two > div:first-child', cap:'Tactic 4, the offline route. Where the vet judges fresh food suitable, this card is handed over in the consult room.'},
      {sel:'a.btn[href*="IW01"]', cap:'Scanning the card opens the price page with the clinic\'s code, so the plan can see which clinics the visits came from.', click:true}
    ],
    'plan.html': [
      {sel:'h1', cap:'The end of the path. Orders placed here are the outcome tier, counted once per order. Growth alone does not prove causation.'},
      {sel:'.card', cap:'That is the whole plan in one walk: one goal, four routes, one destination. Thanks for watching.', end:true}
    ]
  };
  function msFor(text){ return Math.max(3200, Math.min(9000, 1200 + text.length * 34)); }

  var wrap = document.getElementById('wrap'), ifr = document.getElementById('ifr'), cur = document.getElementById('cur');
  var panel = document.getElementById('panel'), capT = panel.querySelector('.t'), addr = panel.querySelector('.addr'), bar = panel.querySelector('.bar i');
  var start = document.getElementById('start');
  var voice = false, paused = false, stopped = false, timer = null, lastEl = null, steps = [], idx = 0, started = false;

  function layout(){ var short = window.innerHeight < 520; document.body.classList.toggle('short', short); document.body.classList.toggle('tall', !short); }
  layout(); window.addEventListener('resize', layout);

  // first page carries the source tag from the cover (QR or link)
  var first = new URL('index.html', location.href);
  ['utm_source','utm_medium','utm_campaign'].forEach(function(k){ if (q.get(k)) first.searchParams.set(k, q.get(k)); });
  if (!first.searchParams.get('utm_source')) { first.searchParams.set('utm_source','cover'); }
  if (!first.searchParams.get('utm_campaign')) { first.searchParams.set('utm_campaign','price'); }
  ifr.src = first.pathname.split('/').pop() + first.search;

  document.getElementById('svoice').onclick = function(){ voice = !!window.speechSynthesis; begin(); };
  document.getElementById('squiet').onclick = function(){ voice = false; begin(); };
  function begin(){
    start.style.display = 'none'; panel.style.display = 'block'; cur.style.display = 'block'; started = true;
    document.getElementById('bvoice').textContent = voice ? 'Voice on' : 'Voice off';
    if (voice) { try { speechSynthesis.cancel(); } catch(e){} }
    if (ifrLoaded) run(0);
  }
  document.getElementById('bpause').onclick = function(){ paused = !paused; this.textContent = paused ? 'Resume' : 'Pause'; if (paused) { clearTimeout(timer); if (voice) speechSynthesis.pause(); } else { if (voice) speechSynthesis.resume(); run(idx); } };
  document.getElementById('bnext').onclick = function(){ clearTimeout(timer); if (voice) speechSynthesis.cancel(); paused = false; document.getElementById('bpause').textContent='Pause'; advance(steps[idx]); };
  document.getElementById('bvoice').onclick = function(){ voice = !voice && !!window.speechSynthesis; this.textContent = voice ? 'Voice on' : 'Voice off'; if (!voice) { try { speechSynthesis.cancel(); } catch(e){} } };
  document.getElementById('bstop').onclick = function(){ stopped = true; clearTimeout(timer); if (window.speechSynthesis) speechSynthesis.cancel(); panel.remove(); cur.remove(); unhl(); };
  document.getElementById('bhide').onclick = function(){ var m = document.body.classList.toggle('mini'); this.textContent = m ? 'Show text' : 'Hide text'; };

  var ifrLoaded = false;
  ifr.addEventListener('load', function(){
    ifrLoaded = true; unhl(); lastEl = null;
    var u = new URL(ifr.contentWindow.location.href);
    var page = u.pathname.split('/').pop() || 'index.html';
    var src = u.searchParams.get('utm_source');
    var key = page; if (page === 'price.html' && (src === 'compare' || src === 'clinic')) key = page + '|' + src;
    steps = S[key] || []; idx = 0;
    addr.textContent = 'Address: ' + page + u.search;
    if (started && !stopped) setTimeout(function(){ run(0); }, 500);
  });

  function doc(){ return ifr.contentDocument; }
  function expanded(){ return ifr.getBoundingClientRect().height > wrap.clientHeight + 5; }
  function pageY(el){ var r = el.getBoundingClientRect(); return r.top + (expanded() ? 0 : ifr.contentWindow.scrollY); }
  function scrollToEl(el){
    var panelH = (document.body.classList.contains('tall') && panel.style.display !== 'none') ? panel.offsetHeight + 20 : 0;
    var visible = wrap.clientHeight - panelH;
    var r = el.getBoundingClientRect();
    var y = pageY(el) - Math.max(20, (visible - r.height) * 0.4);
    if (expanded()) wrap.scrollTo({top: y, behavior:'smooth'}); else ifr.contentWindow.scrollTo({top: y, behavior:'smooth'});
  }
  function place(el){
    var r = el.getBoundingClientRect();
    cur.style.left = (r.left + Math.min(r.width/2, 120)) + 'px';
    cur.style.top = (r.top + r.height/2 - (expanded() ? wrap.scrollTop : 0)) + 'px';
  }
  function hl(el){ el.style.outline = '3px solid #F2876A'; el.style.outlineOffset = '4px'; el.style.borderRadius = '8px'; lastEl = el; }
  function unhl(){ if (lastEl) { lastEl.style.outline = ''; lastEl.style.outlineOffset = ''; } lastEl = null; }
  function speak(text, done){
    var u = new SpeechSynthesisUtterance(text); u.rate = 1.0; u.lang = 'en-AU';
    var vs = speechSynthesis.getVoices(); var v = vs.filter(function(x){ return /en[-_]AU/i.test(x.lang); })[0] || vs.filter(function(x){ return /en[-_]GB/i.test(x.lang); })[0] || vs.filter(function(x){ return /^en/i.test(x.lang); })[0];
    if (v) u.voice = v;
    var fired = false; function once(){ if (!fired) { fired = true; done(); } }
    u.onend = once; u.onerror = once;
    speechSynthesis.speak(u);
    return function(){ fired = true; };
  }

  function run(i){
    if (stopped || paused || !started) return;
    unhl(); clearTimeout(timer);
    var st = steps[i]; idx = i;
    if (!st) { capT.textContent = 'End of this page.'; return; }
    var d = doc();
    if (st.open) { var dt = d.querySelector(st.open); if (dt) dt.open = true; }
    var el = d.querySelector(st.sel);
    if (!el) return run(i + 1);
    capT.textContent = st.cap;
    var dur = msFor(st.cap);
    bar.style.transition = 'none'; bar.style.width = '0';
    scrollToEl(el);
    setTimeout(function(){
      if (stopped) return;
      place(el); hl(el);
      if (st.type) { var inp = d.querySelector(st.type.sel); if (inp) { inp.focus(); inp.value = st.type.value; inp.dispatchEvent(new Event('input')); } }
      bar.style.transition = 'width ' + dur + 'ms linear'; bar.style.width = '100%';
    }, 700);
    var cancelSpeak = null;
    if (voice) {
      cancelSpeak = speak(st.say || st.cap, function(){ clearTimeout(timer); timer = setTimeout(function(){ advance(st); }, 600); });
      // safety net if the speech engine never reports completion
      timer = setTimeout(function(){ if (cancelSpeak) cancelSpeak(); advance(st); }, dur * 2.5 + 700);
    } else {
      timer = setTimeout(function(){ advance(st); }, dur + 700);
    }
  }
  function advance(st){
    if (stopped || paused || !st) return;
    if (st.click) {
      var el = doc().querySelector(st.sel);
      cur.classList.add('click');
      setTimeout(function(){
        cur.classList.remove('click');
        var href = el && el.getAttribute('href');
        if (href && href !== '#') { ifr.src = new URL(href, ifr.contentWindow.location.href).toString(); }
        else { if (el) el.click(); run(idx + 1); }
      }, 450);
    } else if (st.end) {
      document.getElementById('bnext').style.display = 'none';
      document.getElementById('bpause').style.display = 'none';
    } else { run(idx + 1); }
  }
  wrap.addEventListener('scroll', function(){ if (lastEl) place(lastEl); });
  setInterval(function(){ if (lastEl && !stopped) place(lastEl); }, 200);
  if (window.speechSynthesis) { speechSynthesis.getVoices(); speechSynthesis.onvoiceschanged = function(){}; }
})();
