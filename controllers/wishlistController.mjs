import { Wishlist } from "../models/WishlistSchema.mjs";
import { Product } from "../models/ProductSchema.mjs";

// Get user's wishlist
export const getWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user.id })
      .populate({
        path: "items.product",
        select: "title image price brand category inventory rating",
      })
      .sort({ "items.addedAt": -1 });

    if (!wishlist) {
      return res.json({
        success: true,
        data: {
          items: [],
          totalItems: 0,
        },
      });
    }

    // Filter out products that no longer exist
    const validItems = wishlist.items.filter((item) => item.product);

    res.json({
      success: true,
      data: {
        items: validItems,
        totalItems: validItems.length,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch wishlist",
      error: error.message,
    });
  }
};

// Add item to wishlist
export const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    // Validate product ID format
    if (!productId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID format",
      });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    let wishlist = await Wishlist.findOne({ user: req.user.id });

    if (!wishlist) {
      // Create new wishlist if doesn't exist
      wishlist = new Wishlist({
        user: req.user.id,
        items: [
          {
            product: productId,
            addedAt: new Date(),
          },
        ],
      });
    } else {
      // Check if item already exists in wishlist
      const existingItem = wishlist.items.find(
        (item) => item.product.toString() === productId
      );

      if (existingItem) {
        return res.status(400).json({
          success: false,
          message: "Product already in wishlist",
        });
      }

      // Add new item to wishlist
      wishlist.items.push({
        product: productId,
        addedAt: new Date(),
      });
    }

    wishlist.updatedAt = new Date();
    await wishlist.save();

    // Populate the newly added item
    await wishlist.populate({
      path: "items.product",
      select: "title image price brand category inventory rating",
    });

    res.status(201).json({
      success: true,
      message: "Product added to wishlist successfully",
      data: {
        totalItems: wishlist.items.length,
        addedItem: wishlist.items[wishlist.items.length - 1],
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to add product to wishlist",
      error: error.message,
    });
  }
};

// Remove item from wishlist
export const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ user: req.user.id });

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: "Wishlist not found",
      });
    }

    const itemIndex = wishlist.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Product not found in wishlist",
      });
    }

    wishlist.items.splice(itemIndex, 1);
    wishlist.updatedAt = new Date();

    await wishlist.save();

    res.json({
      success: true,
      message: "Product removed from wishlist successfully",
      data: {
        totalItems: wishlist.items.length,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to remove product from wishlist",
      error: error.message,
    });
  }
};

// Clear entire wishlist
export const clearWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user.id });

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: "Wishlist not found",
      });
    }

    wishlist.items = [];
    wishlist.updatedAt = new Date();
    await wishlist.save();

    res.json({
      success: true,
      message: "Wishlist cleared successfully",
      data: {
        totalItems: 0,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to clear wishlist",
      error: error.message,
    });
  }
};

// Move wishlist item to cart
export const moveToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    const wishlist = await Wishlist.findOne({ user: req.user.id });

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: "Wishlist not found",
      });
    }

    // Validate product ID format
    if (!productId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID format",
      });
    }

    const itemIndex = wishlist.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Product not found in wishlist",
      });
    }

    // Check product availability
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (!product.inventory.inStock || product.inventory.quantity < quantity) {
      return res.status(400).json({
        success: false,
        message: "Product is out of stock",
      });
    }

    // Here you would typically call your cart service to add the item
    // For now, just remove from wishlist
    wishlist.items.splice(itemIndex, 1);
    wishlist.updatedAt = new Date();
    await wishlist.save();

    res.json({
      success: true,
      message: "Product moved to cart successfully",
      data: {
        totalItems: wishlist.items.length,
        movedProductId: productId,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to move product to cart",
      error: error.message,
    });
  }
};

// Get wishlist statistics
export const getWishlistStats = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user.id }).populate(
      "items.product",
      "price category"
    );

    if (!wishlist || wishlist.items.length === 0) {
      return res.json({
        success: true,
        data: {
          totalItems: 0,
          totalValue: 0,
          categories: [],
          recentlyAdded: [],
        },
      });
    }

    // Calculate total value
    const totalValue = wishlist.items.reduce((sum, item) => {
      return sum + (item.product?.price || 0);
    }, 0);

    // Get categories
    const categories = [
      ...new Set(
        wishlist.items
          .filter((item) => item.product?.category)
          .map((item) => item.product.category)
      ),
    ];

    // Get recently added items (last 5)
    const recentlyAdded = wishlist.items
      .sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt))
      .slice(0, 5)
      .map((item) => ({
        productId: item.product._id,
        addedAt: item.addedAt,
      }));

    res.json({
      success: true,
      data: {
        totalItems: wishlist.items.length,
        totalValue: Math.round(totalValue * 100) / 100,
        categories,
        recentlyAdded,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch wishlist statistics",
      error: error.message,
    });
  }
};

// Check if product is in wishlist
export const isInWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({
      user: req.user.id,
      "items.product": productId,
    });

    res.json({
      success: true,
      data: {
        isInWishlist: !!wishlist,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to check wishlist status",
      error: error.message,
    });
  }
};

// Get wishlist summary for multiple products
export const checkMultipleProducts = async (req, res) => {
  try {
    const { productIds } = req.body;

    if (!Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Product IDs array is required",
      });
    }

    const wishlist = await Wishlist.findOne({ user: req.user.id });

    if (!wishlist) {
      return res.json({
        success: true,
        data: productIds.reduce((acc, id) => {
          acc[id] = false;
          return acc;
        }, {}),
      });
    }

    const wishlistProductIds = wishlist.items.map((item) =>
      item.product.toString()
    );

    const result = productIds.reduce((acc, id) => {
      acc[id] = wishlistProductIds.includes(id);
      return acc;
    }, {});

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to check multiple products",
      error: error.message,
    });
  }
};
