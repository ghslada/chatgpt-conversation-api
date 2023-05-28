class MessageServiceClass {

    #whatsapp;
    #chatGPT;
    #message;
    conversations = {};

    
    #menuMessage = '\nMenu de opções:'+
    '\nPara iniciar um novo contexto de conversa digite: \n/nova conversa\n\n'+
    '\nPara listar o menu de opções digite: \n/menu\n\n';

    // welcomeMessage = (userName) => {
        
    // };
    
    #options = {
        '/welcome': (userName) => {
            return 'Olá '+userName+' eu sou o ChatGPT. Posso me lembrar de toda nossa conversa dentro de um contexto.\n'+this.#menuMessage;
        },
        '/menu': (userName) => {
            return userName+' você solicitou o '+
            this.#menuMessage
        },
        '/nova conversa': (userName) => {
                return 'Novo contexto de conversa criado para '+userName+'!\nAs mensagens anteriores foram esquecidas.';
        }
    }

    start() {
        this.whatsapp.on("message", (message) => {
            this.message = message;
            console.log('\nReceived message from: ' + message._data.notifyName + '\nMessage: ' + message.body);
            (async () => {
                console.log('Started async process...');

                if (this.isGroupAndMentioned()) {
                    console.log('Message mentioned you and came from a group chat.');
                    const isNewChat = this.isNewConversation(message._data.id.remote);
                    try {
                        if (isNewChat) {
                            console.log('New chat!');
                            // if ( message.body!='/nova conversa' ) {
                            //     this.sendWhatsAppMessage( this.#options["/nova conversa"](message._data.notifyName) );
                            //     // this.sendWhatsAppMessage( this.welcomeMessage(message._data.notifyName) );
                            // }
                            this.sendWhatsAppMessage(this.#options['/welcome'](message._data.notifyName));
                            const response = await this.chatGPT.sendMessage(message.body);
                            this.updateConversation(message._data.id.remote, response);
                            this.sendWhatsAppMessage(response.response);
                        } else {
                            console.log('Chat already exists!');
                            if ( Object.keys(this.#options).includes(message.body) ) {
                                console.log('Options: '+JSON.stringify(Object.keys(this.#options), null, 4));
                                console.log('Option > '+message.body);
                                if ( message.body == '/nova conversa' ) {
                                    this.resetConversation(message._data.id.remote);
                                }
                                this.sendWhatsAppMessage(this.#options[message.body](message._data.notifyName));
                            } else {
                                const conversation = this.conversations[message._data.id.remote];
                                console.log('Sending message to ChatGPT: ' + { ...conversation, message: message.body });
                                const response = await this.chatGPT.sendMessage(conversation);
                                this.updateConversation(message._data.id.remote, response);
                                this.sendWhatsAppMessage(response.response);
                            }
                        }
                    } catch (error) {

                        console.log('Error: ' + ( typeof error == 'object'? JSON.stringify(error, null, 4) : error ) );
                        this.sendWhatsAppMessage('A inteligência artificial está conversando com muitas pessoas ao mesmo tempo e atingiu sua capacidade máxima, por favor tente novamente mais tarde.');

                    }
                } else {
                    const chat = message.getChat();
                    if (!chat.isGroup) {
                        console.log('Message came from a user.');
                        const isNewChat = this.isNewConversation(message._data.id.remote);
                        try {
                            if (isNewChat) {
                                console.log('New chat!');
                                // if ( message.body!='/nova conversa' ) {
                                //     this.sendWhatsAppMessage( this.#options["/nova conversa"](message._data.notifyName) );
                                // }
                                this.sendWhatsAppMessage(this.#options['/welcome'](message._data.notifyName));
                                console.log('User message body: '+message.body);
                                const response = await this.chatGPT.sendMessage({ message: message.body });
                                this.updateConversation(message._data.id.remote, response);
                                this.sendWhatsAppMessage(response.response);
                            } else {
                                console.log('Chat already exists!');
                                if ( Object.keys(this.#options).includes(message.body) ) {
                                    console.log('Options: '+JSON.stringify(Object.keys(this.#options), null, 4));
                                    console.log('Option > '+message.body);
                                    if ( message.body == '/nova conversa' ) {
                                        this.resetConversation(message._data.id.remote);
                                    }
                                    this.sendWhatsAppMessage(this.#options[message.body](message._data.notifyName));
                                } else {
                                    const conversation = this.conversations[message._data.id.remote];
                                    conversation['message'] = message.body;
                                    console.log('Sending message to ChatGPT: ' + JSON.stringify(conversation, null, 4));
                                    

                                        const response = await this.chatGPT.sendMessage(conversation);
                                        this.sendWhatsAppMessage(response.response);
                                        this.updateConversation(message._data.id.remote, response);
                                        // this.sendWhatsAppMessage(response.response);
                                    // 'A inteligência artificial está conversando com muitas pessoas ao mesmo tempo e atingiu sua capacidade máxima, por favor tente novamente mais tarde.'

                                }
                            }
                        } catch (error) {

                            console.log('Error: ' + ( typeof error == 'object'? JSON.stringify(error, null, 4) : error ) );
                            this.sendWhatsAppMessage('A inteligência artificial está conversando com muitas pessoas ao mesmo tempo e atingiu sua capacidade máxima, por favor tente novamente mais tarde.');

                        }
                    }
                }

            })();
        });
    }

    constructor(whatsapp, chatGPTAPI) {
        this.whatsapp = whatsapp;
        this.chatGPT = chatGPTAPI;
    }

    getConversation(chatId) {
        return this.conversations[chatId];
    }

    isGroupAndMentioned() {

        const chat = this.message.getChat();

        return chat.isGroup &&
            this.message.mentionedIds.includes(this.whatsapp.info.wid._serialized);

    }

    isNewConversation(chatId) {
        console.log('Conversations: ' + JSON.stringify(this.conversations, null, 4));
        if ( chatId in this.conversations ) {
            return false;
        } else {
            return true;
        }
    }

    resetConversation(chatId) {
        delete this.conversations[chatId];
        console.log('Conversation for '+chatId+' reseted!');
    }

    updateConversation(chatId, chatGPTResponse) {
        console.log('Chat GPT response: '+JSON.stringify(chatGPTResponse, null, 4));
        const isNewChat = this.isNewConversation(chatId);
        try {
            this.conversations[chatId] = {
                conversationId: chatGPTResponse.conversationId,
                parentMessageId: chatGPTResponse.messageId
            }
            const conversation = this.conversations[chatId];
            console.log('Conversation ' + (isNewChat ? 'created' : 'updated') + ' for user '+chatId+': ' + JSON.stringify(conversation, null, 4));       
        } catch (error) {
            this.conversations[chatId] = error;
            const conversation = this.conversations[chatId];
            console.log('Error '+ (isNewChat ? 'creating' : 'updating') +' conversation of user '+chatId+'. \nError: ' + JSON.stringify(conversation, null, 4));
            delete this.conversations[chatId];
        }

    }

    sendWhatsAppMessage(message) {
        this.message.reply(message);
    }

}

export const MessageService = MessageServiceClass;