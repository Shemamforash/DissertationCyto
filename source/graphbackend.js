/**
 * Created by Sam on 20/01/2017.
 */
var graph = (function () {
    var nodes = {};
    var edges = [];
    var i;

    function node_overlaps(x, y, id) {
        for (var node in nodes) {
            node = nodes[node];
            if (node.x === x && node.y === y && id !== node.id) {
                return true;
            }
        }
        return false;
    }

    function create_edge(origin, end) {
        return {
            origin: origin,
            end: end
        };
    }

    function create_node(id, x, y) {
        return {
            id: id,
            x: x,
            y: y
        };
    }

    return {
        add_edge: function (origin, end) {
            for (i = 0; i < edges.length; ++i) {
                var e = edges[i];
                if ((e.origin === origin && e.end === end) || (e.end === origin && e.origin === end)) {
                    return false;
                }
            }
            edges.push(create_edge(origin, end));
            return true;
        },
        add_node: function (id, x, y) {
            if (node_overlaps(x, y, id)) {
                return false;
            }
            nodes[id] = create_node(id, x, y);
            return true;
        },
        update_node_position: function (node) {
            var graph_node = nodes[node.id()];
            if (node_overlaps(node.position().x, node.position().y, node.id())) {
                node.position().x = graph_node.x;
                node.position().y = graph_node.y;
            } else {
                graph_node.x = node.position().x;
                graph_node.y = node.position().y;
            }
        },
        update_node_property: function (node, prop, val) {
            var graph_node = nodes[node.id()];
            if (graph_node.hasOwnProperty(prop)) {
                graph_node[prop] = val;
            }
        }
    }
}());

//Manages the current list of tags in the system
//Tags must be unique and can only be declared in the graph sidebar
var tags = (function () {
    var tag_list = [];
    var i;

    function tag_exists(tag_name, element) {
        for (i = 0; i < tag_list.length; ++i) {
            if (tag_list[i].tag_name === tag_name) {
                if(element){
                    if(tag_list[i].element === element){
                        return tag_list[i];
                    }
                    return null;
                }
                return tag_list[i];
            }
        }
        return null;
    }

    return {
        //Returns false if a tag with the given name already exists
        //Tags are pairs of a name and an element correspondign to the element in the graph sidebar
        add_tag: function (element, tag_name) {
            if (tag_exists(tag_name)) {
                return false;
            }
            tag_list.push({
                element: element,
                tag_name: tag_name
            });
            console.log(element);
            return true;
        },
        //Returns false if no tag found
        //Otherwise removes the tag and returns true
        remove_tag: function (element, tag_name) {
            var tag = tag_exists(tag_name);
            if (tag) {
                tag_list.remove(tag);
                return true;
            }
            return false;
        },
        //Takes the old name of a tag and replaces it with a new one
        //Returns true if the tag exists, otherwise false
        update_tag: function (old_name, new_name) {
            var tag = tag_exists(old_name);
            if (tag) {
                tag.tag_name = new_name;
                return true;
            }
            return false;
        },
        is_tag_bound: function(tag_name, element){
            return tag_exists(tag_name, element);
        }
    }
}());