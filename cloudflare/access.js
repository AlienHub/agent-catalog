// Cloudflare Access application-token validation using Web Crypto (RS256 only).
// No identity is accepted from a plaintext email header or a decoded-only JWT.
const keys = new Map();
const bytes = value => Uint8Array.from(atob(value.replace(/-/g,'+').replace(/_/g,'/')), c=>c.charCodeAt(0));
const decode = value => JSON.parse(new TextDecoder().decode(bytes(value)));
export function accessConfig(env) {
  const issuer=env.ACCESS_ISSUER, aud=env.ACCESS_AUD;
  const email=env.ACCESS_OWNER_EMAIL?.trim().toLowerCase();
  if(!/^https:\/\/[a-z0-9-]+\.cloudflareaccess\.com$/.test(issuer??'') || !/^[a-f0-9]{64}$/i.test(aud??'') || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email??'')) return null;
  return {issuer,aud,email};
}
export async function authorized(request,env,{fetcher=fetch,now=Date.now()}={}) {
  const config=accessConfig(env); if(!config)return false;
  const token=request.headers.get('Cf-Access-Jwt-Assertion');
  if(!token || token.length>16384)return false;
  try {
    const parts=token.split('.'); if(parts.length!==3)return false;
    const [header,payload]=parts.slice(0,2).map(decode);
    if(header.alg!=='RS256'||typeof header.kid!=='string'||header.crit)return false;
    const seconds=now/1000;
    if(payload.iss!==config.issuer || !(Array.isArray(payload.aud)?payload.aud:[payload.aud]).includes(config.aud) || !Number.isFinite(payload.exp) || payload.exp<=seconds || !Number.isFinite(payload.iat) || payload.iat>seconds+30 || (payload.nbf!==undefined && (!Number.isFinite(payload.nbf)||payload.nbf>seconds+30)) || typeof payload.sub!=='string' || !payload.sub || typeof payload.email!=='string' || payload.email.toLowerCase()!==config.email)return false;
    let cached=keys.get(config.issuer);
    if(!cached || cached.until<=now) {
      const response=await fetcher(`${config.issuer}/cdn-cgi/access/certs`,{redirect:'error',signal:AbortSignal.timeout(5000)});
      if(!response.ok)return false;
      const body=await response.json(); if(!Array.isArray(body.keys))return false;
      cached={until:now+300000,keys:body.keys}; keys.set(config.issuer,cached);
    }
    const jwk=cached.keys.find(key=>key.kid===header.kid&&key.kty==='RSA'&&(!key.alg||key.alg==='RS256')&&(!key.use||key.use==='sig'));
    if(!jwk)return false;
    const key=await crypto.subtle.importKey('jwk',jwk,{name:'RSASSA-PKCS1-v1_5',hash:'SHA-256'},false,['verify']);
    return crypto.subtle.verify('RSASSA-PKCS1-v1_5',key,bytes(parts[2]),new TextEncoder().encode(`${parts[0]}.${parts[1]}`));
  } catch {return false;}
}
