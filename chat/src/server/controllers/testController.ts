import * as Hapi from "@hapi/hapi";
import boom from "@hapi/boom";
import User from "../../db/models/usermodel";
import Room from "../../db/models/roomsmodel";
import mongoose from "mongoose";
// дописать обработку ошибок

const createUser: Hapi.Lifecycle.Method = async (request, h) => {
  const { name, email } = request.payload as { name: string; email: string };
  const checkUser = await User.findOne({ userEmail: email }).exec();
  if (checkUser)
    return boom.badRequest("пользователь c таким email существует");

  const user = new User({ userName: name, userEmail: email });
  await user.save();
  return user;
};

const inputUser: Hapi.Lifecycle.Method = async (request, h) => {
  const { email } = request.payload as { email: string };
  const user = await User.findOne({ userEmail: email }).exec();
  if (!user)
    return boom.badRequest(
      "Такого пользователя не существует. Зарегестрируйтесь"
    );
  return user;
};

const getUsers: Hapi.Lifecycle.Method = async (request, h) => {
  const users = await User.find().select("userName userCreatedRooms").exec();
  return users;
};

const createRoom: Hapi.Lifecycle.Method = async (request, h) => {
  const { userId, roomTitle } = request.payload as {
    userId: string;
    roomTitle: string;
  };
  const checkRoom = await Room.findOne({ roomTitle: roomTitle }).exec();
  if (checkRoom)
    return boom.badRequest(
      "Такая комната существует. Придумайте другое название"
    );
  const user = await User.findById(userId).exec();
  if (!user) return boom.badRequest("Такого пользователя не существует.");
  const room = new Room({
    roomTitle: roomTitle,
    userCreatedRoom: user._id,
  });
  await room.save();
  await user.updateOne({ $push: { userCreatedRooms: room._id } });
  return room;
};

const inputRoom: Hapi.Lifecycle.Method = async (request, h) => {
  const { roomId, userId } = request.payload as {
    roomId: string;
    userId: string;
  };
  const room = await Room.findById(roomId)
    .populate("message.user", "userName")
    .exec();
  if (!room)
    return boom.badRequest(
      "Такого пользователя не существует. Зарегестрируйтесь"
    );
  const user = await User.findById(userId).exec();
  if (!user) return boom.badRequest("Такого пользователя не существует.");
  await room.updateOne({ $addToSet: { userVizitedRoom: user._id } }).exec();
  return room;
};

const getRooms: Hapi.Lifecycle.Method = async (request, h) => {
  const rooms = await Room.find()
    // .populate("message.user", "userName")
    .select("roomTitle message")
    .exec();
  return rooms;
};

const writeMessage: Hapi.Lifecycle.Method = async (request, h) => {
  const { roomId, userId, message } = request.payload as {
    roomId: string;
    userId: string;
    message: string;
  };

  const room = await Room.findById(roomId).exec();
  if (!room)
    return boom.badRequest(
      "Такого пользователя не существует. Зарегестрируйтесь"
    );
  const user = await User.findById(userId).exec();
  if (!user) return boom.badRequest("Такого пользователя не существует.");
  await room
    .updateOne({
      $push: {
        message: {
          text: message,
          user: user._id,
        },
      },
    })
    .exec();
  return { done: true, message: "Сообщение отправлено" };
};

export default {
  createUser,
  getUsers,
  inputUser,
  createRoom,
  inputRoom,
  getRooms,
  writeMessage,
};
