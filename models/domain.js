const mongoose = require("mongoose");

const domainSchema = new mongoose.Schema(
  {
    domainname: {
      type: String,
      required: true,
      trim: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    txt: {
      type: String,
    },
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Client"
    }
  },
  { timestamps: true }
);

const Domain = mongoose.model("Domain", domainSchema);
module.exports = Domain;
