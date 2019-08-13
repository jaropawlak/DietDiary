"use strict";
const api_key = "b76d77635da6f609d5e8e84c1bca496470889617492391c87f75afc283e97ad4";

window.addEventListener('cloudkitloaded', function() {

    CloudKit.configure({
        containers: [{
            containerIdentifier: 'iCloud.pl.majatech.FoodLog',
            apiTokenAuth: {
                apiToken: api_key,
                persist: true,

                signInButton: {
                    id:"apple-sign-in-button"
                },

                signOutButton: {
                    id:"apple-sign-out-button"
                }
                
            },
            environment: 'development'
        }]
    });
    console.log("Cloudkit configured");
    function FoodWebModel() {
        var self = this;
        console.log("get containers");
        let container = CloudKit.getDefaultContainer();
        let database = container.privateCloudDatabase;
        self.categories = ko.observableArray();
        self.items = ko.observableArray();
        self.getCategoryName = function(recordName) {
            if (self.categoriesReference)
            {
                var cat = self.categoriesReference.find(function(element) {
                    return element.recordName === recordName;
                });
                if (cat) {
                    return cat.fields.name.value;
                }
                return "N/A";
            }
        }
        self.fetchCategories = function() {
            console.log("fetching categories from " + database);
            var query = {recordType: 'Category'}; // sortBy: [{fieldName: '???'}]
            return database.performQuery(query).then(function(response){
                if (response.hasErrors) {
                    console.error(response.errors[0]);
                    return;
                }
                var records = response.records;
                console.log(records);
                var numberOfRecords = records.length;
                if (numberOfRecords === 0) {
                    console.error("No matching items");
                    return;
                }
                self.categoriesReference = records;
                self.categories(records);
            })
        }
        self.fetchItems = function() {
            console.log("fetching items from " + database);
            var query = {recordType: 'LogItem'}; // sortBy: [{fieldName: '???'}]
            return database.performQuery(query).then(function(response){
                if (response.hasErrors) {
                    console.error(response.errors[0]);
                    return;
                }
                var records = response.records;
                
                //console.log(records);
                var numberOfRecords = records.length;
                if (numberOfRecords === 0) {
                    console.error("No matching items");
                    return;
                }
                records.forEach(function(element) {
                    console.log(element)
                    if (element.fields.category) {
                        element.fields.categoryName = self.getCategoryName(element.fields.category.value.recordName);
                    }
                });
                self.items(records);
            })
        }
        container.setUpAuth().then(function(userInfo) {
            console.log("setUpAuth");
            if(userInfo) {
                self.gotoAuthenticatedState(userInfo);
                self.fetchCategories();
                self.fetchItems();
               } else {
                self.gotoUnauthenticatedState();
               }        
        })
       
        self.displayUserName = ko.observable('Unauthenticated User');
        self.gotoAuthenticatedState = function(userInfo) {
        if(userInfo.isDiscoverable) {
            self.displayUserName(userInfo.firstName + ' ' + userInfo.lastName);
        } else {
            self.displayUserName('User Who Must Not Be Named');
        }
        container.whenUserSignsOut().then(self.gotoUnauthenticatedState);
        };
        
        self.gotoUnauthenticatedState = function(error) {
            self.displayUserName('Unauthenticated User');          
            container
            .whenUserSignsIn()
            .then(self.gotoAuthenticatedState)
            .catch(self.gotoUnauthenticatedState);
          };
    }
    ko.applyBindings(new FoodWebModel());
   

    
})