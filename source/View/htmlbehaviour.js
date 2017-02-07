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
            $(eles.rules_editor).modal('show');
        });
        $('#cancel_rule_button').click(function(){
            Behaviour.discard_rule();
        });
        $('#accept_rule_button').click(function(){
            Behaviour.accept_rule();
        });
    },

    accept_rule: function(){
        var code = Blockly.JavaScript.workspaceToCode(workspace);
        var blocks = workspace.getAllBlocks();
        Graph.nodes.create_rule();
        workspace.clear();
    },

    discard_rule: function(){
        workspace.clear();
        $('.ui.modal').modal('hide');
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
            console.log(eles);
            eles.node_sidebar.sidebar('hide');
        }
    },

    changeNodeLabel: function (text) {
        CyA.current_node.data('label', text);
    }
};