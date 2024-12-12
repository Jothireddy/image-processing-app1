const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { image_url, bounding_box } = req.body;

  if (!image_url || !bounding_box) {
    return res.status(400).json({ error: "Invalid input. Provide 'image_url' and 'bounding_box'." });
  }

  try {
    const { x_min, y_min, x_max, y_max } = bounding_box;

    // Fetch the image
    const response = await axios({
      url: image_url,
      method: "GET",
      responseType: "arraybuffer",
    });
    const imageBuffer = Buffer.from(response.data, "binary");

    // Save original image
    const originalImagePath = path.join("/tmp", "original_image.png");
    fs.writeFileSync(originalImagePath, imageBuffer);

    // Process image
    const processedImagePath = path.join("/tmp", `processed_${Date.now()}.png`);
    exec(`rembg i "${originalImagePath}" "${processedImagePath}"`, (error) => {
      if (error) {
        console.error(`Processing error: ${error}`);
        return res.status(500).json({ error: "Failed to process the image" });
      }

      res.status(200).json({
        original_image_url: image_url,
        processed_image_url: `${processedImagePath}`,
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred during processing." });
  }
};
