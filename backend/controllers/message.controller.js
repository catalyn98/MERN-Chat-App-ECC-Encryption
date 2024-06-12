import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import eccrypto from "eccrypto";
import { performance } from "perf_hooks";
import { getReceiverSocketId, io } from "../socket/socket.js";
import os from "os";

// Funcția startCPUUsage măsoară utilizarea CPU la un moment dat
function startCPUUsage() {
  const cpus = os.cpus(); // Obține informații despre toate nucleele CPU
  let user = 0; // Timpul petrecut în modul user
  let sys = 0; // Timpul petrecut în modul kernel (system)
  let idle = 0; // Timpul petrecut în mod inactiv (idle)
  let irq = 0; // Timpul petrecut gestionând întreruperile hardware (IRQ)
  // Iterează prin fiecare nucleu CPU și adună timpii corespunzători
  cpus.forEach((cpu) => {
    user += cpu.times.user;
    sys += cpu.times.sys;
    idle += cpu.times.idle;
    irq += cpu.times.irq;
  });
  // Returnează un obiect cu timpii acumulați pentru fiecare categorie
  return { user, sys, idle, irq };
}

// Funcția getCPUUsage calculează utilizarea CPU între două momente
function getCPUUsage(startUsage) {
  const cpus = os.cpus();
  let user = 0;
  let sys = 0;
  let idle = 0;
  let irq = 0;
  cpus.forEach((cpu) => {
    user += cpu.times.user;
    sys += cpu.times.sys;
    idle += cpu.times.idle;
    irq += cpu.times.irq;
  });

  // Calculează diferențele dintre timpii acumulați la momentul actual și cei de la startUsage
  const userDiff = user - startUsage.user;
  const sysDiff = sys - startUsage.sys;
  const idleDiff = idle - startUsage.idle;
  const irqDiff = irq - startUsage.irq;
  const totalDiff = userDiff + sysDiff + idleDiff + irqDiff;

  // Returnează un obiect cu procentele de utilizare pentru fiecare categorie
  return {
    user: totalDiff ? ((userDiff / totalDiff) * 100).toFixed(2) : "0.00",
    sys: totalDiff ? ((sysDiff / totalDiff) * 100).toFixed(2) : "0.00",
    idle: totalDiff ? ((idleDiff / totalDiff) * 100).toFixed(2) : "0.00",
    irq: totalDiff ? ((irqDiff / totalDiff) * 100).toFixed(2) : "0.00",
  };
}

// Utilizată pentru introducerea de pauze (delay) în execuția codului
// Adăugată în scop didactic pentru a putea face măsurări
async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;
    // Se găsește sau se creează conversația între expeditor și destinatar
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });
    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
      });
    }
    // Se generează perechea de chei publică și privată
    const privateKey = eccrypto.generatePrivate();
    const publicKey = eccrypto.getPublic(privateKey);
    // Se crează un nou mesaj și se setează cheile publice și private
    const newMessage = new Message({
      senderId,
      receiverId,
      message,
      publicKey: publicKey.toString("base64"),
      privateKey: privateKey.toString("base64"),
    });
    // Măsurare resurse înainte de criptare
    const startUsageEncrypt = startCPUUsage();
    const startEncrypt = performance.now();
    await newMessage.encryptMessage();
    await delay(100); // Se introduce un mic delay pentru a permite capturarea modificărilor
    const endEncrypt = performance.now();
    const endUsageEncrypt = getCPUUsage(startUsageEncrypt);
    const timeEncrypt = (endEncrypt - startEncrypt).toFixed(2);
    console.log(
      "⏱️   Timpul necesar pentru criptarea mesajului: " + timeEncrypt + " ms"
    );
    console.log("");
    console.log("🔄  Utilizare CPU în timpul criptării  🔒");
    console.log(
      "💻  Procentul de timp în care CPU a fost ocupat cu executarea codului de aplicație: ",
      endUsageEncrypt.user,
      "%"
    );
    console.log(
      "🛠️   Procentul de timp în care CPU a fost ocupat cu execuția codului de kernel: ",
      endUsageEncrypt.sys,
      "%"
    );
    console.log(
      "🛌  Procentul de timp în care CPU a fost inactiv: ",
      endUsageEncrypt.idle,
      "%"
    );
    console.log(
      "⚡  Procentul de timp în care CPU a fost ocupat cu procesarea întreruperilor hardware: ",
      endUsageEncrypt.irq,
      "%"
    );
    console.log("");
    // Se adaugă mesajul la lista de mesaje a conversației
    if (newMessage) {
      conversation.messages.push(newMessage._id);
    }
    // Se salvează conversația și noul mesaj
    await Promise.all([conversation.save(), newMessage.save()]);
    // Măsurare resurse înainte de decriptare
    const startUsageDecrypt = startCPUUsage();
    const startDecrypt = performance.now();
    await newMessage.decryptMessage();
    await delay(100); // Se introduce un mic delay pentru a permite capturarea modificărilor
    const endDecrypt = performance.now();
    const endUsageDecrypt = getCPUUsage(startUsageDecrypt);
    const timeDecrypt = (endDecrypt - startDecrypt).toFixed(2);
    console.log(
      "⏱️   Timpul necesar pentru decriptarea mesajului: " + timeDecrypt + " ms"
    );
    console.log("");
    console.log("🔄  Utilizare CPU în timpul decriptării  🔓");
    console.log(
      "💻  Procentul de timp în care CPU a fost ocupat cu executarea codului de aplicație: ",
      endUsageDecrypt.user,
      "%"
    );
    console.log(
      "🛠️   Procentul de timp în care CPU a fost ocupat cu execuția codului de kernel: ",
      endUsageDecrypt.sys,
      "%"
    );
    console.log(
      "🛌  Procentul de timp în care CPU a fost inactiv: ",
      endUsageDecrypt.idle,
      "%"
    );
    console.log(
      "⚡  Procentul de timp în care CPU a fost ocupat cu procesarea întreruperilor hardware: ",
      endUsageDecrypt.irq,
      "%"
    );
    console.log(
      "____________________________________________________________________________________________________________________________________________________________________"
    );
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
