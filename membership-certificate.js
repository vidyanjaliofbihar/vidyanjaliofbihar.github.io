/* Vidyanjali of Bihar — final premium membership certificate */
(function(){
  async function asset(url){
    const img=new Image();img.crossOrigin='anonymous';
    await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=()=>reject(new Error('Certificate asset unavailable: '+url));img.src=url;});
    const c=document.createElement('canvas');c.width=img.naturalWidth;c.height=img.naturalHeight;
    c.getContext('2d').drawImage(img,0,0);return c.toDataURL('image/png');
  }
  async function qrData(url){
    if(typeof window.QRCode!=='function')throw new Error('QR library unavailable');
    const el=document.createElement('div');el.style.cssText='position:fixed;left:-9999px;top:0';document.body.append(el);
    try{
      new window.QRCode(el,{text:url,width:300,height:300,colorDark:'#071e49',colorLight:'#ffffff',correctLevel:window.QRCode.CorrectLevel.M});
      const canvas=el.querySelector('canvas');if(canvas)return canvas.toDataURL('image/png');
      const img=el.querySelector('img');if(!img)throw new Error('QR creation failed');
      if(!img.complete)await new Promise((ok,fail)=>{img.onload=ok;img.onerror=fail;});
      const c=document.createElement('canvas');c.width=300;c.height=300;c.getContext('2d').drawImage(img,0,0);return c.toDataURL('image/png');
    }finally{el.remove();}
  }
  async function download(member){
    if(!window.jspdf?.jsPDF)throw new Error('PDF library unavailable');
    const id=String(member.membership_id||'');
    if(!/^VOB-\d{4}-\d{4,}$/.test(id))throw new Error('Invalid membership number');
    if(!member.full_name||!member.issue_date)throw new Error('Incomplete certificate details');
    const [logo,signature,stamp,qr]=await Promise.all([
      asset('vob-certificate-logo.png'),asset('vob-president-signature.png'),asset('vob-president-stamp.png'),
      qrData('https://vidyanjaliofbihar.com/verify.html?id='+encodeURIComponent(id))
    ]);
    const {jsPDF}=window.jspdf,pdf=new jsPDF({orientation:'landscape',unit:'mm',format:'a4'});
    const W=297,H=210,navy=[7,29,75],gold=[207,155,36],pale=[253,251,247];
    function fill(color){pdf.setFillColor(...color)}
    function stroke(color){pdf.setDrawColor(...color)}
    function txt(s,x,y,size=12,font='times',style='normal',color=navy,align='center'){
      pdf.setTextColor(...color);pdf.setFont(font,style);pdf.setFontSize(size);pdf.text(s,x,y,{align});
    }
    fill(pale);pdf.rect(0,0,W,H,'F');
    fill(navy);pdf.triangle(0,0,90,0,0,33,'F');pdf.triangle(W,H,W-96,H,W,H-24,'F');
    fill(gold);pdf.triangle(0,0,77,0,0,27,'F');pdf.triangle(W,H,W-78,H,W,H-18,'F');
    fill(navy);pdf.triangle(0,0,67,0,0,22,'F');pdf.triangle(W,H,W-66,H,W,H-14,'F');
    stroke(gold);pdf.setLineWidth(.9);pdf.rect(5,5,W-10,H-10);
    stroke(navy);pdf.setLineWidth(.25);pdf.rect(7,7,W-14,H-14);
    pdf.addImage(logo,'PNG',W/2-13,8,26,27);
    txt('Vidyanjali of Bihar',W/2,49,29,'times','bold');
    txt('Transformation through Education.',W/2,58,12,'times','italic',[34,34,34]);
    fill(navy);pdf.roundedRect(44,66,209,24,5,5,'F');
    stroke(gold);pdf.setLineWidth(1.5);pdf.roundedRect(44,66,209,24,5,5,'S');
    txt('Certificate of Membership',W/2,82,27,'times','bold',[255,255,255]);
    stroke(gold);pdf.setLineWidth(.5);pdf.line(83,94,214,94);
    txt('This is to certify that',W/2,105,15,'times','italic',[30,30,30]);
    const name=String(member.full_name).trim();
    pdf.setFont('times','bolditalic');let fontSize=27;
    while(fontSize>14){pdf.setFontSize(fontSize);if(pdf.getTextWidth(name)<=210)break;fontSize-=1;}
    txt(name,W/2,122,fontSize,'times','bolditalic');
    stroke(gold);pdf.setLineWidth(.45);pdf.line(64,128,233,128);
    txt('is a registered member of Vidyanjali of Bihar.',W/2,137,15,'times','italic',[28,28,28]);
    // Lower certificate details, authentic scanned signature and president stamp.
    txt('Membership No.:',27,160,11,'times','bold',[30,30,30],'left');
    txt(id,67,160,12,'times','bold',navy,'left');
    const d=new Date(member.issue_date);
    const dateText=Number.isNaN(d.getTime())?String(member.issue_date):d.toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'});
    txt('Issue Date:',27,176,11,'times','bold',[30,30,30],'left');
    txt(dateText,57,176,12,'times','bold',navy,'left');
    stroke(gold);pdf.setLineWidth(.6);pdf.line(119,150,119,186);pdf.line(228,150,228,186);
    // The images below are directly extracted from the uploaded original scan; never AI-redrawn.
    pdf.addImage(signature,'PNG',169,145,39,18);
    pdf.addImage(stamp,'PNG',157,163,60,17);
    stroke(gold);pdf.setLineWidth(.35);pdf.line(159,181,216,181);
    txt('Yogendra Tiwari',187,188,11,'times','bold');
    txt('President',187,194,9,'times','normal');
    pdf.addImage(qr,'PNG',244,147,32,32);
    txt('Scan to Verify',260,184,9,'times','bold');
    txt('Official membership record  |  vidyanjaliofbihar.com',W/2,200,8,'helvetica','normal',[52,64,79]);
    pdf.save('VOB-Membership-Certificate-'+id+'.pdf');
  }
  window.VOBCertificate={download};
})();
