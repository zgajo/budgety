let budgetController = ( () => {

    let Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
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
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container'
    }

    let groupLongNumbers = function(num){
        return num.toLocaleString('hr', {useGrouping:true})
    }

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

            document.querySelector(DOMstrings.budgetLabel).textContent = (obj.budget > -1) ?  groupLongNumbers(obj.budget) :  groupLongNumbers(obj.budget) ;
            document.querySelector(DOMstrings.incomeLabel).textContent =  '+ ' + groupLongNumbers(obj.totalInc);
            document.querySelector(DOMstrings.expensesLabel).textContent =  '- ' + groupLongNumbers(obj.totalExp);
            document.querySelector(DOMstrings.percentageLabel).textContent = (obj.percentage == -1) ? '---' : obj.percentage + '%';

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
                                <div class="item__value">+ ${groupLongNumbers(obj.value)}</div>
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
                                <div class="item__value">- ${groupLongNumbers(obj.value)}</div>
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

        deleteFromDOM: function(type, id){
            document.getElementById(type + '-' + id).outerHTML = "";
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

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem)

    }

    let updateBudget = function(){

        // calculate the budget
        budgetCtrl.calculateBudget();

        // return the budget
        let budget = budgetCtrl.getBudget();

        // display budget on UI
        UICtrl.displayBudget(budget);
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
        }
    }
    

})(budgetController, UIController);


appController.init();