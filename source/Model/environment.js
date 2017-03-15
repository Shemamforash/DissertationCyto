/**
 * Created by Iovana on 07/03/2017.
 */
var environment = {
    resources: {},
    create_resource: function(name){
        if(!environment.resources.hasOwnProperty(name)){
            environment.resources[name] = {
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
        return environment.resources[name];
    },
    reset_variables: function(){
        environment.resources = {};
    }
};