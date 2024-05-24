<h1 align="center">
  MERN Chat App ECC Encryption
</h1>
<p align="center">
  ReactJS, NodeJS, ExpressJS, MongoDB, ECC Encryption
</p>

<img align="center" src="https://firebasestorage.googleapis.com/v0/b/licenseproject-c2773.appspot.com/o/mern.png?alt=media&token=3ec9ebdd-6476-4ae2-b172-7fcb635c072d" />

# Tech stack
MERN Chat App ECC Encryption uses a number of open source projects to work properly:
* [ReactJS](https://reactjs.org/) - a JavaScript library for building user interfaces.
* [NodeJS](https://nodejs.org/) - is an open-source, server-side JavaScript runtime environment that allows you to run JavaScript code on the server.
* [ExpressJS](https://expressjs.com/) - is a popular web application framework for Node.js. It provides a set of features and tools that simplify the process of building web applications and APIs.
* [MongoDB](https://www.mongodb.com/) - a document-oriented, No-SQL database used to store the application data.

# Installation
MERN Chat App ECC Encryption application requires [Node.js](https://nodejs.org/) to run.

### Clone the repositories
```sh
$ git clone https://github.com/catalyn98/MERN-Chat-App-ECC-Encryption.git
```

### Set environment variables 
To set up your project, follow these steps:
1. Create a *.env* file in the following directories: the *backend api* folder, the *frontend-user* folder, and the *frontend-admin* folder, this file will store your environment variables.
2. Create a MongoDB database and obtain the connection string provided by MongoDB for connecting to your database.
3. Create a Firebase project and obtain the Firebase connection string.

### Install the dependencies:
Start the server:
```sh
$ npm run build 
$ npm start 
```

Start the frontend:
```sh
$ cd frontend
$ npm run dev
```

# Web application screenshots 
| **Register screen** | **Login Screen** | **Start screen** |
| :-----------------: | :--------------: | :--------------: |
| ![Register Screen](https://github.com/catalyn98/MERN-Chat-App-ECC-Encryption/blob/main/screenshoots/2.Sign%20up%20ECC-256.png) | ![Login Screen](https://github.com/catalyn98/MERN-Chat-App-ECC-Encryption/blob/main/screenshoots/1.Login%20ECC-256.png) | ![Start Screen](https://github.com/catalyn98/MERN-Chat-App-ECC-Encryption/blob/main/screenshoots/3.Homepage%201.png) |
| **Conversation screen** | | |
| ![Conversation Screen](https://github.com/catalyn98/MERN-Chat-App-ECC-Encryption/blob/main/screenshoots/4.Homepage%202.png) | | |

# Elliptic Curve Cryptography
Elliptic Curve Cryptography (ECC) is a public-key cryptography approach based on the algebraic structure of elliptic curves over finite fields. 
ECC provides high levels of security with significantly smaller key sizes compared to traditional algorithms like RSA. 
The security of ECC relies on the difficulty of solving the Elliptic Curve Discrete Logarithm Problem (ECDLP), making it computationally infeasible to derive private keys from public keys.
ECC is efficient and requires less computational power, which is beneficial for use in mobile devices, smart cards, and other constrained environments. 
It supports secure key exchange, digital signatures, and encryption, making it versatile for various cryptographic applications. 
Popular ECC-based protocols include ECDSA (Elliptic Curve Digital Signature Algorithm) and ECDH (Elliptic Curve Diffie-Hellman). 
Due to its efficiency and strong security, ECC is widely adopted in modern security protocols, including TLS (Transport Layer Security) and many blockchain platforms.