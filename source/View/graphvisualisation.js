/**
 * Created by Sam on 20/01/2017.
 */

var CytoGraph = function () {
    var current_node = null;
    var cy = {};
    var behaviour = {
        select_node: function (event) {
            var target = event.cyTarget;
            if (target !== cy) {
                console.log(target.id());
                current_node = Graph.get_nodes()[target.id()];
                Behaviour.update_node_sidebar();
            }
        },
        change_or_move_node: function (event) {
            if (current_node) {
                Graph.update_position(current_node);
            }
            if (event.cyTarget === cy || event.cyTarget.group() !== "nodes") {
                Behaviour.toggle_node_sidebar(false);
            } else {
                cy.nodes().deselect();
                event.cyTarget.select();
                Behaviour.toggle_node_sidebar(true);
            }
        },
        link_nodes: function (event) {
            var target = event.cyTarget;
            if (current_node) {
                if (target !== current_node) {
                    Behaviour.toggle_node_sidebar(true);
                    var new_edge = cy.add({
                        group: "edges",
                        data: {
                            source: current_node.id(),
                            target: target.id()
                        }
                    });
                    if (!Graph.edges.add(new_edge)) {
                        cy.remove(new_edge);
                    }
                }
            }
        }
    };

    function bind() {
        //start click
        cy.on('tapstart', behaviour.select_node);
        //end click
        cy.on('tapend', behaviour.change_or_move_node);
        //right click
        cy.on('cxttap', 'node', behaviour.link_nodes);
    }

    function mouse_to_world_coordinates(x, y) {
        var zoom = cy.zoom();
        x = x / zoom + cy.extent().x1;
        y = y / zoom + cy.extent().y1;
        return {
            x: x,
            y: y
        };
    }

    return {
        init: function(){
            load_graph();
            load_nodes();
        },
        set_cy: function(new_cy){
            cy = new_cy;
            bind();
        },
        behaviour: behaviour,
        add_node: function (event) {
            var snap_position = mouse_to_world_coordinates(event.x, event.y);
            var new_node = cy.add({
                group: "nodes",
                data: {
                    label: "Node" + Graph.get_node_number(),
                    id: "Node" + Graph.get_node_number()
                },
                position: {x: snap_position.x, y: snap_position.y}
            });
            new_node.variables = {};
            new_node.rules = [];
            new_node.resource_tags = [];
            if (!Graph.add_node(new_node)) {
                cy.remove(new_node);
            }
        },
        clamp_viewport: function () {
            var viewport = cy.extent();
            var bound = cy.elements().boundingBox();

            var outOfBounds = viewport.x1 > bound.x2 || viewport.y1 > bound.y2 || bound.x1 > viewport.x2 || bound.y1 > viewport.y2;
            if (outOfBounds) {
                cy.animate({
                    center: cy.elements()
                }, {
                    duration: 1000,
                    easing: "spring(500, 20)"
                });
            }
        },
        get_cy: function(){
            return cy;
        },
        get_current_node: function(){
            return current_node;
        }
    };
};