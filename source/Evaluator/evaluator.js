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
        Evaluator.tokenizer("   hello  sam\n i am saaaaam true false700 5000 a60s 23 q if else INTERNAL * / > = - == 27.23747 1.1.1");
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

    //https://www.codeproject.com/Articles/345888/How-to-write-a-simple-interpreter-in-JavaScript
    tokenizer: function (input) {
        var tokens = [], current_char = "", prev_char_is_whitespace = false, input_iterator = 0;
        var next_char = function () {
            current_char = input[input_iterator];
            ++input_iterator;
        };
        var add_token = function (type, value) {
            tokens.push({
                type: type,
                value: value
            });
        };
        var read_number = function () {
            var final_num = "";
            while (Evaluator.is_digit(current_char)) {
                final_num += current_char;
                next_char();
                if (current_char === "." && final_num.indexOf(".") === -1) {
                    final_num += current_char;
                    next_char();
                } else {
                    console.log("Number badly formatted");
                }
            }
            if (Evaluator.is_empty(current_char)) {
                add_token("number", parseFloat(final_num));
            }
        };
        var read_identifier = function () {
            var final_identifier = "";
            while (Evaluator.is_identifier(current_char)) {
                final_identifier += current_char;
                next_char();
            }
            if (consoleElements.keywords.indexOf(final_identifier) !== -1) {
                add_token("keyword", final_identifier);
            } else if (final_identifier === "true" || final_identifier === "false") {
                add_token("bool", final_identifier === "true");
            }
            else {
                add_token("variable", final_identifier);
            }
        };
        while (input_iterator < input.length) {
            next_char();
            if (Evaluator.is_empty(current_char)) {
                prev_char_is_whitespace = true;
            } else if (Evaluator.is_operator(current_char) && prev_char_is_whitespace) {
                add_token(current_char);
                prev_char_is_whitespace = false;
            } else if (Evaluator.is_digit(current_char) && prev_char_is_whitespace) {
                read_number();
                prev_char_is_whitespace = false;
            } else if (Evaluator.is_identifier(current_char) && prev_char_is_whitespace) {
                read_identifier();
                prev_char_is_whitespace = false;
            }
        }
        add_token("end", null);

        for (var i = 0; i < tokens.length; ++i) {
            console.log(tokens[i]);
        }
       Evaluator.parser(tokens);
    },


    is_operator: function (char) {
        return ["+", "-", "/", "*", "%", "(", ")", "=", "^"].indexOf(char) !== -1;
    },
    is_digit: function (char) {
        return ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"].indexOf(char) !== -1;
    },
    is_empty: function (char) {
        return char === " ";
    },
    is_identifier: function (char) {
        return !(Evaluator.is_operator(char) || Evaluator.is_digit(char) || Evaluator.is_empty(char)) && typeof char === "string";
    },

    parser: function (tokens) {
        var ast = [], current_token = tokens[0], token_iterator = 0, symbols = {};
        var read_token = function () {
            current_token = tokens[token_iterator];
            ++token_iterator;
        };
        var add_operator = function (id, null_function, left_binding_power, left_associative_function) {
            var new_symbol = symbols[id] || {};
            symbols[id] = {
                left_binding_power: new_symbol.left_binding_power || left_binding_power,
                null_function: new_symbol.null_function || null_function,
                left_associative_function: new_symbol.left_associative_function || left_associative_function
            };
        };
        var symbol = function (token) {
            var symbol = symbols[token.type];
            if (symbol) {
                return {
                    left_binding_power: symbol.left_binding_power,
                    null_function: symbol.null_function,
                    left_associative_function: symbol.left_associative_function,
                    type: token.type,
                    value: token.value
                }
            } else {
                return {
                    type: token.type,
                    value: token.value
                };
            }
        };
        var expression = function(right_binding_power){
            var left, t = symbol(current_token);
            read_token();
            if(!t.null_function) {
                console.log("unexpected token" + t);
            }
            left = t.null_function(t);
            while(right_binding_power < symbol(current_token).left_binding_power){
                t = symbol(current_token);
                read_token();
                if(!t.left_associative_function) {
                    console.log("unexpected token" + t);
                }
                left = t.left_associative_function(left);
            }
            return left;
        };
        var infix_creator = function (id, left_binding_power, right_binding_power, left_associative_function) {
            right_binding_power = right_binding_power || left_binding_power;
            left_associative_function = left_associative_function || function (left) {
                return {
                    type: id,
                    left: left,
                    right: expression(right_binding_power)
                };
            };
            add_operator(id, null, left_binding_power, left_associative_function);

        };
        var prefix_creator = function (id, right_binding_power) {
            add_operator(id, function () {
                return {
                    type: id,
                    right: expression(right_binding_power)
                };
            });
        };
        prefix_creator("-", 7);
        infix_creator("^", 6, 5);
        infix_creator("*", 4);
        infix_creator("/", 4);
        infix_creator("%", 4);
        infix_creator("+", 3);
        infix_creator("-", 3);
        add_operator(")");
        add_operator("end");
        add_operator("(", function(){
            var value = expression(2);
            if(symbol(current_token) !== ")") {
                console.log("no closing parenthesis");
            }
            read_token();
            return value;
        });
        symbol("number", function(number){
            return number;
        });
        while(symbol(current_token).type !== "end"){
            ast.push(expression(0));
        }
        console.log(ast);
    }
};

$(document).ready(Evaluator.init());