const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class PDFGenerator {
  async generate(quote, user) {
    try {
      const uploadsDir = path.join(__dirname, '../../uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const filename = `quote_${quote._id}_${Date.now()}.pdf`;
      const filepath = path.join(uploadsDir, filename);

      return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50, bufferPages: true });
        const stream = fs.createWriteStream(filepath);

        doc.on('error', reject);
        stream.on('error', reject);

        doc.pipe(stream);

        // Title
        doc.fontSize(24).font('Helvetica-Bold').text('FREIGHT QUOTATION', { align: 'center' });
        doc.moveDown(0.5);
        doc.fontSize(10).fillColor('#666').text('Professional Freight Rate Quote', { align: 'center' });
        doc.moveDown(1);

        // Status
        const statusColors = {
          pending: '#FFD700',
          approved: '#90EE90',
          rejected: '#FFB6C6'
        };
        const statusColor = statusColors[quote.quote_status] || '#FFD700';
        doc.rect(50, doc.y, 100, 25).fill(statusColor);
        doc.fontSize(11).font('Helvetica-Bold').fillColor('#000').text(`Status: ${quote.quote_status.toUpperCase()}`, 60, doc.y - 17);
        doc.moveDown(1.5);

        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke('#999');
        doc.moveDown(1);

        doc.fontSize(10).font('Helvetica-Bold').fillColor('#333').text('QUOTE INFORMATION');
        doc.fontSize(9).font('Helvetica').fillColor('#000');
        doc.text(`Quote ID: ${quote._id}`, 50);
        doc.text(`Date: ${new Date(quote.createdAt).toLocaleDateString()}`);
        doc.text(`Customer: ${user.name}`);
        doc.text(`Email: ${user.email}`);
        doc.moveDown(1);

        doc.fontSize(10).font('Helvetica-Bold').fillColor('#333').text('ROUTE');
        doc.fontSize(9).font('Helvetica').fillColor('#000');
        doc.text(`From: ${quote.origin_city}, ${quote.origin_country}`);
        doc.text(`To: ${quote.destination_city}, ${quote.destination_country}`);
        doc.moveDown(1);

        doc.fontSize(10).font('Helvetica-Bold').fillColor('#333').text('SHIPMENT DETAILS');
        doc.fontSize(9).font('Helvetica').fillColor('#000');
        doc.text(`Weight: ${quote.weight} kg`);
        if (quote.volume) doc.text(`Volume: ${quote.volume} m³`);
        doc.text(`Transport: ${quote.mode_of_transport.toUpperCase()}`);
        doc.text(`Delivery: ${quote.delivery_type}`);
        doc.text(`Shipment Date: ${new Date(quote.shipment_date).toLocaleDateString()}`);
        if (quote.special_services) doc.text(`Special Services: ${quote.special_services}`);
        doc.moveDown(1);

        doc.fontSize(10).font('Helvetica-Bold').fillColor('#333').text('PRICING');
        doc.fontSize(9).font('Helvetica').fillColor('#000');
        doc.text(`Base Cost: $${quote.base_cost.toFixed(2)}`);
        doc.text(`Fuel Surcharge: $${quote.surcharges.fuel.toFixed(2)}`);
        if (quote.surcharges.urgency > 0) {
          doc.text(`Urgency Surcharge: $${quote.surcharges.urgency.toFixed(2)}`);
        }
        if (quote.surcharges.specialServices > 0) {
          doc.text(`Special Services Fee: $${quote.surcharges.specialServices.toFixed(2)}`);
        }
        doc.moveDown(0.5);

        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke('#999').lineWidth(2);
        doc.moveDown(0.5);
        doc.fontSize(12).font('Helvetica-Bold').fillColor('#DC2626').text('TOTAL: $' + quote.total_price.toFixed(2) + ' USD');

        doc.moveDown(2);
        doc.fontSize(8).fillColor('#999').text('This quotation is valid for 30 days from the issue date.', { align: 'center' });
        doc.fontSize(8).fillColor('#999').text('Contact us to proceed with booking.', { align: 'center' });

        doc.end();

        stream.on('finish', () => {
          // IMPORTANT: Save only the filename, not full path with localhost
          const pdfUrl = `/uploads/${filename}`;
          console.log('PDF saved:', pdfUrl);
          resolve(pdfUrl);
        });
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      throw error;
    }
  }
}

module.exports = new PDFGenerator();
