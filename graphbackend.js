/**
 * Created by Sam on 20/01/2017.
 */
var graph = (function(){
    var nodes = [];
    var edges = [];

    return {
        add_edge: function(origin, end) {
            for(var i = 0; i < edges.length; ++i) {
                var e = edges[i];
                if((e.origin === origin && e.end === end) || (e.end === origin && e.origin === end)){
                    return false;
                }
            }
            edges.push(create_edge(origin, end));
            return true;
        },
        add_node: function(id, x, y) {
            nodes.push(create_node(id, x, y));
        },
        update_node: function(node){
            for(var i = 0; i < nodes.length; ++i){
                if(nodes[i].id === node.id()) {
                    nodes[i].x = node.x;
                    nodes[i].y = node.y;
                }
            }
        }
    }
}());

create_edge = function(origin, end){
    return {
        origin: origin,
        end: end
    };
};

create_node = function(id, x, y){
    return {
        id: id,
        x: x,
        y: y
    };
};