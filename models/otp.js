const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
  {
    otp: {
      type: String,
      required: true,
      trim: true,
      min: 6,
      max: 6
    },
    uuid: {
      type: String,
      required: true,
    },
    domain: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Domain",
      required: true
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true
    },
    redirectUrl: {
      type: String,
      required: true
    },
    createdAt: {
        type: Date,
        expires: 10 * 60,
        default: Date.now
    }
  },
  { timestamps: true }
);

const Otp = mongoose.model("Otp", otpSchema);
module.exports = Otp;
