// Import necessary modules
const express = require("express");
const axios = require("axios");
const path = require("path");
const fs = require("fs");
const { exec } = require("child_process");

const app = express();

// Middleware to parse JSON
app.use(express.json());

// Serve processed images
app.use('/processed', express.static(path.join(__dirname, 'public/processed')));

// POST endpoint to remove background
app.post("/remove-bg", async (req, res) => {
    try {
        const { image_url, bounding_box } = req.body;

        // Validate input
        if (!image_url || !bounding_box) {
            return res.status(400).json({ error: "Invalid input. Provide 'image_url' and 'bounding_box'." });
        }

        const { x_min, y_min, x_max, y_max } = bounding_box;

        // Fetch the image from the URL
        const response = await axios({
            url: image_url,
            method: "GET",
            responseType: "arraybuffer"
        });

        // Convert image data to a buffer
        const imageBuffer = Buffer.from(response.data, "binary");

        // Write the original image to a file
        const originalImagePath = path.join(__dirname, "public", "original_image.png");
        fs.writeFileSync(originalImagePath, imageBuffer);

        // Generate a processed image filename
        const processedImageFilename = `processed_${Date.now()}.png`;
        const processedImagePath = path.join(__dirname, "public/processed", processedImageFilename);

        // Run rembg to remove the background using Python subprocess
        exec(`rembg i "${originalImagePath}" "${processedImagePath}"`, (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                return res.status(500).json({ error: "Failed to process the image" });
            }
            if (stderr) {
                console.error(`stderr: ${stderr}`);
            }
            console.log(`stdout: ${stdout}`);

            // Return the URL of the processed image
            const publicUrl = `/processed/${processedImageFilename}`;
            res.status(200).json({
                original_image_url: image_url,
                processed_image_url: publicUrl
            });
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to process the image" });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
