import logo from '../assets/LOGO_FERRE.png'; 

export const printTicket = (saleData, customerInfo) => {

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);
  };

  const clientName = customerInfo?.name || "PÚBLICO EN GENERAL";
  const clientAddress = customerInfo?.address || "DOMICILIO CONOCIDO";
  const clientLocation = customerInfo?.location || "TUXTLA GTZ, CHIAPAS";
  const clientPhone = customerInfo?.phone ? `Tel: ${customerInfo.phone}` : "";

  const ticketContent = `
    <html>
      <head>
        <title>Ticket La Bodega</title>
        <style>
          @page { size: 80mm auto; margin: 0mm; }
          body {
            font-family: Arial, sans-serif;
            font-size: 11px;
            width: 72mm;
            margin: 2mm auto;
            color: black;
            text-transform: uppercase; /* Todo en mayúsculas como en la foto */
          }
          .header { text-align: center; margin-bottom: 5px; }
          .title { font-size: 20px; font-weight: 800; margin: 0; }
          .subtitle { font-size: 10px; font-weight: bold; margin-bottom: 3px; }
          .address-shop { font-size: 9px; text-align: center; }
          
          .divider-double { border-top: 2px double #000; margin: 5px 0; }
          .divider-dashed { border-top: 1px dashed #000; margin: 5px 0; }

          .client-info { text-align: left; font-size: 11px; margin: 8px 0; font-weight: bold; line-height: 1.3;}
          .client-details { font-weight: normal; font-size: 10px; }

          .folio-row { display: flex; justify-content: space-between; font-weight: bold; margin: 5px 0; font-size: 12px; }
          
          table { width: 100%; border-collapse: collapse; margin-top: 5px; }
          th { border-top: 1px solid #000; border-bottom: 1px solid #000; font-size: 10px; padding: 2px 0; }
          td { padding: 4px 0; vertical-align: top; font-size: 10px; }
          
          .col-qty { width: 10%; text-align: center; font-weight: bold; }
          .col-desc { width: 60%; text-align: left; padding-left: 2px;}
          .col-price { width: 30%; text-align: right; }

          .total-section { text-align: right; margin-top: 10px; font-size: 18px; font-weight: 800; }
          
          .footer { text-align: center; margin-top: 15px; font-size: 10px; font-weight: bold; }
          .footer-small { font-size: 9px; font-weight: normal; margin-top: 5px; }
        </style>
      </head>
      <body>
        
        <div class="header">
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
          <span>FOLIO: F${saleData.id}</span>
        </div>
        <div style="font-size: 10px; margin-bottom: 5px;">
          ${new Date(saleData.date).toLocaleDateString('es-MX')} ${new Date(saleData.date).toLocaleTimeString('es-MX', {hour: '2-digit', minute:'2-digit'})}
          <span style="float:right">VENDEDOR: CAJA 1</span>
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
      printWindow.print();
      setTimeout(() => { printWindow.close(); }, 100); 
    };
  }
};