/* LYNK — interactions : état auth, vue mobile, recherche, favoris, drawer */
(function(){
  var params = new URLSearchParams(location.search);
  var isEmbed = params.get('embed') === '1';

  /* ---------- état persistant ---------- */
  var state = { auth:false, view:'desktop' };
  try{
    var saved = localStorage.getItem('lynk_proto_state');
    if(saved) state = Object.assign(state, JSON.parse(saved));
  }catch(e){}
  if(isEmbed){
    state.auth = params.get('auth') === '1';
    state.view = 'desktop';
    document.body.classList.add('is-embed');
  }
  function persist(){
    if(isEmbed) return;
    try{ localStorage.setItem('lynk_proto_state', JSON.stringify(state)); }catch(e){}
  }

  /* ---------- application de l'état ---------- */
  function applyAuth(){
    document.body.classList.toggle('is-auth', state.auth);
    document.querySelectorAll('[data-sw="guest"]').forEach(function(b){ b.classList.toggle('active', !state.auth); });
    document.querySelectorAll('[data-sw="auth"]').forEach(function(b){ b.classList.toggle('active', state.auth); });
    var fr = document.getElementById('mobileFrame');
    if(fr) fr.src = location.pathname + '?embed=1&auth=' + (state.auth ? '1':'0');
  }
  function applyView(){
    var mob = state.view === 'mobile';
    document.body.classList.toggle('view-mobile', mob);
    document.querySelectorAll('[data-sw="desktop"]').forEach(function(b){ b.classList.toggle('active', !mob); });
    document.querySelectorAll('[data-sw="mobile"]').forEach(function(b){ b.classList.toggle('active', mob); });
    var host = document.getElementById('deviceHost');
    var site = document.getElementById('site');
    if(mob){
      site.style.display = 'none';
      host.style.display = 'block';
      if(!document.getElementById('mobileFrame')){
        var fr = document.createElement('iframe');
        fr.id = 'mobileFrame';
        fr.setAttribute('title','Aperçu mobile');
        fr.style.cssText = 'width:100%;height:100%;border:none;display:block;';
        fr.src = location.pathname + '?embed=1&auth=' + (state.auth ? '1':'0');
        document.getElementById('deviceScreen').appendChild(fr);
      }
    }else{
      site.style.display = '';
      host.style.display = 'none';
    }
  }

  /* ---------- switcher ---------- */
  document.querySelectorAll('[data-sw]').forEach(function(btn){
    btn.addEventListener('click', function(){
      var k = btn.getAttribute('data-sw');
      if(k==='guest'){ state.auth=false; applyAuth(); }
      if(k==='auth'){ state.auth=true; applyAuth(); }
      if(k==='desktop'){ state.view='desktop'; applyView(); }
      if(k==='mobile'){ state.view='mobile'; applyView(); }
      persist();
    });
  });

  /* ---------- recherche : autocomplétion ---------- */
  var SUGG = [
    {t:'Elden Ring', m:'214 guides · carte interactive', k:'jeu', c:'#5C1268'},
    {t:'Zelda : Tears of the Kingdom', m:'186 guides · carte interactive', k:'jeu', c:'#0a5563'},
    {t:'Baldur’s Gate 3', m:'158 guides · builds', k:'jeu', c:'#7a4c00'},
    {t:'Genshin Impact', m:'142 guides · suivi d’événements', k:'jeu', c:'#5C1268'},
    {t:'Battre Malenia — stratégie complète', m:'Guide · Elden Ring', k:'guide', c:'#a200bc'},
    {t:'Toutes les graines Korogu', m:'Carte interactive · Zelda TOTK', k:'carte', c:'#06b6d4'},
    {t:'Build Moine — dégâts maximum', m:'Build · Baldur’s Gate 3', k:'build', c:'#f5a623'},
    {t:'Monter niveau 90 rapidement', m:'Astuce · Genshin Impact', k:'guide', c:'#a200bc'}
  ];
  function wireSearch(rootSel, acSel){
    var input = document.querySelector(rootSel);
    var ac = document.querySelector(acSel);
    if(!input || !ac) return;
    function render(list){
      var html = '';
      var games = list.filter(function(s){return s.k==='jeu'});
      var conts = list.filter(function(s){return s.k!=='jeu'});
      if(games.length){
        html += '<div class="ac__group"><span class="ac__glabel">Jeux</span></div>';
        games.forEach(function(s){ html += row(s); });
      }
      if(conts.length){
        html += '<div class="ac__group"><span class="ac__glabel">Contenus</span></div>';
        conts.forEach(function(s){ html += row(s); });
      }
      ac.innerHTML = html || '<div class="ac__group"><span class="ac__glabel">Aucun résultat — essaie un autre jeu</span></div>';
    }
    function row(s){
      return '<div class="ac__item"><span class="ac__ico" style="background:'+s.c+'">'+s.t.slice(0,1)+'</span>'+
        '<span class="ac__txt"><span class="ac__t">'+s.t+'</span><br><span class="ac__m">'+s.m+'</span></span>'+
        '<span class="ac__go">↵</span></div>';
    }
    input.addEventListener('focus', function(){ render(SUGG.slice(0,6)); ac.classList.add('open'); });
    input.addEventListener('input', function(){
      var q = input.value.trim().toLowerCase();
      var list = q ? SUGG.filter(function(s){ return (s.t+' '+s.m).toLowerCase().indexOf(q)>=0 }) : SUGG.slice(0,6);
      render(list); ac.classList.add('open');
    });
    document.addEventListener('click', function(e){
      if(!ac.contains(e.target) && e.target!==input) ac.classList.remove('open');
    });
  }
  wireSearch('#heroSearchInput', '#heroAc');
  wireSearch('#navSearchInput', '#navAc');

  /* ---------- favoris ---------- */
  document.querySelectorAll('.fav').forEach(function(f){
    f.addEventListener('click', function(e){
      e.stopPropagation(); e.preventDefault();
      f.classList.toggle('on');
    });
  });

  /* ---------- drawer mobile ---------- */
  var drawer = document.getElementById('mdrawer');
  var burger = document.getElementById('burgerBtn');
  if(burger && drawer){
    burger.addEventListener('click', function(){ drawer.classList.add('open'); });
    drawer.querySelector('.mdrawer__scrim').addEventListener('click', function(){ drawer.classList.remove('open'); });
    var closeBtn = document.getElementById('drawerClose');
    if(closeBtn) closeBtn.addEventListener('click', function(){ drawer.classList.remove('open'); });
  }

  /* ---------- filtres (démo visuelle) ---------- */
  document.querySelectorAll('.filters').forEach(function(g){
    g.querySelectorAll('.filter').forEach(function(f){
      f.addEventListener('click', function(){
        g.querySelectorAll('.filter').forEach(function(x){ x.classList.remove('active'); });
        f.classList.add('active');
      });
    });
  });

  applyAuth();
  if(!isEmbed) applyView();
})();
