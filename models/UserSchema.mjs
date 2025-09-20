import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = mongoose.Schema(
  {
    name: { 
      type: String, 
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"]
    },
    email: { 
      type: String, 
      required: [true, "Email is required"], 
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: function(v) {
          return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
        },
        message: "Please provide a valid email address"
      }
    },
    password: { 
      type: String, 
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"]
    },
    phone: {
      type: String,
      trim: true,
      validate: {
        validator: function(v) {
          return !v || /^[\+]?[1-9][\d]{0,15}$/.test(v);
        },
        message: "Please provide a valid phone number"
      }
    },
    avatar: {
      type: String,
      validate: {
        validator: function(v) {
          return !v || /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)$/i.test(v);
        },
        message: "Please provide a valid avatar image URL"
      }
    },
    dateOfBirth: {
      type: Date,
      validate: {
        validator: function(v) {
          return !v || v < new Date();
        },
        message: "Date of birth cannot be in the future"
      }
    },
    gender: {
      type: String,
      enum: {
        values: ['male', 'female', 'other', 'prefer-not-to-say'],
        message: "Gender must be one of: male, female, other, prefer-not-to-say"
      }
    },
    addresses: [{
      type: {
        type: String,
        enum: ['home', 'work', 'other'],
        default: 'home'
      },
      street: { type: String, required: true, trim: true },
      city: { type: String, required: true, trim: true },
      state: { type: String, required: true, trim: true },
      zipCode: { type: String, required: true, trim: true },
      country: { type: String, required: true, trim: true },
      isDefault: { type: Boolean, default: false }
    }],
    isAdmin: { 
      type: Boolean, 
      default: false 
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: {
        values: ['active', 'inactive', 'suspended'],
        message: "Status must be one of: active, inactive, suspended"
      },
      default: 'active'
    },
    preferences: {
      newsletter: { type: Boolean, default: true },
      smsNotifications: { type: Boolean, default: false },
      emailNotifications: { type: Boolean, default: true },
      currency: { type: String, default: 'USD' },
      language: { type: String, default: 'en' }
    },
    lastLogin: {
      type: Date,
      default: Date.now
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    verificationToken: String
  },
  { 
    timestamps: true,
    toJSON: { 
      transform: function(doc, ret) {
        delete ret.password;
        delete ret.resetPasswordToken;
        delete ret.resetPasswordExpire;
        delete ret.verificationToken;
        return ret;
      }
    }
  }
);

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ status: 1 });
userSchema.index({ isAdmin: 1 });

// Hash password before saving
userSchema.pre("save", async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified("password")) return next();
  
  try {
    const salt = await bcrypt.genSalt(12); // Increased salt rounds for better security
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Ensure only one default address per user
userSchema.pre('save', function(next) {
  if (this.addresses && this.addresses.length > 0) {
    const defaultAddresses = this.addresses.filter(addr => addr.isDefault);
    if (defaultAddresses.length > 1) {
      // Set all to false except the last one marked as default
      this.addresses.forEach((addr, index) => {
        if (index !== this.addresses.length - 1) {
          addr.isDefault = false;
        }
      });
    }
  }
  next();
});

// Method to compare passwords during login
userSchema.methods.matchPassword = async function (enteredPassword) {
  try {
    return await bcrypt.compare(enteredPassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Method to get user's default address
userSchema.methods.getDefaultAddress = function() {
  return this.addresses.find(addr => addr.isDefault) || this.addresses[0];
};

// Method to check if user can perform admin actions
userSchema.methods.canPerformAdminActions = function() {
  return this.isAdmin && this.status === 'active';
};

export const User = mongoose.model("User", userSchema);
