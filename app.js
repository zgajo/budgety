let budgetController = ( () => {

    let Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    }

    Expense.prototype.calcPercentage = function(totalIncome){

        this.percentage = Math.round((this.value / totalIncome) * 100 );

    }

    Expense.prototype.getPercentage = function(){
        return this.percentage;
    }

    let Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    };

    let calculateTotal = function(type){
        let sum = 0;
        data.allItems[type].forEach( element => {
            sum += element.value;
        });
        data.totals[type] = sum;
    }

    let data = {
        allItems: {
            inc: [],
            exp: []
        },
        totals: {
            inc: 0,
            exp: 0
        },
        budget: 0,
        percentage: -1
    }

    return{
        addItem: function(type, desc, val){
            let ID, newItem;

            //Create new id
            //                                      id of last element in array +1
            ID = (data.allItems[ type ].length) ? 
                    data.allItems[ type ][ data.allItems[type].length - 1 ].id + 1 
                    : 1; 
            //Create new item, based on it's type
            newItem = (type && type == 'exp') ? new Expense(ID, desc, val) : new Income(ID, desc, val) ;

            data.allItems[type].push(newItem)
            return newItem;
        },
        test: function(){
            return data;
        },
        calculateBudget: function(){

            // calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            //calculate the budget: income - expenses
            data.budget = data.totals['inc'] - data.totals['exp'];

            // calculate the percentaga of income that we spent
            if(data.totals.inc > 0){
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
    
            }else{
                data.percentage = -1;  
            }

        },
        calculatePercentages: function(){

            if(data.totals.inc > 0){
                data.allItems.exp.forEach( current => current.calcPercentage(data.totals.inc) )
            }

        },

        getPercentages: function(){

            let arrPerc = data.allItems.exp.map(function(current){
                return current.getPercentage();
            })

            console.log(arrPerc)
            return arrPerc;

        },

        getBudget: function(){
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        },
        deleteItem: function(type, id){
            data.allItems[type] = data.allItems[type].filter(current => current.id != id);
        }
    }

})();





let UIController = (function(){

    let DOMstrings = {
        inputType:".add__type",
        inputDesc: ".add__description",
        inputVal: ".add__value",
        inputBtn: ".add__btn",
        incomeContainer: ".income__list",
        expensesContainer: ".expenses__list",
        percentageContainer: ".item__percentage",
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        dateLabel: ".budget__title--month"
    }

    

    function formatNumber(num, type){
        /**
         * + or - before number
         * exactly 2 decimal points
         * comma separationg the thousands
         * 
         * 2310.4567 -> 2,310.45
         * 2000 -> + 2,000.00
         */

         num = Math.abs(num);
         num = num.toFixed(2);

         let numSplit = num.split("."), 
            int = numSplit[0], 
            dec = numSplit[1],
            sign;

         if(int.length > 3){
            int = int.substring(0, int.length - 3 ) + ',' + int.substring(int.length - 3, int.length);
         }

         type === 'exp' ? sign = '-' : sign = '+';

         return sign + ' ' + int + '.' + dec;

    }

    
    let nodeListForEach = function(list, callback){

        for(let i = 0; i< list.length; i++){
            callback(list[i], i);
        }

    };

    

    return {
        getInput: function(){
            return {
                type: document.querySelector(DOMstrings.inputType).value,  // inc for +, exp for -
                desc: document.querySelector(DOMstrings.inputDesc).value,
                val: parseFloat(document.querySelector(DOMstrings.inputVal).value) 
            }
            
        }, 

        clearInputFields: function(){
            
            let fields = document.querySelectorAll(DOMstrings.inputDesc + ', ' + DOMstrings.inputVal)
            // giving to fields list a method slice from arrays
            let fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(element => {
                element.value = '';
            });

            fieldsArr[0].focus();

        },

        displayBudget: function(obj){

            let type = (obj.budget > 0) ? 'inc' : 'exp';

            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent =  formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent =  formatNumber(obj.totalExp, 'exp');
            document.querySelector(DOMstrings.percentageLabel).textContent = (obj.percentage == -1) ? '---' : obj.percentage + '%';

        },

        displayPercentages: function(percentages){
            
            let fields = document.querySelectorAll(DOMstrings.percentageContainer);

            nodeListForEach(fields, function(current, index){
                if(percentages[index] > 1){
                    current.textContent = percentages[index] + ' %';
                }
                else{
                    current.textContent = '---';
                }
                
            })

        },

        getDOMstrings: function(){
            return DOMstrings;
        },

        addListItem: function(obj, type){

            let html, element;
            //add HTML string with placeholder text

            if(type === 'inc'){

                element = DOMstrings.incomeContainer;

                html = `<div class="item clearfix" id="inc-${obj.id}">
                            <div class="item__description">${obj.description}</div>
                            <div class="right clearfix">
                                <div class="item__value">${formatNumber(obj.value, type)}</div>
                                <div class="item__delete">
                                    <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                                </div>
                            </div>
                        </div>`
            }else{

                element = DOMstrings.expensesContainer;

                html = `<div class="item clearfix" id="exp-${obj.id}">
                            <div class="item__description">${obj.description}</div>
                            <div class="right clearfix">
                                <div class="item__value">${formatNumber(obj.value, type)}</div>
                                <div class="item__percentage">21%</div>
                                <div class="item__delete">
                                    <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                                </div>
                            </div>
                        </div>`
            }

            // insert the HTML into DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', html);

        },

        changedType: function(){
            let fields = document.querySelectorAll(DOMstrings.inputType + ',' + DOMstrings.inputDesc  + ',' + DOMstrings.inputVal);

            nodeListForEach(fields, function(curr){
                curr.classList.toggle('red-focus');
            });

            document.querySelector(DOMstrings.inputBtn).classList.toggle('red')

        },

        deleteFromDOM: function(type, id){
            document.getElementById(type + '-' + id).outerHTML = "";
        },

        displayDate: function(){
            
            let now = new Date();
            document.querySelector(DOMstrings.dateLabel).textContent = now.getMonth() + 1 + '.' + now.getFullYear();
        }

    }

})();





let appController = (function(budgetCtrl, UICtrl){

    let setupEventListeners = function(){

        let DOM = UICtrl.getDOMstrings();

        //listener on add icon
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        //listener on key enter press
        document.addEventListener('keypress', (ev)=>{
            //Pressed enter
            if(ev.keyCode == 13 || ev.which == 13 ){
                ctrlAddItem()
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);

    }

    let updateBudget = function(){

        // calculate the budget
        budgetCtrl.calculateBudget();

        // return the budget
        let budget = budgetCtrl.getBudget();

        // display budget on UI
        UICtrl.displayBudget(budget);
    }

    let updatePercentages = function(){

        // calculate
        budgetCtrl.calculatePercentages();

        // read from budget controller
        let percentages = budgetCtrl.getPercentages();

        // uptate UI
        UICtrl.displayPercentages(percentages)

    }
    

    let ctrlAddItem = function(){

        let input, addedItem;

        //Get the input field data
        input = UICtrl.getInput();

        if(input.desc != "" && input.val && !isNaN(input.val)  ){

            // Add the item to budget constroller
            addedItem = budgetCtrl.addItem(input.type, input.desc, input.val);

            //add item to UI
            UICtrl.addListItem(addedItem, input.type)

            //clear the input fields
            UICtrl.clearInputFields()

            // calculate and update budget
            updateBudget();

            // calculate and update percentages
            updatePercentages();

        }

    }

    

    let ctrlDeleteItem = function(event){

        let itemID, type, splitID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if(itemID){

            splitID = itemID.split('-');
            type = splitID[0];
            ID = splitID[1];

            // delete from data structure
            budgetCtrl.deleteItem(type, ID);

            // delete from UI
            UICtrl.deleteFromDOM(type, ID);

            // update and show the new budget
            updateBudget();

        }

    }
    
    return{
        init: function(){
            console.log('Started')
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            })
            setupEventListeners()
            UICtrl.displayDate();
        }
    }
    

})(budgetController, UIController);


appController.init();