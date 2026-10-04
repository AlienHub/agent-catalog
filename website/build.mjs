import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
export const buildWebsiteClient = (outfile) => build({entryPoints:[fileURLToPath(new URL('./app.js',import.meta.url))],outfile,bundle:true,minify:true,format:'iife',jsx:'automatic',target:['es2022'],define:{'process.env.NODE_ENV':'"production"'},legalComments:'inline'});
