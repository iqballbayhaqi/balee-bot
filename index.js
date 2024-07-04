require("dotenv").config();
const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const OpenAI = require("openai");

const client = new Client({
  puppeteer: {
    args: ["--no-sandbox"],
  },
  webVersionCache: {
    type: "remote",
    remotePath:
      "https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html",
  }
});

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  console.log("Client is ready!");
});

client.on("message", async (msg) => {
  if (process.env.USE_PREFIX) {
    if (msg.body.toLocaleLowerCase().startsWith(`${process.env.USE_PREFIX} `)) {
      const prompt = msg.body.slice(6);
      if (process.env.LOADING_MESSAGE){
        client.sendMessage(msg.from, process.env.LOADING_MESSAGE);
      }
      const response = await getGPTResponse(prompt);
      msg.reply(response.replace(/\*\*(.*?)\*\*/g, "*$1*"));
    }
  } else {
    const response = await getGPTResponse(msg.body);
    msg.reply(response.replace(/\*\*(.*?)\*\*/g, "*$1*"));
  }
});

const getGPTResponse = async (prompt) => {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content:
          "You are a helpful assistant named AIDIVA. AI: Artificial Intellegence, ID: ID SMARTCARE, DI: Digital, VA: Virtual Assistant, ketika memberi salam jawablah sepertini Halo, saya adalah AIDIVA Virtual Assistant dari idSmartCare. Saat ini saya masih dalam fase uji coba. Saya siap membantu kamu.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    model: "gpt-3.5-turbo-16k",
  });

  return completion.choices[0].message.content;
};

client.initialize();
