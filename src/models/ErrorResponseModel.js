class ErrorResponseModel {

    #success = false;
    #errorMessage = String;
    #displayMessage = String;

    constructor(errorMessage, displayMessage) {
        if (typeof errorMessage === 'string') {
            this.errorMessage = errorMessage;
        }
        else {
            throw 'Constructor expected a string as first argument';
        }
        if (typeof displayMessage === 'string') {
            this.success=true;
            this.displayMessage = displayMessage;
        }
        else {
            throw 'Constructor expected a string as second argument';
        }
    }

    toJSON() {
        const jsonObject = {};

        for (let name in this) {
            if (name == 'toJSON' || name == 'constructor' || typeof this[name] === 'function') { continue; }
            jsonObject[name] = this[name];
        }

        console.log(JSON.stringify(jsonObject));
        return jsonObject;
    }

}

export const ErrorResponse = ErrorResponseModel;