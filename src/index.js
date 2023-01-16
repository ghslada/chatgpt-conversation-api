import { ChatGPT } from './services/ChatGPT.js';
import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
import express from 'express';// = require('express');
import { MessageRouter } from './routes/MessageRoutes.js';
import { MessageService } from './services/MessageService.js';
import { Router } from 'express';

dotenv.config()

const router = Router();

const app = express();

app.use(express.json());

const chatGPTAPI = new ChatGPT();

MessageRouter(router, chatGPTAPI);

app.use(router);

// import { whatsapp } from './services/WhatsAppWeb.js';

chatGPTAPI.init().then(

    con => {

        console.log('Connected to Open AI!');

        const PORT_NUMBER = process.env.PORT_NUMBER;

        // WHATSAPP SERVICE
        // IMPORT OUTSIDE FUNCTION then 

        // whatsapp.on("ready", () => {
        //     console.log("Ready to accept messages");
        //     const messageService = new MessageService(whatsapp, chatGPTAPI);
        //     messageService.start();

        // });

        // API SERVICE
        // WHATSAPP SERVICE COULD BE STARTED USING THE API WITH SOME TYPE OF EVENT EMMITER 
        // TO HAVE MORE CONTROL IF THE SERVICE IS UP 
        
        app.listen(PORT_NUMBER, function(error){
            if (error)
            console.log("Erro to start server on port 3000: ",error);
            else
            console.log("Server started on port: ", PORT_NUMBER);
        });

    }

)
    .catch(async err => {
        console.log(err);
        await chatGPTAPI.retryInit()
        if ( chatGPTAPI.authenticated ) {
            app.listen(PORT_NUMBER, function(error){
                if (error)
                console.log("Erro to start server on port 3000: ",error);
                else
                console.log("Server started on port: ", PORT_NUMBER);
            });
        }
    });