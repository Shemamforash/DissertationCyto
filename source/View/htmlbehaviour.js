/**
 * Created by Sam on 22/01/2017.
 */
var Behaviour = (function () {
    var elements = function () {
        return {
            graph_sidebar: $('#graph_sidebar'),
            node_sidebar: $('#node_sidebar'),
            edit_node_name: $('#edit_node_name'),
            sidebar_opener: $('#sidebar_opener'),
            rules_editor: $('#rules_modal'),
            rules_editor_opener: $('#add_rule'),
            node_name_input: $('#node_name_input'),
            simulate_button: $('#simulate_step_button'),
            reset_button: $('#reset_button'),
            save_button: $('#save_button'),
            load_button: $('#load_button'),
            file_selector: $('#file_selector'),
            tag_editor: $('#tag_editor'),
            trash_button: $('#trash_button'),
            delete_node_button: $('#delete_node'),
            variable_preview: $('#variable_preview'),
            code_preview: $('#code_preview')
        };
    };

    bind();

    function bind() {
        elements = elements();
        $('.ui.accordion').accordion({
            exclusive: false
        });
        $('.ui.dropdown').dropdown();
        $('.ui.modal').modal({closable: false}).modal('hide');
        $('.ui.sidebar').sidebar({
            transition: 'overlay',
            dimPage: false,
            exclusive: false,
            closable: false
        });
        elements.simulate_button.click(simulate);
        elements.sidebar_opener.hover(function () {
            $(this).width("40px");
            $(this).text(">");
        }, function () {
            $(this).width("15px");
            $(this).text("");
        });
        elements.edit_node_name.click(edit_node_name);
        elements.rules_editor_opener.click(function () {
            $('#rule_name_input').val("");
            $(elements.rules_editor).modal('show');
            $('#code_textarea').val(Graph.get_rules_as_string());
        });
        elements.reset_button.click(reset_during_edit);
        elements.save_button.click(save_graph_to_file);
        elements.load_button.click(function () {
            elements.file_selector.click()
        });
        elements.file_selector.multiple = false;
        elements.file_selector.on("change", load_graph_from_file);
        elements.trash_button.click(destroy_graph);
        elements.delete_node_button.click(delete_node);
        $('#cancel_rule_button').click(function () {
            discard_rule();
        });
        $('#accept_rule_button').click(function () {
            accept_rule();
        });
        $('#accept_rule').click(function () {
            accept_rule();
        })
        elements.node_name_input.on("input", change_node_label);
    }

    function save_graph_to_file() {
        CytoGraph.get_cy().elements().removeClass("highlighted");
        var cy_json = CytoGraph.get_cy().json();
        var saved_nodes = convert_nodes_for_saving();
        var save_obj = {
            cy: JSON.stringify(cy_json),
            nodes: JSON.stringify(saved_nodes, null, 4),
        };
        var data = "text/json; charset=utf-8," + encodeURIComponent(JSON.stringify(save_obj, null, 4));
        var download_button = $('<a href="data: ' + data + '" download="my_graph.json" id="download_button"></a>');
        download_button.appendTo(elements.graph_sidebar);
        $('#download_button')[0].click();
        download_button.remove();
    }

    function load_graph_from_file() {
        var files = this.files;
        var fr = new FileReader();
        if (files.length === 1) {
            fr.onload = function (event) {
                var result = JSON.parse(event.target.result);
                load_graph(result.cy);
                load_nodes(result.nodes);
            };
            fr.readAsText(files.item(0));
        }
        elements.file_selector.val("");
    }

    return {
        simulate: simulate,
        accept_rule: accept_rule,
        discard_rule: discard_rule,
        update_node_sidebar: update_node_sidebar,
        edit_node_name: edit_node_name,
        toggle_graph_sidebar: toggle_graph_sidebar,
        toggle_node_sidebar: toggle_node_sidebar,
        change_node_label: change_node_label,
    };

    function reset_during_edit() {
        Graph.reset_simulation();
        elements.tag_editor.empty();
        update_node_sidebar();
    }

    function destroy_graph() {
        CytoGraph.get_cy().remove(CytoGraph.get_cy().elements());
        Graph.clear();
        reset_during_edit();
        CytoGraph.reset_current_node();
    }

    function delete_node() {
        var node = CytoGraph.get_current_node();
        CytoGraph.get_cy().remove(node.connectedEdges());
        CytoGraph.get_cy().remove(node);
        Graph.remove_node(node);
        toggle_node_sidebar(false);
        reset_during_edit();
        CytoGraph.reset_current_node();
        update_node_sidebar();
    }

    function simulate() {
        Graph.evaluate();
        elements.tag_editor.empty();
        var resources = Graph.get_resources();
        for (var resource in resources) {
            resource = resources[resource];
            var new_div = $('<div class="ui button inverted green resource_button">' + resource.name + "  :  " + Math.floor(resource.value * 100) / 100 + '</div>');
            new_div.click(function () {
                var resource_name = resource.name;

                return function () {
                    if ($(this).hasClass("inverted")) {
                        $('.resource_button').addClass("inverted");
                        $(this).removeClass("inverted");
                        Graph.prims(resource_name);
                    } else {
                        $('.resource_button').addClass("inverted");
                        Graph.prims(null);
                    }
                };
            }());
            elements.tag_editor.append(new_div);
        }
        update_node_sidebar();
    }

    function accept_rule() {
        if ($('.ui.dimmer.modals').first().hasClass("active") && !$('.ui.dimmer.modals').first().hasClass("animating")) {
            var code = $('#code_textarea').val();
            var rule_button = $('<button class="ui button red rule fluid"></button>');
            Graph.reset_simulation();
            var result = Evaluator(code, CytoGraph.get_current_node());
            if (result.message_type !== "error") {
                Graph.create_rules(result.message);
                $('#error_message').text("all rules ok!");
                $('.ui.modal').modal('hide');
            } else {
                $('#error_message').text(result.message);
            }
        }
        update_node_sidebar();
    }

    function discard_rule() {
        $('.ui.modal').modal('hide');
        update_node_sidebar();
    }

    function update_node_sidebar() {
        var node = CytoGraph.get_current_node();
        if(node) {
            $('#node_name_input').val(node.data().label);
            var variable_string = "";
            node = Graph.get_nodes()[node.id()];
            for (var variable in node.variables) {
                variable = node.variables[variable];
                variable_string += variable.name + "\n";
                variable_string += "    Value: " + Math.floor(variable.current_value * 100) / 100 + " Max/Min/Reset: ";
                if (variable.max_value !== undefined) {
                    variable_string += variable.max_value;
                } else {
                    variable_string += "-"
                }
                variable_string += "/";
                if (variable.min_value !== undefined) {
                    variable_string += variable.min_value;
                } else {
                    variable_string += "-"
                }
                variable_string += "/";
                if (variable.reset_value !== undefined) {
                    variable_string += variable.reset_value;
                } else {
                    variable_string += "-"
                }
                variable_string += "\n\n";
            }
            elements.variable_preview.text(variable_string);
            var rule_string = "";
            for (var i = 0; i < node.rules.length; ++i) {
                if (node.rules[i].rule_type !== "INACTIVE") {
                    rule_string += node.rules[i].rule_text + "\n\n";
                }
            }
            elements.code_preview.text(rule_string);
        }
    }

    function edit_node_name() {
        var icon = elements.edit_node_name.find('.icon');
        icon.toggleClass('edit');
        icon.toggleClass('checkmark');
        elements.edit_node_name.parent().toggleClass('disabled');
    }

    function toggle_graph_sidebar(close) {
        if(close === false){
            elements.graph_sidebar.sidebar('hide');
        } else {
            if (elements.graph_sidebar.hasClass('visible')) {
                elements.graph_sidebar.sidebar('hide');
            } else {
                elements.graph_sidebar.sidebar('show');
            }
        }
    }

    function toggle_node_sidebar(open) {
        if (open) {
            if (!elements.node_sidebar.hasClass('visible')) {
                elements.node_sidebar.sidebar('show');
            }
        } else {
            elements.node_sidebar.sidebar('hide');
        }
    }

    function change_node_label() {
        CytoGraph.get_current_node().data('label', elements.node_name_input.val());
    }
});