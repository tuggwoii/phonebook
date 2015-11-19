var db = require('./repository.js');
var backToMainMenu;
var step = 0;
var list;
var personIndex;
var currentInputNumber
var replaceIndex;

function displayScreenMessage () {
    console.log('');
    console.log('..........INSERT PHONE NUMBER SCREEN...........');
    console.log('Enter a phone number to be inserted (b to back):');
}

function displayErrorMessage (message) {
    console.log('');
    console.log('.....................ERROR.....................');
    console.log(message);
}

function displayStatusMessage (message) {
    console.log('');
    console.log('.....................INFO......................');
    console.log(message);
}

function displayInputNameMessage () {
    console.log('');
    console.log('Enter the name (8 characters maximum): ');
}

function displayMessageReplaceOrNew () {
    console.log('');
    console.log('Enter the person id to append or \'n\' for new person (b to back):');
}

function displayConfirmReplaceMessage (name, oldNumber, newNumber) {
    console.log('');
    console.log('Do you want to replace ' + name + '\'s contact ' + oldNumber + ' with ' + newNumber + ' (y for yes, any key to cancel): ');
}

function displayAddToExistingPersonMessage () {
    console.log('');
    console.log('Enter the replaced number or \'n\' for new phone number (b to back/cancel):');
}

function displayList (results) {
    console.log('');
    console.log('..................CURRENT LIST.................');
    if (results && results.length) {
        var personIndex = 0;
        results.filter(function (person) {
            personIndex++;
            var name = person.name;
            if (name.length > 8) {
                name = name.substring(0, 7);
            }
            console.log('[' + personIndex + '] ' + name);
            var numberIndex = 0;
            person.numbers.filter(function (number) {
                numberIndex++;
                console.log('- [' + numberIndex + '] ' + number);
            });
        });
    }
    else {
        console.log('NO RESULT.');
    }
}

function validateInput (input) {
    var reg = /^\d+$/;
    if (reg.test(input)) {
        if (input.length > 10) {
            displayErrorMessage('The phone number is to long!');
        }
        else if (input.length < 10) {
            displayErrorMessage('The phone number is to short!');
        }
        else {
            return true;
        }
    }
    else {
        displayErrorMessage('Invalid phone number!');
    }
    return false;
}

function checkExistingNumber (number, notExistCallback, existingCallback) {
    db.getData(function (data) {
        list = data;
        var query = list.filter(function (person) {
            if (person.numbers.indexOf(number) > -1) {
                return person;
            }
        });
        if (query.length > 0) {
            existingCallback();
        }
        else {
            notExistCallback();
        }
    }, function () {
        updateError();
    });
}

function processInsertPhoneNumber (input) {
    currentInputNumber = input;
    db.getData(function (data) {
        list = data;
        displayList(list);
        displayMessageReplaceOrNew();
    }, function () {
        updateError();
    });
}

function createNewPerson () {
    displayInputNameMessage();
}

function updateSuccess (list) {
    displayList(list);
    step = 0;
    displayScreenMessage();
}

function updateError () {
    displayErrorMessage('Can\'t get the data!')
    step = 0;
    displayScreenMessage();
}

function addNewPersonToList(name, number) {
    var person = {
        name: name,
        numbers: []
    };
    person.numbers.push(number);
    list.push(person);
    db.saveData(list, function () {
        updateSuccess(list);
    }, function () {
        list.splice(-1, 1);
        updateError();
    });
}

function addToExistingPerson (index, number) {
    personIndex = index;
    displayAddToExistingPersonMessage();
}

function addNumberToExistingPerson() {
    if (list[personIndex].numbers.length >= 5) {
        var name = list[personIndex].name;
        if (name.length > 8) {
            name = name.substring(0, 7);
        }
        displayErrorMessage(name + ' has 5 phone numbers already!');
        displayAddToExistingPersonMessage();
    }
    else {
        list[personIndex].numbers.push(currentInputNumber);
        db.saveData(list, function () {
            updateSuccess(list);
        }, function () {
            list[personIndex].numbers.splice(-1, 1);
            updateError();
        });
    }
}

function replaceNumber (index) {
    var temp = list[personIndex].numbers[index];
    list[personIndex].numbers[index] = currentInputNumber;
    db.saveData(list, function () {
        updateSuccess(list);
    }, function () {
        list[personIndex].numbers[index] = temp;
        updateError();
    });
}

exports.start = function (back) {
    backToMainMenu = back;
    displayScreenMessage();
}

exports.recieveInput = function (input) {
    //Main screen
    if (step === 0) {
        if (input === 'b') {
            backToMainMenu();
        }
        else if (validateInput(input)) {
            checkExistingNumber(input, function () {
                step = 1;
                processInsertPhoneNumber(input);
            }, function () {
                displayErrorMessage("This number is already exist!");
                displayScreenMessage();
            });
        }
        else {
            displayScreenMessage();
        }
    }
    else if (step === 1) {
        if (input === 'b') {
            step = 0;
            displayScreenMessage();
        }
        else if (input === 'n') {
            step = 2;
            createNewPerson();
        }
        else {
            var index = parseInt(input);
            var reg = /^\d+$/;
            if (!reg.test(input)) {
                displayErrorMessage('Invalid input!');
                displayMessageReplaceOrNew();
            }
            else if (isNaN(index)) {
                displayErrorMessage('Invalid input!');
                displayMessageReplaceOrNew();
            }
            else {
                if (index > list.length || index <= 0) {
                    displayErrorMessage('Invalid input!');
                    displayMessageReplaceOrNew();
                }
                else {
                    step = 3;
                    addToExistingPerson(index -1 , input);
                }
            }
        }
    }
    else if (step === 2) {
        if (input === 'b') {
            step = 0;
            displayScreenMessage();
        }
        else {
            if (input.length > 8 || input.length === 0) {
                displayErrorMessage('name must less than or equal 8 charactors and not be empty!');
                displayInputNameMessage();
            }
            else {
                addNewPersonToList(input, currentInputNumber);
            }
        }
    }
    else if (step === 3) {
        if (input === 'b') {
            step = 0;
            displayScreenMessage();
        }
        else if (input === 'n') {
            addNumberToExistingPerson();
        }
        else {
            var index = parseInt(input);
            var reg = /^\d+$/;
            if (!reg.test(input)) {
                displayErrorMessage('Invalid input!');
                displayAddToExistingPersonMessage();
            }
            else if (isNaN(index)) {
                displayErrorMessage('Invalid input!');
                displayAddToExistingPersonMessage();
            }
            else {
                if (index <= list[personIndex].numbers.length && index > 0) {
                    step = 4;
                    replaceIndex = index - 1;
                    displayConfirmReplaceMessage(list[personIndex].name, list[personIndex].numbers[replaceIndex], currentInputNumber);
                }
                else {
                    displayErrorMessage('Invalid input!');
                    displayAddToExistingPersonMessage();
                }
            }
        }
    }
    //Confirm replace
    else if (step === 4) {
        if (input.toLowerCase() === 'y') {
            replaceNumber(replaceIndex);
        }
        else {
            step = 0;
            displayStatusMessage('Cancel replace phone number!');
            displayScreenMessage();
        }
    }
}