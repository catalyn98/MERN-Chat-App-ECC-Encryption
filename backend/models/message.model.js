import mongoose from "mongoose";
import eccrypto from "eccrypto";
import { performance } from "perf_hooks";

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    publicKey: {
      type: String,
      required: true,
    },
    privateKey: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// Funcție pentru măsurarea memoriei
function measureMemoryUsage() {
  const used = process.memoryUsage();
  console.log(
    `🧠  Memorie fizică [resident set size (RSS)]: ${(
      used.rss /
      1024 /
      1024
    ).toFixed(2)} MB`
  );
  console.log(
    `🧠  Memorie totală alocată pentru heap: ${(
      used.heapTotal /
      1024 /
      1024
    ).toFixed(2)} MB`
  );
  console.log(
    `🧠  Memorie utilizată din heap: ${(used.heapUsed / 1024 / 1024).toFixed(
      2
    )} MB`
  );
}

// Metoda de criptare
messageSchema.methods.encryptMessage = async function () {
  console.log(
    "____________________________________________________________________________________________________________________________________________________________________"
  );
  console.log("🔒  Elliptic-Curve Cryptography 256 [ECC-256]  🔒");
  console.log("");
  console.log("");
  // Măsurare resurse înainte de criptare
  console.log("📊  Măsurare resurse înainte de criptare  🔒");
  measureMemoryUsage();
  console.log("");
  if (this.message) {
    // Măsurare timpul de generare a cheilor
    const startTimeGeneratePublicKey = performance.now();
    const privateKeyBuffer = Buffer.from(this.privateKey, "base64");
    const endTimeGeneratePublicKey = performance.now();
    const startTimeGeneratePrivateKey = performance.now();
    /*
    Cheia publică necomprimată este formată dintr-o pereche de coordonate 
    (x,y) pe curba eliptică. Pentru curba P-256, fiecare coordonată x și y este de 256 de biți, astfel:
    -> 256 biți pentru coordonata x
    -> 256 biți pentru coordonata y
    -> 8 biți pentru prefixul care indică formatul (0x04 pentru formatul necomprimat)
    În total, acest lucru se adaugă la 520 de biți (65 de octeți). 
    Prefixul de 8 biți este folosit pentru a indica faptul că cheia publică este în format necomprimat.
     */
    const publicKeyBuffer = Buffer.from(this.publicKey, "base64");
    const endTimeGeneratePrivateKey = performance.now();
    const timeGeneratePublicKey = (
      endTimeGeneratePublicKey - startTimeGeneratePublicKey
    ).toFixed(2);
    const timeGeneratePrivateKey = (
      endTimeGeneratePrivateKey - startTimeGeneratePrivateKey
    ).toFixed(2);
    // Calculare lungimea cheilor în biți
    const privateKeyLengthBits = privateKeyBuffer.length * 8;
    const publicKeyLengthBits = publicKeyBuffer.length * 8;
    // Măsurare lungimea mesajului original (numărul de caractere)
    const originalMessageLength = this.message.length;
    // Măsurare dimensiunea mesajului original (numărul de bytes)
    const originalSize = Buffer.byteLength(this.message, "utf8");
    const messageBuffer = Buffer.from(this.message, "utf8");
    try {
      const encrypted = await eccrypto.encrypt(publicKeyBuffer, messageBuffer);
      // Se convertesc datele criptate în base64 pentru stocare
      this.message = Buffer.concat([
        encrypted.iv,
        encrypted.ephemPublicKey,
        encrypted.ciphertext,
        encrypted.mac,
      ]).toString("base64");
      // Măsurare lungimea mesajului criptat (numărul de caractere)
      const encryptedMessageLength = this.message.length;
      console.log("🔑  Cheia de criptare publică: ", this.publicKey);
      console.log("🔑  Cheia de criptare privată: ", this.privateKey);
      console.log(
        "📐  Dimensiunea cheii publice de criptare: " +
          publicKeyLengthBits +
          " biți (format necomprimat)"
      );
      console.log(
        "📐  Dimensiunea cheii private de criptare: " +
          privateKeyLengthBits +
          " biți"
      );
      console.log(
        "⏱️  Timpul necesar pentru generarea cheii publice: " +
          timeGeneratePublicKey +
          " ms"
      );
      console.log(
        "⏱️  Timpul necesar pentru generarea cheii private: " +
          timeGeneratePrivateKey +
          " ms"
      );
      console.log("");
      console.log(
        "📏  Lungimea mesajului original: " +
          originalMessageLength +
          " caractere"
      );
      console.log(
        "📐  Dimensiunea mesajului original: " + originalSize + " bytes"
      );
      console.log("");
      // console.log("🔒  Mesajul criptat: ", this.message);
      console.log(
        "📏  Lungimea mesajului criptat: " +
          encryptedMessageLength +
          " caractere"
      );
      console.log("");
      // Măsurare resurse după criptare
      console.log("📊  Măsurare resurse după criptare  🔒");
      measureMemoryUsage();
      console.log("");
    } catch (error) {
      console.error("Eroare la criptare:", error);
      throw new Error("Criptarea mesajului a eșuat.");
    }
  }
};

// Metoda de decriptare
messageSchema.methods.decryptMessage = async function () {
  if (this.message) {
    // Măsurare resurse înainte de decriptare
    console.log("📊  Măsurare resurse înainte de decriptare  🔓");
    measureMemoryUsage();
    console.log("");
    try {
      // Convertim cheia privată în format buffer
      const privateKeyBuffer = Buffer.from(this.privateKey, "base64");
      // Convertim mesajul criptat în format buffer
      const encryptedComponents = Buffer.from(this.message, "base64");
      const encrypted = {
        iv: encryptedComponents.slice(0, 16),
        ephemPublicKey: encryptedComponents.slice(16, 81),
        ciphertext: encryptedComponents.slice(
          81,
          encryptedComponents.length - 32
        ),
        mac: encryptedComponents.slice(
          encryptedComponents.length - 32,
          encryptedComponents.length
        ),
      };
      // Decriptăm mesajul
      const decrypted = await eccrypto.decrypt(privateKeyBuffer, encrypted);
      this.message = decrypted.toString("utf8");
      const decryptedMessageLength = this.message.length;
      // Măsurare resurse după decriptare
      console.log("📊  Măsurare resurse după decriptare  🔓");
      measureMemoryUsage();
      console.log("");
      console.log(
        "📏  Lungimea mesajului decriptat: " +
          decryptedMessageLength +
          " caractere"
      );
      console.log("");
    } catch (error) {
      console.error("Eroare la decriptare:", error);
      throw new Error("Decriptarea mesajului a eșuat.");
    }
  }
};

const Message = mongoose.model("Message", messageSchema);

export default Message;
