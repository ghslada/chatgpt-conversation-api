export const MessageRouter = (router, chatGPTAPI) => {

    router.post('/message', async (req, res) => {

        const message = req.body.message==null? 'Sugira uma mensagem de erro dizendo que não foi possível ler a mensagem do usuário pois não foi encontrado o atributo message no corpo da requisição': req.body.message;

        console.log('Server received the message: ', message);

        try {

            const resp = await chatGPTAPI.sendMessage(message);
            console.log(resp);
            res.json( { succes: true, chatGPTResponse: resp, userMessage: message } );


            // .then( res => {

            //     res.send(JSON.stringify({  success: true, chatGPTResponse: response, userMessage: message }));

            // })
            // .catch( err => {

            //     res.send( {succes: false, errorMessage: err} );

            // });
            
        } catch (error) {
            console.log(error);
            res.json( {succes: false, errorMessage: error} );

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