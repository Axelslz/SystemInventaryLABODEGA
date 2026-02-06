import LOGO_FERRE from '../assets/LOGO_FERRE.png'; 

const convertImageToBase64 = async (url) => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Error cargando logo:", error);
    return null; 
  }
};

const getTicketHTML = (logoBase64, saleData, customerInfo, copyLabel) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);
  };

  const clientName = customerInfo?.name || "PÚBLICO EN GENERAL";
  const clientAddress = customerInfo?.address || "DOMICILIO CONOCIDO";
  const clientLocation = customerInfo?.location || "TUXTLA GTZ, CHIAPAS";
  const clientPhone = customerInfo?.phone ? `Tel: ${customerInfo.phone}` : "";
  const paymentType = saleData.paymentMethod || "EFECTIVO";
  const sellerName = saleData.seller || "CAJA 1"; 

  // --- LÓGICA DE FOLIO ---
  // Si hay ticketNumber manual úsalo, si no, usa "F-" + id de sistema
  const folioDisplay = saleData.ticketNumber ? `${saleData.ticketNumber}` : `F-${saleData.id || '---'}`;

  return `
    <html>
      <head>
        <title>Ticket La Bodega</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          
          @page { 
            size: 80mm auto; 
            margin: 0mm;     
          }

          body { 
            font-family: 'Arial', sans-serif; 
            font-size: 11px; 
            width: 74mm; 
            margin: 0 auto; 
            padding: 2mm;   
            color: black; 
            text-transform: uppercase; 
            line-height: 1.2; 
            background-color: #fff; 
          }

          .center { text-align: center; }
          .right { text-align: right; }
          .left { text-align: left; }
          .bold { font-weight: bold; }
          
          .header { margin-bottom: 5px; width: 100%; }
          .logo-img { 
            width: 60px; 
            height: auto; 
            display: block; 
            margin: 0 auto 5px auto; 
            filter: grayscale(100%); 
          }
          .title { font-size: 14px; font-weight: 800; margin: 2px 0; }
          .subtitle { font-size: 10px; font-weight: bold; margin-bottom: 3px; }
          .address-shop { font-size: 9px; margin-bottom: 5px;}

          .divider-double { border-top: 1px double #000; border-bottom: 1px solid #000; height: 3px; margin: 5px 0; }
          .divider-dashed { border-top: 1px dashed #000; margin: 5px 0; }

          .client-info { margin: 8px 0; font-size: 11px; }
          .client-details { font-weight: normal; font-size: 10px; display: block; margin-top: 2px;}

          .folio-row { display: flex; justify-content: space-between; margin: 5px 0; font-size: 12px; }
          .meta-info { font-size: 9px; margin-bottom: 5px; display: flex; justify-content: space-between; }

          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 5px; 
            table-layout: fixed; 
          }
          th { border-top: 1px solid #000; border-bottom: 1px solid #000; font-size: 9px; padding: 2px 0; text-align: left;}
          td { padding: 4px 0; vertical-align: top; font-size: 10px; }
          
          .col-qty { width: 12%; text-align: center; }
          .col-desc { 
            width: 63%; 
            text-align: left; 
            padding-right: 2px;
            white-space: normal; 
            overflow-wrap: break-word; 
          }
          .col-price { width: 25%; text-align: right; }

          .total-section { text-align: right; margin-top: 10px; font-size: 16px; font-weight: 800; border-top: 1px solid #000; padding-top: 5px;}
          .payment-info { text-align: right; font-size: 10px; font-weight: bold; margin-top: 2px; }

          .footer { margin-top: 15px; font-size: 10px; }
          .footer-small { font-size: 9px; font-weight: normal; margin-top: 5px; }
          .copy-label { font-size: 10px; margin-bottom: 5px; }
        </style>
      </head>
      <body>
        <div class="header center">
          ${logoBase64 ? `<img src="${logoBase64}" class="logo-img" />` : ''}
          <div class="title">LA BODEGA</div>
          <div class="subtitle">MATERIALES PARA LA CONSTRUCCIÓN<br>Y GALVANIZADOS</div>
          <div class="address-shop">1A PTE SUR S/N ENTRE 1A Y 2A SUR<br>COL EL JOBO</div>
        </div>
        
        <div class="divider-double"></div>
        <div class="copy-label center">*** ${copyLabel} ***</div>
        
        <div class="client-info left">
          <span class="bold">${clientName}</span>
          <span class="client-details">
            ${clientAddress}<br/>${clientLocation}<br/>${clientPhone}
          </span>
        </div>
        
        <div class="divider-dashed"></div>
        
        <div class="folio-row bold">
          <span>NOTA DE VENTA</span>
          <span>FOLIO: ${folioDisplay}</span>
        </div>
        
        <div class="meta-info">
          <span>${new Date(saleData.date).toLocaleDateString('es-MX')} ${new Date(saleData.date).toLocaleTimeString('es-MX', {hour: '2-digit', minute:'2-digit'})}</span>
          <span>VEND: ${sellerName}</span>
        </div>
        
        <table>
          <thead>
            <tr>
              <th class="col-qty">CANT</th>
              <th class="col-desc">DESCRIPCIÓN</th>
              <th class="col-price">TOTAL</th>
            </tr>
          </thead>
          <tbody>
            ${saleData.items.map(item => `
              <tr>
                <td class="col-qty bold">${item.quantity}</td>
                <td class="col-desc">${item.name} ${item.isWholesale ? '(MY)' : ''}</td>
                <td class="col-price">${formatCurrency(item.price * item.quantity)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="total-section">TOTAL: ${formatCurrency(saleData.total)}</div>
        <div class="payment-info">PAGO: ${paymentType}</div>
        
        <div class="footer center bold">
          <div style="margin-bottom: 5px;">** GRACIAS POR SU COMPRA **</div>
          SOLICITE SU FACTURA EL MISMO DÍA<br/>- NO SE ACEPTAN DEVOLUCIONES -
          <div class="footer-small">TELS. 961 182 1679 Y 961 690 5168<br/>labodegaeljobo@hotmail.com</div>
        </div>
      </body>
    </html>
  `;
};

const triggerPrintJob = (htmlContent) => {
  return new Promise((resolve) => {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '0px';
    iframe.style.height = '0px';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(htmlContent);
    doc.close();

    iframe.onload = function() {
        try {
            iframe.contentWindow.focus();
            iframe.contentWindow.print(); 
        } catch (e) {
            console.error("Error al imprimir:", e);
        }
        setTimeout(() => {
            document.body.removeChild(iframe);
            resolve();
        }, 500);
    };
  });
};

export const printTicket = async (saleData, customerInfo) => {
  const logoBase64 = await convertImageToBase64(LOGO_FERRE);
  
  const htmlCliente = getTicketHTML(logoBase64, saleData, customerInfo, "COPIA CLIENTE");
  await triggerPrintJob(htmlCliente);

  setTimeout(async () => {
      const htmlTienda = getTicketHTML(logoBase64, saleData, customerInfo, "COPIA TIENDA");
      await triggerPrintJob(htmlTienda);
  }, 1000); 
};

export const generateTicketHTML = async (saleData, customerInfo) => {
  const logoBase64 = await convertImageToBase64(LOGO_FERRE);
  return getTicketHTML(logoBase64, saleData, customerInfo, "VISTA PREVIA");
};