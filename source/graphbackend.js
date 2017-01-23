/**
 * Created by Sam on 20/01/2017.
 */
var graph = (function(){
    var nodes = {};
    var edges = [];
    var tags = [];
    var i;

    function node_overlaps(x, y, id){
        for(var node in nodes){
            node = nodes[node];
            if(node.x === x && node.y === y && id !== node.id) {
                return true;
            }
        }
        return false;
    }

    function create_edge(origin, end){
        return {
            origin: origin,
            end: end
        };
    }

    function create_node(id, x, y){
        return {
            id: id,
            x: x,
            y: y
        };
    }

    return {
        add_edge: function(origin, end) {
            for(i = 0; i < edges.length; ++i) {
                var e = edges[i];
                if((e.origin === origin && e.end === end) || (e.end === origin && e.origin === end)){
                    return false;
                }
            }
            edges.push(create_edge(origin, end));
            return true;
        },
        add_node: function(id, x, y) {
            if(node_overlaps(x, y, id)){
                return false;
            }
            nodes[id] = create_node(id, x, y);
            return true;
        },
        update_node_position: function(node){
            var graph_node = nodes[node.id()];
            if(node_overlaps(node.position().x, node.position().y, node.id())){
                node.position().x = graph_node.x;
                node.position().y = graph_node.y;
            } else {
                graph_node.x = node.position().x;
                graph_node.y = node.position().y;
            }
        },
        update_node_property: function(node, prop, val) {
            var graph_node = nodes[node.id()];
            if(graph_node.hasOwnProperty(prop)){
                graph_node[prop] = val;
            }
        }
    }
}());