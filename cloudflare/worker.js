import trends from '../services/trends/src/worker.js';
import {authorized,accessConfig} from './access.js';
const privateResponse = response => {
  const result=new Response(response.body,response);
  result.headers.set('Cache-Control','private, no-store');
  result.headers.set('Vary','Cookie, Cf-Access-Jwt-Assertion');
  result.headers.set('X-Content-Type-Options','nosniff');
  result.headers.delete('Access-Control-Allow-Origin');
  return result;
};
export function createWorker({authorize=authorized,api=trends}={}) {
  return {
    async fetch(request,env,ctx) {
      // Every path, including downloads, favicon, HEAD, errors and API, is gated.
      if(!await authorize(request,env))return privateResponse(new Response('Private Agent Atlas: access required',{status:403}));
      const path=new URL(request.url).pathname;
      if(path==='/health'||path.startsWith('/v1/'))return privateResponse(await api.fetch(request,env,ctx));
      if(!['GET','HEAD'].includes(request.method))return privateResponse(new Response('Method not allowed',{status:405}));
      if(!env.ASSETS)return privateResponse(new Response('Assets unavailable',{status:503}));
      return privateResponse(await env.ASSETS.fetch(request));
    },
    async scheduled(controller,env,ctx) {
      // Inert until deployment explicitly configures privacy and enables collection.
      if(env.COLLECTION_ENABLED!=='true'||!accessConfig(env)||!env.DB)return;
      return api.scheduled(controller,env,ctx);
    }
  };
}
export default createWorker();
