require("dotenv").config();
const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const { Configuration, OpenAIApi } = require("openai");

const config = new Configuration({
  apiKey: process.env.NEXT_PUBLIC_OPEN_AI,
});

const openai = new OpenAIApi(config);

const client = new Client({
  authStrategy: new LocalAuth(),
});

client.initialize();

// whatsapp web
client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on("authenticated", () => {
  console.log("AUTHENTICATED");
});

client.on("ready", () => {
  console.log("Client is ready!");
});

// Message listener
client.on("message", async (msg) => {
  if (msg.body === "!ping") {
    msg.reply("pong");
  }
});

// Message listener for openai api
client.on("message", async (msg) => {
  if (msg.body === "!hatori") {
    msg.reply("What's your problem?").then(() => {
      client.on("message", async (msg) => {
        if (msg.body) {
          const response = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: `give me a home remedy for ${msg.body}`,
            temperature: 0.1,
            max_tokens: 1024,
          });
          msg.reply(response?.data?.choices[0].text);
        }
      });
    });
  }
});
