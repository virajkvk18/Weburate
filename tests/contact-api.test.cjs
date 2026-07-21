const handler = require("../api/contact.js");
function response() { return { statusCode: 200, headers: {}, body: null, setHeader(key,value){this.headers[key]=value;}, status(code){this.statusCode=code;return this;}, json(body){this.body=body;return this;} }; }
async function run(req) { const res=response(); await handler({ method:"POST", headers:{"content-type":"application/json","x-forwarded-for":`test-${Math.random()}`}, socket:{}, body:{}, ...req },res); return res; }
(async()=>{
  let res=await run({method:"GET"}); if(res.statusCode!==405) throw new Error("GET should return 405");
  res=await run({body:"{"}); if(res.statusCode!==400) throw new Error("Malformed JSON should return 400");
  res=await run({body:{name:"Test",email:"bad",message:"A valid-length project description",startedAt:Date.now()-3000}}); if(res.statusCode!==400) throw new Error("Invalid email should return 400");
  res=await run({body:{name:"Test",email:"test@example.com",message:"A valid-length project description",startedAt:Date.now()-3000,extra:"no"}}); if(res.statusCode!==400) throw new Error("Unexpected field should return 400");
  res=await run({body:{website:"bot"}}); if(res.statusCode!==200) throw new Error("Honeypot should return neutral success");
  res=await run({body:{name:"Test",email:"test@example.com",message:"A valid-length project description",startedAt:Date.now()}}); if(res.statusCode!==400) throw new Error("Fast automated submissions should be rejected");
  res=await run({body:{name:"Test",email:"test@example.com",message:"A valid-length project description",startedAt:Date.now()-3000}}); if(res.statusCode!==503) throw new Error("Missing email configuration should return 503");
  process.env.CONTACT_DEV_MODE="true"; process.env.VERCEL_ENV="development";
  res=await run({body:{name:"Header\r\nTest",email:"test@example.com",message:"A valid-length project description",startedAt:Date.now()-3000}}); if(res.statusCode!==200||!res.body.development) throw new Error("Development mode should validate without sending email");
  delete process.env.CONTACT_DEV_MODE; delete process.env.VERCEL_ENV;
  process.env.VERCEL_ENV="production";
  res=await run({body:{name:"Test",email:"test@example.com",message:"A valid-length project description",startedAt:Date.now()-3000}}); if(res.statusCode!==403) throw new Error("Production requests without an Origin should return 403");
  res=await run({headers:{"content-type":"application/json","origin":"http://localhost:4173"},body:{name:"Test",email:"test@example.com",message:"A valid-length project description",startedAt:Date.now()-3000}}); if(res.statusCode!==403) throw new Error("Production requests should require an HTTPS production origin");
  delete process.env.VERCEL_ENV;
  process.env.RESEND_API_KEY="test-only"; process.env.CONTACT_TO_EMAIL="owner@example.com"; process.env.CONTACT_FROM_EMAIL="forms@example.com";
  let delivery; const originalFetch=global.fetch; global.fetch=async(_url,options)=>{delivery=JSON.parse(options.body);return{ok:true};};
  res=await run({body:{name:"Test\r\nBcc: victim",email:"sender@example.com",business:"Example Business",service:"Business Website",budget:"₹10,001–₹20,000",message:"<script>alert(1)</script> valid project details",startedAt:Date.now()-3000}});
  global.fetch=originalFetch;
  if(res.statusCode!==200||delivery.to[0]!=="owner@example.com"||delivery.from!=="forms@example.com") throw new Error("Server-controlled mail headers failed");
  if(/[\r\n]/.test(delivery.subject)||delivery.html.includes("<script>")) throw new Error("Header or HTML injection was not neutralised");
  if(!delivery.html.includes("budget")||!delivery.html.includes("₹10,001–₹20,000")) throw new Error("Optional budget field was not delivered");
  delete process.env.RESEND_API_KEY; delete process.env.CONTACT_TO_EMAIL; delete process.env.CONTACT_FROM_EMAIL;
  console.log("PASS: contact API method, JSON, field, budget, origin, injection, honeypot and configuration checks.");
})().catch((error)=>{console.error(error);process.exit(1);});
