// Script de captura/propagación de UTMs (Nexofy). Se inyecta en el <head>.
export const NEXOFY_UTM_SCRIPT = String.raw`
(function(){
  var K=['utm_source','utm_medium','utm_campaign','utm_content','utm_term','utm_id','src','sck','fbclid','gclid','ttclid'];
  var S='nexofy_utm',TTL=2592000000;
  function save(o){
    try{localStorage.setItem(S,JSON.stringify({t:Date.now(),v:o}))}catch(e){}
    try{document.cookie=S+'='+encodeURIComponent(JSON.stringify(o))+';path=/;max-age=2592000;SameSite=Lax'}catch(e){}
  }
  function read(){
    try{var r=JSON.parse(localStorage.getItem(S)||'null');if(r&&r.v&&Date.now()-r.t<TTL)return r.v}catch(e){}
    var m=document.cookie.match('(?:^|; )'+S+'=([^;]*)');
    if(m){try{return JSON.parse(decodeURIComponent(m[1]))}catch(e){}}
    return {};
  }
  function fromUrl(){
    var q=new URLSearchParams(location.search),o={};
    K.forEach(function(k){var v=q.get(k);if(v)o[k]=v});
    return o;
  }
  var incoming=fromUrl();
  var data=Object.keys(incoming).length?incoming:read();
  if(Object.keys(incoming).length)save(incoming);
  window.nexofyUtm=data;
  if(!Object.keys(data).length)return;
  function link(a){
    var h=a.getAttribute('href');
    if(!h||/^(#|mailto:|tel:|javascript:)/i.test(h))return;
    var u;try{u=new URL(h,location.href)}catch(e){return}
    if(u.protocol!=='http:'&&u.protocol!=='https:')return;
    var changed=false;
    K.forEach(function(k){if(data[k]&&!u.searchParams.get(k)){u.searchParams.set(k,data[k]);changed=true}});
    if(changed)a.setAttribute('href',u.toString());
  }
  function form(f){
    if(f.getAttribute('data-nexofy'))return;
    f.setAttribute('data-nexofy','1');
    K.forEach(function(k){
      if(!data[k]||f.querySelector('[name="'+k+'"]'))return;
      var i=document.createElement('input');i.type='hidden';i.name=k;i.value=data[k];f.appendChild(i);
    });
  }
  function apply(){
    var a=document.getElementsByTagName('a');for(var i=0;i<a.length;i++)link(a[i]);
    var f=document.getElementsByTagName('form');for(var j=0;j<f.length;j++)form(f[j]);
  }
  apply();
  document.addEventListener('DOMContentLoaded',apply);
  document.addEventListener('click',function(e){
    var t=e.target;
    while(t&&t.tagName!=='A')t=t.parentElement;
    if(t)link(t);
  },true);
  if(window.MutationObserver)new MutationObserver(apply).observe(document.documentElement,{childList:true,subtree:true});
})();
`;
