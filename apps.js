/* BUDGET CONTROLLER */

var budgetController = (function() {

    //Expense Constructor
    var Expense = function (id, description, value) { 
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(totalIncome) {  
        if(totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function() {
        return this.percentage;
    }
    

    //Income Constructor
    var Income = function (id, description, value) { 
        this.id = id;
        this.description = description;
        this.value = value;
    };

    //Data structure to store incomes and expenses
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };
    
    var calculateTotal = function(type) {
        
        var sum = 0;
        data.allItems[type].forEach(function(curr) {
            sum += curr.value;
        } );

        data.totals[type] = sum;
    };

    var clearData = function(obj) {
        data.allItems.exp = [];
        data.allItems.inc= [];
        data.totals.exp = 0;
        data.totals.inc= 0;
        data.budget= 0;
        data.percentage= -1;
    }

    

    return {
        //Public method
        addItem: function(type, des, val) {
            var newItem;

            //create new ID
            if(data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }
            

            //create new item based on type(inc/exp)
            if(type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if(type === 'inc') {
                newItem = new Income(ID, des, val);
            }

            //push items into the data structure based on type
            data.allItems[type].push(newItem);

            //return new item so other controllers can acces it
            return newItem;
           
        },

        deleteItem: function(type, id) {

            var ids, index;

            ids = data.allItems[type].map(function (current) {
                return current.id;
            });

            index = ids.indexOf(id);

            if(index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },

        calculateBudget: function() {
            // 1. Calculate Total Income and Total Expenses
            calculateTotal('exp');
            calculateTotal('inc');

            // 2. Calculate the budget -> income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            // 3. Calculate the percentage of the income that we spent
            if(data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
            

        },

        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },

        calculatePercentages: function() {
            data.allItems.exp.forEach(function(cur) {
                cur.calcPercentage(data.totals.inc);
            });
        },

        getPercentages: function() {
            var allPerc = data.allItems.exp.map(function(cur) {
                return cur.getPercentage();
            });
            return allPerc;
        },


        // Add data to Local Storage
        addToLocalStorage: function() {
            localStorage.setItem('data', JSON.stringify(data));
        },

        // Get items from Local Storage
        getFromLocalStorage: function() {
            getData = JSON.parse(localStorage.getItem('data'));
            return getData;
        },

        // Update data in Local Storage
        updateDataInLocalStorage: function(dataStored) {
            data.totals = dataStored.totals;
            data.budget = dataStored.budget;
            data.percentage = dataStored.percentage;
        },

        // Clear entire data from Local Storage
        clearFromLocalStorage: function() {
            localStorage.removeItem('data');
        },

        getData: function() {
             clearData(data);
        },

        test: function () { 
            console.log(data);
         }

    };

}());


/* UI CONTROLLER */

var UIController = (function() {

    var DOMstrings = {
            inputBtn: '.add__btn',
            inputType: '.input__toggle',
            inputDescription: '.add__description',
            inputValue: '.add__value',
            container: '.panel',
            budgetLabel: '.budget__head--value',
            incomeLabel: '.budget__income--value',
            expenseLabel: '.budget__expense--value',
            percentageLabel: '.budget__expense--percentage',
            cont: '.container',
            expensePercLabel: '.panel__item__value-percentage',
            dateLabel: '.budget__head--month',
            clearLabel: '.budget__trash'
    };

    var formatNumber = function(num, type) {
        /* +/- before num, exactly 2 decimal places, comma seperating thousands */
        var num, numSplit, int, dec, type;

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];
        

        if(int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        }

        dec = numSplit[1];

        return (type === 'exp' ? sign = '-' : sign = '+') + ' ' + int + '.' + dec;
    };


    return {
        
        getInput: function() {
            return {
                type: document.querySelector(DOMstrings.inputType).checked ? 'exp' : 'inc',
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            }
        },

        addListItem: function(obj, type) {
            var html, newHtml, element;
            //1. create html string with place holder text 

            if(type === 'inc') {
                element = DOMstrings.container;
                html = '<div class="panel__item panel__item-income" id="inc-%id%"><div class="panel__item__description"><div class="panel__item__description-name">%description%</div></div> <ion-icon name="trending-up" class="panel__item__trending"></ion-icon> <div class="panel__item__value panel__item__-income-value"><div class="panel__item__value-num panel__item__-income-value-num">%value%</div></div> <button class="panel__item__delete-income"><ion-icon name="close-circle-outline"></ion-icon></button></div>';




            } else if(type === 'exp') {
                element = DOMstrings.container;
                html = '<div class="panel__item panel__item-expense" id="exp-%id%"><div class="panel__item__description"><div class="panel__item__description-name">%description%</div></div><ion-icon name="trending-down" class="panel__item__trending"></ion-icon><div class="panel__item__value"><div class="panel__item__value-num">%value%</div><div class="panel__item__value-percentage">113%</div></div><button class="panel__item__delete-expense"><ion-icon name="close-circle-outline"></ion-icon></button> </div>';
            }
            
            //2. replace place holder text with data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            //3. Insert the html into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);


        },

        deleteListItem: function(selectorID) {

            var el = document.getElementById(selectorID);el.parentNode.removeChild(el);
        },

        clearFields: function() {
            var fields, fieldsArray;
            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);

            fieldsArray = Array.prototype.slice.call(fields);

            fieldsArray.forEach(function(current) {
                current.value = "";
            });

            fieldsArray[0].focus();
        },


        changeType: function() {
            var fields = document.querySelectorAll(
              DOMstrings.inputType + ',' + DOMstrings.inputDescription + ',' + DOMstrings.inputValue
            );
      
            Array.prototype.forEach.call(fields, function(current) {
              current.classList.toggle('add__description-red');
              current.classList.toggle('add__value-red');
            });
      
            document.querySelector(DOMstrings.inputBtn).classList.toggle('add__red-btn');
        },

        displayBudget: function(obj) {

            var type;

            obj.budget > 0 ? type = 'inc' : type = 'exp';
            
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expenseLabel).textContent = formatNumber(obj.totalExp, 'exp');
            

            if(obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }
        },

        displayPercentages: function(percentages) {
            var fields = document.querySelectorAll(DOMstrings.expensePercLabel);

            fields.forEach(function(cur, index) {
                if(percentages[index] > 0) {
                    cur.textContent = percentages[index] + '%';
                } else {
                    cur.textContent = '---'
                }  
            });
        },

        displayDate: function() {
            var now, year, month, months;
            now = new Date();

            year = now.getFullYear();

            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            month = now.getMonth();
            
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
        },

        getDOMStrings: function() {
            return DOMstrings;
        }
    
        
    };

    
}());




/* APP CONTROLLER */

var controller = (function(budgetCtrl, UICtrl) {

    //setupEventListners

    var setupEventListners = function() {
        var DOM = UICtrl.getDOMStrings();
        
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
        
        document.addEventListener('keypress', function (e) { 
            
            if(e.keyCode === 13 || e.which === 13) {
           
            ctrlAddItem();
            }

        });

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changeType);
        document.querySelector(DOM.cont).addEventListener('click', crtlDeleteItem);
        document.querySelector(DOM.clearLabel).addEventListener('click', clearLocalStorage);

    };

    // Load data from local storage
    var loadDataFromLocalStorage = function() {

        var storedData, newIncomeItem, newExpenseItem;
        // 1. Get the data from local storage
        storedData = budgetCtrl.getFromLocalStorage();

        // 2. Update the data structure
        if(storedData) {
            budgetCtrl.updateDataInLocalStorage(storedData);
            
            // 3. Create income obj
            
            storedData.allItems.inc.forEach(function(curr) {
                newIncomeItem = budgetCtrl.addItem('inc', curr.description, curr.value);
                UICtrl.addListItem(newIncomeItem, 'inc');
            });
            
            // 4. Create exp object
            storedData.allItems.exp.forEach(function(curr) {
                newExpenseItem = budgetCtrl.addItem('exp', curr.description, curr.value);
                UICtrl.addListItem(newExpenseItem, 'exp');
            });
            
            // 5. Display budget
            var localBudget = budgetCtrl.getBudget();
            UICtrl.displayBudget(localBudget);
            
            // 6. Display percentage
            updatePercentages();
        }


    };


    var updateBudget = function() {
        // 1. calculate Budget 
        budgetCtrl.calculateBudget();

        // 2. Display Budget
        var budget = budgetController.getBudget();

        // 3. Display budget on UI
        UICtrl.displayBudget(budget);
    };

    var updatePercentages = function() {
        // 1. calculate percentages 
        budgetCtrl.calculatePercentages();

        // 2. Read percentages from budget controller
        var percentages = budgetCtrl.getPercentages();

        // 3. Update UI with new percentages
        UICtrl.displayPercentages(percentages);
        
    };

    var ctrlAddItem = function() {

        var input, newItem

        // 1. Get field input data
        input = UICtrl.getInput();

        if(input.description !== "" && ! isNaN(input.value) && input.value > 0) {
            // 2. Add Item to Budget Controller
            newItem = budgetCtrl.addItem(input.type,     input.description, input.value);

            // 3. Add Item to UI Controller
            UICtrl.addListItem(newItem, input.type);

            // 4. Clear the fields
            UICtrl.clearFields();

            // 5. Calculate and update budget
            updateBudget();

            // 6. Calc and update percentages
            updatePercentages();

            // 7. Add data to the local storage
            budgetCtrl.addToLocalStorage();
        }   
    };

    var crtlDeleteItem = function (event) { 

        var itemID, splitID, type, ID;
        itemID = event.target.parentNode.parentNode.id;


        if(itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // 1. Delete the item from DS
            budgetCtrl.deleteItem(type, ID);

            // 2. Delete item from UI
            UICtrl.deleteListItem(itemID);

            // 3. Update and show the new budget
            updateBudget();

            // 4. Calc and update percentages
            updatePercentages();

            // 5. update data to the local storage
            budgetCtrl.addToLocalStorage();
        }
     };


     var clearLocalStorage = function() {
        var confirmTure = confirm('Are you sure you want to clear the data?');

        if(confirmTure) {
            budgetCtrl.clearFromLocalStorage();

            var DOM, el;

            DOM = UICtrl.getDOMStrings();

            el = document.querySelector(DOM.container);

            while(el.firstChild) {
                el.removeChild(el.firstChild);
            }

           budgetController.getData();

            // 5. Display budget
             UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
             }); 
        
     }
        
}

     


    //init
    return {
        init: function() {
            console.log('Application has started');
            UICtrl.displayDate();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
        });
            setupEventListners();
            loadDataFromLocalStorage();



        }
    } ;

}(budgetController, UIController));

controller.init();
