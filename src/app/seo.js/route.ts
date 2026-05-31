import { getCachePolicy } from "@/lib/cache-policy";

export const dynamic = "force-static";

export function GET(request: Request) {
  const origin = new URL(request.url).origin;

  return new Response(buildSeoScript(origin), {
    headers: {
      "Cache-Control": getCachePolicy("script"),
      "Content-Type": "application/javascript; charset=utf-8",
    },
  });
}

function buildSeoScript(appOrigin: string) {
  return `(function(){
  var script=document.currentScript;
  if(!script||script.__allInOneSeoLoaded)return;
  script.__allInOneSeoLoaded=true;
  var siteId=script.getAttribute("data-site-id");
  if(!siteId)return;
  var endpoint=new URL("/api/ingest/script-event","${appOrigin}").toString();
  var vitals={};
  function cleanUrl(value){
    try{var url=new URL(value,window.location.href);return url.origin+url.pathname;}catch(error){return String(value||"").split("?")[0].split("#")[0];}
  }
  function textList(selector,limit){
    return Array.prototype.slice.call(document.querySelectorAll(selector),0,limit).map(function(node){return (node.textContent||"").replace(/\\s+/g," ").trim().slice(0,160);}).filter(Boolean);
  }
  function meta(name){
    var node=document.querySelector('meta[name="'+name+'"],meta[property="'+name+'"]');
    return node?node.getAttribute("content")||"": "";
  }
  function payload(){
    var canonical=document.querySelector('link[rel="canonical"]');
    return {
      url:cleanUrl(window.location.href),
      title:document.title||"",
      metaDescription:meta("description"),
      canonical:canonical?cleanUrl(canonical.href):"",
      robots:meta("robots"),
      headings:{h1:textList("h1",10),h2:textList("h2",20)},
      schemaCount:document.querySelectorAll('script[type="application/ld+json"]').length,
      linkCount:document.querySelectorAll("a[href]").length,
      webVitals:vitals,
      observedAt:new Date().toISOString()
    };
  }
  function send(eventType){
    try{
      var body=JSON.stringify({siteId:siteId,eventType:eventType,pageUrl:cleanUrl(window.location.href),payload:payload()});
      if(navigator.sendBeacon){
        var blob=new Blob([body],{type:"application/json"});
        if(navigator.sendBeacon(endpoint,blob))return;
      }
      fetch(endpoint,{method:"POST",headers:{"Content-Type":"application/json"},body:body,keepalive:true,credentials:"omit",mode:"cors"}).catch(function(){});
    }catch(error){}
  }
  function observeVitals(){
    if(!("PerformanceObserver" in window))return;
    try{new PerformanceObserver(function(list){list.getEntries().forEach(function(entry){vitals.lcp=entry.startTime;send("web_vital");});}).observe({type:"largest-contentful-paint",buffered:true});}catch(error){}
    try{new PerformanceObserver(function(list){list.getEntries().forEach(function(entry){if(!entry.hadRecentInput){vitals.cls=(vitals.cls||0)+entry.value;}});}).observe({type:"layout-shift",buffered:true});}catch(error){}
    try{new PerformanceObserver(function(list){list.getEntries().forEach(function(entry){vitals.fid=entry.processingStart-entry.startTime;send("web_vital");});}).observe({type:"first-input",buffered:true});}catch(error){}
    try{new PerformanceObserver(function(list){list.getEntries().forEach(function(entry){vitals.inp=entry.duration;send("web_vital");});}).observe({type:"event",buffered:true,durationThreshold:40});}catch(error){}
  }
  function routeChanged(){setTimeout(function(){send("route_change");},0);}
  ["pushState","replaceState"].forEach(function(method){
    var original=history[method];
    history[method]=function(){var result=original.apply(this,arguments);routeChanged();return result;};
  });
  window.addEventListener("popstate",routeChanged);
  observeVitals();
  if(document.readyState==="loading"){document.addEventListener("DOMContentLoaded",function(){send("page_view");});}else{send("page_view");}
})();`;
}
