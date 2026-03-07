const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

exports.generateCertificatePDF = (participantName, eventName) => {
  return new Promise((resolve, reject) => {
    try {
      // Ensure certificates directory exists
      const certDir = path.join(__dirname, '../../certificates');
      if (!fs.existsSync(certDir)) {
        fs.mkdirSync(certDir, { recursive: true });
      }

      const fileName = `${participantName}-${Date.now()}.pdf`;
      const filePath = path.join(certDir, fileName);

      const doc = new PDFDocument({
        size: 'A4',
        layout: 'landscape'
      });

      const stream = fs.createWriteStream(filePath);

      // Pipe document to file
      doc.pipe(stream);

      // Content
      doc.fontSize(30).text('Certificate of Achievement', {
        align: 'center'
      });

      doc.moveDown();

      doc.fontSize(20).text('This is proudly awarded to', {
        align: 'center'
      });

      doc.moveDown();

      doc.fontSize(26).text(participantName, {
        align: 'center'
      });

      doc.moveDown();

      doc.fontSize(18).text(
        `For outstanding performance in ${eventName}`,
        { align: 'center' }
      );

      // Finalize PDF
      doc.end();

      // Listen on STREAM (not doc)
      stream.on('finish', () => {
        resolve(fileName);
      });

      stream.on('error', (err) => {
        reject(err);
      });

    } catch (error) {
      reject(error);
    }
  });
};