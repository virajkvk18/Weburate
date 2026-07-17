const handler = require("../api/contact.js");
function response() { return { statusCode: 200, headers: {}, body: null, setHeader(key,value){this.headers[key]=value;}, status(code){this.statusCode=code;return this;}, json(body){this.body=body;return this;} }; }
async function run(req) { const res=response(); await handler({ method:"POST", headers:{"content-type":"application/json","x-forwarded-for":`test-${Math.random()}`}, socket:{}, body:{}, ...req },res); return res; }
(async()=>{
  let res=await run({method:"GET"}); if(res.statusCode!==405) throw new Error("GET should return 405");
  res=await run({body:"{"}); if(res.statusCode!==400) throw new Error("Malformed JSON should return 400");
  res=await run({body:{name:"Test",email:"bad",message:"A valid-length project description",startedAt:Date.now()-3000}}); if(res.statusCode!==400) throw new Error("Invalid email should return 400");
  res=await run({body:{name:"Test",email:"test@example.com",message:"A valid-length project description",startedAt:Date.now()-3000,extra:"no"}}); if(res.statusCode!==400) throw new Error("Unexpected field should return 400");
  res=await run({body:{website:"bot"}}); if(res.statusCode!==200) throw new Error("Honeypot should return neutral success");
  res=await run({body:{name:"Test",email:"test@example.com",message:"A valid-length project description",startedAt:Date.now()-3000}}); if(res.statusCode!==503) throw new Error("Missing email configuration should return 503");
  console.log("PASS: contact API method, JSON, field, email, honeypot and configuration checks.");
})().catch((error)=>{console.error(error);process.exit(1);});
