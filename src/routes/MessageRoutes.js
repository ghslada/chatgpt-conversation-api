import { appendFile } from "fs";
import { ErrorResponse } from "../models/ErrorResponseModel.js";
import { SuccessResponse } from "../models/SuccessResponseModel.js";

export const MessageRouter = (router, chatGPTAPI) => {

    router.post('/message', async (req, res) => {

        // const instruction = req.body.instruction==null? null : req.body.instruction; 

        // const message = req.body.message==null? 'Sugira uma mensagem de erro dizendo que não foi possível ler a mensagem do usuário pois não foi encontrado o atributo message no corpo da requisição': req.body.message;

        const userMessage = req.body;

        console.log('Server received the message: \n' + JSON.stringify(userMessage, null, 4));

        try {
            let message = userMessage.message;
            while(String(message).includes('\t')||String(message).includes('\r')||String(message).includes('\n')) {
                String(message).replace('\r', '');
                String(message).replace('\t', '');
                String(message).replace('\n', '');
            }
            userMessage.message = message;
            const chatGPTResponse = await chatGPTAPI.sendMessage(userMessage);
            console.log(chatGPTResponse);
            const successResponse = new SuccessResponse(userMessage, chatGPTResponse);
            console.log(successResponse);
            res.json( successResponse.toJSON() );


            // .then( res => {

            //     res.send(JSON.stringify({  success: true, chatGPTResponse: response, userMessage: message }));

            // })
            // .catch( err => {

            //     res.send( {succes: false, errorMessage: err} );

            // });
            
        } catch (error) {

            console.log(error);
            const errorResponse = new ErrorResponse(error, 'Desculpe, não foi possível processar a resposta da sua mensagem');
            res.json( errorResponse.toJSON() );

        }

        

        // .then( response => {

        //     console.log('Response: '+JSON.stringify(response));

        //     res.send(JSON.stringify({ response: response }));

        // } )
        // .catch( err => {
        //     console.log('Error: '+JSON.stringify(+err));
        //     res.send(JSON.stringify({ response: err }));
        // });

    });

}