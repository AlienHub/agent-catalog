import {cp,rm,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
execFileSync(process.execPath,['scripts/build-website.mjs'],{stdio:'inherit'});
await rm('cloudflare-dist',{recursive:true,force:true});
await cp('website-dist','cloudflare-dist',{recursive:true});
await writeFile('cloudflare-dist/trends-config.json',JSON.stringify({apiBaseUrl:'same-origin'})+'\n');
console.log('Unified Cloudflare assets built; original Site configuration unchanged.');
