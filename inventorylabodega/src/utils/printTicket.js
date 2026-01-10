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

export const printTicket = async (saleData, customerInfo) => {

  const logoBase64 = await convertImageToBase64(LOGO_FERRE);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);
  };

  const clientName = customerInfo?.name || "PÚBLICO EN GENERAL";
  const clientAddress = customerInfo?.address || "DOMICILIO CONOCIDO";
  const clientLocation = customerInfo?.location || "TUXTLA GTZ, CHIAPAS";
  const clientPhone = customerInfo?.phone ? `Tel: ${customerInfo.phone}` : "";
  const paymentType = saleData.paymentMethod || "EFECTIVO";

  const ticketContent = `
    <html>
      <head>
        <title>Ticket La Bodega</title>
        <style>
          @page { size: 100mm auto; margin: 0mm; }
          
          body {
            font-family: 'Arial', sans-serif;
            font-size: 11px;
            width: 100%;
            max-width: 64mm; 
            margin: 2mm auto; 
            color: black;
            text-transform: uppercase;
            line-height: 1.2;
          }

          .header { text-align: center; margin-bottom: 5px; }
          
          /* Estilo para el Logo */
          .logo-img {
            width: 100px;      /* Tamaño ajustado */
            height: auto;
            display: block;
            margin: 0 auto 5px auto; /* Centrado */
            filter: grayscale(100%); /* Opcional: imprimir mejor en b/n */
          }

          .title { font-size: 18px; font-weight: 800; margin: 0; }
          .subtitle { font-size: 10px; font-weight: bold; margin-bottom: 3px; }
          .address-shop { font-size: 9px; text-align: center; }
          
          .divider-double { border-top: 2px double #000; margin: 5px 0; }
          .divider-dashed { border-top: 1px dashed #000; margin: 5px 0; }

          .client-info { text-align: left; font-size: 11px; margin: 8px 0; font-weight: bold; }
          .client-details { font-weight: normal; font-size: 10px; }

          .folio-row { display: flex; justify-content: space-between; font-weight: bold; margin: 5px 0; font-size: 12px; }
          
          .meta-info { font-size: 10px; margin-bottom: 5px; display: flex; justify-content: space-between; }

          table { width: 100%; border-collapse: collapse; margin-top: 5px; }
          th { border-top: 1px solid #000; border-bottom: 1px solid #000; font-size: 10px; padding: 2px 0; text-align: left;}
          td { padding: 4px 0; vertical-align: top; font-size: 10px; }
          
          .col-qty { width: 10%; text-align: center; font-weight: bold; }
          .col-desc { width: 65%; text-align: left; padding-left: 2px; overflow: hidden; }
          .col-price { width: 25%; text-align: right; white-space: nowrap; }

          .total-section { text-align: right; margin-top: 10px; font-size: 16px; font-weight: 800; }
          
          .payment-info { text-align: right; font-size: 11px; font-weight: bold; margin-top: 2px; }

          .footer { text-align: center; margin-top: 15px; font-size: 10px; font-weight: bold; }
          .footer-small { font-size: 9px; font-weight: normal; margin-top: 5px; }
        </style>
      </head>
      <body>
        
        <div class="header">
          ${logoBase64 ? `<img src="${logoBase64}" class="logo-img" />` : ''}
          
          <div class="title">LA BODEGA</div>
          <div class="subtitle">MATERIALES PARA LA CONSTRUCCIÓN<br>Y GALVANIZADOS</div>
          <div class="address-shop">1A PTE SUR S/N ENTRE 1A Y 2A SUR<br>COL EL JOBO</div>
        </div>

        <div class="divider-double"></div>

        <div class="client-info">
          ${clientName}<br/>
          <span class="client-details">
            ${clientAddress}<br/>
            ${clientLocation}<br/>
            ${clientPhone}
          </span>
        </div>

        <div class="divider-dashed"></div>

        <div class="folio-row">
          <span>* NOTA DE VENTA *</span>
          <span>FOLIO: F${saleData.id || '---'}</span>
        </div>
        
        <div class="meta-info">
          <span>${new Date(saleData.date).toLocaleDateString('es-MX')} ${new Date(saleData.date).toLocaleTimeString('es-MX', {hour: '2-digit', minute:'2-digit'})}</span>
          <span>VENDEDOR: CAJA 1</span>
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
                <td class="col-qty">${item.quantity}</td>
                <td class="col-desc">
                  ${item.name} 
                  ${item.isWholesale ? '(MY)' : ''}
                </td>
                <td class="col-price">${formatCurrency(item.price * item.quantity)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="total-section">
          TOTAL ${formatCurrency(saleData.total)}
        </div>
        
        <div class="payment-info">
           PAGO: ${paymentType}
        </div>
        
        <div class="footer">
          ** GRACIAS POR SU COMPRA **<br/>
          SOLICITE SU FACTURA EL MISMO DÍA
          <br/><br/>
          - NO SE ACEPTAN DEVOLUCIONES -
          <div class="footer-small">
            TELS. 961 182 1679 Y 961 690 5168<br/>
            labodegaeljobo@hotmail.com
          </div>
        </div>
      </body>
    </html>
  `;

  const printWindow = window.open('', '_blank', 'width=300,height=600');
  if (printWindow) {
    printWindow.document.write(ticketContent);
    printWindow.document.close();
    
    printWindow.onload = function() {
      printWindow.focus();
      setTimeout(() => { 
          printWindow.print();  
      }, 500);
    };
  }
};