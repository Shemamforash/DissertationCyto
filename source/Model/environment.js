/**
 * Created by Iovana on 07/03/2017.
 */
var environment = {
    attributes: {
        nodes: {},
        edges: {},
        resources: {}
    },
    modify_resource: function(name, value){
        if(environment.attributes.hasOwnProperty(name)){
            environment.attributes.name += value;
        } else {
            console.log("no such tagged variable exists: " + name);
        }
    },
    make_node: function(name){
        return {
            name: name,
            rules: [],
            variables: {},
            add_variable: function(name, value){
                if(this.variables.hasOwnProperty(name)){
                    return false;
                } else {
                    this.name = value;
                }
            },
            get_variable: function(name){
                if(this.variables.hasOwnProperty(name)){
                    return this.variables.name;
                } else {
                    console.log("variable does not exist");
                }
            },
            add_rule: function(type, rule){
                this.rules.push({
                    type: type,
                    rule: rule
                });
            },
            evaluate: function(type){
                for(var i = 0; i < this.rules.length; ++i){
                    if(this.rules[i].type === type){
                        eval(this.rules[i].rule);
                    }
                }
            }
        }
    }
};