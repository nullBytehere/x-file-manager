// js/early.js — runs first, in <head>: blocks framing and applies the saved theme before the page paints.
if(top!==self){try{top.location=self.location}catch(e){}document.documentElement.style.display='none'}
try{document.documentElement.dataset.theme=localStorage.getItem('fm-theme')||(matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light')}catch(e){}
