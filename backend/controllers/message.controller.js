import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import eccrypto from "eccrypto";
import { performance } from "perf_hooks";
import { getReceiverSocketId, io } from "../socket/socket.js";

export const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;
    // Găsim sau creăm conversația între expeditor și destinatar
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });
    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
      });
    }
    // Generăm perechea de chei publică și privată
    const privateKey = eccrypto.generatePrivate();
    const publicKey = eccrypto.getPublic(privateKey);
    // Creăm un nou mesaj și setăm cheile publică și privată
    const newMessage = new Message({
      senderId,
      receiverId,
      message,
      publicKey: publicKey.toString("base64"),
      privateKey: privateKey.toString("base64"),
    });
    // Începutul măsurării timpului pentru criptarea mesajului
    const startEncrypt = performance.now();
    // Criptăm mesajul înainte de salvare
    await newMessage.encryptMessage();
    // Adăugăm mesajul la lista de mesaje a conversației
    if (newMessage) {
      conversation.messages.push(newMessage._id);
    }
    // Salvăm conversația și noul mesaj
    await Promise.all([conversation.save(), newMessage.save()]);
    // Decriptăm mesajul pentru a-l afișa pe interfața utilizatorului
    await newMessage.decryptMessage();
    // Sfârșitul măsurării timpului pentru decriptarea mesajului
    const endDecrypt = performance.now();
    console.log(
      `Timpul necesar pentru decriptarea mesajului: ${
        endDecrypt - startEncrypt
      }ms`
    );
    // Trimitem mesajul criptat prin socket
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }
    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const senderId = req.user._id;
    const conversation = await Conversation.findOne({
      participants: { $all: [senderId, userToChatId] },
    }).populate("messages");
    if (!conversation) return res.status(200).json([]);
    const messages = await Promise.all(
      conversation.messages.map(async (message) => {
        // Decriptează fiecare mesaj înainte de a-l returna
        await message.decryptMessage();
        return message;
      })
    );
    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
