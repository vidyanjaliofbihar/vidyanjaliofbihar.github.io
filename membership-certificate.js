/* Vidyanjali of Bihar - membership certificate PDF */
(function () {
  async function imageData(url) {
    const img = new Image(); img.crossOrigin = 'anonymous';
    await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=()=>reject(new Error('NGO logo unavailable'));img.src=url;});
    const c=document.createElement('canvas');c.width=320;c.height=320;
    c.getContext('2d').drawImage(img,0,0,320,320);
    return c.toDataURL('image/png');
  }
  async function qrData(url) {
    if (typeof window.QRCode !== 'function') throw new Error('QR library unavailable');
    const el=document.createElement('div');el.style.cssText='position:fixed;left:-9999px;top:0';document.body.append(el);
    try {
      new window.QRCode(el,{text:url,width:300,height:300,colorDark:'#102b50',colorLight:'#ffffff',correctLevel:window.QRCode.CorrectLevel.M});
      const canvas=el.querySelector('canvas');
      if(canvas)return canvas.toDataURL('image/png');
      const img=el.querySelector('img');if(!img)throw new Error('QR not created');
      if(!img.complete)await new Promise((ok,fail)=>{img.onload=ok;img.onerror=fail;});
      const c=document.createElement('canvas');c.width=300;c.height=300;c.getContext('2d').drawImage(img,0,0,300,300);return c.toDataURL('image/png');
    } finally {el.remove();}
  }
  async function download(member) {
    if(!window.jspdf?.jsPDF)throw new Error('PDF library unavailable');
    if(!/^VOB-\d{4}-\d{4,}$/.test(String(member.membership_id||'')))throw new Error('Invalid membership number');
    if(!member.full_name || !member.issue_date)throw new Error('Incomplete certificate details');
    const {jsPDF}=window.jspdf;
    const pdf=new jsPDF({orientation:'landscape',unit:'mm',format:'a4'});
    const W=297,H=210, navy=[16,43,80],gold=[200,156,69];
    pdf.setFillColor(251,249,244);pdf.rect(0,0,W,H,'F');
    pdf.setDrawColor(...navy);pdf.setLineWidth(1.3);pdf.rect(9,9,W-18,H-18);
    pdf.setDrawColor(...gold);pdf.setLineWidth(.55);pdf.rect(13,13,W-26,H-26);
    const logo=await imageData('ngo-logo.jpg');pdf.addImage(logo,'PNG',W/2-15,18,30,30);
    pdf.setTextColor(...navy);pdf.setFont('times','bold');pdf.setFontSize(24);
    pdf.text('VIDYANJALI OF BIHAR',W/2,57,{align:'center'});
    pdf.setFont('helvetica','italic');pdf.setFontSize(11);pdf.text('Transformation through Education',W/2,65,{align:'center'});
    pdf.setDrawColor(...gold);pdf.line(72,72,225,72);
    pdf.setFont('times','bold');pdf.setFontSize(23);pdf.text('CERTIFICATE OF MEMBERSHIP',W/2,86,{align:'center'});
    pdf.setFont('times','normal');pdf.setFontSize(14);pdf.text('This is to certify that',W/2,100,{align:'center'});
    pdf.setFont('times','bold');pdf.setFontSize(23);
    const name=String(member.full_name).trim();
    const safeName=pdf.splitTextToSize(name,205).slice(0,2);
    pdf.text(safeName,W/2,115,{align:'center'});
    const base=115+(safeName.length-1)*9;
    pdf.setFont('times','normal');pdf.setFontSize(13);
    pdf.text('is a registered member of Vidyanjali of Bihar.',W/2,base+13,{align:'center'});
    pdf.setFont('helvetica','normal');pdf.setFontSize(10);
    pdf.text('Membership / Certificate No.: '+member.membership_id,31,160);
    const d=new Date(member.issue_date);
    const dateText=Number.isNaN(d.getTime())?String(member.issue_date):d.toLocaleDateString('en-GB',{day:'2-digit',month:'long',year:'numeric'});
    pdf.text('Issue Date: '+dateText,31,169);
    const url='https://vidyanjaliofbihar.com/verify.html?id='+encodeURIComponent(member.membership_id);
    const qr=await qrData(url);pdf.addImage(qr,'PNG',240,145,29,29);
    pdf.setFontSize(8);pdf.text('Scan to verify',254.5,179,{align:'center'});
    pdf.setDrawColor(...navy);pdf.line(111,172,185,172);
    pdf.setFont('times','bold');pdf.setFontSize(11);pdf.text('Authorized Signatory',148,179,{align:'center'});
    pdf.setFont('helvetica','normal');pdf.setFontSize(8);
    pdf.text('Official membership record: vidyanjaliofbihar.com',W/2,190,{align:'center'});
    pdf.save('VOB-Membership-Certificate-'+member.membership_id+'.pdf');
  }
  window.VOBCertificate={download};
})();
