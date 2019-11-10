"use strict";
const api_key = "b76d77635da6f609d5e8e84c1bca496470889617492391c87f75afc283e97ad4";


var loginState = new LoginState();
var dataModel = new DataAccess();

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
    loginState.setUpAuth().then(function(r){
        if (r)
        {
            dataModel.fetchCategories().then(function(c){
                //x.fields.name.value
                //x.recordName
                let l = document.getElementById("categoryList");
                for (var i = 0 ; i < c.length ; ++i) {
                    let span = document.createElement("div");
                    let cb = document.createElement("input");
                    cb.type = "checkbox";
                    cb.name = "categoryCB";
                    cb.id = c[i].recordName;
                    cb.value=c[i].recordName;

                    let label = document.createElement("label");
                    label.htmlFor = c[i].recordName;
                    label.appendChild(document.createTextNode(c[i].fields.name.value));

                    span.appendChild(cb);
                    span.appendChild(label);
                    l.appendChild(span);
                }                                
            });
        }
    });
})
function prepareDataTable(data) {

    let dataArray = [];
    let columns = [];

    if (document.getElementById("timeSlots").checked) {
        const start = parseInt(document.getElementById("slotstart").value) // 6 ?
        const end = parseInt(document.getElementById("slotend").value) // 21
        const slen =  parseInt(document.getElementById("slotLength").value)
        const numCols = (end - start)/slen + 1;
        
        let currentSlotStart = start;
        let currentSlotEnd = start + slen;
        columns.push({ title: "Date"});
        for (var i = 1 ; i < numCols ; ++i) {
            columns.push({ title: "" + currentSlotStart + " - " + currentSlotEnd});
            currentSlotStart += slen;
            currentSlotEnd += slen;
        }
        for (var i = 0 ; i < data.length ; ++i)
        {
            let item = data[i];
            let date = new Date(item[0]);            
            let hour = date.getHours();
            
            date.setHours(0,0,0,0); //clear time part
            if (hour < start || hour > end) {
                continue;
            }
            let slotNum = (hour - start) / slen + 1; //+1 as 0 is date 
            let existing_item = dataArray.find(function(element){ return element[0].toDateString() === date.toDateString(); });            
            let dataItem = new Array(numCols);
            dataItem.fill("", 0, numCols);
            dataItem[0] = date;
            if (existing_item) {
                dataItem = existing_item;
            }
            if (!dataItem[slotNum]) {
                dataItem[slotNum] = ""; //no "undefined"
            }
            else {
                dataItem[slotNum] += ", ";
            }
            dataItem[slotNum] += item[2];
            if (!existing_item) {
                dataArray.push(dataItem);
            }
        }

        return {
            data: dataArray,
            columns:columns,
            buttons: [
                { orientation: 'landscape', pageSize: 'LEGAL', extend: 'pdfHtml5' }
            ],
            columnDefs: [{
                targets: 0,
                render: $.fn.dataTable.render.moment('YYYY-MM-DD')
            }],
            dom: 'Blfrtip'            
       }

    }

    return {
            data: data,
            columns: [
                { title: 'Date'},
                { title: 'Category'},
                { title: 'Text'}

            ],
            buttons: [
                { orientation: 'landscape', pageSize: 'LEGAL', extend: 'pdfHtml5' }
            ],
            columnDefs: [{
                targets: 0,
                render: $.fn.dataTable.render.moment('YYYY-MM-DD')
            }],
            dom: 'Blfrtip'
       }
}

function fetchData() {
    let fromDate = new Date( parseInt(document.getElementById("fromYear").value), parseInt(document.getElementById("fromMonth").value), parseInt(document.getElementById("fromDay").value) );
    let toDate = new Date( parseInt(document.getElementById("toYear").value), parseInt(document.getElementById("toMonth").value), parseInt(document.getElementById("toDay").value) );
    let categories = document.querySelectorAll("input[name=categoryCB]:checked");
    let catids = [];
    for (var i = 0 ; i < categories.length ; ++i){
        catids.push(categories[i].value);
    }
    dataModel.fetchItems(fromDate, toDate, catids).then(function(data){
        const dataWithConfig = prepareDataTable(data);
        $("#tablecontainer").empty();
        $("#tablecontainer").append($('<table id="resulttable" class="table table-striped table-bordered"></table>'))
        let tb = $("#resulttable").DataTable(dataWithConfig);
        tb.ajax.reload();
    });
}