/**
 * Created by Sam on 15/02/2017.
 */

//http://lisperator.net/pltut/parser/token-stream
//http://eloquentjavascript.net/11_language.html

var consoleElements, Evaluator = {
    elements: {
        rule_types: ["INTERNAL", "SOURCE", "SINK"],
        keywords: ["if", "else", "then", "endif", "reset", "min", "max", "VAR", ";", "(", ")"],
        conditional_operators: ["<", ">", "<=", ">=", "==", "!="],
        logical_operators: ["&&", "||", "!"],
        assignment_operators: ["*=", "+=", "-=", "/=", "^=", "++", "--"],
        mathematical_operators: ["+", "-", "*", "/", "=", "%", "^"],
        input: "",
        button: {}
    },
    init: function () {
        consoleElements = Evaluator.elements;
    },
    tokenizer: function (input, economy_node) {
        var i, rules;
        input.replace(/\r?\n|\r/, " ");
        rules = input.split(";");
        if (input.trim() === "") {
            return "Nothing Entered";
        }
        for (i = 0; i < rules.length; ++i) {
            console.log(rules[i]);
            if (/^\s+$/.test(rules[i]) || rules[i] === "") {
                continue;
            }
            rules[i] = rules[i].trim();
            rules[i] = rules[i].split(" ");
            var interpretation_result = Evaluator.interpret_rule(rules[i], economy_node);
            if (interpretation_result !== true) {
                console.log("interpretation failed " + interpretation_result);
                return interpretation_result;
            }
        }
    },
    print_tokens: function (tokens) {
        for (var i = 0; i < tokens.length; ++i) {
            console.log(tokens[i]);
        }
    },
    tag_ifs: function (tokens) {
        var if_counter = 0, then_counter = 0, else_counter = 0, i;
        var current_token;
        for (i = 0; i < tokens.length; ++i) {
            current_token = tokens[i];
            if (current_token.value === "if") {
                ++if_counter;
                ++then_counter;
                ++else_counter;
                current_token.tag = if_counter;
            } else if (current_token.value === "then") {
                current_token.tag = then_counter;
            } else if (current_token.value === "else") {
                current_token.tag = else_counter;
            } else if (current_token.value === "endif") {
                current_token.tag = if_counter;
                --if_counter;
                --then_counter;
                --else_counter;
            }
        }
        if (if_counter === 0
            && then_counter === 0
            && else_counter === 0) {
            return Evaluator.tag_braces(tokens);
        } else {
            return "if statements not terminated";
        }
    },
    tag_braces: function (tokens) {
        var brace_counter = 0;
        var current_token = {};
        var i;
        for (i = 0; i < tokens.length; ++i) {
            current_token = tokens[i];
            if (current_token.value === "(") {
                current_token.tag = brace_counter;
                ++brace_counter;
            } else if (current_token.value === ")") {
                --brace_counter;
                current_token.tag = brace_counter;
            }
        }
        if (brace_counter === 0) {
            return true;
        } else {
            return "unmatched brace pair";
        }
    },
    validate_tokens: function (tokens) {
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
                return "unknown token: " + tokens[i];
            }
        }
        return Evaluator.tag_ifs(tokens);
    },
    interpret_rule: function (tokens, economy_node) {
        var variable_check_result
        var validation_result = Evaluator.validate_tokens(tokens);
        if (validation_result === true) {
            if (tokens.length > 0) {
                var rule_type = tokens.shift().value;
                if (rule_type === "INTERNAL") {
                    var is_declaration = tokens[0].value === "VAR";
                    if (is_declaration) {
                        tokens.shift();
                        variable_check_result = Evaluator.check_variables(tokens, economy_node, true);
                        if (variable_check_result === true) {
                            return Evaluator.create_internal_variable(tokens, economy_node);
                        } else {
                            return variable_check_result;
                        }
                    } else {
                        variable_check_result = Evaluator.check_variables(tokens, economy_node, false);
                        if (variable_check_result === true) {
                            return Evaluator.create_internal_rule(tokens, economy_node);
                        } else {
                            return variable_check_result;
                        }
                    }
                } else if (rule_type === "SOURCE") {
                    variable_check_result = Evaluator.check_variables(tokens, economy_node, false);
                    if (variable_check_result === true) {
                        return Evaluator.create_source_rule(tokens, economy_node);
                    } else {
                        return variable_check_result;
                    }
                } else if (rule_type === "SINK") {
                    variable_check_result = Evaluator.check_variables(tokens, economy_node, false);
                    if (variable_check_result === true) {
                        return Evaluator.create_sink_rule(tokens, economy_node);
                    } else {
                        return variable_check_result;
                    }
                } else {
                    return "not a valid rule format";
                }
            }
        } else {
            return validation_result;
        }
    },
    check_variables: function (tokens, economy_node, ignore_first) {
        var internal_variable, resource, i;
        for (i = 0; i < tokens.length; ++i) {
            if (tokens[i].type === "variable" && !ignore_first) {
                if (economy_node.variables.hasOwnProperty(tokens[i].value)) {
                    internal_variable = economy_node.variables[tokens[i].value];
                    tokens[i].value = "n.node_list['" + economy_node.id() + "'].variables['" + internal_variable.name + "'].current_value";
                } else if (environment.attributes.resources.hasOwnProperty(tokens[i].value)) {
                    resource = environment.attributes.resources[tokens[i].value];
                    tokens[i].value = "environment.attributes.resources['" + resource.name + "']";
                } else {
                    return "variable " + tokens[i].value + " does not exist";
                }
            }
            ignore_first = false;
        }
        return true;
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
            if (token === "^=") {
                token = "**=";
            }
            return Evaluator.wrap_token("assignment_operator", token);
        }
    },
    is_mathematical_operator: function (token) {
        if (consoleElements.mathematical_operators.indexOf(token) === -1) {
            return false;
        } else {
            if (token === "^") {
                token = "**";
            }
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
    parse_if: function (tokens, current_if_depth, economy_node) {
        var conditional_stmt = [], then_stmt = [], else_stmt = [];
        var stmts = [conditional_stmt, then_stmt, else_stmt];
        var stmt_iterator = 0;
        var final_stmt = "";
        var next_token = tokens.shift();
        var include_token;
        while (next_token !== undefined) {
            include_token = true;
            if (next_token.value === "then" && next_token.tag === current_if_depth) {
                var parsed_conditional = Evaluator.parse_statement(conditional_stmt, economy_node);
                console.log(parsed_conditional);
                if (typeof (eval(parsed_conditional)) === "boolean") {
                    final_stmt += parsed_conditional + " ? ";
                }
                ++stmt_iterator;
                include_token = false;
            } else if (next_token.value === "else" && next_token.tag === current_if_depth) {
                var parsed_then = Evaluator.parse_statement(then_stmt, economy_node);
                if (typeof (eval(parsed_then)) === "number" || typeof (eval(parsed_then)) === "boolean") {
                    final_stmt += parsed_then;
                }
                final_stmt += " : ";
                ++stmt_iterator;
                include_token = false;
            } else if (next_token.value === "endif" && next_token.tag === current_if_depth) {
                var parsed_else = Evaluator.parse_statement(else_stmt, economy_node);
                console.log(parsed_else);
                if (typeof (eval(parsed_else)) === "number" || typeof (eval(parsed_else)) === "boolean") {
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
            stmt: "(" + final_stmt + ")",
            tokens: tokens
        };
    },
    parse_statement: function (tokens, economy_node) {
        var next_token = tokens.shift();
        var final_stmt = "";
        var result;
        var current_type = "";
        var type_check_result;
        while (next_token !== undefined) {
            if (next_token.value === "(" || next_token.value === ")") {
                final_stmt += next_token.value;
            }
            else if (next_token.value === "if") {
                result = Evaluator.parse_if(tokens, next_token.tag, economy_node);
                tokens = result.tokens;
                var if_type = typeof (eval(result.stmt));
                if (current_type === "") {
                    current_type = if_type;
                    final_stmt += result.stmt;
                } else if (if_type === current_type) {
                    final_stmt += result.stmt;
                } else {
                    return "if statement returns incompatible type with outer statement";
                }
            } else if (next_token.type === "conditional_operator" || next_token.type === "logical_operator") {
                type_check_result = check_type("boolean", "332 incompatible operator with current statement type, should be a ", next_token.value);
                if (type_check_result !== true) {
                    return type_check_result;
                }
            } else if (next_token.type === "mathematical_operator") {
                type_check_result = check_type("number", "337 incompatible operator with current statement type, should be a ", next_token.value);
                if (type_check_result !== true) {
                    return type_check_result;
                }
            } else if (next_token.type === "boolean") {
                type_check_result = check_type("boolean", "342 incompatible value with current statement type, should be a ", next_token.value);
                if (type_check_result !== true) {
                    return type_check_result;
                }
            } else if (next_token.type === "number") {
                type_check_result = check_type("number", "347 incompatible value with current statement type, should be a ", next_token.value);
                console.log(type_check_result);
                if (type_check_result !== true) {
                    return type_check_result;
                }
            } else if (next_token.type === "variable") {
                var variable_type = eval(next_token.value);
                type_check_result = check_type(variable_type, "this variable is of type " + variable_type + " and should be of type ", next_token.value);
                if (type_check_result !== true) {
                    return type_check_result;
                }
            }
            function check_type(substatement_type, message, value) {
                if (current_type === "") {
                    current_type = substatement_type;
                    final_stmt += value;
                } else if (current_type === substatement_type) {
                    final_stmt += value;
                } else {
                    return message + substatement_type;
                }
                return true;
            }

            console.log(next_token);
            next_token = tokens.shift();
        }
        console.log(final_stmt);
        return final_stmt;
    },
    create_internal_variable: function (tokens, economy_node) {
        var variable_name = tokens.shift().value;
        for (var i = 0; i < economy_node.variables.length; ++i) {
            if (economy_node.variables[i].name === variable_name) {
                return "variable '" + variable_name + "' already exists on this node";
            }
        }
        if (tokens.shift().value !== "=") {
            return "initial value assignment syntax error";
        }
        var initial_value = tokens.shift();
        if (initial_value.type !== ("number" || "bool")) {
            return "declared variable must be boolean or number";
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
                    return "min value assignment syntax error";
                }
            }
            else if (tokens[i].type === "max") {
                if (check_valid_assignment(i)) {
                    max_value = tokens[i + 2].value;
                } else {
                    return "max value assignment syntax error";
                }

            } else if (tokens[i].type === "reset") {
                if (check_valid_assignment(i)) {
                    reset_value = tokens[i + 2].value;
                } else {
                    return "reset value assignment syntax error";
                }
            }
        }

        var new_variable = {
            name: variable_name,
            current_value: initial_value,
            initial_value: initial_value,
            max_value: max_value,
            min_value: min_value,
            reset_value: reset_value
        };

        economy_node.variables[variable_name] = new_variable;

        return true;

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
        // if (economy_node.variables.hasOwnProperty(variable_name)) {
        //     variable_exists = true;
        // }
        // if (variable_exists) {
        var stmt = variable_name;
        var operator = tokens.shift();
        if (operator.type === "assignment_operator") {
            // var next_token = tokens.shift();
            stmt += " " + operator.value;
            var result = Evaluator.parse_statement(tokens, economy_node);
            stmt += " " + result;
            console.log(stmt);
            console.log(eval(stmt));
        } else {
            return "expecting assignment operator";
        }

        var next_token = tokens.shift();


        // economy_node.internal_rules.push({});
        // } else {
        //     return "variable '" + variable_name + "' referenced but does not exist on this node";
        // }
        // return "successfully initialised new variable";
        return true;
    },
    create_source_rule: function (tokens) {

    },
    create_sink_rule: function (tokens) {

    }
};

$(document).ready(Evaluator.init());