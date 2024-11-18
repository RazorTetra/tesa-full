// backend/models/user.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema(
  {
    nama: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: {
      type: String,
      required: true,
      unique: true,
      match: /.+\@.+\..+/,
    },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    pengguna: { type: String, enum: ["admin", "user"], required: true },
    image: { type: String, default: "/noavatar.png" },
  },
  { timestamps: true }
);

// Hash password
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Export model and methods
const User = mongoose.models.User || mongoose.model('User', UserSchema);

export const deleteMany = () => User.deleteMany();
export const insertMany = (data) => User.insertMany(data);
export default User;