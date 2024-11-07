// backend/controllers/siswaController.js
const Siswa = require("../models/siswa");
const User = require("../models/user");
const bcrypt = require("bcryptjs");

exports.getAllSiswa = async (req, res) => {
  try {
    const siswa = await Siswa.find().populate('userId', '-password');
    res.status(200).json({ success: true, data: siswa });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.createSiswa = async (req, res) => {
  try {
    // Generate username dari NISN
    const username = `siswa${req.body.nisn}`;
    
    // Generate password default (bisa diganti nanti)
    const defaultPassword = req.body.nisn; // Using NISN as default password
    
    // Create user account
    const user = new User({
      nama: req.body.nama,
      username: username,
      email: `${username}@smpadventtompaso.com`, // Generate email from username
      password: defaultPassword, // Will be hashed by User model pre-save hook
      phone: req.body.phone || "000000000000", // Default phone if not provided
      pengguna: "user",
      image: req.body.image || "/noavatar.png"
    });

    const savedUser = await user.save();

    // Create siswa with reference to user
    const siswa = new Siswa({
      ...req.body,
      userId: savedUser._id
    });

    const savedSiswa = await siswa.save();

    res.status(201).json({ 
      success: true, 
      data: savedSiswa,
      credentials: {
        username: username,
        password: defaultPassword // Show this only once during creation
      }
    });
  } catch (error) {
    // If error occurs, cleanup any partially created data
    if (error.user && error.user._id) {
      await User.findByIdAndDelete(error.user._id);
    }
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.getSiswa = async (req, res) => {
  try {
    const siswa = await Siswa.findById(req.params.id).populate('userId', '-password');
    if (!siswa) {
      return res.status(404).json({ success: false, error: "Siswa tidak ditemukan" });
    }
    res.status(200).json({ success: true, data: siswa });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.updateSiswa = async (req, res) => {
  try {
    const siswa = await Siswa.findById(req.params.id);
    if (!siswa) {
      return res.status(404).json({ success: false, error: "Siswa tidak ditemukan" });
    }

    // Update user data if provided
    if (req.body.email || req.body.phone) {
      await User.findByIdAndUpdate(siswa.userId, {
        email: req.body.email,
        phone: req.body.phone,
        nama: req.body.nama // Update nama in user record too
      });
    }

    // Update siswa data
    const updatedSiswa = await Siswa.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('userId', '-password');

    res.status(200).json({ success: true, data: updatedSiswa });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.deleteSiswa = async (req, res) => {
  try {
    const siswa = await Siswa.findById(req.params.id);
    if (!siswa) {
      return res.status(404).json({ success: false, error: "Siswa tidak ditemukan" });
    }

    // Delete associated user account
    await User.findByIdAndDelete(siswa.userId);
    
    // Delete siswa record
    await Siswa.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: "Siswa dan akun pengguna berhasil dihapus" });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};