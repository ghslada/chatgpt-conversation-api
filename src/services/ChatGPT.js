import { ChatGPTAPIBrowser } from 'chatgpt'
import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import

dotenv.config();

const configuration = {
  email: process.env.OPENAI_EMAIL,//
  password: process.env.OPENAI_PASSWORD,
  // isGoogleLogin: true,
  // debug: true,
  // proxyServer: '<ip>:<port>'
  markdown: false,
};


class ChatGPTClass {

  chatGPT = new ChatGPTAPIBrowser(configuration);
  #instruction = '.\nInstrução: responda retornando somente uma String sem quebras de linhas.';
  retriesCount = 0;

  chats = {};

  async sendMessage(userMessageBody) {

    const authenticated = await this.chatGPT.getIsAuthenticated();
    if (!authenticated) {
      this.chatGPT.resetThread();
      this.init()
      .then( ok => {
        console.log('Reinicializing ChatGPT...')
      })
      .catch( err => {
        this.retryInit();
      });
    }
    const isChatPage = this.chatGPT.isChatPage;
    if (isChatPage) {

      const userMessageKeys = Object.keys(userMessageBody);

      if (userMessageKeys.includes('instruction')) {
        if (typeof userMessageBody.instruction === string) {
          this.changeInstruction(String(userMessageBody.instruction));
        } else {
          throw 'The key instruction expect a value of the String type';
        }
      }
      if (userMessageKeys.includes('message')) {
        if (typeof userMessageBody.message === 'string') {

          const message = userMessageBody.message;

          const question = message + this.#instruction;

          const storedConversation = userMessageKeys.includes('conversationId') && userMessageKeys.includes('parentMessageId') ? {
            conversationId: userMessageBody['conversationId'],
            parentMessageId: userMessageBody['parentMessageId'],
            timeoutMs: userMessageKeys.includes('timeoutMs') ? userMessageBody['timeoutMs'] : 2 * 60 * 1000
          } : undefined;
          
          let response = {};

          console.log(question);
          
          try {
            if (storedConversation !== undefined) {
              console.log(storedConversation);
              response = await this.chatGPT.sendMessage(question, storedConversation);
            } else {
              response = await this.chatGPT.sendMessage(question, { timeoutMs: 2 * 60 * 1000 });
            }
          } catch (error) {
            console.log(error);
            return error;
          }

          console.log(response);
          return response;
        } else {
          throw 'The key message expect a value of the String type';
        }
      } else {
        throw 'Expected the key message in the request body';
      }
    } else {
      console.log('Please resolve the CAPTCHA and click next');
    }

  }

  async resetSession() {
    await this.chatGPT.resetSession();
  }

  async refreshSession() {
    await this.chatGPT.refreshSession();
  }

  async init() {
    await this.chatGPT.initSession();
    // await this.chatGPT.refreshSession();
  }

  async retryInit() {
    if (this.retriesCount < 3) {
      await this.init()
        .then(res => {
          console.log('ChatGPT connected')
        })
        .catch(async err => {
          this.retriesCount += 1;
          console.log('Retrying to connect to ChatGPT... \n');
          console.log('Retries count: ' + this.retriesCount);
          await this.retryInit();
        });
    }
  }

  changeInstruction(instruction) {
    if (instruction != null && typeof instruction === 'string' && String(instruction).length > 0) {
      this.#instruction = instruction;
      console.log('Instruction changed to: ' + instruction);
    } else {
      throw 'Please provide a string.';
    }
  }

}

export const ChatGPT = ChatGPTClass;

