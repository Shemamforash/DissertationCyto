/**
 * Created by Sam on 15/02/2017.
 */

//http://lisperator.net/pltut/parser/token-stream
//http://eloquentjavascript.net/11_language.html

var consoleElements, Evaluator = {
    elements: {
        rule_types: ["INTERNAL", "SOURCE", "SINK"],
        keywords: ["if", "else", "then", "endif", "reset", "min", "max", "VAR", ";"],
        conditional_operators: ["<", ">", "<=", ">=", "==", "!="],
        logical_operators: ["&&", "||", "!"],
        assignment_operators: ["*=", "+=", "-=", "/=", "^=", "++", "--"],
        mathematical_operators: ["+", "-", "*", "/", "=", "%", "^"],
        input: "",
        button: {}
    },
    init: function () {
        consoleElements = Evaluator.elements;
        Evaluator.tokenizer("INTERNAL damage *= if true then 6 else 2 endif ;", {variables: [{name: "damage"}], internal_rules: []}); //REGULAR IF
        Evaluator.tokenizer("INTERNAL damage *= if true then if true then 5 else 6 endif else 2 endif ;", {variables: [{name: "damage"}], internal_rules: []}); //NESTED IF
        Evaluator.tokenizer("INTERNAL damage *= if false then 6 else if false then 4 else if true then 2 else 4 endif endif endif ;", {variables: [{name: "damage"}], internal_rules: []}); //SEQUENTIAL IF
        Evaluator.tokenizer("INTERNAL damage *= if true then if false then 5 else if true then 6 else 3 endif endif else 2 endif ;", {variables: [{name: "damage"}], internal_rules: []}); //NESTED IF
    },
    bind: function () {

    },
    tokenizer: function (input, economy_node) {
        input.replace(/\r?\n|\r/, " ");
        var rules = input.split(";");
        for (var i = 0; i < rules.length; ++i) {
            console.log(rules[i]);
            if (/^\s+$/.test(rules[i]) || rules[i] === "") {
                continue;
            }
            rules[i] = rules[i].trim();
            rules[i] = rules[i].split(" ");
            Evaluator.interpret_rule(rules[i], economy_node);
        }
    },
    print_tokens: function (tokens) {
        for (var i = 0; i < tokens.length; ++i) {
            console.log(tokens[i]);
        }
    },
    interpret_rule: function (tokens, economy_node) {
        for (var i = 0; i < tokens.length; ++i) {
            var checked_token = {};
            if ((checked_token = Evaluator.is_conditional_operator(tokens[i])) !== false) {
                tokens[i] = checked_token;
            } else if ((checked_token = Evaluator.is_logical_operator(tokens[i])) !== false) {
                tokens[i] = checked_token;
            } else if ((checked_token = Evaluator.is_assignment_operator(tokens[i])) !== false) {
                tokens[i] = checked_token;
            } else if ((checked_token = Evaluator.is_mathematical_operator(tokens[i])) !== false) {
                tokens[i] = checked_token;
            } else if ((checked_token = Evaluator.is_keyword(tokens[i])) !== false) {
                tokens[i] = checked_token;
            } else if ((checked_token = Evaluator.is_rule_type(tokens[i])) !== false) {
                tokens[i] = checked_token;
            } else if ((checked_token = Evaluator.is_bool(tokens[i])) !== false) {
                tokens[i] = checked_token;
            } else if ((checked_token = Evaluator.is_num(tokens[i])) !== false) {
                tokens[i] = checked_token;
            } else if ((checked_token = Evaluator.is_variable(tokens[i])) !== false) {
                tokens[i] = checked_token;
            } else {
                console.log("unknown token: " + tokens[i]);
            }

        }
        var rule_type = tokens.shift().value;
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
    },
    wrap_token: function (type, value) {
        return {
            type: type,
            value: value
        }
    },
    is_conditional_operator: function (token) {
        if (consoleElements.conditional_operators.indexOf(token) === -1) {
            return false;
        } else {
            return Evaluator.wrap_token("conditional_operator", token);
        }
    },
    is_logical_operator: function (token) {
        if (consoleElements.logical_operators.indexOf(token) === -1) {
            return false;
        } else {
            return Evaluator.wrap_token("logical_operator", token);
        }
    },
    is_assignment_operator: function (token) {
        if (consoleElements.assignment_operators.indexOf(token) === -1) {
            return false;
        } else {
            return Evaluator.wrap_token("assignment_operator", token);
        }
    },
    is_mathematical_operator: function (token) {
        if (consoleElements.mathematical_operators.indexOf(token) === -1) {
            return false;
        } else {
            return Evaluator.wrap_token("mathematical_operator", token);
        }
    },
    is_keyword: function (token) {
        if (consoleElements.keywords.indexOf(token) === -1) {
            return false;
        } else {
            return Evaluator.wrap_token("keyword", token);
        }
    },
    is_rule_type: function (token) {
        if (consoleElements.rule_types.indexOf(token) === -1) {
            return false;
        } else {
            return Evaluator.wrap_token("rule_type", token);
        }
    },
    is_bool: function (token) {
        var value;
        if (token === "true" || token === "false") {
            value = token === "true";
            return Evaluator.wrap_token("boolean", value);
        }
        return false;
    },
    is_num: function (token) {
        if (/(^[0-9]+)|([0-9]+\.[0-9]+)/.test(token)) {
            return Evaluator.wrap_token("number", parseFloat(token));
        }
        return false;
    },
    is_variable: function (token) {
        if (/^[a-z_]+$/i.test(token)) {
            return {
                type: "variable",
                value: token
            }
        } else {
            return false;
        }
    },
    parse_if: function (tokens, depth) {
        var conditional_stmt = [];
        var then_stmt = [];
        var else_stmt = [];
        var stmts = [conditional_stmt, then_stmt, else_stmt];
        var stmt_iterator = 0;
        var final_stmt = "";
        var next_token = tokens.shift();
        while (next_token !== undefined) {
            var include_token = true;
            if (next_token.value === "if") {
                var result = Evaluator.parse_if(tokens, depth + 1);
                final_stmt += result.stmt;
                // console.log("d1: " + result.stmt);
                tokens = result.tokens;
            }
            if (next_token.value === "then") {
                // console.log("conds ");
                // Evaluator.print_tokens(conditional_stmt);
                var parsed_conditional = Evaluator.parse_statement(conditional_stmt);
                if (typeof (eval(parsed_conditional)) === "boolean") {
                    final_stmt += parsed_conditional + " ? ";
                }
                ++stmt_iterator;
                include_token = false;
            } else if (next_token.value === "else") {
                // console.log("then " + depth);
                // Evaluator.print_tokens(then_stmt);
                var parsed_then = Evaluator.parse_statement(then_stmt);
                if (typeof (eval(parsed_then)) === "number") {
                    final_stmt += parsed_then;
                }
                final_stmt += " : ";
                ++stmt_iterator;
                include_token = false;
            } else if (next_token.value === "endif") {
                // Evaluator.print_tokens(else_stmt);
                var parsed_else = Evaluator.parse_statement(else_stmt);
                if (typeof (eval(parsed_else)) === "number") {
                    final_stmt += parsed_else;
                }
                break;
            }
            if (include_token) {
                stmts[stmt_iterator].push(next_token);
            }
            next_token = tokens.shift();
        }
        return {
            stmt: final_stmt,
            tokens: tokens
        };
    },
    parse_statement: function (tokens) {
        var next_token = tokens.shift();
        var final_stmt = "";
        while (next_token !== undefined) {
            if (next_token.value === "if") {
                var result = Evaluator.parse_if(tokens, 0)
                tokens = result.tokens;
                final_stmt += result.stmt;
            }
            if (next_token.type === "number") {
                if (tokens.length > 1) {
                    if (tokens[1].type === "conditional_operator") {
                        Evaluator.parse_conditional(tokens);
                    }
                }
                return next_token.value;
            } else if (next_token.type === "boolean") {
                return next_token.value;
            }
            next_token = tokens.shift();
            return final_stmt;
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
    }
    ,
    create_internal_rule: function (tokens, economy_node) {
        var variable_name = tokens.shift().value;
        var variable_exists = false;
        //check for variable existence;
        for (var i = 0; i < economy_node.variables.length; ++i) {
            if (economy_node.variables[i].name === variable_name) {
                variable_exists = true;
            }
        }
        if (variable_exists) {
            var stmt = "";
            var operator = tokens.shift();
            if (operator.type === "assignment_operator") {
                // var next_token = tokens.shift();
                var result = Evaluator.parse_statement(tokens);
                console.log(result);
                console.log(eval(result));
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
};

$(document).ready(Evaluator.init());