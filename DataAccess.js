class DataAccess {
    async fetchCategories() {
            let container = CloudKit.getDefaultContainer();
            let database = container.privateCloudDatabase;
        
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

    getCategoryName(recordName,cats) {
        
        if (cats)
        {
            var cat = cats.find(function(element) {
                return element.recordName === recordName;
            });
            if (cat) {
                return cat.fields.name.value;
            }
        }
        return "N/A";
    }
    /**
     * 
     * @param {int} dateFrom in miliseconds 
     * @param {int} dateTo in miliseconds 
     * @param {[string]} selectedCategories ids of categories 
     */
    async fetchItems(dateFrom, dateTo, selectedCategories) {
        let filters = [];
        if (dateFrom) {
            filters.push({
                comparator: 'GREATER_THAN_OR_EQUALS',
                fieldName: 'date',
                fieldValue: { value: dateFrom }
            })
        }
        if (dateTo) {
            filters.push({
                comparator: 'LESS_THAN_OR_EQUALS',
                fieldName: 'date',
                fieldValue: { value: dateTo }
            })
        }
        let container = CloudKit.getDefaultContainer();
        let database = container.privateCloudDatabase;
        console.log("fetching items from " + database);
        var query = {recordType: 'LogItem', filterBy: filters}; // sortBy: [{fieldName: '???'}]
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
        let gn = this.getCategoryName;
        let cats = this.categories;
        let outputItems = [];
        records.forEach(function(element) {
            if (element.fields.date.value < dateFrom || element.fields.date.value > dateTo)
            {
                return;
            }
            if (selectedCategories && selectedCategories.length >0 && element.fields.category && selectedCategories.indexOf(element.fields.category.value.recordName) == -1){
                return;
            }

            //console.log(element)
            if (element.fields.category) {
                element.fields.categoryName = gn(element.fields.category.value.recordName, cats);
            } else {
                element.fields.categoryName = "N/A";
            }
           
            outputItems.push([
                new Date( element.fields.date.value),                
                element.fields.categoryName,
                element.fields.text.value
            ]);
        });
        this.items = outputItems;
        return outputItems;     
    }

    /**
     * 
     * @param {string} text 
     * @param {Date} date 
     * @param {string} categoriy 
     */
    addEntry(text, date, category) {
        let container = CloudKit.getDefaultContainer();
        let database = container.privateCloudDatabase;
        var record = { recordType: "LogItem",
            fields: { 
                date: { value: date.getTime() },
                text: { value: text }
                
            }
        };
        if (category) {
            record.fields.category = { value: { recordName: category } }
        }
        database.saveRecords(record).then(function(response) {
            if (response.hasErrors) {
                console.error(response.errors[0]);
                alert(error);
                return;
            }
        });
    }

    /**
     * 
     * @param {string} name 
     */
    async addNewCategory(name) {
        let container = CloudKit.getDefaultContainer();
        let database = container.privateCloudDatabase;
        var record = { recordType: "Category",
            fields: {                
                name: { value: name }                
            }
        };
        let response = await database.saveRecords(record);
        if (response.hasErrors) {
            let error = console.error(response.errors[0]);
            alert(error);
            return error;
        }
        return null;
    }

    async removeCategory(id) {
        let container = CloudKit.getDefaultContainer();
        let database = container.privateCloudDatabase;
        var record = { recordType: "Category",
            recordName: id            
        };
        let response = await database.deleteRecords(record);
        if (response.hasErrors) {
            let error = console.error(response.errors[0]);
            alert(error);
            return error;
        }
        return null;
    }
    
}
