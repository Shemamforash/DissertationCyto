/**
 * Created by Sam on 15/02/2017.
 */
var consoleElements, Evaluator = {
    elements: {
        keywords: ["if", "(", ")", "else", "INTERNAL", "SOURCE", "SINK", "reset", "lower-bound", "upper-bound"],
        input: "",
        button: {}
    },
    init: function () {
        consoleElements = Evaluator.elements;
        Evaluator.tokenizer("   hello  sam\n i am saaaaam true false700 5000 a60s 23q");
    },
    bind: function () {

    },
    strip_whitespace: function (input) {
        var next_char, next_whitespace;
        if (input.length === 0) {
            return null;
        }
        next_char = input.charAt(0);
        if (next_char === " ") {
            return Evaluator.strip_whitespace(input.slice(1, input.length));
        } else {
            next_whitespace = input.indexOf(" ") === -1 ? input.length : input.indexOf(" ");
            return {
                token: input.substring(0, next_whitespace),
                input: input.substring(next_whitespace, input.length)
            };
        }
    },
    //NOTE ALL TO_X FUNCTIONS SHOULD RETURN NULL IF THE TOKEN IS NOT MATCHED/UNRECOGNISED SYMBOL
    to_bool: function (token) {
        if (token === "true") {
            return true;
        } else if (token === "false") {
            return false;
        }
        return null;
    },
    to_num: function(token) {
        var num;
        if(!isNaN(Number(token.charAt(0)))) {
            num = Number(token);
            if(isNaN(num)) {
                return {error: "Incorrectly formatted number '" + token + "'"};
            } else {
                return num;
            }
        }
        return null;
    },
    tokenizer: function (input) {
        var current_token = Evaluator.strip_whitespace(input);
        var parsed_token = null;
        if (current_token) {
            parsed_token = Evaluator.to_bool(current_token.token);
            if(parsed_token === null){
                parsed_token = Evaluator.to_num(current_token.token);
            }
            if(parsed_token !== null){
                if(parsed_token.hasOwnProperty("error")){
                    console.log("ERROR: " + parsed_token.error);
                } else {
                    console.log("Well parsed: " + parsed_token);
                }
            } else {
                console.log("Badly parsed: " + current_token.token);
            }
            Evaluator.tokenizer(current_token.input);
        }
    }
};

$(document).ready(Evaluator.init());