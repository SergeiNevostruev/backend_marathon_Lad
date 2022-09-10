import mongoose from "mongoose";
const RoomSchema = new mongoose.Schema({
  roomTitle: {
    type: String,
    required: "userName is required",
  },
  userCreatedRoom: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  userVizitedRoom: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  message: [
    {
      text: String,
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      created: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  created: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Room", RoomSchema);
