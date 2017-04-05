/**
 * Created by Sam on 15/02/2017.
 */

//http://lisperator.net/pltut/parser/token-stream
//http://eloquentjavascript.net/11_language.html

var Evaluator = (function () {
    var elements = {
        rule_types: ["INTERNAL", "SOURCE", "SINK"],
        keywords: ["if", "else", "then", "endif", "reset", "min", "max", "VAR", ";", ":", "(", ")", "random", ",", "//"],
        conditional_operators: ["<", ">", "<=", ">=", "===", "!="],
        logical_operators: ["&&", "||", "!"],
        assignment_operators: ["*=", "+=", "-=", "/=", "^=", "++", "--", "="],
        mathematical_operators: ["+", "-", "*", "/", "%", "^"],
        input: "",
        button: {},
        original_variable_values: []
    };
    function tag_ifs(tokens) {
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
            return tag_braces(tokens);
        } else {
            return wrap_message("error", "if statements not terminated");
        }
    };
    function tag_braces(tokens) {
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
            return wrap_message("success", true);
        } else {
            return wrap_message("error", "unmatched brace pair");
        }
    };
    function validate_tokens(tokens) {
        for (var i = 0; i < tokens.length; ++i) {
            var checked_token = {};
            if ((checked_token = is_conditional_operator(tokens[i])) !== false) {
                tokens[i] = checked_token;
            } else if ((checked_token = is_logical_operator(tokens[i])) !== false) {
                tokens[i] = checked_token;
            } else if ((checked_token = is_assignment_operator(tokens[i])) !== false) {
                tokens[i] = checked_token;
            } else if ((checked_token = is_mathematical_operator(tokens[i])) !== false) {
                tokens[i] = checked_token;
            } else if ((checked_token = is_keyword(tokens[i])) !== false) {
                tokens[i] = checked_token;
            } else if ((checked_token = is_rule_type(tokens[i])) !== false) {
                tokens[i] = checked_token;
            } else if ((checked_token = is_bool(tokens[i])) !== false) {
                tokens[i] = checked_token;
            } else if ((checked_token = is_num(tokens[i])) !== false) {
                tokens[i] = checked_token;
            } else if ((checked_token = is_variable(tokens[i])) !== false) {
                tokens[i] = checked_token;
            } else {
                return wrap_message("error", "unknown token: " + tokens[i]);
            }
        }
        for (var i = 0; i < tokens.length; ++i) {
            if (tokens[i].value === "random") {
                if (i + 5 < tokens.length &&
                    tokens[i + 1].value === "(" &&
                    tokens[i + 2].type === "number" &&
                    tokens[i + 3].value === ":" &&
                    tokens[i + 4].type === "number" &&
                    tokens[i + 5].value === ")") {
                    var lower_bound = tokens[i + 2].value;
                    var upper_bound = tokens[i + 4].value;
                    var range = Math.abs(upper_bound - lower_bound);
                    tokens.splice(i + 1, 5);
                    tokens[i].value = "Math.floor(Math.random() * " + range + " + " + lower_bound + ")";
                    tokens[i].type = "number";
                } else {
                    return wrap_message("error", "random integer not correctly formatted should be random ( num : num )");
                }
            }
        }

        return tag_ifs(tokens);
    };
    function interpret_rule(tokens, economy_node) {
        var variable_check_result
        var validation_result = validate_tokens(tokens);
        if (validation_result.message_type === "success") {
            if (tokens.length > 0) {
                var rule_type = tokens.shift().value;
                if (rule_type === "INTERNAL") {
                    var is_declaration = tokens[0].value === "VAR";
                    if (is_declaration) {
                        tokens.shift();
                        variable_check_result = check_variables(tokens, economy_node, true);
                        if (variable_check_result.message_type === "success") {
                            var rule = create_internal_variable(tokens, economy_node);
                            rule.rule_type = "INTERNAL VAR";
                            return rule;
                        } else {
                            return variable_check_result;
                        }
                    } else {
                        variable_check_result = check_variables(tokens, economy_node, false);
                        if (variable_check_result.message_type === "success") {
                            var rule = create_rule(tokens, economy_node, "anything");
                            rule.rule_type = "INTERNAL";
                            return rule;
                        } else {
                            return variable_check_result;
                        }
                    }
                } else if (rule_type === "SOURCE" || rule_type === "SINK") {
                    variable_check_result = check_variables(tokens, economy_node, false);
                    if (variable_check_result.message_type === "success") {
                        var layer = tokens.shift();
                        if (layer.type === "number") {
                            layer = layer.value;
                            var variable = tokens.shift();
                            if (variable.type === "resource variable") {
                                if (tokens.shift().value == ":") {
                                    var rule = create_rule(tokens, economy_node, "number", layer);
                                    if (rule.message_type === "error") {
                                        return rule;
                                    }
                                    rule.rule_type = rule_type;
                                    if (rule_type === "SOURCE") {
                                        console.log(rule.message);
                                        rule.message = variable.value + ".increment(" + rule.message + ");";
                                        rule.layer = layer;
                                        return rule;
                                    } else {
                                        rule.message = variable.value + ".decrement(" + rule.message + ");";
                                        rule.layer = layer;
                                        return rule;
                                    }
                                } else {
                                    return wrap_message("error", "source and sink rules must be of the form 'SOURCE resource_name : statement");
                                }
                            } else {
                                return wrap_message("error", rule_type + " requires a valid resource type to be specified, you said " + variable.type + " " + variable.value);
                            }
                        } else {
                            return wrap_message("error", "source and sink rules must have a numeric layer specified");
                        }


                    } else {
                        return variable_check_result;
                    }
                }
            }
        } else {
            return validation_result;
        }
    };
    function check_variables(tokens, economy_node, ignore_first) {
        var internal_variable, resource, i;
        for (i = 0; i < tokens.length; ++i) {
            if (tokens[i].type === "variable" && !ignore_first) {
                var variable_reference;
                if (economy_node.variables.hasOwnProperty(tokens[i].value)) {
                    tokens[i].type = "internal variables";
                    internal_variable = economy_node.variables[tokens[i].value];
                    variable_reference = "Graph.get_nodes()['" + economy_node.id() + "'].variables['" + internal_variable.name + "'].current_value = " + internal_variable.current_value;
                    tokens[i].value = "Graph.get_nodes()['" + economy_node.id() + "'].variables['" + internal_variable.name + "'].current_value";
                    tokens[i].temp_value = eval(tokens[i].value);
                } else {
                    tokens[i].type = "resource variable";
                    resource = Graph.create_resource(tokens[i].value, economy_node);
                    variable_reference = "Graph.create_resource('" + resource.name + "', " + "Graph.get_nodes()['" + economy_node.id() + "'])";
                    tokens[i].value = "Graph.create_resource('" + resource.name + "', " + "Graph.get_nodes()['" + economy_node.id() + "'])";
                    tokens[i].temp_value = eval(tokens[i].value);
                }
                elements.original_variable_values.push(variable_reference);
            }
            ignore_first = false;
        }
        return wrap_message("success", "");
    };
    function wrap_token(type, value) {
        return {
            type: type,
            value: value
        }
    };
    function is_conditional_operator(token) {
        token = token === "==" ? "===" : token;
        if (elements.conditional_operators.indexOf(token) === -1) {
            return false;
        } else {
            return wrap_token("conditional_operator", token);
        }
    };
    function is_logical_operator(token) {
        if (elements.logical_operators.indexOf(token) === -1) {
            return false;
        } else {
            return wrap_token("logical_operator", token);
        }
    };
    function is_assignment_operator(token) {
        if (elements.assignment_operators.indexOf(token) === -1) {
            return false;
        } else {
            if (token === "^=") {
                token = "**=";
            }
            return wrap_token("assignment_operator", token);
        }
    };
    function is_mathematical_operator(token) {
        if (elements.mathematical_operators.indexOf(token) === -1) {
            return false;
        } else {
            if (token === "^") {
                token = "**";
            }
            return wrap_token("mathematical_operator", token);
        }
    };
    function is_keyword(token) {
        if (elements.keywords.indexOf(token) === -1) {
            return false;
        } else {
            return wrap_token("keyword", token);
        }
    };
    function is_rule_type(token) {
        if (elements.rule_types.indexOf(token) === -1) {
            return false;
        } else {
            return wrap_token("rule_type", token);
        }
    };
    function is_bool(token) {
        var value;
        if (token === "true" || token === "false") {
            value = token === "true";
            return wrap_token("boolean", value);
        }
        return false;
    };
    function is_num(token) {
        if (/(^[0-9]+)|([0-9]+\.[0-9]+)/.test(token)) {
            return wrap_token("number", parseFloat(token));
        }
        return false;
    };
    function is_variable(token) {
        if (/^[a-z_]+$/i.test(token)) {
            return {
                type: "variable",
                value: token
            }
        } else {
            return false;
        }
    };
    function parse_if(tokens, current_if_depth, economy_node, expected_type) {
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
                var parse_result = parse_statement(conditional_stmt, economy_node);
                if (parse_result.message_type === "error") {
                    return parse_result;
                } else {
                    var parsed_conditional = parse_result.message;
                    console.log(parsed_conditional);
                    var block_type = typeof (eval(parsed_conditional));
                    if (block_type === "boolean") {
                        final_stmt += parsed_conditional + " ? ";
                    } else {
                        return wrap_message("error", "if conditional block does not evaluate to boolean " + parsed_conditional);
                    }
                    ++stmt_iterator;
                    include_token = false;
                }
            }
            else if (next_token.value === "else" && next_token.tag === current_if_depth) {
                var parse_result = parse_statement(then_stmt, economy_node, expected_type);
                if (parse_result.message_type === "error") {
                    return parse_result;
                } else {
                    var parsed_then = parse_result.message;
                    var block_type = typeof (eval(parsed_then));
                    if (block_type === "object") {
                        block_type = "number";
                    }
                    if_type = block_type;
                    if (block_type === "number" || block_type === "boolean" || block_type === "undefined") {
                        final_stmt += parsed_then + " : ";
                    } else {
                        return wrap_message("error", "then statement block does not evaluate to desired type (number, boolean, none) " + parsed_then);
                    }
                    ++stmt_iterator;
                    include_token = false;
                }
            }
            else if (next_token.value === "endif" && next_token.tag === current_if_depth) {
                var parse_result = parse_statement(else_stmt, economy_node, expected_type);
                if (parse_result.message_type === "error") {
                    return parse_result;
                } else {
                    var parsed_else = parse_result.message;
                    var block_type = typeof (eval(parsed_else));
                    if (block_type !== if_type) {
                        return wrap_message("error", "if blocks do not have the same return value type");
                    }
                    if (block_type === "number" || block_type === "boolean" || block_type === "undefined") {
                        final_stmt += parsed_else;
                    } else {
                        return wrap_message("error", "else statement block does not evaluate to desired type (number, boolean, none) " + parsed_else);
                    }
                    break;
                }
            }
            if (include_token) {
                stmts[stmt_iterator].push(next_token);
            }
            next_token = tokens.shift();
        }
        return wrap_message("success", {
            stmt: "(" + final_stmt + ")",
            tokens: tokens,
            if_type: if_type
        });
    };
    function wrap_message(type, message) {
        return {
            message_type: type,
            message: message
        }
    };
    function parse_statement(tokens, economy_node, expected_type) {
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
                result = parse_if(tokens, next_token.tag, economy_node, expected_type);
                if (result.message_type === "error") {
                    return result;
                }
                tokens = result.message.tokens;
                var if_type = result.message.if_type;
                if (if_type === expected_type || expected_type === "anything") {
                    final_stmt += result.message.stmt;
                } else {
                    return wrap_message("error", "if statement returns incompatible type with outer statement, saw: " + if_type + " expected: " + expected_type);
                }
            } else if (next_token.type == "resource variable") {
                next_token.value += ".value";
                final_stmt += next_token.value;
            } else {
                final_stmt += next_token.value;
            }
            next_token = tokens.shift();
        }
        // console.log(final_stmt);
        return wrap_message("success", final_stmt);
    };
    function reset_variable_values() {
        for (var i = 0; i < elements.original_variable_values.length; ++i) {
            eval(elements.original_variable_values[i]);
        }
    };
    function create_internal_variable(tokens, economy_node) {
        var variable_name = tokens.shift().value;
        for (var variable in economy_node.variable) {
            if (variable === variable_name) {
                return wrap_message("error", "variable '" + variable_name + "' already exists on this node");
            }
        }
        if (tokens.shift().value !== "=") {
            return wrap_message("error", "initial value assignment syntax error");
        }
        var initial_value = tokens.shift();
        if (initial_value.type !== ("number" || "bool")) {
            return wrap_message("error", "declared variable must be boolean or number");
        }
        initial_value = initial_value.value;
        var max_value = undefined;
        var min_value = undefined;
        var reset_value = undefined;
        for (var i = 0; i < tokens.length; ++i) {

            if (tokens[i].value === "min") {
                console.log(tokens[i + 1]);
                console.log(tokens[i + 2]);
                if (check_valid_assignment(i)) {
                    i += 2;
                    min_value = tokens[i].value;
                } else {
                    return wrap_message("error", "min value assignment syntax error");
                }
            } else if (tokens[i].value === "max") {
                if (check_valid_assignment(i)) {
                    i += 2;
                    max_value = tokens[i].value;
                } else {
                    return wrap_message("error", "max value assignment syntax error");
                }
            } else if (tokens[i].value === "reset") {
                if (check_valid_assignment(i)) {
                    i += 2;
                    reset_value = tokens[i].value;
                } else {
                    return wrap_message("error", "reset value assignment syntax error");
                }
            }
        }

        var new_variable = "{name:'" + variable_name + "'," +
            "current_value:" + initial_value + "," +
            "initial_value:" + initial_value + "," +
            "max_value:" + max_value + "," +
            "min_value:" + min_value + "," +
            "reset_value:" + reset_value + "}";
        var code = "Graph.get_nodes()['" + economy_node.id() + "'].variables['" + variable_name + "'] = " + new_variable;
        eval(code);
        return wrap_message("success", code);

        function check_valid_assignment(i) {
            if(i + 2 < tokens.length) {
                if (tokens[i + 1].value !== "=") {
                    //should be assignment
                    return false;
                } else if (tokens[i + 2].type !== "number") {
                    //should be a number
                    return false;
                }
                return true;
            }
            return false;
        }
    };
    function create_rule(tokens, economy_node, type) {
        var result = parse_statement(tokens, economy_node, type);
        if (result.message_type === "error") {
            return result;
        }
        return wrap_message("success", result.message);
    };
    return function (input, economy_node) {
        var i, rules, validated_rules = [];
        elements.original_variable_values = [];
        input.replace(/\r?\n|\r/, " ");
        rules = input.split(";");
        if (input.trim() === "") {
            return "Nothing Entered";
        }
        for (i = 0; i < rules.length; ++i) {
            if (/^\s+$/.test(rules[i]) || rules[i] === "" || /\/\//.test(rules[i])) {
                continue;
            }
            rules[i] = rules[i].trim();
            var rule = {
                rule_text: rules[i] + ";"
            };
            rules[i] = rules[i].split(" ");
            var interpretation_result = interpret_rule(rules[i], economy_node);
            reset_variable_values();
            if (interpretation_result.message_type !== "error") {
                rule.code = interpretation_result.message;
                rule.rule_type = interpretation_result.rule_type;
                rule.layer = interpretation_result.layer;
                validated_rules.push(rule);
                console.log(economy_node);
                console.log(interpretation_result);
                console.log(interpretation_result.message);
                // console.log(eval(interpretation_result.message));
            } else {
                return interpretation_result;
            }
        }
        Graph.reset_variables();
        return wrap_message("success", validated_rules);
    };
});
