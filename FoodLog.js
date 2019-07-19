"use strict";
const api_key = "b76d77635da6f609d5e8e84c1bca496470889617492391c87f75afc283e97ad4";

CloudKit.configure({
    containers: [{
        containerIdentifier: 'iCloud.pl.majatech.FoodLog',
        apiTokenAuth: {
            apiToken: api_key,
            persist: true
            
        },
        environment: 'development'
    }]
});
let container = CloudKit.getDefaultContainer();
let database = container.privateCloudDatabase;

