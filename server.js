const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const PORT=Number(process.env.PORT||3000),rooms=new Map(),qs=[
['Which planet has the most moons currently confirmed?',['Jupiter','Saturn','Neptune','Uranus'],1],
['What is the only mammal capable of true flight?',['Flying squirrel','Sugar glider','Bat','Colugo'],2],
['Which country gifted the Statue of Liberty to the United States?',['France','Italy','Spain','Canada'],0],
['How many sides does a dodecagon have?',['10','11','12','14'],2],
['What is the largest ocean on Earth?',['Atlantic','Indian','Arctic','Pacific'],3],
['Which instrument has 88 keys on a standard version?',['Accordion','Piano','Harpsichord','Organ'],1],
['What do bees collect from flowers to make honey?',['Pollen','Nectar','Sap','Dew'],1],
['In which sport would you perform a slam dunk?',['Volleyball','Handball','Basketball','Netball'],2]];
const send=(r,s,x)=>{r.writeHead(s,{'content-type':'application/json; charset=utf-8','cache-control':'no-store'});r.end(JSON.stringify(x))},safe=x=>String(x||'Player').trim().replace(/[<>]/g,'').slice(0,20)||'Player';
const view=(r,id)=>{let q=r.started&&r.i<qs.length?qs[r.i]:null;return{code:r.code,hostId:r.host,players:[...r.players.values()],started:r.started,finished:r.started&&r.i>=qs.length,i:r.i,total:qs.length,revealed:r.revealed,q:q?{text:q[0],options:q[1],answer:r.revealed?q[2]:null}:null,myId:id||null}};
async function read(req){let b='';for await(const c of req)b+=c;try{return JSON.parse(b||'{}')}catch{return{}}}
const server=http.createServer(async(req,res)=>{const u=new URL(req.url,'http://localhost');if(u.pathname.startsWith('/api/'))try{
if(req.method==='POST'&&u.pathname==='/api/rooms'){let b=await read(req),chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789',code;do{code=Array.from({length:4},()=>chars[crypto.randomInt(chars.length)]).join('')}while(rooms.has(code));let id=crypto.randomUUID(),r={code,host:id,players:new Map([[id,{id,name:safe(b.name||'Host'),score:0,answered:null}]]),started:false,i:0,revealed:false};rooms.set(code,r);return send(res,201,view(r,id))}
let p=u.pathname.split('/').filter(Boolean),code=(p[2]||'').toUpperCase(),r=rooms.get(code);if(!r)return send(res,404,{error:'Room not found. Check the code and try again.'});
if(req.method==='GET'&&p.length===3)return send(res,200,view(r,u.searchParams.get('playerId')));
if(req.method==='POST'&&p[3]==='join'){let b=await read(req);if(r.started)return send(res,409,{error:'This game has already started.'});if(r.players.size>=20)return send(res,409,{error:'This room is full (20 players max).'});let id=crypto.randomUUID();r.players.set(id,{id,name:safe(b.name),score:0,answered:null});return send(res,201,view(r,id))}
if(req.method==='POST'){let b=await read(req),pl=r.players.get(b.playerId),host=b.playerId===r.host;if(!pl)return send(res,403,{error:'You are not in this room.'});
if(p[3]==='start'&&host){r.started=true;r.i=0;r.revealed=false;r.players.forEach(x=>x.answered=null)}
else if(p[3]==='answer'&&r.started&&!r.revealed&&r.i<qs.length&&pl.answered===null&&Number.isInteger(b.choice)&&b.choice>=0&&b.choice<4){pl.answered=b.choice;if(b.choice===qs[r.i][2])pl.score+=100}
else if(p[3]==='reveal'&&host&&r.started&&r.i<qs.length)r.revealed=true;
else if(p[3]==='next'&&host&&r.revealed){r.i++;r.revealed=false;r.players.forEach(x=>x.answered=null)}
else return send(res,403,{error:'That action is not allowed.'});return send(res,200,view(r,b.playerId))}
return send(res,404,{error:'Unknown API route.'})}catch{return send(res,400,{error:'Could not process that request.'})}
const f=u.pathname==='/'?'index.html':path.basename(u.pathname),fp=path.join(__dirname,'public',f);fs.readFile(fp,(e,d)=>{if(e){res.writeHead(404);return res.end('Not found')}const type=f.endsWith('.css')?'text/css':f.endsWith('.js')?'text/javascript':'text/html';res.writeHead(200,{'content-type':type+'; charset=utf-8'});res.end(d)})});
server.listen(PORT,'0.0.0.0',()=>console.log('Room Rush on http://localhost:'+PORT));
