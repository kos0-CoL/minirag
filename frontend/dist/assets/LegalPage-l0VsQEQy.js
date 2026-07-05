import{r,j as o}from"./index-4Kf9QMgh.js";import{F as c}from"./Footer-Ch79jZ4F.js";import{F as l}from"./file-text-LmSOhWIF.js";import{S as d}from"./shield-DlWd3NP8.js";import{c as m}from"./createLucideIcon-Cgj5s5Ic.js";import{C as p,a as u}from"./chevron-up-C85Nv2O0.js";/**
 * @license lucide-react v0.378.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const h=m("Scale",[["path",{d:"m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z",key:"7g6ntu"}],["path",{d:"m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z",key:"ijws7r"}],["path",{d:"M7 21h10",key:"1b0cd5"}],["path",{d:"M12 3v18",key:"108xh3"}],["path",{d:"M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2",key:"3gwbw2"}]]),x=[{id:"aviso",icon:l,title:"Aviso Legal",content:`Mini RAG Pro es una herramienta de inteligencia artificial que permite a los usuarios procesar sus propios documentos y obtener respuestas basadas en ellos.

El usuario es el unico responsable del contenido que sube. No nos hacemos responsables del uso indebido ni de las decisiones tomadas basandose en las respuestas generadas por IA, las cuales pueden contener errores. Siempre verifique la informacion critica con fuentes adicionales.

El usuario conserva todos los derechos sobre sus documentos. No reclamamos propiedad sobre el contenido subido.`},{id:"privacidad",icon:d,title:"Politica de Privacidad",content:`Ultima actualizacion: junio 2026

1. DATOS QUE RECOPILAMOS
Al registrarse con Google: nombre, email e imagen de perfil. Al registrarse con email: nombre y correo electronico.

2. API KEYS
Las claves de API (Gemini, OpenAI, Anthropic, Cohere, Mistral) se almacenan en el navegador (localStorage) y se envian directamente al proveedor de IA correspondiente desde el frontend. El servidor puede usar una clave de fallback configurada por el administrador. Las claves nunca se comparten con terceros no relacionados con el servicio.

3. ARCHIVOS
Los documentos subidos se procesan localmente en el navegador para chunking. No almacenamos archivos en servidores externos.

4. COOKIES
Solo cookies de sesion para mantener autenticacion (JWT). Sin cookies de rastreo ni publicitarias.

5. TUS DERECHOS
Puede solicitar la eliminacion de su cuenta contactandonos a hola@minirag.pro.

6. CONTACTO
Para consultas sobre privacidad: hola@minirag.pro`},{id:"terminos",icon:h,title:"Terminos de Uso",content:`Al usar Mini RAG Pro, acepta:

1. USO RESPONSABLE
No use la plataforma para actividades ilegales. No suba contenido que infrinja derechos de terceros.

2. LIMITACION DE RESPONSABILIDAD
El servicio se proporciona "tal cual". No garantizamos precision o integridad de las respuestas generadas por IA. Las respuestas no constituyen asesoramiento profesional (medico, legal, financiero).

3. PROPIEDAD INTELECTUAL
El codigo de la plataforma es propiedad de Mini RAG Pro. Las configuraciones creadas por usuarios pertenecen a sus creadores.

4. MODIFICACIONES
Nos reservamos el derecho de modificar estos terminos. Los cambios se notificaran en la plataforma.

5. CONTACTO LEGAL
hola@minirag.pro`}];function N(){const[i,s]=r.useState("aviso");r.useEffect(()=>{const e=window.location.hash.replace("#","");e&&s(e)},[]);const n=e=>s(a=>a===e?"":e);return o.jsxs("div",{className:"min-h-screen flex flex-col",style:{backgroundColor:"var(--theme-bg)"},children:[o.jsxs("div",{className:"flex-1 w-full max-w-3xl mx-auto px-4 py-6 md:px-8 md:py-12",children:[o.jsx("h1",{className:"text-xl md:text-3xl font-bold mb-1",style:{color:"var(--theme-text)"},children:"Informacion Legal"}),o.jsx("p",{className:"text-sm mb-6",style:{color:"var(--theme-text-secondary)"},children:"Aviso Legal, Privacidad y Terminos de Uso"}),o.jsx("div",{className:"space-y-2",children:x.map(e=>{const a=i===e.id,t=e.icon;return o.jsxs("div",{id:e.id,className:"rounded-xl border",style:{borderColor:"var(--theme-border)",backgroundColor:"var(--theme-bg-card)"},children:[o.jsxs("button",{onClick:()=>n(e.id),"aria-expanded":a,"aria-controls":`section-${e.id}`,className:"w-full flex items-center gap-3 px-4 py-3 min-h-[48px] text-left transition focus-visible:ring-2 focus-visible:outline-none rounded-xl",style:{"--tw-ring-color":"var(--theme-ring)"},children:[o.jsx(t,{className:"w-5 h-5 shrink-0",style:{color:"var(--theme-primary)"}}),o.jsx("span",{className:"text-sm md:text-base font-semibold",style:{color:"var(--theme-text)"},children:e.title}),a?o.jsx(p,{className:"w-4 h-4 ml-auto",style:{color:"var(--theme-text-secondary)"}}):o.jsx(u,{className:"w-4 h-4 ml-auto",style:{color:"var(--theme-text-secondary)"}})]}),a&&o.jsx("div",{id:`section-${e.id}`,className:"px-4 pb-4 pt-0 border-t",style:{borderColor:"var(--theme-border)"},children:o.jsx("div",{className:"text-sm leading-relaxed whitespace-pre-line mt-3",style:{color:"var(--theme-text-secondary)"},children:e.content})})]},e.id)})})]}),o.jsx(c,{})]})}export{N as default};
