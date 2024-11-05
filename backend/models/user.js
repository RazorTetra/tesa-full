const mongoose = require("mongoose");

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
  { timestamps: true },
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);

module.exports = User;
