// Shared behaviour for the concept mock-up. No data is sent anywhere.
(function(){
  document.querySelectorAll('a.scope').forEach(function(a){ a.addEventListener('click', function(e){ e.preventDefault(); var n=document.getElementById('scopeNote'); if(!n){ n=document.createElement('div'); n.id='scopeNote'; n.className='flash'; n.style.cssText='position:fixed;top:12px;left:50%;transform:translateX(-50%);z-index:9000;max-width:560px;box-shadow:0 8px 24px rgba(0,0,0,.2)'; document.body.appendChild(n);} n.innerHTML='<b>'+a.textContent+'</b>: an existing Lyka page, not part of this proposal. The plan changes only the Pricing, Learn and Try Lyka routes. <a href="#" onclick="this.parentNode.remove();return false;">Close</a>'; }); });
  var q = new URLSearchParams(location.search);
  var src = q.get('utm_source'); var clinic = q.get('clinic');
  // carry tracking parameters across internal links so the route stays visible in the address bar
  if (src) {
    document.querySelectorAll('a[href]').forEach(function(a){
      var h = a.getAttribute('href');
      if (/^(https?:|#|mailto:)/.test(h)) return;
      var u = new URL(h, location.href);
      if (!u.searchParams.get('utm_source')) {
        u.searchParams.set('utm_source', src);
        if (q.get('utm_medium')) u.searchParams.set('utm_medium', q.get('utm_medium'));
        if (q.get('utm_campaign')) u.searchParams.set('utm_campaign', q.get('utm_campaign'));
        if (clinic) u.searchParams.set('clinic', clinic);
      }
      a.setAttribute('href', u.pathname.split('/').pop() + u.search + u.hash);
    });
  }
  var route = document.getElementById('route');
  if (route) {
    var label = {tiktok:'TikTok reply', clinic:'vet clinic card', search:'Google search result', compare:'cost comparison page', instagram:'Instagram reply', cover:'report cover QR'}[src] || null;
    if (label) {
      route.style.display = 'block';
      route.innerHTML = '<b>Route recorded:</b> you arrived from the ' + label + (clinic ? ' (clinic code ' + clinic + ')' : '') + '. Address bar shows <span class="url">' + location.search.replace(/[?&]tour=\d+/,'') + '</span>. This is how each tactic is attributed in the plan.';
    }
  }
  // price calculator
  var w = document.getElementById('weight');
  if (w) {
    var age = document.getElementById('age'), act = document.getElementById('activity');
    var V = {day:15.50, fort:217.00, hday:9.20, hfour:257.60}; // verified 30 kg adult Labrador, typical activity, 17 Sep 2026
    function fmt(n){ return '$' + n.toFixed(2); }
    function calc(){
      var kg = parseFloat(w.value) || 30;
      var exact = (kg === 30 && age.value === 'adult' && act.value === 'typical');
      var f = Math.pow(kg/30, 0.75);
      if (age.value === 'puppy') f *= 1.25; if (age.value === 'senior') f *= 0.9;
      if (act.value === 'low') f *= 0.9; if (act.value === 'high') f *= 1.15;
      var day = V.day * f, fort = V.fort * f, hday = V.hday * f, hfour = V.hfour * f;
      document.getElementById('fDay').textContent = fmt(day);
      document.getElementById('fFort').textContent = fmt(fort);
      document.getElementById('hDay').textContent = fmt(hday);
      document.getElementById('hFour').textContent = fmt(hfour);
      document.getElementById('basis').innerHTML = exact
        ? 'Verified quote: 30 kg adult Labrador, typical activity, ongoing list prices before offers, captured 17 September 2026 (Assessment 1, Table 5).'
        : 'Illustrative estimate only: scaled from the one verified quote (30 kg adult, typical activity) using metabolic weight (kg<sup>0.75</sup>) and simple age and activity factors. Lyka\'s live page would use its own feeding model. Breed and body condition would refine the figure in the plan.';
    }
    [w, age, act].forEach(function(el){ el.addEventListener('input', calc); el.addEventListener('change', calc); });
    calc();
  }
})();
