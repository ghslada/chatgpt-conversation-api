class MessageServiceClass {

    #whatsapp;
    #chatGPT;
    #message;
    conversations = {};

    start() {
        this.whatsapp.on("message", (message) => {
            this.message = message;
            console.log('Received message from: ' + message._data.notifyName + '\nMessage: ' + message.body);
            (async () => {
                console.log('Started async process...');

                if (this.isGroupAndMentioned()) {
                    console.log('Message mentioned you and came from a group chat.');
                    const isNewChat = this.isNewConversation(message._data.id.remote);
                    if (isNewChat) {
                        console.log('New chat!');
                        const response = await this.chatGPT.sendMessage(message.body);
                        this.updateConversation(message._data.id.remote, response);
                        this.sendWhatsAppMessage(response.response);
                    } else {
                        console.log('Chat already exists!');
                        if (message.body == 'reset') {
                            this.resetConversation(message._data.id.remote);
                        } else {
                            const conversation = this.conversations[message._data.id.remote];
                            console.log('Sending message to ChatGPT: ' + { ...conversation, message: message.body });
                            const response = await this.chatGPT.sendMessage(conversation);
                            this.updateConversation(message._data.id.remote, response);
                            this.sendWhatsAppMessage(response.response);
                        }
                    }
                } else {
                    const chat = message.getChat();
                    if (!chat.isGroup) {
                        console.log('Message came from a user.');
                        const isNewChat = this.isNewConversation(message._data.id.remote);
                        if (isNewChat) {
                            console.log('New chat!');
                            const response = await this.chatGPT.sendMessage({ message: message.body });
                            this.updateConversation(message._data.id.remote, response);
                            this.sendWhatsAppMessage(response.response);
                        } else {
                            console.log('Chat already exists!');
                            if (message.body == 'reset') {
                                this.resetConversation(message._data.id.remote);
                            } else {
                                const conversation = this.conversations[message._data.id.remote];
                                conversation['message'] = message.body;
                                console.log('Sending message to ChatGPT: ' + JSON.stringify(conversation));
                                try {

                                    const response = await this.chatGPT.sendMessage(conversation);
                                    this.sendWhatsAppMessage(response.response);

                                } catch (error) {

                                    this.sendWhatsAppMessage('A inteligência artificial está conversando com muitas pessoas ao mesmo tempo e atingiu sua capacidade máxima, por favor tente novamente mais tarde.');

                                }
                                // 'A inteligência artificial está conversando com muitas pessoas ao mesmo tempo e atingiu sua capacidade máxima, por favor tente novamente mais tarde.'

                                this.updateConversation(message._data.id.remote, response);
                                this.sendWhatsAppMessage(response.response);
                            }
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
        console.log('Conversations: ' + JSON.stringify(this.conversations));
        if (chatId in this.conversations) {
            return false;
        } else {
            return true;
        }
    }

    resetConversation(chatId) {
        delete this.conversations[chatId];
        console.log('Conversation reseted!');
    }

    updateConversation(chatId, chatGPTResponse) {
        const isNewChat = this.isNewConversation(chatId);
        this.conversations[chatId] = {
            conversationId: chatGPTResponse.conversationId,
            parentMessageId: chatGPTResponse.messageId
        }

        const conversation = this.conversations[chatId];
        console.log('Conversation ' + (isNewChat ? 'created' : 'updated') + ': ' + conversation);


    }

    sendWhatsAppMessage(message) {
        this.message.reply(message);
    }

}

export const MessageService = MessageServiceClass;