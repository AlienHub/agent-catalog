import {readFile,writeFile} from 'node:fs/promises';
import {accessConfig} from './access.js';
const env=process.env;
if(!accessConfig(env))throw new Error('Verified Access issuer, audience and exact owner email are required; refusing public deployment.');
if(!/^[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(env.D1_DATABASE_ID??''))throw new Error('Existing D1 UUID required');
const origin=new URL(env.ATLAS_ORIGIN??'https://agent-atlas.pindo.page');
if(origin.protocol!=='https:'||origin.origin!==(env.ATLAS_ORIGIN??'https://agent-atlas.pindo.page')||origin.hostname.endsWith('.workers.dev'))throw new Error('An Access-protected HTTPS custom domain is required');
const config=JSON.parse(await readFile(new URL('./wrangler.example.jsonc',import.meta.url),'utf8'));
for(const key of ['ACCESS_ISSUER','ACCESS_AUD','ACCESS_OWNER_EMAIL'])config.vars[key]=env[key];
config.d1_databases[0].database_id=env.D1_DATABASE_ID;
config.routes=[{pattern:origin.hostname,custom_domain:true}];
if(env.COLLECTION_ENABLED==='true'){config.vars.COLLECTION_ENABLED='true';config.triggers.crons=['17-23 3 * * *'];}
await writeFile(new URL('./wrangler.jsonc',import.meta.url),JSON.stringify(config,null,2)+'\n');
console.log('Private unified config generated locally; no resources created or deployed.');
