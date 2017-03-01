/**
 * Created by Sam on 15/02/2017.
 */

//http://lisperator.net/pltut/parser/token-stream
//http://eloquentjavascript.net/11_language.html

var consoleElements, Evaluator = {
    elements: {
        keywords: ["if", "(", ")", "else", "then", "INTERNAL", "SOURCE", "SINK", "reset", "min", "max", "VAR"],
        conditional_symbols: ["<", ">", "<=", ">=", "=="],
        operators: ["+", "-", "*", "/", "="],
        input: "",
        button: {}
    },
    init: function () {
        consoleElements = Evaluator.elements;
        Evaluator.tokenizer("INTERNAL damage *= if true then 4 * 6 / 3 else 2 ;", {variables: [{name: "damage"}], internal_rules: []});
    },
    bind: function () {

    },

    //https://www.codeproject.com/Articles/345888/How-to-write-a-simple-interpreter-in-JavaScript
    tokenizer: function (input, economy_node) {
        var tokens = [], current_char = " ", prev_char = " ", input_iterator = 0;
        var next_char = function () {
            prev_char = current_char;
            current_char = input[input_iterator];
            ++input_iterator;
        };
        var add_token = function (type, value) {
            var new_token = {
                type: type,
                value: value !== "" ? value : undefined
            };
            tokens.push(new_token);
        };
        var peek = function () {
            return input[input_iterator];
        };
        var read_number = function (is_negative) {
            var final_num = "";
            var num_valid = true;
            while (num_valid) {
                if (Evaluator.is_digit(current_char)) {
                    final_num += current_char;
                } else if (current_char === ".") {
                    if (final_num.indexOf(".") === -1) {
                        final_num += current_char;
                        continue;
                    } else {
                        num_valid = false;
                        break;
                    }
                } else if (Evaluator.is_empty(peek()) || peek() === undefined || current_char === " ") {
                    break;
                } else {
                    num_valid = false;
                    break;
                }
                next_char();
            }

            if (num_valid) {
                if (is_negative) {
                    final_num = -final_num;
                }
                add_token("number", parseFloat(final_num));
            } else {
                console.log("Number badly formatted: " + final_num + current_char);
            }
        };
        var read_identifier = function () {
            var final_identifier = "";
            while (Evaluator.is_identifier(current_char)) {
                final_identifier += current_char;
                if (current_char === ";") {
                    return;
                }
                next_char();
            }
            if (consoleElements.keywords.indexOf(final_identifier) !== -1) {
                if(final_identifier === "then"){
                    final_identifier = "?";
                } else if (final_identifier === "else"){
                    final_identifier = ":";
                }
                add_token(final_identifier, "");
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
                //do nothing
            } else if ((Evaluator.is_digit(current_char) && prev_char === " ") || (current_char === "-" && Evaluator.is_digit(peek()))) {
                if (current_char === "-") {
                    next_char();
                    read_number(true)
                } else {
                    read_number(false);
                }
            } else if (Evaluator.is_operator(current_char) && prev_char === " ") {
                if(Evaluator.is_operator(peek())){
                    var operator = current_char;
                    next_char();
                    if(peek() === " ") {
                        operator += current_char;
                        add_token(operator);
                    }
                } else if(Evaluator.is_empty(peek())){
                    add_token(current_char);
                }
            } else if (Evaluator.is_identifier(current_char) && prev_char === " ") {
                read_identifier();
            }
            if (current_char === ";") {
                break;
            }
        }
        Evaluator.print_tokens(tokens);
        add_token("end", null);
        var rule_type = tokens.shift().type;
        if (rule_type === "INTERNAL") {
            var is_declaration = tokens[0].type === "VAR";
            if (is_declaration) {
                tokens.shift();
                console.log(Evaluator.create_internal_variable(tokens, economy_node));
            } else {
                Evaluator.create_internal_rule(tokens, economy_node);
            }
        } else if (rule_type === "SOURCE") {
            Evaluator.create_source_rule(tokens, economy_node);
        } else if (rule_type === "SINK") {
            Evaluator.create_sink_rule(tokens, economy_node);
        } else {
            console.log("not a valid rule format");
        }
        // Evaluator.parser(tokens);
    },

    print_tokens: function (tokens) {
        for (var i = 0; i < tokens.length; ++i) {
            console.log(tokens[i]);
        }
    },
    create_internal_variable: function (tokens, economy_node) {
        var variable_name = tokens.shift().value;
        for (var i = 0; i < economy_node.variables.length; ++i) {
            if (economy_node.variables[i].name === variable_name) {
                return {
                    type: "error",
                    message: "variable '" + variable_name + "' already exists on this node"
                }
            }
        }
        if (tokens.shift().type !== "=") {
            return {
                type: "error",
                message: "initial value assignment syntax error"
            }
        }
        var initial_value = tokens.shift();
        if (initial_value.type !== ("number" || "bool")) {
            return {
                type: "error",
                message: "declared variable must be boolean or number"
            }
        }
        initial_value = initial_value.value;
        var max_value = undefined;
        var min_value = undefined;
        var reset_value = undefined;
        for (var i = 0; i < tokens.length; ++i) {
            if (tokens[i].type === "min") {
                if (check_valid_assignment(i)) {
                    min_value = tokens[i + 2].value;
                } else {
                    return {
                        type: "error",
                        message: "min value assignment syntax error"
                    }
                }
            }
            else if (tokens[i].type === "max") {
                if (check_valid_assignment(i)) {
                    max_value = tokens[i + 2].value;
                } else {
                    return {
                        type: "error",
                        message: "max value assignment syntax error"
                    }
                }

            } else if (tokens[i].type === "reset") {
                if (check_valid_assignment(i)) {
                    reset_value = tokens[i + 2].value;
                } else {
                    return {
                        type: "error",
                        message: "reset value assignment syntax error"
                    }
                }
            }
        }

        var new_variable = {
            name: variable_name,
            initial_value: initial_value,
            max_value: max_value,
            min_value: min_value,
            reset_value: reset_value
        };

        economy_node.variables.push(new_variable);

        return {
            type: "success",
            message: "initialized new variable '" + variable_name + "'"
        };

        function check_valid_assignment(i) {
            if (tokens[i + 1].type !== "=") {
                //should be assignment
                return false;
            } else if (tokens[i + 2].type !== "number") {
                //should be a number
                return false;
            }
            return true;
        }
    },
    create_internal_rule: function (tokens, economy_node) {
        var variable_name = tokens.shift().value;
        var variable_exists = false;
        //check for variable existence;
        for (var i = 0; i < economy_node.variables.length; ++i) {
            if (economy_node.variables[i].name === variable_name) {
                variable_exists = true;
            }
        }
        if(variable_exists) {
            var stmt = "";
            var operator = tokens.shift().type;
            console.log(operator);
            if(Evaluator.is_assignment_operator(operator)){
                var next_token = tokens.shift();
                while(next_token.type !== "end"){
                    console.log(next_token);

                    if(next_token.type === "if"){
                          next_token = tokens.shift();
                    }

                    if(next_token.type === "number" || next_token.type === "bool"){
                        stmt += next_token.value;
                    } else {
                        stmt += next_token.type;
                    }
                    next_token = tokens.shift();
                }
                if(typeof(eval(stmt)) === "number") {
                    console.log("it's a number!" + eval(stmt));
                }
            } else {
                return {
                    type: "error",
                    message: "expecting assignment operator"
                }
            }

            var next_token = tokens.shift();



            economy_node.internal_rules.push({});
        } else {
            return {
                type: "error",
                message: "variable '" + variable_name + "' referenced but does not exist on this node"
            }
        }
    },
    create_source_rule: function (tokens) {

    },
    create_sink_rule: function (tokens) {

    },

    is_assignment_operator: function(operator){
      return ["=", "*=", "+=", "/=", "-="].indexOf(operator) !== -1;
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
};

$(document).ready(Evaluator.init());