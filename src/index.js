// import { ChatGPTAPIBrowser } from 'chatgpt'
import { ChatGPT } from './services/ChatGPT.js';
import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
import { ChatGPTAPI } from 'chatgpt';

import express from 'express';// = require('express');
import { MessageRouter } from './routes/MessageRoutes.js';
import { Router } from 'express';

// dotenv.config()

// const configuration = {
//     email: process.env.OPENAI_EMAIL,//
//     password: process.env.OPENAI_PASSWORD,
// };

const router = Router();

const app = express();

app.use(express.json());

const chatGPTAPI = new ChatGPT();

MessageRouter(router, chatGPTAPI);

app.use(router);

chatGPTAPI.init().then(

    con => {

        console.log('Connected to Open AI!');

        const PORT_NUMBER = process.env.PORT_NUMBER;

        app.listen(PORT_NUMBER, function(error){
            if (error)
            console.log("Erro ao iniciar servidor na porta 3000: ",error);
            else
            console.log("O servidor foi iniciado na porta: ", PORT_NUMBER);
        })

    }

)
.catch( err => {
    console.log(err);
});

// console.log(process.env.CHATGPT_API_KEY);

// const api = new ChatGPTAPIBrowser(configuration);
// await api.initSession()

// const result = await api.sendMessage('Hello World!');

// console.log(result.response)