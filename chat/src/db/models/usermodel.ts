import mongoose from "mongoose";
const UserSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: "userName is required",
  },
  userEmail: {
    type: String,
    required: "userName is required",
  },
  userCreatedRooms: [{ type: mongoose.Schema.Types.ObjectId, ref: "Room" }],
  created: {
    type: Date,
    trim: true,
    default: Date.now,
  },
});

export default mongoose.model("User", UserSchema);
