var db = require('./repository.js');
var backToMainMenu;
var list;
var step = 0;
var personIndex;
var telephoneIndex;
var currentPhoneNumber;

function dispayScreenMessage() {
    console.log('');
    console.log('..................EDIT SCREEN..................');
    console.log('Enter the person id to be modified (b to back):');
}

function displaySelectPhoneNumberMessage() {
    console.log('');
    console.log('Enter the phone id to be modified (b to back):');
}

function displayInputPhoneNumberMessage () {
    console.log('');
    console.log('Enter the new phone number (b to back):');
}

function displayConfirmMessage(name, oldNumber, newNumber) {
    console.log('');
    console.log('Do you want to modify ' + name + '\'s contact from ' + oldNumber +' to ' + newNumber + ' ? (y for yes, any key to cancel):');
}

function displayErrorMessage(message) {
    console.log('');
    console.log('.....................ERROR.....................');
    console.log(message);
}

function displayStatusMessage (message) {
    console.log('');
    console.log('.....................INFO......................');
    console.log(message);
}


function getdataError() {
    displayErrorMessage('Can\'t get the data!')
    step = 0;
    displayScreenMessage();
}

function uodateError() {
    displayErrorMessage('Can\'t save the data!')
    step = 0;
    displayScreenMessage();
}

function displayList () {
    db.getData(function (data) {
        list = data;
        console.log('');
        console.log('..................CURRENT LIST.................');
        if (data && data.length) {
            var personIndex = 0;
            data.filter(function (person) {
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
            dispayScreenMessage();
        }
        else {
            console.log('NO RESULT.');
        }
    }, function () {
        getdataError();
    });
}

function updatePhoneNumber(personId, phoneId, newNumber) {
    var temp = list[personId].numbers[phoneId];
    list[personId].numbers[phoneId] = newNumber;
    db.saveData(list, function () {
        step = 0;
        displayList();
    }, function () {
        list[personId].numbers[telephoneId] = temp;
        updateError();
    });
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

exports.start = function (back) {
    backToMainMenu = back;
    displayList();
}

exports.recieveInput = function (input) {
    if (step === 0) {
        if (input === 'b') {
            backToMainMenu();
        }
        else {
            var index = parseInt(input);
            var reg = /^\d+$/;
            if (!reg.test(input)) {
                displayErrorMessage('Invalid input!');
                dispayScreenMessage();
            }
            else if (isNaN(index)) {
                displayErrorMessage('Invalid input!');
                dispayScreenMessage();
            }
            else {
                if (index > list.length || index <= 0) {
                    displayErrorMessage('Invalid input!');
                    dispayScreenMessage();
                }
                else {
                    personIndex = index - 1;
                    step = 1;
                    displaySelectPhoneNumberMessage();
                }
            }
        }
    }
    else if (step === 1) {
        if (input.toLowerCase() === 'b') {
            step = 0;
            displayList();
        }
        else {
            var index = parseInt(input);
            var reg = /^\d+$/;
            if (!reg.test(input)) {
                displayErrorMessage('Invalid input!');
                displaySelectPhoneNumberMessage();
            }
            else if (isNaN(index)) {
                displayErrorMessage('Invalid input!');
                displaySelectPhoneNumberMessage();
            }
            else {
                if (index > list[personIndex].numbers.length || index <= 0) {
                    displayErrorMessage('Invalid input!');
                    displaySelectPhoneNumberMessage();
                }
                else {
                    telephoneIndex = index - 1;
                    step = 2;
                    displayInputPhoneNumberMessage();
                }
            }
        }
    }
    else if (step === 2) {
        if (input.toLowerCase() === 'b') {
            step = 0;
            displayList();
        }
        else {
            if (validateInput(input)) {
                checkExistingNumber(input, function () {
                    currentPhoneNumber = input;
                    step = 3;
                    displayConfirmMessage(list[personIndex].name, list[personIndex].numbers[telephoneIndex], input);
                }, function () {
                    displayErrorMessage("This number is already exist!");
                    displayInputPhoneNumberMessage();
                });
            }
            else {
                displayInputPhoneNumberMessage();
            }
        }
    }
    else if (step === 3) {
        if (input.toLowerCase() === 'y') {
            updatePhoneNumber(personIndex, telephoneIndex, currentPhoneNumber);
        }
        else {
            displayStatusMessage('Modefy was cancelled!');
            step = 0;
            displayList();
        }
    }
}