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
            loadCategories();
        }
    });
})

function createOptionElement(recordName, textValue){
    let span = document.createElement("div");
    let cb = document.createElement("input");
    cb.type = "checkbox";
    cb.name = "categoryCB";
    cb.id = recordName;
    cb.value=recordName;

    let label = document.createElement("label");
    label.htmlFor = recordName;
    label.appendChild(document.createTextNode(textValue));

    span.appendChild(cb);
    span.appendChild(label);
    return span;
}
function loadCategories() {
    dataModel.fetchCategories().then(function(c){
        //x.fields.name.value
        //x.recordName
        let l = document.getElementById("categoryList");
        let l2 = document.getElementById("categoryList2");
        let s = document.getElementById("categoryToAdd");
        s.innerHTML = '';
        l.innerHTML = '';
        l2.innerHTML = '';
        for (var i = 0 ; i < c.length ; ++i) {
            
            l.appendChild(createOptionElement(c[i].recordName, c[i].fields.name.value));
            l2.appendChild(createOptionElement(c[i].recordName, c[i].fields.name.value));
            var opt = document.createElement('option');
            opt.appendChild( document.createTextNode(c[i].fields.name.value) );
            opt.value = c[i].recordName; 
            s.appendChild(opt); 
        }                                
    });
}
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
        console.log(dataArray);
        return {
            ajax: null,
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
    console.log(data);
    return {
            data: data,
            columns: [
                { title: 'Date', type: "date"},
                { title: 'Category'},
                { title: 'Text'}

            ],
            buttons: [
                { orientation: 'landscape', pageSize: 'LEGAL', extend: 'pdfHtml5' }
            ],
            columnDefs: [{
                targets: 0,
                type: "date",
                render: $.fn.dataTable.render.moment('YYYY-MM-DD')
            }],
            dom: 'Blfrtip'
       }
}

function fetchData() {
    let fromDate = new Date(document.getElementById("from").value).getTime();
    let toDate = new Date( document.getElementById("to").value ).getTime();
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
        
    });
}

function addNewEntry() {
    let text = document.getElementById("text").value;
    let date = new Date( document.getElementById("date").value);
    
    var catSelect = document.getElementById("categoryToAdd");
    let category = e.options[e.selectedIndex].value;
    dataModel.addEntry(text, date, category);
}

async function addNewCategory() {
    let name = document.getElementById("newCategoryName").value;
    let res = await dataModel.addNewCategory(name);
    if (res == null) {
        alert('Category added');
        loadCategories();
    }
}
async function deleteCategory() {
    let arr = [];
    $("#categoryList input:checked").each(function(){
        arr.push($(this).val());
    });
    for (const a in arr) {
        await dataModel.removeCategory(arr[a]);
    }
    loadCategories();
    
}

function openTab(evt, tabName) {
    // Declare all variables
    var i, tabcontent, tablinks;
  
    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = "none";
    }
  
    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
  
    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
  }
  

$(function(){
    const config = {
        enableTime: true,
        dateFormat: "Y-m-d H:i",
        time_24hr: true
    }
    flatpickr("#date", config);
    flatpickr("#from", config);
    flatpickr("#to", config);
    // $("#date").datetimepicker({
    //     //defaultDate: 0
    // });
    // $("#from").datetimepicker({
    //     //defaultDate: -7
    // });
    // $("#to").datetimepicker({
    //    // defaultDate: 0
    // });
})