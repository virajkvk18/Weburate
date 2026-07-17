import { readFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, extname, join, normalize, relative, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const ignore = new Set(["node_modules", ".git"]);
async function walk(dir) { const out=[]; for (const item of await readdir(dir,{withFileTypes:true})) { if(ignore.has(item.name)) continue; const path=join(dir,item.name); item.isDirectory()?out.push(...await walk(path)):out.push(path); } return out; }
const files=await walk(root); const html=files.filter((f)=>extname(f)===".html"); const errors=[]; const titles=new Map(); const descriptions=new Map();
function count(text,re){return [...text.matchAll(re)].length;} function add(message){errors.push(message);}
for(const file of html){const text=await readFile(file,"utf8");const name=relative(root,file).replaceAll("\\","/");
 if(!/^<!doctype html>/i.test(text)) add(`${name}: missing doctype`);
 if(count(text,/<h1\b/gi)!==1)add(`${name}: expected one H1`);
 const title=text.match(/<title>([^<]+)<\/title>/i)?.[1]; if(!title)add(`${name}: missing title`); else if(!/404|Template/.test(title)){if(titles.has(title))add(`${name}: duplicate title with ${titles.get(title)}`);titles.set(title,name);}
 const desc=text.match(/<meta name="description" content="([^"]+)"/i)?.[1];if(!desc)add(`${name}: missing description`);else if(!/404|template/i.test(name)){if(descriptions.has(desc))add(`${name}: duplicate description with ${descriptions.get(desc)}`);descriptions.set(desc,name);}
 if(!/<link rel="canonical" href="https:\/\/weburate\.online\//i.test(text))add(`${name}: invalid canonical`);
 const ids=[...text.matchAll(/\sid="([^"]+)"/gi)].map((m)=>m[1]); if(new Set(ids).size!==ids.length)add(`${name}: duplicate ID`);
 for(const match of text.matchAll(/(?:href|src)="([^"]+)"/gi)){const url=match[1];if(/^(?:https?:|mailto:|tel:|#|data:)/.test(url))continue;const clean=url.split("#")[0].split("?")[0];if(!clean)continue;const target=normalize(join(dirname(file),clean));if(!existsSync(target))add(`${name}: broken local reference ${url}`);}
}
const sitemap=await readFile(join(root,"sitemap.xml"),"utf8");if(!/<urlset xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">/.test(sitemap))add("sitemap.xml: invalid namespace");
for(const loc of sitemap.matchAll(/<loc>https:\/\/weburate\.online\/([^<]*)<\/loc>/g)){const path=loc[1]||"index.html";const target=join(root,path.endsWith("/")?path+"index.html":path);if(!existsSync(target))add(`sitemap.xml: missing ${path}`);const body=await readFile(target,"utf8");if(/name="robots" content="[^"]*noindex/i.test(body))add(`sitemap.xml: noindex URL ${path}`);}
const secrets=files.filter((f)=>!["pasted-text.txt"].includes(f.split(/[\\/]/).at(-1))).filter((f)=>/\.(?:html|js|json|md|txt|xml|css)$/i.test(f));for(const file of secrets){const text=await readFile(file,"utf8");if(/\bre_[A-Za-z0-9]{20,}\b/.test(text))add(`${relative(root,file)}: possible Resend secret`);}
if(errors.length){console.error(errors.join("\n"));process.exit(1);}console.log(`PASS: ${html.length} HTML files; unique metadata, H1s, IDs, local links, sitemap and secret patterns checked.`);
