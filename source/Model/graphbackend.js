/**
 * Created by Sam on 20/01/2017.
 */
var e, n, t, Graph = {
    init: function () {
        e = Graph.edges;
        n = Graph.nodes;
        t = Graph.tags;
    },
    edges: {
        edge_list: [],
        create_edge: function (origin, end) {
            return {
                origin: origin,
                end: end
            };
        },
        add: function (origin, end) {
            for (var i = 0; i < e.edge_list.length; ++i) {
                var edge = e.edge_list[i];
                if ((edge.origin === origin && edge.end === end) || (edge.end === origin && edge.origin === end)) {
                    return false;
                }
            }
            e.edge_list.push(e.create_edge(origin, end));
            return true;
        }
    },
    nodes: {
        node_list: {},
        current_node: {},
        create_node: function (id, x, y) {
            return {
                id: id,
                x: x,
                y: y,
                rules: [],
                variables: []
            };
        },
        set_current_node: function(id){
            n.current_node = n.node_list[id];
        },
        create_rule: function (rule_id, code, xml_blocks) {
            var graph_node = n.node_list[CyA.current_node_element.id()];
            var current_rule = null;
            if (graph_node) {
                if (rule_id === "") {
                    rule_id = 'Rule ' + graph_node.rules.length;

                }
                current_rule = {
                    id: rule_id,
                    code: code,
                    blocks: xml_blocks
                };
                graph_node.rules.push(current_rule);
            }
            return current_rule;
        },
        change_rule_name: function (rule, new_id) {
            //TODO Check id is unique
            rule.id = new_id;
        },
        edit_rule: function (rule_id, code, xml_blocks) {
            var graph_node = n.node_list[CyA.current_node_element.id()];
            if (graph_node) {
                for (var i = 0; i < graph_node.rules.length; ++i) {
                    var current_rule = graph_node.rules[i];
                    if (current_rule.id === rule_id) {
                        current_rule.code = code;
                        current_rule.blocks = xml_blocks;
                    }
                }
            }
        },
        delete_rule: function (rule_id) {
            var graph_node = n.node_list[CyA.current_node_element];
            if (graph_node) {
                for (var i = 0; i < graph_node.rules.length; ++i) {
                    var current_rule = graph_node.rules[i];
                    if (current_rule.id === rule_id) {
                        graph_node.rules.splice(i, 1);
                    }
                }
            }
        },
        node_overlaps: function (x, y, id) {
            for (var node in n.node_list) {
                node = n.node_list[node];
                if (node.x === x && node.y === y && id !== node.id) {
                    return true;
                }
            }
            return false;
        },
        add: function (id, x, y) {
            if (n.node_overlaps(x, y, id)) {
                return false;
            }
            n.node_list[id] = n.create_node(id, x, y);
            return true;
        },
        update_position: function (node) {
            var graph_node = n.node_list[node.id()];
            if (n.node_overlaps(node.position().x, node.position().y, node.id())) {
                node.position().x = graph_node.x;
                node.position().y = graph_node.y;
            } else {
                graph_node.x = node.position().x;
                graph_node.y = node.position().y;
            }
        },
        update_property: function (node, prop, val) {
            var graph_node = n.node_list[node.id()];
            if (graph_node.hasOwnProperty(prop)) {
                graph_node[prop] = val;
            }
        }
    },
    //Manages the current list of tags in the system
    //Tags must be unique and can only be declared in the graph sidebar
    tags: {
        tag_list: [],
        exists: function (tag_name) {
            i = t.tag_list.indexOf(tag_name);
            return i == -1 ? null : t.tag_list[i];
        },
        //Returns false if a tag with the given name already exists
        //Tags are pairs of a name and an element corresponding to the element in the graph sidebar
        update: function (element_id, tag_name) {
            if (t.exists(tag_name)) {
                if (tag_name === element_id) {
                    return true;
                } else {
                    return false;
                }
            } else {
                if (tag_name !== "") {
                    t.tag_list.push(tag_name);
                }
                t.tag_list.splice(t.tag_list.indexOf(element_id), 1);
                return true;
            }
        },
        //Returns false if no tag found
        //Otherwise removes the tag and returns true
        remove: function (tag_name) {
            var tag = t.exists(tag_name);
            if (tag) {
                t.tag_list.splice(t.tag_list.indexOf(tag), 1);
                return true;
            }
            return false;
        },
    },

    getAsJSON: function () {
        return {
            nodes: nodes,
            edges: edges
        }
    },
    evaluator: {
        internal_rules: [],
        source_rules: [],
        sink_rules: [],
        evaluate: function () {
            var i;
            for(i = 0; i < Graph.evaluator.internal_rules.length; ++i){
                Graph.evaluator.internal_rules[i].run();
            }
            for(i = 0; i < Graph.evaluator.source_rules.length; ++i){
                Graph.evaluator.source_rules[i].run();
            }
            for(i = 0; i < Graph.evaluator.sink_rules.length; ++i){
                Graph.evaluator.sink_rules[i].run();
            }
        }
    }
};
