import {APPEARANCES} from './content-data.js';
export {APPEARANCES};
export const APPEARANCE_COUNT=Object.values(APPEARANCES).reduce((n,a)=>n+a.length,0);
export function appearanceFor(id,selected){const list=APPEARANCES[id]||[];return list.find(a=>a.id===String(selected))||list[0];}
