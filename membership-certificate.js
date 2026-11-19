/* Vidyanjali of Bihar — Approved Design, dynamic PDF (no registration/backend changes). */
(function(){
  const TEMPLATE='vob-approved-certificate-template.png';
  async function loadImage(src){
    const img=new Image();img.crossOrigin='anonymous';
    await new Promise((ok,fail)=>{img.onload=ok;img.onerror=()=>fail(new Error('Missing certificate template: '+src));img.src=src;});
    return img;
  }
  async function qrCanvas(url){
    if(typeof window.QRCode!=='function')throw new Error('QR library unavailable');
    const host=document.createElement('div');host.style.cssText='position:fixed;left:-9999px;top:-9999px';document.body.appendChild(host);
    try{
      new window.QRCode(host,{text:url,width:320,height:320,colorDark:'#08265a',colorLight:'#ffffff',correctLevel:window.QRCode.CorrectLevel.M});
      const cv=host.querySelector('canvas');if(cv)return cv;
      const img=host.querySelector('img');if(!img)throw new Error('QR generation failed');
      if(!img.complete)await new Promise((ok,fail)=>{img.onload=ok;img.onerror=fail;});
      const c=document.createElement('canvas');c.width=320;c.height=320;c.getContext('2d').drawImage(img,0,0,320,320);return c;
    }finally{host.remove();}
  }
  function fitText(ctx,value,maxWidth,initial,min){
    let size=initial;do{ctx.font='bold italic '+size+'px Georgia, "Times New Roman", serif';if(ctx.measureText(value).width<=maxWidth)break;size-=2;}while(size>=min);
    return Math.max(size,min);
  }
  async function download(member){
    if(!window.jspdf?.jsPDF)throw new Error('PDF library unavailable');
    const id=String(member?.membership_id||'').trim();
    const name=String(member?.full_name||'').trim();
    if(!/^VOB-\d{4}-\d{4,}$/.test(id)||!name||!member.issue_date)throw new Error('Incomplete certificate details');
    const dt=new Date(member.issue_date);
    const dateText=Number.isNaN(dt.getTime())?String(member.issue_date):dt.toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'});
    const [bg,qr]=await Promise.all([loadImage(TEMPLATE),qrCanvas('https://vidyanjaliofbihar.com/verify.html?id='+encodeURIComponent(id))]);
    const canvas=document.createElement('canvas');canvas.width=1536;canvas.height=1024;
    const ctx=canvas.getContext('2d');ctx.drawImage(bg,0,0,1536,1024);
    ctx.fillStyle='#09275c';ctx.textAlign='center';ctx.textBaseline='middle';
    fitText(ctx,name,870,67,31);ctx.fillText(name,768,580,870);
    ctx.textAlign='left';ctx.textBaseline='alphabetic';ctx.font='bold 28px Georgia, "Times New Roman", serif';ctx.fillText(id,362,797);
    ctx.font='bold 27px Georgia, "Times New Roman", serif';ctx.fillText(dateText,298,858);
    ctx.fillStyle='#fff';ctx.fillRect(1298,713,161,159);
    ctx.drawImage(qr,1300,716,154,154);
    const {jsPDF}=window.jspdf;
    const pdf=new jsPDF({orientation:'landscape',unit:'mm',format:'a4',compress:true});
    pdf.addImage(canvas.toDataURL('image/jpeg',0.94),'JPEG',0,0,297,210,undefined,'FAST');
    pdf.save('VOB-Membership-Certificate-'+id+'.pdf');
  }
  window.VOBCertificate={download};
})();
