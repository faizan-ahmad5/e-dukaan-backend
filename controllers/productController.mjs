import { Product } from "../models/ProductSchema.mjs";

// CREATE a new product
export const createProduct = async (req, res) => {
  const {
    title,
    description,
    image,
    images = [],
    price,
    category,
    brand,
    inventory,
    tags = [],
    seoTitle,
    seoDescription,
    weight,
    dimensions,
  } = req.body;

  try {
    // Handle single image or multiple images
    let productImages = images.length > 0 ? images : [];
    if (image) {
      productImages.unshift(image); // Add main image at the beginning
    }

    const newProduct = new Product({
      title,
      description,
      image: image || (productImages.length > 0 ? productImages[0] : ""),
      images: productImages,
      price,
      category,
      brand,
      inventory: inventory || { inStock: true, quantity: 0 },
      tags,
      seo: {
        title: seoTitle || title,
        description: seoDescription || description,
      },
      specifications: {
        weight,
        dimensions,
      },
    });

    const savedProduct = await newProduct.save();

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: savedProduct,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create product",
      error: error.message,
    });
  }
};

// GET all products
export const getProducts = async (req, res) => {
  try {
    const {
      category,
      brand,
      minPrice,
      maxPrice,
      inStock,
      page = 1,
      limit = 10,
      sort = "createdAt",
      order = "desc",
    } = req.query;

    // Build filter object
    const filter = {};

    if (category) filter.category = { $regex: category, $options: "i" };
    if (brand) filter.brand = { $regex: brand, $options: "i" };
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (inStock !== undefined) {
      filter["inventory.inStock"] = inStock === "true";
    }

    // Build sort object
    const sortOrder = order === "desc" ? -1 : 1;
    const sortObj = { [sort]: sortOrder };

    // Calculate pagination
    const skip = (page - 1) * limit;

    const products = await Product.find(filter)
      .sort(sortObj)
      .skip(skip)
      .limit(Number(limit));

    const total = await Product.countDocuments(filter);

    res.json({
      success: true,
      data: products,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
      error: error.message,
    });
  }
};

// GET product by ID
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.json({
        success: true,
        data: product,
        timestamp: new Date().toISOString(),
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Product not found",
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch product",
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
};

// UPDATE product by ID
export const updateProduct = async (req, res) => {
  const { title, description, price, image } = req.body;

  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      product.title = title || product.title;
      product.description = description || product.description;
      product.image = image || product.image;
      product.price = price || product.price;

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Failed to update product" });
  }
};

// DELETE product by ID
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      await Product.findByIdAndDelete(req.params.id);
      res.json({ message: "Product removed" });
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete product",
      error: error.message,
    });
  }
};

// Update product images
export const updateProductImages = async (req, res) => {
  try {
    const { id } = req.params;
    const { images, mainImage } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Update images array if provided
    if (images && Array.isArray(images)) {
      product.images = images;
    }

    // Update main image if provided
    if (mainImage) {
      product.image = mainImage;
      // Ensure main image is also in images array
      if (!product.images.includes(mainImage)) {
        product.images.unshift(mainImage);
      }
    }

    const updatedProduct = await product.save();

    res.json({
      success: true,
      message: "Product images updated successfully",
      data: {
        id: updatedProduct._id,
        image: updatedProduct.image,
        images: updatedProduct.images,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update product images",
      error: error.message,
    });
  }
};

// Add image to product
export const addProductImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        message: "Image URL is required",
      });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Add image if not already exists
    if (!product.images.includes(imageUrl)) {
      product.images.push(imageUrl);

      // Set as main image if none exists
      if (!product.image) {
        product.image = imageUrl;
      }

      await product.save();
    }

    res.json({
      success: true,
      message: "Image added to product successfully",
      data: {
        id: product._id,
        image: product.image,
        images: product.images,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to add product image",
      error: error.message,
    });
  }
};

// Remove image from product
export const removeProductImage = async (req, res) => {
  try {
    const { id, imageUrl } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Remove image from images array
    product.images = product.images.filter((img) => img !== imageUrl);

    // If removed image was the main image, set new main image
    if (product.image === imageUrl) {
      product.image = product.images.length > 0 ? product.images[0] : "";
    }

    await product.save();

    res.json({
      success: true,
      message: "Image removed from product successfully",
      data: {
        id: product._id,
        image: product.image,
        images: product.images,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to remove product image",
      error: error.message,
    });
  }
};
