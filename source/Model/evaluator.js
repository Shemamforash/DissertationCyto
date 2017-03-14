/**
 * Created by Sam on 15/02/2017.
 */

//http://lisperator.net/pltut/parser/token-stream
//http://eloquentjavascript.net/11_language.html

var consoleElements, Evaluator = {
    elements: {
        rule_types: ["INTERNAL", "SOURCE", "SINK"],
        keywords: ["if", "else", "then", "endif", "reset", "min", "max", "VAR", ";", ":", "(", ")"],
        conditional_operators: ["<", ">", "<=", ">=", "==", "!="],
        logical_operators: ["&&", "||", "!"],
        assignment_operators: ["*=", "+=", "-=", "/=", "^=", "++", "--", "="],
        mathematical_operators: ["+", "-", "*", "/", "%", "^"],
        input: "",
        button: {},
        original_variable_values: []
    },
    init: function () {
        consoleElements = Evaluator.elements;
    },
    tokenizer: function (input, economy_node) {
        var i, rules, validated_rules = [];
        consoleElements.original_variable_values = [];
        input.replace(/\r?\n|\r/, " ");
        rules = input.split(";");
        if (input.trim() === "") {
            return "Nothing Entered";
        }
        for (i = 0; i < rules.length; ++i) {
            if (/^\s+$/.test(rules[i]) || rules[i] === "") {
                continue;
            }
            rules[i] = rules[i].trim();
            var rule = {
                rule_text: rules[i]
            };
            rules[i] = rules[i].split(" ");
            var interpretation_result = Evaluator.interpret_rule(rules[i], economy_node);
            Evaluator.reset_variable_values();
            if (interpretation_result.message_type !== "error") {
                rule.code = interpretation_result.message;
                rule.rule_type = interpretation_result.rule_type;
                validated_rules.push(rule);
                console.log(interpretation_result);
                console.log(interpretation_result.message);
                console.log(eval(interpretation_result.message));
                // console.log(n.node_list["Node0"].variables["hello"].current_value);
            } else {
                return interpretation_result;
            }
        }
        environment.reset_variables();
        return Evaluator.wrap_message("success", validated_rules);
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
            return Evaluator.wrap_message("error", "if statements not terminated");
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
            return Evaluator.wrap_message("success", true);
        } else {
            return Evaluator.wrap_message("error", "unmatched brace pair");
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
                return Evaluator.wrap_message("error", "unknown token: " + tokens[i]);
            }
        }
        return Evaluator.tag_ifs(tokens);
    },
    interpret_rule: function (tokens, economy_node) {
        var variable_check_result
        var validation_result = Evaluator.validate_tokens(tokens);
        if (validation_result.message_type === "success") {
            if (tokens.length > 0) {
                var rule_type = tokens.shift().value;
                if (rule_type === "INTERNAL") {
                    var is_declaration = tokens[0].value === "VAR";
                    if (is_declaration) {
                        tokens.shift();
                        variable_check_result = Evaluator.check_variables(tokens, economy_node, true);
                        if (variable_check_result.message_type === "success") {
                            var rule = Evaluator.create_internal_variable(tokens, economy_node);
                            rule.rule_type = "INTERNAL VAR";
                            return rule;
                        } else {
                            return variable_check_result;
                        }
                    } else {
                        variable_check_result = Evaluator.check_variables(tokens, economy_node, false);
                        if (variable_check_result.message_type ==="success") {
                            var rule = Evaluator.create_rule(tokens, economy_node, "anything");
                            rule.rule_type = "INTERNAL";
                            return rule;
                        } else {
                            return variable_check_result;
                        }
                    }
                } else if (rule_type === "SOURCE" || rule_type === "SINK") {
                    variable_check_result = Evaluator.check_variables(tokens, economy_node, false);
                    if (variable_check_result.message_type === "success") {
                        var variable = tokens.shift();
                        if (variable.type === "resource variable") {
                            if (tokens.shift().value == ":") {
                                var rule = Evaluator.create_rule(tokens, economy_node, "number");
                                if(rule.message_type === "error"){
                                    return rule;
                                }
                                rule.rule_type = rule_type;
                                if (rule_type === "SOURCE") {
                                    rule.message = variable.value + ".increment(" + rule.message + ");";
                                    return rule;
                                } else {
                                    rule.message = variable.value + ".decrement(" + rule.message + ");";
                                    return rule;
                                }
                            } else {
                                return Evaluator.wrap_message("error", "source and sink rules must be of the form 'SOURCE resource_name : statement");
                            }
                        } else {
                            return Evaluator.wrap_message("error", rule_type + " requires a valid resource type to be specified, you said " + variable.type + " " + variable.value);
                        }


                    } else {
                        return variable_check_result;
                    }
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
                var variable_reference;
                if (economy_node.variables.hasOwnProperty(tokens[i].value)) {
                    tokens[i].type = "internal variables";
                    internal_variable = economy_node.variables[tokens[i].value];
                    variable_reference = "n.node_list['" + economy_node.id() + "'].variables['" + internal_variable.name + "'].current_value = " + internal_variable.current_value;
                    tokens[i].value = "n.node_list['" + economy_node.id() + "'].variables['" + internal_variable.name + "'].current_value";
                    tokens[i].temp_value = eval(tokens[i].value);
                } else {
                    tokens[i].type = "resource variable";
                    resource = environment.create_resource(tokens[i].value);
                    variable_reference = "environment.create_resource('" + resource.name + "')";
                    tokens[i].value = "environment.create_resource('" + resource.name + "')";
                    tokens[i].temp_value = eval(tokens[i].value);
                }
                consoleElements.original_variable_values.push(variable_reference);
            }
            ignore_first = false;
        }
        return Evaluator.wrap_message("success", "");
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
    parse_if: function (tokens, current_if_depth, economy_node, expected_type) {
        var conditional_stmt = [], then_stmt = [], else_stmt = [];
        var stmts = [conditional_stmt, then_stmt, else_stmt];
        var stmt_iterator = 0;
        var final_stmt = "";
        var next_token = tokens.shift();
        var include_token;
        var if_type = undefined;
        while (next_token !== undefined) {
            include_token = true;

            if (next_token.value === "then" && next_token.tag === current_if_depth) {
                var parse_result = Evaluator.parse_statement(conditional_stmt, economy_node);
                if (parse_result.message_type === "error") {
                    return parse_result;
                } else {
                    var parsed_conditional = parse_result.message;
                    var block_type = typeof (eval(parsed_conditional));
                    if (block_type === "boolean") {
                        final_stmt += parsed_conditional + " ? ";
                    } else {
                        return Evaluator.wrap_message("error", "if conditional block does not evaluate to boolean " + parsed_conditional);
                    }
                    ++stmt_iterator;
                    include_token = false;
                }
            }
            else if (next_token.value === "else" && next_token.tag === current_if_depth) {
                var parse_result = Evaluator.parse_statement(then_stmt, economy_node, expected_type);
                if (parse_result.message_type === "error") {
                    return parse_result;
                } else {
                    var parsed_then = parse_result.message;
                    var block_type = typeof (eval(parsed_then));
                    if_type = block_type;
                    if (block_type === "number" || block_type === "boolean" || block_type === "undefined") {
                        final_stmt += parsed_then + " : ";
                    } else {
                        return Evaluator.wrap_message("error", "then statement block does not evaluate to desired type (number, boolean, none) " + parsed_then);
                    }
                    ++stmt_iterator;
                    include_token = false;
                }
            }
            else if (next_token.value === "endif" && next_token.tag === current_if_depth) {
                var parse_result = Evaluator.parse_statement(else_stmt, economy_node, expected_type);
                if (parse_result.message_type === "error") {
                    return parse_result;
                } else {
                    var parsed_else = parse_result.message;
                    var block_type = typeof (eval(parsed_else));
                    if (block_type !== if_type) {
                        return Evaluator.wrap_message("error", "if blocks do not have the same return value type");
                    }
                    if (block_type === "number" || block_type === "boolean" || block_type === "undefined") {
                        final_stmt += parsed_else;
                    } else {
                        return Evaluator.wrap_message("error", "else statement block does not evaluate to desired type (number, boolean, none) " + parsed_else);
                    }
                    break;
                }
            }
            if (include_token) {
                stmts[stmt_iterator].push(next_token);
            }
            next_token = tokens.shift();
        }
        return Evaluator.wrap_message("success", {
            stmt: "(" + final_stmt + ")",
            tokens: tokens,
            if_type: if_type
        });
    },
    wrap_message: function (type, message) {
        return {
            message_type: type,
            message: message
        }
    },
    parse_statement: function (tokens, economy_node, expected_type) {
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
                result = Evaluator.parse_if(tokens, next_token.tag, economy_node, expected_type);
                if (result.message_type === "error") {
                    return result;
                }
                tokens = result.message.tokens;
                var if_type = result.message.if_type;
                if (if_type === expected_type || expected_type === "anything") {
                    final_stmt += result.message.stmt;
                } else {
                    return Evaluator.wrap_message("error", "if statement returns incompatible type with outer statement, saw: " + if_type + " expected: " + expected_type);
                }
            } else {
                final_stmt += next_token.value;
            }
            // else if (next_token.type === "logical_operator") {
            //     type_check_result = check_type("boolean", "332 incompatible operator with current statement type, should be a ", next_token.value);
            //     if (type_check_result !== true) {
            //         return type_check_result;
            //     }
            // } else if (next_token.type === "mathematical_operator" || next_token.type === "conditional_operator") {
            //     type_check_result = check_type("number", "337 incompatible operator with current statement type, should be a ", next_token.value);
            //     if (type_check_result !== true) {
            //         return type_check_result;
            //     }
            // } else if (next_token.type === "boolean") {
            //     type_check_result = check_type("boolean", "342 incompatible value with current statement type, should be a ", next_token.value);
            //     if (type_check_result !== true) {
            //         return type_check_result;
            //     }
            // } else if (next_token.type === "number") {
            //     type_check_result = check_type("number", "347 incompatible value with current statement type, should be a ", next_token.value);
            //     if (type_check_result !== true) {
            //         return type_check_result;
            //     }
            // } else if (next_token.type === "variable") {
            //     var variable_type = typeof(eval(next_token.value));
            //     type_check_result = check_type(variable_type, "this variable is of type " + variable_type + " and should be of type ", next_token.value);
            //     if (type_check_result !== true) {
            //         return type_check_result;
            //     }
            // }
            // function check_type(substatement_type, message, value) {
            //     // if (current_type === "") {
            //     //     current_type = substatement_type;
            //     final_stmt += value;
            //     // } else if (current_type === substatement_type) {
            //     //     final_stmt += value;
            //     // } else {
            //     //     return message + substatement_type;
            //     // }
            //     return true;
            // }

            next_token = tokens.shift();
        }
        // console.log(final_stmt);
        return Evaluator.wrap_message("success", final_stmt);
    },
    reset_variable_values: function () {
        for (var i = 0; i < consoleElements.original_variable_values.length; ++i) {
            eval(consoleElements.original_variable_values[i]);
        }
    },
    create_internal_variable: function (tokens, economy_node) {
        var variable_name = tokens.shift().value;
        for (var i = 0; i < economy_node.variables.length; ++i) {
            if (economy_node.variables[i].name === variable_name) {
                return Evaluator.wrap_message("error", "variable '" + variable_name + "' already exists on this node");
            }
        }
        if (tokens.shift().value !== "=") {
            return Evaluator.wrap_message("error", "initial value assignment syntax error");
        }
        var initial_value = tokens.shift();
        if (initial_value.type !== ("number" || "bool")) {
            return Evaluator.wrap_message("error", "declared variable must be boolean or number");
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
                    return Evaluator.wrap_message("error", "min value assignment syntax error");
                }
            }
            else if (tokens[i].type === "max") {
                if (check_valid_assignment(i)) {
                    max_value = tokens[i + 2].value;
                } else {
                    return Evaluator.wrap_message("error", "max value assignment syntax error");
                }

            } else if (tokens[i].type === "reset") {
                if (check_valid_assignment(i)) {
                    reset_value = tokens[i + 2].value;
                } else {
                    return Evaluator.wrap_message("error", "reset value assignment syntax error");
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

        return Evaluator.wrap_message("success", "");

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
    create_rule: function (tokens, economy_node, type) {
        var result = Evaluator.parse_statement(tokens, economy_node, type);
        if (result.message_type === "error") {
            return result;
        }
        return Evaluator.wrap_message("success", result.message);
    }
};

$(document).ready(Evaluator.init());