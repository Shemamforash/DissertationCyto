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
        $('#graph_sidebar').width("40px");
        $('#toggle_graph_sidebar').text(">");
        $('#toggle_graph_sidebar').width("40px");
    }
}

function minimiseGraphSideBar() {
    if (!sidebarOpen) {
        $('#graph_sidebar').width("10px");
        $('#toggle_graph_sidebar').text("");
        $('#toggle_graph_sidebar').width("10px");
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

$(document).ready(function() {
    var acc = document.getElementsByClassName("accordion");
    for(var i = 0; i < acc.length; ++i){
        acc[i].onclick = function(){
            this.classList.toggle("active");
            var panel = this.nextElementSibling;
            if(panel.style.display === "block"){
                panel.style.display = "none";
            } else {
                panel.style.display = "block";
            }
        }
    }
    }
);