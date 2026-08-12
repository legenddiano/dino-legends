// DINO LEGENDS — Cloudflare Worker backend for the GLOBAL leaderboard.
// Bind a KV namespace named LEADERBOARD before deploying.
const MAX_SCORE = 1000000000;
const MAX_NAME = 16;
const MAX_TAG = 5;
const KEY = season => `season:${season}`;
const json = (body,status=200) => new Response(JSON.stringify(body),{status,headers:{'content-type':'application/json','access-control-allow-origin':'*','access-control-allow-methods':'GET,POST,OPTIONS','access-control-allow-headers':'content-type'}});
const clean = (s,n) => String(s||'').replace(/[^a-zA-Z0-9 _-]/g,'').replace(/\s+/g,' ').trim().slice(0,n);
export default {
 async fetch(request,env){
  if(request.method==='OPTIONS') return json({ok:true});
  const u=new URL(request.url), season=clean(u.searchParams.get('season')||'S1',8)||'S1';
  if(u.pathname==='/top' && request.method==='GET'){
   const rows=JSON.parse(await env.LEADERBOARD.get(KEY(season))||'[]');
   return json({season,entries:rows.slice(0,100)});
  }
  if(u.pathname==='/submit' && request.method==='POST'){
   let b;try{b=await request.json()}catch{return json({error:'bad json'},400)}
   const id=clean(b.id,64), name=clean(b.name,MAX_NAME)||'Rookie Dino', tag=clean(b.tag,MAX_TAG).toUpperCase(), title=clean(b.title,24)||'Rookie', avatar=String(b.avatar||'🦖').slice(0,4), score=Math.max(0,Math.min(MAX_SCORE,Math.floor(Number(b.score)||0)));
   if(!id)return json({error:'missing id'},400);
   const rows=JSON.parse(await env.LEADERBOARD.get(KEY(season))||'[]');
   const old=rows.find(x=>x.id===id);
   if(old){old.score=Math.max(old.score,score);old.name=name;old.tag=tag;old.title=title;old.avatar=avatar}else rows.push({id,name,tag,title,avatar,score});
   rows.sort((a,b)=>b.score-a.score);await env.LEADERBOARD.put(KEY(season),JSON.stringify(rows.slice(0,100)),{expirationTtl:60*60*24*365});
   return json({ok:true,rank:rows.findIndex(x=>x.id===id)+1,season});
  }
  return json({error:'not found'},404);
 }
};
