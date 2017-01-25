/**
 * Created by Sam on 22/01/2017.
 */
var sidebarOpen = 'hide';
var editing = false;

function toggleGraphSidebar() {
    if ($('graph_sidebar').hasClass('visible')) {
        $('#graph_sidebar').sidebar('hide');
    } else {
        $('#graph_sidebar').sidebar('show');
    }
}

function toggleNodeSidebar(open) {
    if (open) {
        $('#node_sidebar').sidebar('show');
    } else {
        $('#node_sidebar').sidebar('hide');
    }
}

function changeNodeLabel(text) {
    currentNode.get().data('label', text);
}

function setEditingMode(mode) {
    editing = mode;
    if (mode) {
        //User is editing tag names
        $('.tag_edit').removeClass('disabled');
        var delete_button = $('<div class="ui icon button tag_delete inverted right attached"><i class="remove icon"></i></div>');
        delete_button.click(function () {
            $(this).parent().remove();
        });
        $('.tag_edit').append(delete_button);
        $('.tag_edit > .tag.icon').remove();
    } else {
        //User has finished editing tags
        $('.tag_edit').addClass("disabled");
        $('.tag_edit > .tag_delete').remove();
        var tag_entries = $('.tag_edit')
        for (var i = 0; i < tag_entries.length; ++i) {
            if ($(tag_entries[0]).find('.tag.icon').length === 0) {
                $('.tag_edit').append($('<i class="tag icon"></i>"'));
            }
        }
    }
}

function checkNewTags() {
    var tag_elements = $('.tag_edit > input');
    for (var i = 0; i < tag_elements.length; ++i) {
        var tag_name = $(tag_elements[i]).val();
        if (tag_name !== "") {
            if (!tags.is_tag_bound(tag_name, tag_elements[i])) {
                if (!tags.add_tag($(tag_elements[i]), tag_name)) {
                    $(tag_elements[i]).val("");
                }
            } else {
                console.log("bound");
            }
        }
    }
}

$(document).ready(function () {
    $('.ui.accordion').accordion({
        exclusive: false
    });
    $('.ui.dropdown').dropdown();
    // $('#graph_sidebar').sidebar('attach events', '#sidebar_opener');
    $('.ui.sidebar').sidebar({
        transition: 'overlay',
        dimPage: false,
        exclusive: true
    });
    $('#sidebar_opener').hover(function () {
        $(this).width("40px");
        $(this).text(">");
    }, function () {
        $(this).width("15px");
        $(this).text("");
    });
    $('#add_tag_button').click(function () {
        setEditingMode(false);
        $('#tag_editor').before($('<div class="ui inverted transparent fluid">' +
            '<div class="ui icon disabled input inverted transparent tag_edit">' +
            '<input type="text" placeholder="Tag name...">' +
            '<i class="tag icon"></i>' +
            '</div>' +
            '</div>'));
    });
    $('#edit_tags_button').click(function () {
        setEditingMode(!editing);
        var icon = $('#edit_tags_button > .icon');
        if ($('#edit_tags_button').text().indexOf("Edit") !== -1) {
            $('#edit_tags_button').html("Done");
        } else {
            $('#edit_tags_button').html("Edit");
            checkNewTags();
        }
        $('#edit_tags_button').prepend(icon);
        $('#edit_tags_button > .icon').toggleClass('checkmark');
        $('#edit_tags_button > .icon').toggleClass('edit');
    });
    $('#edit_node_name').click(function () {
        $('#edit_node_name > .icon').toggleClass('edit');
        $('#edit_node_name > .icon').toggleClass('checkmark');
        $('#edit_node_name').parent().toggleClass('disabled');
    });
});