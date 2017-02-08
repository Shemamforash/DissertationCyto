/**
 * Created by Sam on 22/01/2017.
 */
var eles, a, Behaviour = {
    elements: function () {
        return {
            graph_sidebar: $('#graph_sidebar'),
            node_sidebar: $('#node_sidebar'),
            add_tag: $('#add_tag_button'),
            edit_tag: $('#edit_tags_button'),
            edit_node_name: $('#edit_node_name'),
            sidebar_opener: $('#sidebar_opener'),
            tag_editor: $('#tag_editor'),
            rules_editor: $('#rules_modal'),
            rules_editor_opener: $('#add_rule')
        }
    },
    attributes: {
        editing: false
    },
    init: function () {
        eles = Behaviour.elements();
        a = Behaviour.attributes;
        Behaviour.bind();
    },
    bind: function () {
        $('.ui.accordion').accordion({
            exclusive: false
        });
        $('.ui.dropdown').dropdown();
        $('.ui.modal').modal({closable: false}).modal('hide');
        $('.ui.modal').modal("setting", {
            onVisible: RuleEditor.onresize
        });
        $('.ui.sidebar').sidebar({
            transition: 'overlay',
            dimPage: false,
            exclusive: true
        });
        eles.sidebar_opener.hover(function () {
            $(this).width("40px");
            $(this).text(">");
        }, function () {
            $(this).width("15px");
            $(this).text("");
        });
        eles.add_tag.click(Behaviour.addTag);
        eles.edit_node_name.click(Behaviour.editNodeName);
        eles.rules_editor_opener.click(function () {
            $('#rule_name_input').val("");
            $(eles.rules_editor).modal('show');

        });
        $('#cancel_rule_button').click(function () {
            Behaviour.rule_editor.discard_rule();
        });
        $('#accept_rule_button').click(function () {
            Behaviour.rule_editor.accept_rule();
        });
    },

    rule_editor: {
        current_rule: null,
        accept_rule: function () {
            if ($('.ui.dimmer.modals').first().hasClass("active") && !$('.ui.dimmer.modals').first().hasClass("animating")) {
                var code = Blockly.JavaScript.workspaceToCode(workspace);
                var blocks = Blockly.Xml.workspaceToDom(workspace);
                var xml_string = Blockly.Xml.domToText(blocks);
                var rule_name = $('#rule_name_input').val();
                var rule_button = $('<button class="ui button red rule fluid"></button>');
                var new_rule = {};

                if (Behaviour.rule_editor.current_rule === null) {
                    new_rule = Graph.nodes.create_rule(rule_name, code, xml_string);
                    rule_button.text(new_rule.id);
                    $('#add_rule').before(rule_button);
                    rule_button.bind('click', new_rule, Behaviour.rule_editor.edit_rule);
                } else {
                    Graph.nodes.edit_rule(rule_name, code, xml_string);
                }

                Behaviour.rule_editor.current_rule = null;
                $('.ui.modal').modal('hide');
                workspace.clear();
            }
        },

        edit_rule: function (event) {
            var rule = event.data;
            var xml = Blockly.Xml.textToDom(rule.blocks);
            $('#rule_name_input').val(rule.id);
            Blockly.Xml.domToWorkspace(xml, workspace);
            $(eles.rules_editor).modal('show');
            Behaviour.rule_editor.current_rule = rule;
        },

        discard_rule: function () {
            workspace.clear();
            Behaviour.rule_editor.current_rule = null;
            $('.ui.modal').modal('hide');
        },

        delete_rule: function () {
            Graph.nodes.delete_rule(1);
        },
    },


    addTag: function () {
        var element = $('<div class="ui input inverted transparent tag_edit right labelled">' +
            '<input type="text" placeholder="Tag name...">' +
            '<div class="ui buttons">' +
            '</div>' +
            '</div>');
        Behaviour.finish_editing(element);
        eles.tag_editor.before(element);
    },

    start_editing: function (element) {
        var button_group = $(element).find('.ui.buttons');
        var delete_button = $('<div class="ui button icon inverted white right attached delete_button">' +
            '<i class="remove icon"></i></div>');
        delete_button.click(function () {
            Behaviour.delete_tag(element);
        });
        var done_button = $('<div class="ui button icon inverted white right attached delete_button">' +
            '<i class="checkmark icon"></i></div>');
        done_button.click(function () {
            Behaviour.finish_editing(element);
        });
        button_group.html("");
        button_group.append(delete_button);
        button_group.append(done_button);
        $(element).toggleClass("disabled");
    },

    finish_editing: function (element) {
        var button_group = $(element).find('.ui.buttons');
        var edit_button = $('<div class="ui button icon inverted white right attached edit_button">' +
            '<i class="edit icon"></i></div>');
        edit_button.click(function () {
            Behaviour.start_editing(element)
        });
        button_group.html("");
        button_group.append(edit_button);
        $(element).toggleClass("disabled");

        var tag_name = $(element).find('input').val();
        var old_name = $(element).attr("id");
        if (Graph.tags.update($(element).attr("id"), tag_name)) {
            $(element).attr("id", tag_name);
        } else {
            $(element).find('input').val(old_name);
        }
    },

    delete_tag: function (element) {
        var tag_name = $(element).attr("id");
        if (tag_name !== "") {
            if (!Graph.tags.remove(tag_name)) {
                console.log("Tag did not exist for some reason..." + tag_name);
            } else {
                $(element).remove();
            }
        }
    },

    editNodeName: function () {
        var icon = eles.edit_node_name.find('.icon');
        icon.toggleClass('edit');
        icon.toggleClass('checkmark');
        eles.edit_node_name.parent().toggleClass('disabled');
    },

    toggleGraphSidebar: function () {
        if (eles.graph_sidebar.hasClass('visible')) {
            eles.graph_sidebar.sidebar('hide');
        } else {
            eles.graph_sidebar.sidebar('show');
        }
    },

    toggleNodeSidebar: function (open) {
        if (open) {
            if (!eles.node_sidebar.hasClass('visible')) {
                eles.node_sidebar.sidebar('show');
            }
        } else {
            eles.node_sidebar.sidebar('hide');
        }
    },

    changeNodeLabel: function (text) {
        CyA.current_node.data('label', text);
    }
};