import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const PermissionSchema = new mongoose.Schema({
  resource: {
    type: String,
    required: [true, 'Resource is required'],
    enum: {
      values: [
        'conversations',
        'personality',
        'analytics',
        'users',
        'system',
        'admin'
      ],
      message: 'Invalid resource type'
    }
  },
  actions: {
    type: [String],
    required: [true, 'Actions are required'],
    enum: {
      values: ['read', 'write', 'delete', 'admin'],
      message: 'Invalid action type'
    }
  }
}, {
  timestamps: true
});

const LoginHistorySchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now,
    required: true
  },
  ipAddress: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        return /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$|^[a-fA-F0-9:]+$/.test(v);
      },
      message: 'Invalid IP address format'
    }
  },
  userAgent: {
    type: String,
    trim: true,
    maxlength: [500, 'User agent too long']
  },
  success: {
    type: Boolean,
    required: true
  },
  failureReason: {
    type: String,
    trim: true,
    maxlength: [200, 'Failure reason too long']
  },
  location: {
    country: String,
    city: String,
    timezone: String
  }
}, {
  timestamps: true
});

const AdminUserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [50, 'Username cannot exceed 50 characters'],
    match: [/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens'],
    index: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email format'],
    index: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    validate: {
      validator: function(password) {
        // At least one uppercase, one lowercase, one number, one special character
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
        return passwordRegex.test(password);
      },
      message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    }
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  role: {
    type: String,
    required: [true, 'Role is required'],
    enum: {
      values: ['admin', 'moderator', 'analyst', 'viewer'],
      message: 'Invalid role type'
    },
    default: 'viewer',
    index: true
  },
  permissions: {
    type: [PermissionSchema],
    default: []
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  lastLogin: {
    type: Date,
    default: null
  },
  loginHistory: {
    type: [LoginHistorySchema],
    default: []
  },
  failedLoginAttempts: {
    type: Number,
    default: 0,
    min: [0, 'Failed login attempts cannot be negative']
  },
  lockedUntil: {
    type: Date,
    default: null
  },
  passwordChangedAt: {
    type: Date,
    default: Date.now
  },
  passwordResetToken: {
    type: String,
    default: null
  },
  passwordResetExpires: {
    type: Date,
    default: null
  },
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  twoFactorSecret: {
    type: String,
    default: null
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'auto'
    },
    language: {
      type: String,
      default: 'en',
      enum: ['en', 'es', 'fr', 'de']
    },
    timezone: {
      type: String,
      default: 'UTC'
    },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: false },
      sms: { type: Boolean, default: false }
    }
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.passwordResetToken;
      delete ret.passwordResetExpires;
      delete ret.twoFactorSecret;
      return ret;
    }
  },
  toObject: { 
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.passwordResetToken;
      delete ret.passwordResetExpires;
      delete ret.twoFactorSecret;
      return ret;
    }
  }
});

// Virtual for full name
AdminUserSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for is locked
AdminUserSchema.virtual('isLocked').get(function() {
  return this.lockedUntil && this.lockedUntil > new Date();
});

// Virtual for permission count
AdminUserSchema.virtual('permissionCount').get(function() {
  return this.permissions.length;
});

// Indexes for performance
AdminUserSchema.index({ username: 1 });
AdminUserSchema.index({ email: 1 });
AdminUserSchema.index({ role: 1, isActive: 1 });
AdminUserSchema.index({ lastLogin: -1 });
AdminUserSchema.index({ createdAt: -1 });
AdminUserSchema.index({ 'loginHistory.timestamp': -1 });

// Pre-save middleware to hash password
AdminUserSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with cost of 12
    const hashedPassword = await bcrypt.hash(this.password, 12);
    this.password = hashedPassword;
    this.passwordChangedAt = new Date();
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-save middleware to update password changed timestamp
AdminUserSchema.pre('save', function(next) {
  if (!this.isModified('password') || this.isNew) return next();
  
  this.passwordChangedAt = Date.now() - 1000; // Subtract 1 second to ensure token is created after password change
  next();
});

// Static method to find by username or email
AdminUserSchema.statics.findByUsernameOrEmail = function(identifier) {
  return this.findOne({
    $or: [
      { username: identifier },
      { email: identifier }
    ]
  });
};

// Static method to find active users
AdminUserSchema.statics.findActive = function() {
  return this.find({ isActive: true });
};

// Static method to find by role
AdminUserSchema.statics.findByRole = function(role) {
  return this.find({ role, isActive: true });
};

// Instance method to check password
AdminUserSchema.methods.checkPassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to check if password was changed after token was issued
AdminUserSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Instance method to add login attempt
AdminUserSchema.methods.addLoginAttempt = function(success, ipAddress, userAgent, failureReason = null) {
  const loginAttempt = {
    timestamp: new Date(),
    ipAddress,
    userAgent,
    success,
    failureReason
  };
  
  this.loginHistory.push(loginAttempt);
  
  if (success) {
    this.lastLogin = new Date();
    this.failedLoginAttempts = 0;
    this.lockedUntil = null;
  } else {
    this.failedLoginAttempts++;
    
    // Lock account after 5 failed attempts for 15 minutes
    if (this.failedLoginAttempts >= 5) {
      this.lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    }
  }
  
  // Keep only last 50 login attempts
  if (this.loginHistory.length > 50) {
    this.loginHistory = this.loginHistory.slice(-50);
  }
  
  return this.save();
};

// Instance method to check permission
AdminUserSchema.methods.hasPermission = function(resource, action) {
  if (this.role === 'admin') return true;
  
  const permission = this.permissions.find(p => p.resource === resource);
  if (!permission) return false;
  
  return permission.actions.includes(action) || permission.actions.includes('admin');
};

// Instance method to add permission
AdminUserSchema.methods.addPermission = function(resource, actions) {
  const existingPermission = this.permissions.find(p => p.resource === resource);
  
  if (existingPermission) {
    // Merge actions
    const uniqueActions = [...new Set([...existingPermission.actions, ...actions])];
    existingPermission.actions = uniqueActions;
  } else {
    this.permissions.push({ resource, actions });
  }
  
  return this.save();
};

// Instance method to remove permission
AdminUserSchema.methods.removePermission = function(resource) {
  this.permissions = this.permissions.filter(p => p.resource !== resource);
  return this.save();
};

// Instance method to unlock account
AdminUserSchema.methods.unlockAccount = function() {
  this.failedLoginAttempts = 0;
  this.lockedUntil = null;
  return this.save();
};

const AdminUser = mongoose.model('AdminUser', AdminUserSchema);

export default AdminUser; 