const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const User = require('./model/UserModel.js');
const bcrypt = require('bcryptjs');
const bodyParser = require("body-parser");
// Initialize Express
const app = express();
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const invitationSchema = new mongoose.Schema({
  fullName: String,
  email: { type: String, unique: true, required: true },
  department: String,
  qrCode: String,
  status: { type: String, enum: [ "Accepted", "Rejected"], default: "Pending" },
  scannedBy: { type: String},
  scannedAt: Date,
});

const Invitation = mongoose.model("Invitation", invitationSchema);

mongoose.connect("mongodb://localhost:27017/qrscanner", { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error(err));

// Store scanned QR data
app.post("/save-qr", async (req, res) => {
    try {
      const { fullName, email, department, status, scannedBy } = req.body;
  
      // Check if the email with the same status already exists
      let existingInvitation = await Invitation.findOne({ email, status });
  
      if (existingInvitation) {
        return res.status(400).json({ 
          success: false, 
          message: `This invitee with email ${email} has already been scanned with status '${status}'` 
        });
      }
  
      // If not found, create a new invitation
      const invitation = new Invitation({
        fullName,
        email,
        department,
        status,
        scannedBy,
        scannedAt: new Date(),
      });
  
      await invitation.save();
  
      res.json({ success: true, message: "QR Code processed successfully!", data: invitation });
    } catch (error) {
      // Handle duplicate key error explicitly
      if (error.code === 11000) {
        return res.status(400).json({ success: false, message: "Invitee already recorded" });
      }
      
      res.status(500).json({ success: false, error: error.message });
    }
  });
  

// Retrieve all scanned QR codes
app.get("/scanned-qr", async (req, res) => {
  try {
    const scannedInvites = await Invitation.find({ status: { $ne: "Pending" } })
      .populate("scannedBy", "fullName department email");
    res.json({ success: true, data: scannedInvites });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/register', async (req, res) => {
    try {
        console.log("Request Body:", req.body);
        const { username, password } = req.body;
        
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, password: hashedPassword, confirmPassword: password });
        
        await newUser.save();
        res.status(201).send('User registered');
    } catch (err) {
        console.error("Error registering user:", err);
        res.status(500).send('Error registering user: ' + err.message);
    }
});


// Login user
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    // Find user by username
    const user = await User.findOne({ username });
    if (!user) {
        return res.status(400).send('Invalid username or password');
    }

    // Compare the provided password with the stored hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return res.status(400).send('Invalid username or password');
    }

    // If everything is okay, return a success message
    res.status(200).send('Login successful');
});
// Start Server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));