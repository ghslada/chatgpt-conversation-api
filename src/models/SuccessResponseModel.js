class SuccessResponseModel {

    #success = true;
    #userMessage = Object;
    #chatGPTResponse = Object;

    constructor(userMessage, chatGPTResponse) {
        if (typeof userMessage === 'object') {
            this.userMessage = userMessage;
            console.log('User message: '+userMessage);
        }
        else {
            throw 'Constructor expected a object as first argument';
        }
        if (typeof chatGPTResponse === 'object') {
            this.success=true;
            this.chatGPTResponse = chatGPTResponse;
            console.log('ChatGPT message: '+chatGPTResponse);
        }
        else {
            throw 'Constructor expected a object as second argument';
        }

    }

    toJSON() {
        const jsonObject = {};

        for (let name in this) {
            if (name === 'toJSON' || name === 'constructor' || typeof this[name] === 'function') { continue; }
            jsonObject[name] = this[name];
            console.log(name);
        }

        console.log(JSON.stringify(jsonObject));
        return jsonObject;
    }

}

export const SuccessResponse = SuccessResponseModel;