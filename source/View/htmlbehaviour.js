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
            tag_editor: $('#tag_editor')
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
        eles.edit_tag.click(Behaviour.editTag);
        eles.edit_node_name.click(Behaviour.editNodeName);
    },

    addTag: function () {
        Behaviour.setEditingMode(false);
        eles.tag_editor.before($('<div class="ui inverted transparent fluid">' +
            '<div class="ui icon disabled input inverted transparent tag_edit">' +
            '<input type="text" placeholder="Tag name...">' +
            '<i class="tag icon"></i>' +
            '</div>' +
            '</div>'));
    },

    editTag: function () {
        Behaviour.setEditingMode(!a.editing);
        var icon = eles.edit_tag.find('.icon');
        // var icon = $('#edit_tags_button > .icon');
        if (eles.edit_tag.text().indexOf("Edit") !== -1) {
            eles.edit_tag.html("Done");
        } else {
            eles.edit_tag.html("Edit");
            Behaviour.checkNewTags();
        }
        eles.edit_tag.prepend(icon);
        icon.toggleClass('checkmark');
        icon.toggleClass('edit');
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
        currentNode.get().data('label', text);
    },

    setEditingMode: function (mode) {
        a.editing = mode;
        var tag_edit = $('.tag_edit');
        if (mode) {
            //User is editing tag names
            tag_edit.removeClass('disabled');
            var delete_button = $('<div class="ui icon button tag_delete inverted right attached"><i class="remove icon"></i></div>');
            delete_button.click(function () {
                $(this).parent().remove();
                Behaviour.removeTag(delete_button.parent().attr('id'));
            });
            tag_edit.append(delete_button);
            tag_edit.find('.tag.icon').remove();
        } else {
            //User has finished editing tags
            tag_edit.addClass("disabled");
            tag_edit.find('.tag_delete').remove();
            for (var i = 0; i < tag_edit.length; ++i) {
                if ($(tag_edit[i]).find('.tag.icon').length === 0) {
                    tag_edit.append($('<i class="tag icon"></i>"'));
                }
            }
        }
    },

    checkNewTags: function () {
        var tag_elements = $('.tag_edit > input');
        for (var i = 0; i < tag_elements.length; ++i) {
            var tag_name = $(tag_elements[i]).val();
            if (tag_name !== "") {
                if (!Graph.tags.is_bound(tag_name, tag_elements[i])) {
                    if (!Graph.tags.add($(tag_elements[i]), tag_name)) {
                        $(tag_elements[i]).val($(tag_elements[i]).attr("id"));
                    } else {
                        $('#tag_dropdown').append('<div class="item">' +
                            '<div class="ui red empty circular label"></div>' + tag_name + '</div>');
                    }
                }
            }
        }
    },

    removeTag: function () {

    }
};