/**
 * Created by Sam on 22/01/2017.
 */
var Behaviour = (function () {
    var editing = false;
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
            tag_editor: $('#tag_editor')
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
            exclusive: true,
        });
        elements.simulate_button.click(simulate);
        elements.node_sidebar.sidebar({
            closable: false,
            transition: 'overlay',
            dimPage: false,
            exclusive: true
        });
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

        });
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

    return {
        simulate: simulate,
        accept_rule: accept_rule,
        discard_rule: discard_rule,
        update_node_sidebar: update_node_sidebar,
        add_tag: add_tag,
        start_editing: start_editing,
        finish_editing: finish_editing,
        delete_tag: delete_tag,
        edit_node_name: edit_node_name,
        toggle_graph_sidebar: toggle_graph_sidebar,
        toggle_node_sidebar: toggle_node_sidebar,
        change_node_label: change_node_label,
    };
    function simulate() {
        Graph.evaluate();
        elements.tag_editor.empty();
        var resources = Graph.get_resources();
        for (var resource in resources) {
            resource = resources[resource];
            var new_div = $('<div class="ui segment inverted" style="width:100%; height: 30px;">' + resource.name + "  :  " + resource.value + '</div>');
            elements.tag_editor.append(new_div);
        }
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
    }

    function discard_rule() {
        $('.ui.modal').modal('hide');
    }

    function update_node_sidebar() {
        var node = CytoGraph.get_current_node();
        $('#code_textarea').val(Graph.get_rules_as_string());
        $('#node_name_input').val(node.data().label);
    }

    function add_tag() {
        var element = $('<div class="ui input inverted transparent tag_edit right labelled">' +
            '<input type="text" placeholder="Tag name...">' +
            '<div class="ui buttons">' +
            '</div>' +
            '</div>');
        finish_editing(element);
        elements.tag_editor.before(element);
    }

    function start_editing(element) {
        var button_group = $(element).find('.ui.buttons');
        var delete_button = $('<div class="ui button icon inverted white right attached delete_button">' +
            '<i class="remove icon"></i></div>');
        delete_button.click(function () {
            delete_tag(element);
        });
        var done_button = $('<div class="ui button icon inverted white right attached delete_button">' +
            '<i class="checkmark icon"></i></div>');
        done_button.click(function () {
            finish_editing(element);
        });
        button_group.html("");
        button_group.append(delete_button);
        button_group.append(done_button);
        $(element).toggleClass("disabled");
    }

    function finish_editing(element) {
        var button_group = $(element).find('.ui.buttons');
        var edit_button = $('<div class="ui button icon inverted white right attached edit_button">' +
            '<i class="edit icon"></i></div>');
        edit_button.click(function () {
            start_editing(element)
        });
        button_group.html("");
        button_group.append(edit_button);
        $(element).toggleClass("disabled");

        var tag_name = $(element).find('input').val();
        var old_name = $(element).attr("id");
        if (Graph.resources.update($(element).attr("id"), tag_name)) {
            $(element).attr("id", tag_name);
        } else {
            $(element).find('input').val(old_name);
        }
    }

    function delete_tag(element) {
        var tag_name = $(element).attr("id");
        if (tag_name !== "") {
            if (!Graph.resources.remove(tag_name)) {
                console.log("Tag did not exist for some reason..." + tag_name);
            } else {
                $(element).remove();
            }
        }
    }

    function edit_node_name() {
        var icon = elements.edit_node_name.find('.icon');
        icon.toggleClass('edit');
        icon.toggleClass('checkmark');
        elements.edit_node_name.parent().toggleClass('disabled');
    }

    function toggle_graph_sidebar() {
        if (elements.graph_sidebar.hasClass('visible')) {
            elements.graph_sidebar.sidebar('hide');
        } else {
            elements.graph_sidebar.sidebar('show');
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