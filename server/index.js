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
  empId: {type:Number},
  emailId: { type: String, unique: true, required: true },
  department: String,
  status: { type: String, enum:["Accepted", "Rejected", "Pending"], default: "Pending" },
  giftStatus: { type: Boolean, default: false },
  scannedBy: { type: String },
  scannedAt: Date,
  note: {type:String, default: "Attendence Marked"}
});

const Invitation = mongoose.model("Invitation", invitationSchema);

mongoose.connect("mongodb://localhost:27017/qrtest", { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error(err));

// Store scanned QR data
// app.post("/api/save-qr", async (req, res) => {
//   try {
//     const { fullName, emailId, department, status } = req.body;

//     // Find the existing invitation by emailId
//     let existingInvitation = await Invitation.findOne({ emailId });

//     if (existingInvitation) {
//       // Update the existing invitation
//       existingInvitation.status = "Accepted";
//       existingInvitation.giftStatus = true;  // Update giftStatus as well
//       existingInvitation.scannedAt = new Date();

//       await existingInvitation.save();

//       return res.json({ 
//         success: true, 
//         message: `Invitee with emailId ${emailId} updated to status 'Accepted' and gift status updated!`, 
//         data: existingInvitation 
//       });
//     } else {
//       // If not found, create a new invitation
//       const invitation = new Invitation({
//         fullName,
//         emailId,
//         department,
//         status,
//         giftStatus: false,  // Set giftStatus to true for new invitation
//         scannedAt: new Date(),
//       });

//       await invitation.save();

//       res.json({ success: true, message: "QR Code processed successfully!", data: invitation });
//     }
//   } catch (error) {
//     // Handle duplicate key error explicitly
//     if (error.code === 11000) {
//       return res.status(400).json({ success: false, message: "Invitee already recorded" });
//     }
    
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

app.put("/api/save-qr", async (req, res) => {
  try {
    const { emailId, status } = req.body;

    let invitation = await Invitation.findOne({ emailId });

    if (!invitation) {
      return res.status(404).json({ success: false, message: "Invitee not found" });
    }

    if (invitation.status === "Accepted") {
      return res.status(400).json({ success: false, message: "Invitee already accepted. Please update the gift status instead." });
    }

    invitation = await Invitation.findOneAndUpdate(
      { emailId },
      { status, note: "Attendance Marked", scannedAt: new Date() },
      { new: true }
    );

    res.json({ success: true, message: "Status updated successfully!", data: invitation });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update gift status
app.put("/api/update-gift-status", async (req, res) => {
  try {
    const { emailId, giftStatus, note } = req.body;

    // Update the existing invitation's gift status and note
    const invitation = await Invitation.findOneAndUpdate(
      { emailId },
      { giftStatus, note }, // Include note in the update object
      { new: true }
    );

    if (!invitation) {
      return res.status(404).json({ success: false, message: "Invitee not found" });
    }

    res.json({ success: true, message: "Gift status updated successfully!", data: invitation });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Retrieve all scanned QR codes
app.get("/api/scanned-qr", async (req, res) => {
  try {
    const scannedInvites = await Invitation.find({ status: { $ne: "Pending" } })
      .populate("scannedBy", "fullName department emailId");
    res.json({ success: true, data: scannedInvites });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get("/api/get-status", async (req, res) => {
  const { emailId } = req.query;

  try {
    const invite = await Invitation.findOne({ emailId });

    if (invite) {
      res.json({ success: true, department: invite.department, status: invite.status, giftStatus: invite.giftStatus });
    } else {
      res.json({ success: false, message: "Invitee not found" });
    }
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
const PORT = 5090;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
