import { ChatGPTAPIBrowser } from 'chatgpt'
import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config()

// const configuration = new Configuration({
//     organization: "org-DmPkVT4SLwXqCvsnEolbq48v",
//     apiKey: process.env.ChatGPT_API_KEY,
// });

// console.log(process.env.CHATGPT_API_KEY);

const configuration = {
  email: process.env.OPENAI_EMAIL,//
  password: process.env.OPENAI_PASSWORD,
};


class ChatGPTClass {

  chatGPT = new ChatGPTAPIBrowser(configuration);
  #instruction = '';

  async sendMessage(msg) {

    // return new Promise ( resolve, reject => {

      const response = await this.chatGPT.sendMessage(msg);
      console.log(response);
      // resolve(response);
      return response;
    // });

  }

  async init() {
    await this.chatGPT.initSession();
    // await this.chatGPT.refreshSession();
  }

  changeInstruction(instruction) {
    if( instruction.length > 0 && typeof instruction == 'string' ){
      this.instruction = instruction;
      console.log('Instruction changed to: '+instruction);
    } else {
      return 'Please provide a string.';
    }
  }

}

export const ChatGPT = ChatGPTClass;

