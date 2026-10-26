// Source SkeletonConf sizes may be 0 even when the animated attachments are large.
// Measure visible region/mesh vertices across the animation, not its empty first pose.
export function measureAnimationBounds(data, runtime, {skin='', actions=data.animations.map(a=>a.name), fps=60}={}) {
 const {Skeleton,AnimationState,AnimationStateData}=runtime;
 let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity,frames=0;
 const vertices=[];
 for(const name of actions){
  const animation=data.findAnimation(name);if(!animation)continue;
  const rig=new Skeleton(data);
  if(skin)rig.setSkinByName(skin);
  rig.setSlotsToSetupPose();
  const state=new AnimationState(new AnimationStateData(data));state.setAnimation(0,name,false);
  const steps=Math.max(1,Math.ceil(animation.duration*fps));
  for(let i=0;i<=steps;i++){
   const dt=i?animation.duration/steps:0;state.update(dt);state.apply(rig);rig.updateWorldTransform();frames++;
   for(const slot of rig.drawOrder){
    const a=slot.getAttachment();
    if(!a||!slot.bone.active||rig.color.a*slot.color.a*(a.color?.a??1)<.01)continue;
    // Spine AttachmentType: Region=0, Mesh=2. Paths/clipping/bounds do not draw pixels.
    if(a.type===0){a.updateOffset();vertices.length=8;a.computeWorldVertices(slot.bone,vertices,0,2);}
    else if(a.type===2){vertices.length=a.worldVerticesLength;a.computeWorldVertices(slot,0,vertices.length,vertices,0,2);}
    else continue;
    for(let j=0;j<vertices.length;j+=2){
     const x=vertices[j],y=vertices[j+1];
     if(!Number.isFinite(x)||!Number.isFinite(y))throw Error(`Invalid visible animation bounds: ${name} / ${slot.data.name} @ ${i}/${steps}`);
     minX=Math.min(minX,x);minY=Math.min(minY,y);maxX=Math.max(maxX,x);maxY=Math.max(maxY,y);
    }
   }
  }
 }
 const width=maxX-minX,height=maxY-minY;
 if(!Number.isFinite(width)||!Number.isFinite(height)||width<=0||height<=0)throw Error('Animation has no measurable visible geometry');
 return {x:minX,y:minY,width,height,frames};
}

export function effectDimensions(meta,bounds){
 const width=Math.max(Number.isFinite(meta.width)?meta.width:0,bounds.width);
 const height=Math.max(Number.isFinite(meta.height)?meta.height:0,bounds.height);
 if(!(width>0&&height>0&&Number.isFinite(width)&&Number.isFinite(height)))throw Error('Invalid effect dimensions');
 return {width,height};
}

export function resolveEffectDimensions(meta,data,runtime){
 if(Number.isFinite(meta.width)&&Number.isFinite(meta.height)&&meta.width>0&&meta.height>0)return {width:meta.width,height:meta.height};
 const bounds=measureAnimationBounds(data,runtime,{actions:[data.animations[0].name]});
 // Keep a small margin for interpolation between samples. Never normalize against 1px.
 return effectDimensions(meta,{width:bounds.width*1.05,height:bounds.height*1.05});
}

export function fitEffectScale(dimensions,width,height=width){
 if(![width,height,dimensions.width,dimensions.height].every(n=>Number.isFinite(n)&&n>0))throw Error('Cannot scale an effect with missing dimensions');
 return Math.min(width/dimensions.width,height/dimensions.height);
}
