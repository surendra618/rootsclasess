// utils/generateReceipt.js
import PDFDocument from "pdfkit";
import fs from "fs";

export const generateReceipt = (filePath, data) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const stream = fs.createWriteStream(filePath);
      
      doc.pipe(stream);
      
      // Header
      doc.fontSize(24)
         .font('Helvetica-Bold')
         .fillColor('#4F46E5')
         .text('PAYMENT RECEIPT', { align: 'center' });
      
      doc.moveDown();
      
      // Company Info
      doc.fontSize(10)
         .font('Helvetica')
         .fillColor('#666666')
         .text('Roots Classes', { align: 'center' })
         .text('Your Institute Address', { align: 'center' })
         .text('contact@rootsclasses.com | +91 1234567890', { align: 'center' });
      
      doc.moveDown(2);
      
      // Receipt Info Box
      doc.rect(50, doc.y, 495, 80)
         .fill('#F3F4F6');
      
      doc.fillColor('#000000')
         .fontSize(10)
         .font('Helvetica');
      
      const startY = doc.y + 15;
      doc.text(`Receipt No: ${data.orderId || 'N/A'}`, 60, startY)
         .text(`Date: ${data.date || new Date().toLocaleString()}`, 60, startY + 20)
         .text(`Transaction ID: ${data.paymentId || 'N/A'}`, 60, startY + 40);
      
      doc.text(`Status: PAID`, 380, startY)
         .text(`Payment Method: RAZORPAY`, 380, startY + 20);
      
      doc.moveDown(3);
      
      // Student Details
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .fillColor('#1F2937')
         .text('Student Details:', 50);
      
      doc.moveDown(0.5);
      doc.fontSize(10)
         .font('Helvetica')
         .fillColor('#4B5563')
         .text(`Name: ${data.name || 'N/A'}`, 50);
      
      doc.moveDown(1.5);
      
      // Course Details
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .fillColor('#1F2937')
         .text('Course Details:', 50);
      
      doc.moveDown(0.5);
      doc.fontSize(10)
         .font('Helvetica')
         .fillColor('#4B5563')
         .text(`Course Name: ${data.course || 'N/A'}`, 50);
      
      doc.moveDown(2);
      
      // Payment Summary
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .fillColor('#1F2937')
         .text('Payment Summary:', 50);
      
      doc.moveDown(0.5);
      
      let y = doc.y;
      
      // Table
      doc.fontSize(10);
      
      doc.text('Description', 50, y);
      doc.text('Amount (₹)', 450, y, { align: 'right' });
      
      y += 20;
      
      doc.text('Course Fee', 50, y);
      doc.text(`₹${(data.originalPrice || 0).toLocaleString('en-IN')}`, 450, y, { align: 'right' });
      
      y += 20;
      
      if (data.discount > 0) {
        doc.fillColor('#059669');
        doc.text(`Discount (${data.discount}% off)`, 50, y);
        doc.text(`-₹${((data.originalPrice || 0) - (data.finalPrice || 0)).toLocaleString('en-IN')}`, 450, y, { align: 'right' });
        doc.fillColor('#000000');
        y += 20;
      }
      
      doc.moveDown();
      doc.font('Helvetica-Bold');
      doc.text('Total Paid:', 50, y);
      doc.text(`₹${(data.finalPrice || 0).toLocaleString('en-IN')}`, 450, y, { align: 'right' });
      
      doc.moveDown(3);
      
      // Footer
      doc.fontSize(10)
         .font('Helvetica')
         .fillColor('#666666')
         .text('Thank you for your purchase!', { align: 'center' })
         .moveDown(0.5)
         .text('This is a computer generated receipt.', { align: 'center' });
      
      doc.end();
      
      stream.on('finish', resolve);
      stream.on('error', reject);
      
    } catch (error) {
      reject(error);
    }
  });
};