var db = require('./repository.js');
var backToMainMenu;
var list;
var step = 0;
var personIndex;
var telephoneIndex;

function dispayScreenMessage() {
    console.log('');
    console.log('................DELETE SCREEN..................');
    console.log('Enter the person id to be deleted (b to back):');
}

function displaySelectPhoneNumberMessage () {
    console.log('');
    console.log('Enter the phone id to be deleted (b to back):');
}

function displayErrorMessage(message) {
    console.log('');
    console.log('.....................ERROR.....................');
    console.log(message);
}

function displayConfirmMessage() {
    console.log('');
    console.log('Are you sure? (y for yes, any key to cancel):');
}

function displayDeletePersonConfirmMessage (name) {
    console.log('');
    console.log('Do you want to delete '+ name +'\'s contact as well (y for yes, any key to cancel):');
}

function getdataError () {
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

function removePerson(index) {
    var temp = list[index];
    list.splice(index, 1);
    db.saveData(list, function () {
        step = 0;
        displayList();
    }, function () {
        list.splice(index, 0, temp);
        updateError();
    });
}

function deletePhoneNumber (personId, phoneId) {
    var temp = list[personId].numbers[phoneId];
    list[personId].numbers.splice(phoneId, 1);
    db.saveData(list, function () {
        step = 0;
        displayList();
    }, function () {
        list[personId].numbers.splice(phoneId, 0, temp);
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
                    if (list[personIndex].numbers.length <= 1) {
                        step = 1;
                        displayDeletePersonConfirmMessage(list[personIndex].name);
                    }
                    else {
                        step = 2;
                        displaySelectPhoneNumberMessage();
                    }
                }
            }
        }
    }
    else if (step === 1) {
        if (input.toLowerCase() === 'y') {
            removePerson(personIndex);
        }
        else {
            step = 0;
            displayList();
        }
    }
    else if (step === 2) {
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
                    step = 3;
                    displayConfirmMessage();
                }
            }
        }
    }
    else if (step === 3) {
        if (input.toLowerCase() === 'y') {
            deletePhoneNumber(personIndex, telephoneIndex);
        }
        else {
            step = 0;
            displayList();
        }
    }
}