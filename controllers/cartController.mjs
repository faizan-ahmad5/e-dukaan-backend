import { Cart } from '../models/CartSchema.mjs';
import { Product } from '../models/ProductSchema.mjs';
import mongoose from 'mongoose';

// Add product to cart
export const addToCart = async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  const userId = req.user._id;

  try {
    // Validate userId format (should be ObjectId)
    if (!userId || !userId.toString().match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user session',
        timestamp: new Date().toISOString(),
      });
    }

    // Validate productId format
    if (!productId || !productId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format',
        timestamp: new Date().toISOString(),
      });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
        timestamp: new Date().toISOString(),
      });
    }

    // Check if user already has a cart
    // Convert userId to ObjectId to prevent NoSQL injection
    const userObjectId = new mongoose.Types.ObjectId(userId);
    let cart = await Cart.findOne({ user: userObjectId });

    if (cart) {
      // Check if product already exists in cart
      const existingProductIndex = cart.products.findIndex(
        item => item.product.toString() === productId
      );

      if (existingProductIndex > -1) {
        // Product exists, update quantity
        cart.products[existingProductIndex].quantity += quantity;
      } else {
        // Product doesn't exist, add new product with price
        cart.products.push({
          product: productId,
          quantity,
          priceAtAdd: product.price,
        });
      }
    } else {
      // Create new cart
      cart = new Cart({
        user: userId,
        products: [
          {
            product: productId,
            quantity,
            priceAtAdd: product.price,
          },
        ],
      });
    }

    await cart.save();
    await cart.populate('products.product');

    res.status(200).json({
      success: true,
      message: 'Product added to cart successfully',
      data: {
        _id: cart._id,
        user: cart.user,
        items: cart.products,
        totalAmount: cart.totalAmount || 0,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Failed to add product to cart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add product to cart',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
};

// Get user's cart
export const getCart = async (req, res) => {
  const userId = req.user._id;

  try {
    // Validate userId format
    if (!userId || !userId.toString().match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user session',
      });
    }

    // Convert userId to ObjectId to prevent NoSQL injection
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const cart = await Cart.findOne({ user: userObjectId }).populate(
      'products.product'
    );

    if (!cart) {
      return res.status(200).json({
        success: true,
        data: {
          items: [],
          totalAmount: 0,
        },
        timestamp: new Date().toISOString(),
      });
    }

    res.status(200).json({
      success: true,
      data: {
        items: cart.products,
        totalAmount: cart.totalAmount || 0,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Failed to fetch cart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cart',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
};

// Update cart item quantity
export const updateCart = async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.user._id;

  try {
    // Validate userId format
    if (!userId || !userId.toString().match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user session',
        timestamp: new Date().toISOString(),
      });
    }

    // Validate productId format
    if (!productId || !productId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format',
        timestamp: new Date().toISOString(),
      });
    }

    // Validate quantity
    if (!quantity || quantity < 1 || quantity > 99) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be between 1 and 99',
        timestamp: new Date().toISOString(),
      });
    }

    // Find user's cart
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const cart = await Cart.findOne({ user: userObjectId });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found',
        timestamp: new Date().toISOString(),
      });
    }

    // Find the product in cart
    const productIndex = cart.products.findIndex(
      item => item.product.toString() === productId
    );

    if (productIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Product not found in cart',
        timestamp: new Date().toISOString(),
      });
    }

    // Update the quantity
    cart.products[productIndex].quantity = quantity;

    await cart.save();
    await cart.populate('products.product');

    res.json({
      success: true,
      message: 'Cart updated successfully',
      data: {
        _id: cart._id,
        user: cart.user,
        items: cart.products,
        totalAmount: cart.totalAmount || 0,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Failed to update cart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update cart',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
};

// Remove product from cart
export const removeFromCart = async (req, res) => {
  const { productId } = req.params;
  const userId = req.user._id;

  try {
    // Validate userId format
    if (!userId || !userId.toString().match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user session',
      });
    }

    // Validate productId format
    if (!productId || !productId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format',
      });
    }

    // Convert userId to ObjectId to prevent NoSQL injection
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const cart = await Cart.findOne({ userId: userObjectId });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.products = cart.products.filter(
      item => item.productId.toString() !== productId
    );

    await cart.save();
    await cart.populate('products.productId');

    res.status(200).json({
      message: 'Product removed from cart successfully',
      cart,
    });
  } catch (error) {
    logger.error('Failed to remove product from cart:', error);
    res.status(500).json({ message: 'Failed to remove product from cart' });
  }
};

// Clear entire cart
export const clearCart = async (req, res) => {
  const userId = req.user._id;

  try {
    // Validate userId format
    if (!userId || !userId.toString().match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user session',
      });
    }

    // Convert userId to ObjectId to prevent NoSQL injection
    const userObjectId = new mongoose.Types.ObjectId(userId);
    await Cart.findOneAndDelete({ userId: userObjectId });

    res.status(200).json({ message: 'Cart cleared successfully' });
  } catch (error) {
    logger.error('Failed to clear cart:', error);
    res.status(500).json({ message: 'Failed to clear cart' });
  }
};
