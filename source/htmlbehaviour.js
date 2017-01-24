/**
 * Created by Sam on 22/01/2017.
 */
var sidebarOpen = false;

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

function expandGraphSideBar() {
    if (!sidebarOpen) {
        // $('#graph_sidebar').width("40px");
        // $('#sidebar_opener').text(">");
        // $('#sidebar_opener').width("40px");
    }
}

function minimiseGraphSideBar() {
    if (!sidebarOpen) {
        // $('#graph_sidebar').width("10px");
        // $('#sidebar_opener').text("");
        // $('#sidebar_opener').width("10px");
    }
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

$(document).ready(function () {
    $('.ui.accordion').accordion({
        exclusive: false
    });
    $('.ui.sidebar').sidebar('toggle');
    $('#graph_sidebar').sidebar('attach events', '#sidebar_opener');
    // $('.sidebar').sidebar('setting', {
    //     dimPage: false,
    //     defaultTransition: {
    //         computer : {
    //             left: 'overlay'
    //         }
    //     }
    // });
    $('.ui.sidebar').sidebar({
        transition: 'overlay',
        dimPage: false,
        exclusive: true
    });
});