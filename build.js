const fs=require('fs'),path=require('path'),{minify}=require('terser'),CleanCSS=require('clean-css');
(async()=>{
const src=fs.readFileSync('src/index.html','utf8');
const css=src.match(/<style>([\s\S]*?)<\/style>/)[1];
const js=src.split('<script>')[1].split('</script>')[0];
const mcss=new CleanCSS({level:1}).minify(css).styles;
const mjs=(await minify(js,{compress:true,mangle:{toplevel:false}})).code;
const mdata=(await minify(fs.readFileSync('src/data.js','utf8'),{compress:false,mangle:false,format:{comments:false}})).code;
let body=src.replace(css,mcss).replace(js,mjs);
body=body.replace(/<header class="top">[\s\S]*?<\/header>/,m=>m.replace(/\n\s*/g,''));
const head='<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#2445C2"><link rel="manifest" href="manifest.webmanifest"><link rel="icon" href="icon.svg" type="image/svg+xml"><link rel="apple-touch-icon" href="icon-192.png"><meta name="apple-mobile-web-app-capable" content="yes"><style>:root{padding-top:env(safe-area-inset-top);padding-bottom:env(safe-area-inset-bottom)}body{margin:0;font:14px system-ui,sans-serif}img{max-width:100%}[hidden]{display:none!important}</style></head><body>';
fs.writeFileSync('public/index.html',head+body+'</body></html>');
fs.writeFileSync('public/data.js',mdata);
})();
