const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
  {
    otp: {
      type: String,
      required: true,
      trim: true,
    },
    uuid: {
      type: String,
      required: true,
    },
    domain: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Domain"
    },
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Client"
    },
    createdAt: {
        type: Date,
        expires: 10 * 60 * 60,
        default: Date.now
    }
  },
  { timestamps: true }
);

const Otp = mongoose.model("Otp", otpSchema);
module.exports = Otp;
