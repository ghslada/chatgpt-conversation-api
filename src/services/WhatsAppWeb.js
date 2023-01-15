import whatsappweb from "whatsapp-web.js";

const { Client, LocalAuth, NoAuth } = whatsappweb;
import qrcode from "qrcode-terminal";

const whatsappinstance = new Client({
    puppeteer: {
        executablePath: process.env.CHROME_PATH,
    },
    // authStrategy: new LocalAuth(),
    authStrategy: new NoAuth()
});

console.log(process.env.CHROME_PATH);

whatsappinstance.initialize();

whatsappinstance.on("qr", (qr) => {
    qrcode.generate(qr, { small: true });
});

whatsappinstance.on("authenticated", () => {
    console.log("Authentication completed");
});

export const whatsapp = whatsappinstance;