// scripts/upload-images.js
// Safa Kurtilab High-Speed Parallel Image Uploader
try { require('dotenv').config(); } catch (e) {}
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const fsPromises = require('fs/promises');
const path = require('path');

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'safa-kurtilab',
  api_key: process.env.CLOUDINARY_API_KEY || '489568912389146',
  api_secret: process.env.CLOUDINARY_API_SECRET || ''
});

const IMAGE_DIR = path.join(process.cwd(), 'raw-images');
const OUTPUT_FILE = path.join(process.cwd(), 'cloudinary-urls.txt');
const CONCURRENCY_LIMIT = 6; // Upload 6 images in parallel

async function uploadInventoryImages() {
  const startTime = Date.now();
  try {
    if (!fs.existsSync(IMAGE_DIR)) {
      console.log(`📂 Creating raw-images folder at: ${IMAGE_DIR}...`);
      fs.mkdirSync(IMAGE_DIR, { recursive: true });
      console.log('💡 Please place wholesale Kurti raw images in raw-images/ and rerun.');
      return;
    }

    // 1. Read existing uploads to skip already processed images
    const uploadedSet = new Set();
    if (fs.existsSync(OUTPUT_FILE)) {
      const existingLines = fs.readFileSync(OUTPUT_FILE, 'utf8').split('\n');
      for (const line of existingLines) {
        if (line.includes(':')) {
          const filename = line.split(':')[0].trim();
          uploadedSet.add(filename);
        }
      }
    }

    const files = await fsPromises.readdir(IMAGE_DIR);
    const imageFiles = files.filter(file => file.match(/\.(jpg|jpeg|png|webp|gif)$/i));
    const pendingFiles = imageFiles.filter(file => !uploadedSet.has(file));

    console.log(`🚀 Total Images Found: ${imageFiles.length} | Already Uploaded: ${uploadedSet.size} | Pending: ${pendingFiles.length}`);

    if (pendingFiles.length === 0) {
      console.log('✨ All images are already uploaded! Nothing to do.');
      return;
    }

    console.log(`⚡ Launching Parallel Upload Engine (${CONCURRENCY_LIMIT} concurrent workers)...`);

    const logStream = fs.createWriteStream(OUTPUT_FILE, { flags: 'a' });
    let completedCount = 0;
    let successCount = 0;
    let failCount = 0;

    // Helper worker function
    async function processFile(file) {
      const filePath = path.join(IMAGE_DIR, file);
      try {
        const result = await cloudinary.uploader.upload(filePath, {
          folder: 'safa_kurtilab_products',
          overwrite: false,
          quality: 'auto:good',
          fetch_format: 'auto',
        });

        logStream.write(`${file}: ${result.secure_url}\n`);
        successCount++;
      } catch (err) {
        failCount++;
        console.error(`❌ Failed: ${file} -> ${err.message || err}`);
      } finally {
        completedCount++;
        const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(1);
        const speed = (completedCount / Math.max(elapsedSec, 0.1)).toFixed(1);
        const percent = ((completedCount / pendingFiles.length) * 100).toFixed(1);
        console.log(`⚡ [${completedCount}/${pendingFiles.length}] (${percent}%) | Speed: ${speed} img/s | Elapsed: ${elapsedSec}s`);
      }
    }

    // Parallel Worker Queue using Promise.all pool
    for (let i = 0; i < pendingFiles.length; i += CONCURRENCY_LIMIT) {
      const batch = pendingFiles.slice(i, i + CONCURRENCY_LIMIT);
      await Promise.all(batch.map(file => processFile(file)));
    }

    logStream.end();
    const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`\n🎉 Upload Complete in ${totalTime}s! Success: ${successCount} | Failed: ${failCount}`);
    console.log(`📄 Mappings saved to: ${OUTPUT_FILE}`);
  } catch (error) {
    console.error('❌ Upload Process Error:', error);
  }
}

uploadInventoryImages();
