

import mongoose from "mongoose";

const invitationSchema = new mongoose.Schema({
  fullName: String,
  email: String,
  department: String,
  qrCode: String,
  status: { type: String, enum: [ "Accepted", "Rejected"], default: "Pending" },
  scannedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  scannedAt: Date,
});

export default mongoose.model("Invitation", invitationSchema);


