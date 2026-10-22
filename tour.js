// Guided walk-through of Chloe's path. Start with ?tour=1 on any page; the step index carries in the URL.
(function(){
  var q = new URLSearchParams(location.search);
  if (!q.has('tour')) return;
  var page = location.pathname.split('/').pop() || 'index.html';
  var S = {
    'index.html': [
      {sel:'h1', cap:'This is the working mock-up behind the plan. The guided walk follows Chloe, a convinced first-time buyer, from the question she asks to the price she can see.', wait:4200},
      {sel:'.path', cap:'The strip at the top shows where you are on her path. You can pause the tour at any time and click around yourself.', wait:3800},
      {sel:'a.step[href^="tiktok"]', cap:'Chloe starts on TikTok. She asks the price in a comment under a Lyka video.', wait:3000, click:true}
    ],
    'tiktok.html': [
      {sel:'.reply', cap:'Tactic 1. A real price question in the thread: "how much is it for a 30kg dog??"', wait:3600},
      {sel:'.cap', cap:'A named team member answers on camera with a labelled example price, in public, so everyone reading the thread sees it.', wait:4000},
      {sel:'.pin', cap:'TikTok comments cannot carry live links, so the address sits in a pinned comment and the profile link. Every reply is counted toward the 90 per cent reply-coverage measure.', wait:4600},
      {sel:'.bio a', cap:'Chloe taps the bio link. The tag utm_source=tiktok travels with her, which is how the plan attributes the visit.', wait:3200, click:true}
    ],
    'price.html': [
      {sel:'#route', cap:'Tactic 2. The page records the route she arrived by. Nothing about her is collected.', wait:3600},
      {sel:'#weight', cap:'She enters her dog\'s weight, age and activity. No email field appears before the answer.', wait:3400, type:{sel:'#weight', value:'30'}},
      {sel:'.plan.best', cap:'The ongoing price, with the billing period and total shown at least as prominently as the per-day figure. This is the main goal: can she state this number within five minutes?', wait:5000},
      {sel:'.email', cap:'Email comes after the price, and only if she wants it. That is the trade-off the plan tests against the gated quote.', wait:3800},
      {sel:'.faq details:nth-of-type(3) a', cap:'Still weighing it up? Tactic 3 compares fresh and dry food for the same dog.', wait:3200, open:'.faq details:nth-of-type(3)', click:true}
    ],
    'compare.html': [
      {sel:'table.cmp', cap:'Tactic 3. A vet-reviewed comparison with dated prices and a clear note on what Half Bowl does and does not cover. Found through search, AI assistants and one capped search ad.', wait:5200},
      {sel:'.card', cap:'How she finds it: the search ad mirrors her own question and lands here, not on a sales page.', wait:3800},
      {sel:'a.btn[href^="price"]', cap:'Every route ends at the same destination. Back to the price page, now tagged utm_source=compare.', wait:3000, click:true}
    ],
    'clinic.html': [
      {sel:'.two > div:first-child', cap:'Tactic 4, the offline route. Where the vet judges fresh food suitable, this card is handed over in the consult room.', wait:4400},
      {sel:'a.btn[href*="IW01"]', cap:'Scanning the card opens the price page with the clinic\'s code, so the plan can see which clinics the visits came from.', wait:3600, click:true}
    ],
    'plan.html': [
      {sel:'h1', cap:'The end of the path. Orders placed here are the outcome tier, counted once per order. Growth alone does not prove causation.', wait:4600},
      {sel:'.card', cap:'That is the whole plan in one walk: one goal, four routes, one destination. Thanks for watching.', wait:4200, end:true}
    ]
  };
  // the clinic route is reached from the tour by a dedicated step after compare -> price
  var steps = S[page] || [];
  var idx = parseInt(q.get('tour')) || 0; if (isNaN(idx)) idx = 0;
  // After compare -> price, divert to the clinic page instead of repeating the price tour
  if (page === 'price.html' && q.get('utm_source') === 'compare') {
    steps = [
      {sel:'#route', cap:'Back on the price page, tagged from the comparison. The two digital routes are done. One route is left: the vet clinic.', wait:4200},
      {sel:'.path a[href^="clinic"]', cap:'Chloe\'s vet raises diet. Follow the offline route.', wait:3000, click:true}
    ];
  }
  if (page === 'price.html' && q.get('utm_source') === 'clinic') {
    steps = [
      {sel:'#route', cap:'The clinic code arrived with her: clinic=IW01. A scan shows movement to the page, not confidence or purchase, which is why it is only a supporting measure.', wait:5200},
      {sel:'.plan.best a.btn', cap:'From here the outcome the plan measures is an order placed.', wait:3000, click:true}
    ];
  }

  // UI
  var css = document.createElement('style');
  css.textContent = '#tcur{position:fixed;z-index:9999;width:26px;height:26px;pointer-events:none;transition:left .9s cubic-bezier(.4,0,.2,1),top .9s cubic-bezier(.4,0,.2,1);filter:drop-shadow(0 2px 4px rgba(0,0,0,.35))}#tcur.click{transform:scale(.8)}'+
   '#tcap{position:fixed;z-index:9998;left:50%;bottom:22px;transform:translateX(-50%);max-width:640px;width:calc(100% - 32px);background:#1F3A5F;color:#fff;border-radius:14px;padding:14px 18px;font:15px/1.45 Inter,Arial,sans-serif;box-shadow:0 10px 30px rgba(0,0,0,.3)}'+
   '#tcap .k{font-size:11px;letter-spacing:1.2px;text-transform:uppercase;opacity:.75;margin-bottom:4px}#tcap .b{margin-top:10px;display:flex;gap:8px;align-items:center}#tcap button{background:#fff;color:#1F3A5F;border:0;border-radius:20px;padding:6px 14px;font-weight:700;cursor:pointer}#tcap button.g{background:transparent;color:#fff;border:1px solid rgba(255,255,255,.6)}#tcap .bar{height:4px;background:rgba(255,255,255,.25);border-radius:2px;margin-top:10px;overflow:hidden}#tcap .bar i{display:block;height:100%;width:0;background:#F2876A}'+
   '.thl{outline:3px solid #F2876A!important;outline-offset:4px;border-radius:8px;transition:outline .3s}';
  document.head.appendChild(css);
  var cur = document.createElement('div'); cur.id='tcur';
  cur.innerHTML = '<svg viewBox="0 0 24 24" width="26" height="26"><path d="M4 2l16 9-7 2-3 7z" fill="#1F3A5F" stroke="#fff" stroke-width="1.5"/></svg>';
  document.body.appendChild(cur);
  var cap = document.createElement('div'); cap.id='tcap';
  cap.innerHTML = '<div class="k">Guided walk-through of Chloe\'s path</div><div class="t"></div><div class="bar"><i></i></div><div class="b"><button id="tpause">Pause</button><button id="tnext" class="g">Next</button><button id="tstop" class="g">Stop and explore</button></div>';
  document.body.appendChild(cap);
  var capT = cap.querySelector('.t'), bar = cap.querySelector('.bar i');
  var paused = false, timer = null, cancelled = false, lastEl = null;
  document.getElementById('tpause').onclick = function(){ paused = !paused; this.textContent = paused ? 'Resume' : 'Pause'; if (!paused) run(idx); };
  document.getElementById('tnext').onclick = function(){ clearTimeout(timer); idx++; run(idx); };
  document.getElementById('tstop').onclick = function(){ cancelled = true; clearTimeout(timer); cap.remove(); cur.remove(); if (lastEl) lastEl.classList.remove('thl'); var u = new URL(location.href); u.searchParams.delete('tour'); history.replaceState(null,'',u.toString()); };

  function moveTo(el){
    var r = el.getBoundingClientRect();
    cur.style.left = (r.left + Math.min(r.width/2, 120)) + 'px';
    cur.style.top = (r.top + r.height/2) + 'px';
  }
  function run(i){
    if (cancelled || paused) return;
    if (lastEl) lastEl.classList.remove('thl');
    var st = steps[i];
    if (!st) { capT.textContent = 'End of this page.'; return; }
    if (st.open) { var d = document.querySelector(st.open); if (d) d.open = true; }
    var el = document.querySelector(st.sel);
    if (!el) { idx = i+1; return run(idx); }
    el.scrollIntoView({behavior:'smooth', block:'center'});
    capT.textContent = st.cap;
    bar.style.transition = 'none'; bar.style.width = '0';
    setTimeout(function(){
      moveTo(el); el.classList.add('thl'); lastEl = el;
      bar.style.transition = 'width ' + st.wait + 'ms linear'; bar.style.width = '100%';
      if (st.type) { var inp = document.querySelector(st.type.sel); if (inp) { inp.focus(); inp.value = st.type.value; inp.dispatchEvent(new Event('input')); } }
    }, 700);
    timer = setTimeout(function(){
      if (cancelled || paused) return;
      if (st.click) {
        cur.classList.add('click');
        setTimeout(function(){
          var href = el.getAttribute('href');
          if (href && href !== '#') {
            var u = new URL(href, location.href);
            u.searchParams.set('tour', '0');
            location.href = u.pathname.split('/').pop() + u.search;
          } else { el.click(); idx = i+1; run(idx); }
        }, 450);
      } else if (st.end) {
        capT.textContent = st.cap; document.getElementById('tnext').style.display = 'none';
      } else { idx = i+1; run(idx); }
    }, st.wait + 700);
  }
  window.addEventListener('scroll', function(){ if (lastEl && !cancelled) moveTo(lastEl); });
  setTimeout(function(){ run(idx); }, 600);
})();
