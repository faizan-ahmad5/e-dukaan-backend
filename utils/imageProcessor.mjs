import sharp from "sharp";
import fs from "fs";
import path from "path";

// Image processing utility functions
export class ImageProcessor {
  // Validate image file
  static validateImage(file) {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const maxSize = 5 * 1024 * 1024; // 5MB

    const errors = [];

    // Check file type
    if (!allowedTypes.includes(file.mimetype)) {
      errors.push("Invalid file type. Only JPEG, PNG, and WebP are allowed.");
    }

    // Check file size
    if (file.size > maxSize) {
      errors.push("File size too large. Maximum size is 5MB.");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Resize image with different options
  static async resizeImage(inputPath, outputPath, options = {}) {
    try {
      const {
        width = 800,
        height = 600,
        quality = 80,
        format = "jpeg",
        fit = "cover",
      } = options;

      let pipeline = sharp(inputPath);

      // Resize image
      pipeline = pipeline.resize(width, height, { fit });

      // Set format and quality
      switch (format.toLowerCase()) {
        case "jpeg":
        case "jpg":
          pipeline = pipeline.jpeg({ quality });
          break;
        case "png":
          pipeline = pipeline.png({ quality });
          break;
        case "webp":
          pipeline = pipeline.webp({ quality });
          break;
        default:
          pipeline = pipeline.jpeg({ quality });
      }

      // Save processed image
      await pipeline.toFile(outputPath);

      return {
        success: true,
        outputPath,
        message: "Image processed successfully",
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: "Failed to process image",
      };
    }
  }

  // Create multiple sizes for different use cases
  static async createImageVariants(inputPath, outputDir, filename) {
    const variants = {
      thumbnail: { width: 150, height: 150, quality: 70 },
      medium: { width: 400, height: 300, quality: 80 },
      large: { width: 800, height: 600, quality: 85 },
      original: null, // Keep original size
    };

    const results = {};
    const nameWithoutExt = path.parse(filename).name;
    const ext = "jpg"; // Convert all to JPG for consistency

    try {
      for (const [variant, options] of Object.entries(variants)) {
        const outputFilename =
          variant === "original"
            ? filename
            : `${nameWithoutExt}_${variant}.${ext}`;
        const outputPath = path.join(outputDir, outputFilename);

        if (variant === "original") {
          // Copy original file
          fs.copyFileSync(inputPath, outputPath);
          results[variant] = outputFilename;
        } else {
          // Resize and save
          const result = await this.resizeImage(inputPath, outputPath, options);
          if (result.success) {
            results[variant] = outputFilename;
          }
        }
      }

      return {
        success: true,
        variants: results,
        message: "Image variants created successfully",
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: "Failed to create image variants",
      };
    }
  }

  // Get image metadata
  static async getImageInfo(imagePath) {
    try {
      const metadata = await sharp(imagePath).metadata();
      const stats = fs.statSync(imagePath);

      return {
        success: true,
        data: {
          width: metadata.width,
          height: metadata.height,
          format: metadata.format,
          size: stats.size,
          channels: metadata.channels,
          hasAlpha: metadata.hasAlpha,
          created: stats.birthtime,
          modified: stats.mtime,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: "Failed to get image info",
      };
    }
  }

  // Optimize image without resizing
  static async optimizeImage(inputPath, outputPath, options = {}) {
    try {
      const { quality = 85, format } = options;

      const metadata = await sharp(inputPath).metadata();
      const originalFormat = format || metadata.format;

      let pipeline = sharp(inputPath);

      switch (originalFormat.toLowerCase()) {
        case "jpeg":
        case "jpg":
          pipeline = pipeline.jpeg({ quality, progressive: true });
          break;
        case "png":
          pipeline = pipeline.png({ quality, progressive: true });
          break;
        case "webp":
          pipeline = pipeline.webp({ quality });
          break;
        default:
          pipeline = pipeline.jpeg({ quality, progressive: true });
      }

      await pipeline.toFile(outputPath);

      return {
        success: true,
        outputPath,
        message: "Image optimized successfully",
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: "Failed to optimize image",
      };
    }
  }

  // Delete image file safely
  static deleteImage(imagePath) {
    try {
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
        return {
          success: true,
          message: "Image deleted successfully",
        };
      } else {
        return {
          success: false,
          message: "Image file not found",
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: "Failed to delete image",
      };
    }
  }

  // Clean up old images (for maintenance)
  static cleanupOldImages(directory, daysOld = 30) {
    try {
      const files = fs.readdirSync(directory);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      let deletedCount = 0;

      files.forEach((file) => {
        const filePath = path.join(directory, file);
        const stats = fs.statSync(filePath);

        if (stats.mtime < cutoffDate) {
          fs.unlinkSync(filePath);
          deletedCount++;
        }
      });

      return {
        success: true,
        deletedCount,
        message: `Cleanup completed. ${deletedCount} old images deleted.`,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: "Failed to cleanup old images",
      };
    }
  }
}

// Middleware for image processing
export const processUploadedImage = async (req, res, next) => {
  try {
    if (!req.file && !req.files) {
      return next();
    }

    const files = req.files || [req.file];
    const processedFiles = [];

    for (const file of files) {
      // Validate image
      const validation = ImageProcessor.validateImage(file);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: "Image validation failed",
          errors: validation.errors,
        });
      }

      // Optimize image
      const optimizedPath = file.path.replace(
        path.extname(file.path),
        "_optimized" + path.extname(file.path)
      );

      const optimization = await ImageProcessor.optimizeImage(
        file.path,
        optimizedPath,
        { quality: 85 }
      );

      if (optimization.success) {
        // Replace original with optimized
        fs.unlinkSync(file.path);
        fs.renameSync(optimizedPath, file.path);
      }

      processedFiles.push(file);
    }

    // Update req object
    if (req.file) {
      req.file = processedFiles[0];
    } else {
      req.files = processedFiles;
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Image processing failed",
      error: error.message,
    });
  }
};

export default ImageProcessor;
