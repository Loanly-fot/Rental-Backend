const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

// Helper function to ensure reports directory exists
const ensureReportsDir = () => {
  const reportsDir = path.join(__dirname, "../../reports");
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  return reportsDir;
};

// Generate PDF Report
exports.generatePDFReport = (filename, title, data, columns) => {
  return new Promise((resolve, reject) => {
    try {
      const reportsDir = ensureReportsDir();
      const filePath = path.join(reportsDir, filename);

      const doc = new PDFDocument({ margin: 50 });
      const stream = fs.createWriteStream(filePath);

      doc.pipe(stream);

      // Title
      doc.fontSize(20).font("Helvetica-Bold").text(title, { align: "center" });
      doc
        .fontSize(10)
        .font("Helvetica")
        .text(`Generated: ${new Date().toLocaleString()}`, { align: "center" });
      doc.moveDown();

      // Table header
      const columnWidths = {};
      const pageWidth = doc.page.width - 100;
      columns.forEach((col) => {
        columnWidths[col.key] =
          (col.width || 1) *
          (pageWidth / columns.reduce((sum, c) => sum + (c.width || 1), 0));
      });

      doc.fontSize(10).font("Helvetica-Bold");
      let xPos = 50;
      columns.forEach((col) => {
        doc.text(col.label, xPos, doc.y, {
          width: columnWidths[col.key],
          align: "left",
        });
        xPos += columnWidths[col.key];
      });
      doc.moveDown();

      // Separator line
      doc
        .strokeColor("#cccccc")
        .lineWidth(0.5)
        .moveTo(50, doc.y)
        .lineTo(doc.page.width - 50, doc.y)
        .stroke();
      doc.moveDown();

      // Table rows
      doc.fontSize(9).font("Helvetica");
      data.forEach((row, index) => {
        if (doc.y > doc.page.height - 100) {
          doc.addPage();
        }

        xPos = 50;
        columns.forEach((col) => {
          const cellValue = row[col.key] || "";
          doc.text(String(cellValue), xPos, doc.y, {
            width: columnWidths[col.key],
            align: col.align || "left",
            height: 30,
          });
          xPos += columnWidths[col.key];
        });

        if (index < data.length - 1) {
          doc.moveDown(0.5);
          doc
            .strokeColor("#eeeeee")
            .lineWidth(0.5)
            .moveTo(50, doc.y)
            .lineTo(doc.page.width - 50, doc.y)
            .stroke();
          doc.moveDown(0.5);
        }
      });

      doc.end();

      stream.on("finish", () => {
        resolve(filePath);
      });
    } catch (error) {
      reject(error);
    }
  });
};

// Generate CSV Report
exports.generateCSVReport = (filename, title, data, columns) => {
  return new Promise((resolve, reject) => {
    try {
      const reportsDir = ensureReportsDir();
      const filePath = path.join(reportsDir, filename);

      // CSV Header
      const csvHeader = columns.map((col) => `"${col.label}"`).join(",");

      // CSV Rows
      const csvRows = data.map((row) =>
        columns
          .map((col) => {
            let value = row[col.key] || "";
            // Escape quotes and wrap in quotes if needed
            value = String(value).replace(/"/g, '""');
            return `"${value}"`;
          })
          .join(",")
      );

      const csvContent = [csvHeader, ...csvRows].join("\n");

      fs.writeFileSync(filePath, csvContent, "utf8");
      resolve(filePath);
    } catch (error) {
      reject(error);
    }
  });
};
