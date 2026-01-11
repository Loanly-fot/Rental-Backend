const { createObjectCsvWriter } = require("csv-writer");
const path = require("path");
const fs = require("fs");

/**
 * Generate CSV file from data array
 * @param {Array} data - Array of objects to write to CSV
 * @param {Array} headers - Array of header definitions [{id, title}]
 * @param {string} filename - Output filename
 * @returns {Promise<string>} Path to generated CSV file
 */
const generateCSV = async (data, headers, filename) => {
  try {
    // Ensure reports directory exists
    const reportsDir = path.join(__dirname, "../../reports");
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const filepath = path.join(reportsDir, filename);

    const csvWriter = createObjectCsvWriter({
      path: filepath,
      header: headers,
    });

    await csvWriter.writeRecords(data);
    return filepath;
  } catch (error) {
    console.error("CSV Generation Error:", error);
    throw new Error(`Failed to generate CSV: ${error.message}`);
  }
};

/**
 * Convert MongoDB data to CSV format
 * @param {Array} data - MongoDB documents array
 * @returns {Array} Formatted data for CSV
 */
const formatDataForCSV = (data) => {
  return data.map((item) => {
    const formatted = { ...item };

    // Convert ObjectId to string
    if (formatted._id) formatted._id = formatted._id.toString();

    // Convert dates to readable format
    Object.keys(formatted).forEach((key) => {
      if (formatted[key] instanceof Date) {
        formatted[key] = formatted[key].toISOString();
      }

      // Handle nested objects (refs)
      if (typeof formatted[key] === "object" && formatted[key] !== null) {
        if (formatted[key]._id) {
          formatted[key] = formatted[key]._id.toString();
        }
      }
    });

    return formatted;
  });
};

module.exports = { generateCSV, formatDataForCSV };
