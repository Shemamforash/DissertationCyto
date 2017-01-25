/**
 * Created by Sam on 22/01/2017.
 */
var sidebarOpen = false;
var editing = false;

function toggleGraphSidebar() {
    if (sidebarOpen) {
        $('#graph_sidebar').width("10px");
        $('#toggle_sidebar').text("");
    } else {
        $('#graph_sidebar').width("20%");
        $('#toggle_sidebar').text("<");
    }
    // setTimeout(function(){cy.resize(), cy.layout()}, 500);
    sidebarOpen = !sidebarOpen;
}

function toggleNodeSidebar(open) {
    if (open) {
        $('#node_sidebar').width("20%");
    } else {
        $('#node_sidebar').width("0%");
    }
}

function changeNodeLabel(text) {
    currentNode.get().data('label', text);
}

function setEditingMode(mode){
    editing = mode;
    if (mode) {
        $('.tag_edit').removeClass('disabled');
        var delete_button = $('<div class="ui icon button tag_delete inverted"><i class="remove icon"></i></div>');
        delete_button.click(function(){
            $(this).parent().remove();
        });
        $('.tag_edit').append(delete_button);
    } else {
        $('.tag_edit').addClass("disabled");
        $('.tag_edit > .tag_delete').remove();
    }
}

$(document).ready(function () {
    $('.ui.accordion').accordion({
        exclusive: false
    });
    $('#graph_sidebar').sidebar('attach events', '#sidebar_opener');
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
        $('#tag_editor').before($('<div class="ui inverted segment tag_edit">' +
                                    '<div class="ui inverted transparent fluid icon input">' +
                                        '<input type="text" placeholder="tag">' +
                                        '<i class="tag icon inverted"></i>' +
                                    '</div>' +
                                '</div><div class="ui divider inverted"></div>'));
    });
    $('#edit_tags_button').click(function () {
        setEditingMode(!editing);
    });
});