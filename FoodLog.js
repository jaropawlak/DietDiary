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
        self.categories = [];
        self.items = [];
        container.setUpAuth().then(function(userInfo) {
            console.log("setUpAuth");
            if(userInfo) {
                self.gotoAuthenticatedState(userInfo);
                
               } else {
                self.gotoUnauthenticatedState();
               }        
        })
        self.gotoAuthenticatedState = function(userInfo) {
            document.getElementById("ForLoggedIn").style.display = "block";


            container.whenUserSignsOut().then(self.gotoUnauthenticatedState);
        };
        
        self.gotoUnauthenticatedState = function(error) {
            document.getElementById("ForLoggedIn").style.display = "none";
            container
            .whenUserSignsIn()
            .then(self.gotoAuthenticatedState)
            .catch(self.gotoUnauthenticatedState);
          };
    }
        
        
     
})

class DataAccess {
    async fetchCategories() {
        
        
            var query = {recordType: 'Category'}; // sortBy: [{fieldName: '???'}]
            let response =  await database.performQuery(query);
            
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
            this.categoryList = records;
            return records;
    }

    get categories() {
        return this.categoryList;
    } 

    async fetchItems() {
        let container = CloudKit.getDefaultContainer();
        let database = container.privateCloudDatabase;
        console.log("fetching items from " + database);
        var query = {recordType: 'LogItem'}; // sortBy: [{fieldName: '???'}]
        let response = await database.performQuery(query);
        
        if (response.hasErrors) {
            console.error(response.errors[0]);
            return;
        }
        var records = response.records;
        
        var numberOfRecords = records.length;
        if (numberOfRecords === 0) {
            console.error("No matching items");
            return;
        }
        records.forEach(function(element) {
            console.log(element)
            if (element.fields.category) {
                element.fields.categoryName = this.getCategoryName(element.fields.category.value.recordName);
            }
        });
        this.items = records;
        
      
    }

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
}