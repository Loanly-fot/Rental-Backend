const fs = require("fs");
const path = require("path");

/**
 * Save base64 image to file system
 * @param {string} base64Data - Base64 encoded image string
 * @param {string} folder - Folder name (e.g., 'equipments')
 * @returns {Promise<string>} - Filename of saved image
 */
exports.saveBase64Image = async (base64Data, folder = "equipments") => {
  try {
    // Remove data URL prefix if present (e.g., "data:image/png;base64,")
    const base64Pattern = /^data:image\/(png|jpg|jpeg|gif|webp);base64,/;
    let imageData = base64Data;
    let extension = "jpg"; // default

    if (base64Pattern.test(base64Data)) {
      const matches = base64Data.match(base64Pattern);
      extension = matches[1] === "jpg" ? "jpg" : matches[1];
      imageData = base64Data.replace(base64Pattern, "");
    }

    // Generate unique filename
    const filename = `${folder}-${Date.now()}-${Math.random()
      .toString(36)
      .substring(7)}.${extension}`;

    // Create buffer from base64
    const buffer = Buffer.from(imageData, "base64");

    // Ensure upload directory exists
    const uploadDir = path.join(__dirname, "../../public/uploads", folder);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Save file
    const filePath = path.join(uploadDir, filename);
    fs.writeFileSync(filePath, buffer);

    return filename;
  } catch (error) {
    console.error("Error saving image:", error);
    throw new Error("Failed to save image");
  }
};

/**
 * Delete image file
 * @param {string} filename - Filename to delete
 * @param {string} folder - Folder name (e.g., 'equipments')
 * @returns {Promise<boolean>} - Success status
 */
exports.deleteImage = async (filename, folder = "equipments") => {
  try {
    if (!filename) return false;

    const filePath = path.join(
      __dirname,
      "../../public/uploads",
      folder,
      filename
    );

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error deleting image:", error);
    return false;
  }
};

/**
 * Check if string is base64 image data
 * @param {string} str - String to check
 * @returns {boolean}
 */
exports.isBase64Image = (str) => {
  if (!str || typeof str !== "string") return false;
  return /^data:image\/(png|jpg|jpeg|gif|webp);base64,/.test(str);
};
