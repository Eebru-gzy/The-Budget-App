//BUDGET CONTROLLER MODULE
var budgetController = (function () {

    //
    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function (totalIncome) {

        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function () {
        return this.percentage;
    }

    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function (type) {
        var sum = 0;
        data.allItems[type].forEach(function (cur) {
            sum += cur.value;
        });

        data.totals[type] = sum;

    }

    var data = {
        //object taking the data in according to type
        allItems: {
            exp: [],
            inc: []
        },

        //their total object
        totals: {
            exp: 0,
            inc: 0
        },

        //budget in the data structure
        budget: 0,
        //percentage of budget in the data structure
        percentage: -1
    };


    return {
        addItem: function (type, des, val) {

            var newItem, ID;

            //create new id
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length -
                    1
                ].id + 1;
            } else {
                ID = 0;
            }


            //create new item based on 'inc' or 'exp' type
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }

            //push item to the data structure
            data.allItems[type].push(newItem);

            //return item in the data structure
            return newItem;
        },

        //delete item from the array method
        deleteItem: function (type, id) {
            var ids, index;

            //select and loop over the data, as determined by the type
            ids = data.allItems[type].map(function (current) {
                //return an array but only its id
                return current.id;
            });

            //find the index of the id in the new id array
            index = ids.indexOf(id);

            //delete the id of the found id index
            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            };

        },


        calculateBudget: function () {

            //calculate the total income and expenses
            calculateTotal('inc');
            calculateTotal('exp');

            //calculate the budget (income - expenses)
            data.budget = data.totals.inc - data.totals.exp;

            //calculate the percentage of the income spent
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1
            };


        },

        calculatePercentage: function () {

            data.allItems.exp.forEach(function (current) {
                current.calcPercentage(data.totals.inc);
            });

        },

        getPercents: function () {
            var allPercent = data.allItems.exp.map(function (current) {
                return current.getPercentage();
            });
            return allPercent;
        },

        getBudget: function () {
            return {
                budget: data.budget,
                totalIncome: data.totals.inc,
                totalExpenses: data.totals.exp,
                percentage: data.percentage
            };
        },

        testing: function () {
            console.log(data);
        }

    };
})();



//UI CONTROLLER MODULE
var UIController = (function () {

    var DOMStrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expPercentLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };

    //format number method
    var formatNumber = function (num, type) {
        var numSplit, integer, decimal;

        //make the number absolute, not + or -
        num = Math.abs(num);

        //this rounds the numbers up to 2 decimals, but a string
        num = num.toFixed(2);

        //this would split the number at the decimal eg; 20.00 to '20' '00', and they're going to be in an array
        numSplit = num.split('.');

        integer = numSplit[0];

        //integer is still a string at this point, so
        if (integer.length > 3) {
            //overide former integer value because this value is now what we want... substr seperate numbers and return the numbers at their input position
            integer = integer.substr(0, integer.length - 3) + ',' + integer.substr(integer.length - 3, 3);
        }

        decimal = numSplit[1];

        return (type === 'exp' ? '-' : '+') + ' ' + integer + '.' + decimal;

    };

    //function for nodelist from selector all query
    var nodeLIstForEach = function (list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        };
    };

    //module's returning obj
    return {
        //object property
        getInput: function () {
            //returning an obj, the obj gets some values from html
            return {
                type: document.querySelector(DOMStrings.inputType).value,
                description: document.querySelector(DOMStrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
            }
        },

        addListItem: function (obj, type) {
            var html, newHtml, element;
            // create HTML string with placeholder text
            if (type === 'inc') {
                element = DOMStrings.incomeContainer;

                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div</div></div>';
            } else if (type === 'exp') {
                element = DOMStrings.expensesContainer;

                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            // replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
            // insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        //deleting method from UI
        deleteListItem: function (selectorID) {
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },

        //clearing inputs in the fields as soon as they are entered
        clearfields: function () {
            var fields, fieldArr;

            fields = document.querySelectorAll(DOMStrings.inputDescription + ', ' + DOMStrings.inputValue);

            fieldArr = Array.prototype.slice.call(fields);

            fieldArr.forEach(function (current, index, array) {
                current.value = "";
            });
            //bringing the focus back to description field
            fieldArr[0].focus();

        },

        //displaying budget method
        displayBudget: function (obj) {
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalIncome, 'inc');
            document.querySelector(DOMStrings.expensesLabel).textContent = formatNumber(obj.totalExpenses, 'exp');

            if (obj.percentage > 0) {
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMStrings.percentageLabel).textContent = '---';
            }
        },


        //this whole thing is crazy but it displays % for each expenses
        displayPercentages: function (percents) {
            var fields = document.querySelectorAll(DOMStrings.expPercentLabel);
            nodeLIstForEach(fields, function (current, index) {

                if (percents[index] > 0) {
                    current.textContent = percents[index] + '%';
                } else {
                    current.textContent = '---';
                };

            });
        },
        //display month method
        displayMonth: function () {
            var now, year, month, months;

            now = new Date();

            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
            month = now.getMonth();

            year = now.getFullYear();

            document.querySelector(DOMStrings.dateLabel).textContent = months[month] + ' ' + year;

        },

        changedType: function () {

            var fields = document.querySelectorAll(DOMStrings.inputType + ',' + DOMStrings.inputDescription + ',' + DOMStrings.inputValue);

            nodeLIstForEach(fields, function (cur) {
                cur.classList.toggle('red-focus');
            });

            document.querySelector(DOMStrings.inputBtn).classList.toggle('red');

        },
        //object property
        getDOMstrings: function () {
            return DOMStrings;
        },

    }

})();


//GLOBAL APP CONTROLLER MODULE 
var controller = (function (budgetCtrl, UICtrl) {

    //function to initialize pressing the button and pressing the enter key
    var setupEventListeners = function () {

        var DOM = UICtrl.getDOMstrings();


        //using button
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        //using enter key
        document.addEventListener('keypress', function (event) {

            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }

        });

        //delete item selector from DOM bubbling up to the container class
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        //change focus of input fields to 
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    };


    var updateBudget = function () {
        // 1. calculate the budget
        budgetCtrl.calculateBudget();

        // 2. Return budget
        var budget = budgetCtrl.getBudget();

        // 3. Display the budget on the UI
        UICtrl.displayBudget(budget);
    };

    var updatePercentages = function () {

        // 1. calculate percentages
        budgetCtrl.calculatePercentage();

        // 2. read percentages from the budget controller
        var percents = budgetCtrl.getPercents();

        // 3. update the UI with the new percentages
        UICtrl.displayPercentages(percents);
    };

    var ctrlAddItem = function () {
        var input, newItem;
        // 1. Get the field input data
        input = UICtrl.getInput();

        //if input field is not empty and  not not a number
        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {

            // 2. Add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // 3. Add the item to the UI
            UICtrl.addListItem(newItem, input.type);

            //4. clear field
            UICtrl.clearfields();

            //5. calc and update budget
            updateBudget();

            // 6. update ad calculate the percentages after an item is deleted
            updatePercentages();
        };
    };

    //delete item selector callback function
    var ctrlDeleteItem = function (event) {
        var itemID, splitID, type, ID;

        //traversing through the DOM to the container class ID
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;



        if (itemID) {

            //spliting the ID string with split method
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            //delete the item from the data structure
            budgetCtrl.deleteItem(type, ID);

            //delete from the UI
            UICtrl.deleteListItem(itemID);

            //update and show the new budget
            updateBudget();

            // update ad calculate the percentages after an item is deleted
            updatePercentages();
        };
    };

    return {
        init: function () {
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalIncome: 0,
                totalExpenses: 0,
                percentage: -1
            });
            setupEventListeners();
            console.log('application started');
        }
    }

})(budgetController, UIController);

controller.init();