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
    create_resource: function(name){
        if(!environment.attributes.resources.hasOwnProperty(name)){
            environment.attributes.resources[name] = {
                name: name,
                value: 0,
                increment: function(amnt){
                    this.value += amnt;
                },
                decrement: function(amnt){
                    this.value -= amnt;
                }
            };
        }
        return environment.attributes.resources[name];
    },
    reset_variables: function(){
        environment.attributes.resources = {};
    }
};