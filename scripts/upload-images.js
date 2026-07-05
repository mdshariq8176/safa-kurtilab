// scripts/upload-images.js
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const fsPromises = require('fs/promises');
const path = require('path');

// Cloudinary Configuration (reads from environment variables)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const IMAGE_DIR = path.join(process.cwd(), 'raw-images');
const OUTPUT_FILE = path.join(process.cwd(), 'cloudinary-urls.txt');

async function uploadInventoryImages() {
  try {
    // Check if the source directory exists
    if (!fs.existsSync(IMAGE_DIR)) {
      console.log(`📂 Creating raw-images folder at: ${IMAGE_DIR}...`);
      fs.mkdirSync(IMAGE_DIR, { recursive: true });
      console.log('💡 Please place your raw wholesale Kurti images inside the raw-images/ folder and rerun this script!');
      return;
    }

    const files = await fsPromises.readdir(IMAGE_DIR);
    let logStream = fs.createWriteStream(OUTPUT_FILE, { flags: 'a' });

    const imageFiles = files.filter(file => file.match(/\.(jpg|jpeg|png|webp)$/i));
    console.log(`🚀 Found ${imageFiles.length} images to process inside ${IMAGE_DIR}...`);

    for (const file of imageFiles) {
      const filePath = path.join(IMAGE_DIR, file);

      console.log(`Uploading: ${file}...`);
      const result = await cloudinary.uploader.upload(filePath, {
        folder: 'safa_kurtilab_products'
      });

      // Saves the mapping: filename -> secure Cloudinary URL
      logStream.write(`${file}: ${result.secure_url}\n`);
      console.log(`✅ Success: ${file} -> ${result.secure_url}`);
    }
    
    logStream.end();
    console.log('🎉 All images processed! Mappings saved to: cloudinary-urls.txt');
  } catch (error) {
    console.error('❌ Error uploading images:', error);
  }
}

uploadInventoryImages();
