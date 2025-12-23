const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    default: null // null for Google-only users
  },
    googleId: {
    type: String,
    default: null
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  authMethod: {
    type: String,
    enum: ['google', 'email'],
    required: true
  },
  contact_number: String,
  company_name: String,
  address: String,
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash if password is modified AND exists
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  
  // Skip if password is already hashed (bcrypt hashes start with $2)
  if (this.password.startsWith('$2')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    console.error('Password hashing error:', error);
    next(error);
  }
});


// Compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.index(
  { googleId: 1 },
  {
    unique: true,
    partialFilterExpression: { 
      googleId: { $type: "string" }  // Only index non-null strings
    }
  }
);

module.exports = mongoose.model('User', userSchema);
