// Source licensing and a vendor's business offering are independent facts.
export function classificationLabels(id, sources, commercial) {
 const labels=[];
 if(sources?.[id]?.source_model==='open-source')labels.push('open-source');
 if(commercial?.[id])labels.push('commercial');
 return labels.length?labels:['unknown'];
}
