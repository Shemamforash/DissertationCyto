/**
 * Created by Sam on 15/02/2017.
 */

//http://lisperator.net/pltut/parser/token-stream
//http://eloquentjavascript.net/11_language.html

var consoleElements, Evaluator = {
    elements: {
        keywords: ["if", "(", ")", "else", "INTERNAL", "SOURCE", "SINK", "reset", "lower-bound", "upper-bound"],
        conditional_symbols: ["<", ">", "<=", ">=", "=="],
        operators: ["+", "-", "*", "/", "="],
        input: "",
        button: {}
    },
    init: function () {
        consoleElements = Evaluator.elements;
        Evaluator.tokenizer("   hello  sam\n i am saaaaam true false700 5000 a60s 23q if else INTERNAL * / > = - ==");
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
            return Evaluator.wrap_type_value(true, "bool");
        } else if (token === "false") {
            return Evaluator.wrap_type_value(false, "bool");
        }
        return null;
    },
    to_num: function (token) {
        var num;
        if (!isNaN(Number(token.charAt(0)))) {
            num = Number(token);
            if (isNaN(num)) {
                return {error: "Incorrectly formatted number '" + token + "'"};
            } else {
                return Evaluator.wrap_type_value(num, "number");
            }
        }
        return null;
    },
    to_keyword: function (token) {
        if (consoleElements.keywords.indexOf(token) !== -1) {
            return Evaluator.wrap_type_value(token, "keyword");
        }
        return null;
    },
    to_variable: function (token) {
        if (token.charAt(0) === ".") {
            return Evaluator.wrap_type_value(token, "ivar");
        } else if (token.charAt(0) === "#") {
            return Evaluator.wrap_type_value(token, "tvar");
        }
        return null;
    },
    to_operator: function (token) {
        if (consoleElements.operators.indexOf(token) !== -1) {
            return Evaluator.wrap_type_value(token, "operator");
        }
        return null;
    },
    to_conditional: function (token) {
        if (consoleElements.conditional_symbols.indexOf(token) !== -1) {
            return Evaluator.wrap_type_value(token, "conditional");
        }
        return null;
    },
    wrap_type_value: function (value, type) {
        return {
            type: type,
            value: value
        }
    },
    read_token: function (input) {
        var current_token = Evaluator.strip_whitespace(input);
        var parsed_token = null;
        if (current_token) {
            parsed_token = Evaluator.to_bool(current_token.token);
            if (parsed_token === null) {
                parsed_token = Evaluator.to_num(current_token.token);
            }
            if (parsed_token === null) {
                parsed_token = Evaluator.to_keyword(current_token.token);
            }
            if (parsed_token === null) {
                parsed_token = Evaluator.to_variable(current_token.token);
            }
            if (parsed_token === null) {
                parsed_token = Evaluator.to_operator(current_token.token);
            }
            if (parsed_token === null) {
                parsed_token = Evaluator.to_conditional(current_token.token);
            }
            if (parsed_token !== null) {
                if (parsed_token.hasOwnProperty("error")) {
                    console.log("ERROR: " + parsed_token.error);
                } else {
                    console.log("Well parsed: " + parsed_token.value + " type " + parsed_token.type);
                }
            } else {
                console.log("Badly parsed: " + current_token.token);
            }
            return {
                input: current_token.input,
                parsed_token: parsed_token
            };
        }
        return null;
    },
    tokenizer: function (input) {
        while (input !== null) {
            var output = Evaluator.read_token(input);
            if (output !== null) {
                input = output.input;
            } else {
                input = null;
            }
        }
    }
};

$(document).ready(Evaluator.init());