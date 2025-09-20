import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { protect } from "../middleware/authMiddleware.mjs";
import { fileUploadSecurity } from "../middleware/securityMiddleware.mjs";
import { processUploadedImage } from "../utils/imageProcessor.mjs";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure upload directories exist
const createUploadDirs = () => {
  const dirs = [
    path.join(__dirname, "../uploads"),
    path.join(__dirname, "../uploads/products"),
    path.join(__dirname, "../uploads/avatars"),
    path.join(__dirname, "../uploads/reviews"),
  ];

  dirs.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

// Initialize upload directories
createUploadDirs();

// Configure multer for different image types
const createMulterConfig = (uploadPath) => {
  return multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, `../uploads/${uploadPath}`);
        cb(null, uploadDir);
      },
      filename: (req, file, cb) => {
        // Generate unique filename with timestamp
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const extension = path.extname(file.originalname);
        cb(null, `${file.fieldname}-${uniqueSuffix}${extension}`);
      },
    }),
    limits: fileUploadSecurity.limits,
    fileFilter: fileUploadSecurity.fileFilter,
  });
};

// Multer instances for different image types
const uploadProduct = createMulterConfig("products");
const uploadAvatar = createMulterConfig("avatars");
const uploadReview = createMulterConfig("reviews");

// Helper function to generate image URL
const generateImageUrl = (req, category, filename) => {
  const protocol = req.protocol;
  const host = req.get("host");
  return `${protocol}://${host}/uploads/${category}/${filename}`;
};

// Product image upload - supports multiple images
router.post(
  "/upload/product",
  protect,
  uploadProduct.array("images", 5),
  processUploadedImage,
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: "No images uploaded",
        });
      }

      const imageUrls = req.files.map((file) =>
        generateImageUrl(req, "products", file.filename)
      );

      res.status(200).json({
        success: true,
        message: `${req.files.length} product image(s) uploaded and processed successfully`,
        data: {
          images: imageUrls,
          count: req.files.length,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Product image upload failed",
        error: error.message,
      });
    }
  }
);

// User avatar upload - single image
router.post(
  "/upload/avatar",
  protect,
  uploadAvatar.single("avatar"),
  processUploadedImage,
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No avatar image uploaded",
        });
      }

      const imageUrl = generateImageUrl(req, "avatars", req.file.filename);

      res.status(200).json({
        success: true,
        message: "Avatar uploaded and processed successfully",
        data: {
          avatar: imageUrl,
          filename: req.file.filename,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Avatar upload failed",
        error: error.message,
      });
    }
  }
);

// Review images upload - supports multiple images
router.post(
  "/upload/review",
  protect,
  uploadReview.array("images", 3),
  processUploadedImage,
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: "No review images uploaded",
        });
      }

      const imageUrls = req.files.map((file) =>
        generateImageUrl(req, "reviews", file.filename)
      );

      res.status(200).json({
        success: true,
        message: `${req.files.length} review image(s) uploaded and processed successfully`,
        data: {
          images: imageUrls,
          count: req.files.length,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Review image upload failed",
        error: error.message,
      });
    }
  }
);

// Delete image endpoint (optional - for cleanup)
router.delete("/delete/:category/:filename", protect, async (req, res) => {
  try {
    const { category, filename } = req.params;
    const allowedCategories = ["products", "avatars", "reviews"];

    if (!allowedCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: "Invalid image category",
      });
    }

    const filePath = path.join(__dirname, `../uploads/${category}/${filename}`);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.status(200).json({
        success: true,
        message: "Image deleted successfully",
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Image not found",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Image deletion failed",
      error: error.message,
    });
  }
});

// Get image info endpoint
router.get("/info/:category/:filename", (req, res) => {
  try {
    const { category, filename } = req.params;
    const filePath = path.join(__dirname, `../uploads/${category}/${filename}`);

    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      const imageUrl = generateImageUrl(req, category, filename);

      res.status(200).json({
        success: true,
        data: {
          filename,
          category,
          url: imageUrl,
          size: stats.size,
          created: stats.birthtime,
          modified: stats.mtime,
        },
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Image not found",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get image info",
      error: error.message,
    });
  }
});

export default router;
