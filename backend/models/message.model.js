import mongoose from "mongoose";
import eccrypto from "eccrypto";

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

// Metodele de criptare și decriptare
messageSchema.methods.encryptMessage = async function () {
  if (this.message) {
    // Convertim mesajul într-un buffer
    const messageBuffer = Buffer.from(this.message, "utf8");
    try {
      // Convertim cheia publică în format buffer
      const publicKeyBuffer = Buffer.from(this.publicKey, "base64");
      // Criptăm mesajul
      const encrypted = await eccrypto.encrypt(publicKeyBuffer, messageBuffer);
      // Convertim datele criptate în base64 pentru stocare
      // În cazul criptografiei eliptice, lungimea cheii este determinată de curba eliptică utilizată
      // eccrypto utilizează curba secp256k1
      // Lungimea cheii private este de 256 de biți (32 de octeți)
      /*
        Cheia publică completă (necomprimată) este de 512 biți (64 de octeți), 
        iar cheia publică comprimată este de 256 biți (32 de octeți)
      */
      this.message = Buffer.concat([
        encrypted.iv,
        encrypted.ephemPublicKey,
        encrypted.ciphertext,
        encrypted.mac,
      ]).toString("base64");
      console.log(
        "_________________________________________________________________________"
      );
      console.log("Cheia publică este -> ", this.publicKey);
      console.log("Cheia privată este -> ", this.privateKey);
      console.log("Mesajul criptat este -> ", this.message);
    } catch (error) {
      console.error("Eroare la criptare:", error);
      throw new Error("Criptarea mesajului a eșuat.");
    }
  }
};

messageSchema.methods.decryptMessage = async function () {
  if (this.message) {
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
    } catch (error) {
      console.error("Eroare la decriptare:", error);
      throw new Error("Decriptarea mesajului a eșuat.");
    }
  }
};

const Message = mongoose.model("Message", messageSchema);

export default Message;
