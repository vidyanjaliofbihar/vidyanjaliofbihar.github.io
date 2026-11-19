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

    // Approved premium ornaments — drawn as vectors so PDF stays crisp at A4 size.
    function ellipse(x,y,rx,ry,color,angle=0){
      fill(color);pdf.ellipse(x,y,rx,ry,'F');
    }
    function laurel(cx,cy,side){
      stroke(gold);pdf.setLineWidth(.45);
      for(let i=0;i<8;i++){
        const yy=cy+i*4.1, xx=cx+side*(Math.sin(i/8*Math.PI)*8);
        if(i>0){const py=cy+(i-1)*4.1,px=cx+side*(Math.sin((i-1)/8*Math.PI)*8);pdf.line(px,py,xx,yy);}
        const theta=(i%2===0?1:-1)*side;
        ellipse(xx+theta*2.5,yy-1.2,2.8,1.1,gold);
      }
    }
    // Gentle watermark: stylized open book, behind the recipient's name.
    fill([249,246,238]);
    pdf.triangle(75,114,139,106,144,140,'F');
    pdf.triangle(153,140,158,106,222,114,'F');
    stroke([242,235,219]);pdf.setLineWidth(.4);
    pdf.line(148.5,112,148.5,141);
    for(let i=0;i<3;i++){
      pdf.line(89,118+i*5,138,112+i*5);
      pdf.line(159,112+i*5,208,118+i*5);
    }
    // Upper corner botanical flourishes.
    laurel(64,33,-1);laurel(233,33,1);
    // Gold corner curls and ornamented inner borders.
    stroke(gold);pdf.setLineWidth(.55);
    for(const [x,y,sx,sy] of [[11,11,1,1],[286,11,-1,1],[11,199,1,-1],[286,199,-1,-1]]){
      pdf.line(x,y,x+sx*10,y);pdf.line(x,y,x,y+sy*10);
      pdf.circle(x+sx*3,y+sy*3,1.3,'S');
    }
    // Gold & navy swooping bands at the bottom edge (behind content).
    fill(gold);pdf.triangle(0,185,0,210,118,210,'F');
    fill(navy);pdf.triangle(0,193,0,210,95,210,'F');
    fill(gold);pdf.triangle(297,185,297,210,178,210,'F');
    fill(navy);pdf.triangle(297,193,297,210,202,210,'F');
    // Premium gold medallion, intentionally not a representation of the official seal.
    ellipse(137,172,14.5,14.5,[214,160,35]);
    ellipse(137,172,12.2,12.2,[250,220,111]);
    ellipse(137,172,10.2,10.2,[191,127,20]);
    ellipse(137,172,8.8,8.8,[251,229,143]);
    stroke([138,88,15]);pdf.setLineWidth(.5);
    pdf.line(131.5,170,137,172);pdf.line(137,172,142.5,170);
    pdf.line(131.5,170,131.5,176);pdf.line(142.5,170,142.5,176);
    pdf.line(131.5,176,137,178);pdf.line(137,178,142.5,176);
    // Small gold ornaments below title.
    ellipse(148.5,96,1.6,1.6,gold);
    ellipse(143.5,96,.75,.75,gold);ellipse(153.5,96,.75,.75,gold);

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
    stroke(gold);pdf.setLineWidth(.6);pdf.line(118,151,118,186);pdf.line(229,151,229,186);
    // The images below are directly extracted from the uploaded original scan; never AI-redrawn.
    pdf.addImage(signature,'PNG',169,145,39,18);
    pdf.addImage(stamp,'PNG',155.5,163,63,18);
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
