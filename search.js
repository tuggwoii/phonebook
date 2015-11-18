var db = require('./repository.js');
var backToMainMenu;

function dispayScreenMessage () {
    console.log('');
    console.log('................SEARCH SCREEN..................');
    console.log('Enter 3 digit to search (b to back):');
}

function displayErrorMessage () {
    console.log('');
    console.log('.....................ERROR.....................');
    console.log('invalid input!');
}

function displaySearchResult (results) {
    console.log('');
    console.log('.................SEARCH RESULT.................');
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
    console.log('');
    console.log('Enter 3 digit to search (b to back):');
}

function search (input) {
    db.getData(function (data) {
        var result = [];
        data.filter(function (person) {
            var currentPerson = JSON.parse(JSON.stringify(person));
            var numbers = [];
            person.numbers.filter(function (number) {
                if (number.indexOf(input) > -1) {
                    numbers.push(number);
                }
            });
            if (numbers.length > 0) {
                currentPerson.numbers = numbers;
                result.push(currentPerson);
            }
        });
        displaySearchResult(result);
    }, function () {
        console.log('.....................ERROR.....................');
        console.log('Can\'t get the data!');
        dispayScreenMessage();
    });
}

exports.start = function (back) {
    backToMainMenu = back;
    dispayScreenMessage();
}

exports.recieveInput = function (input) {
    if (input === 'b') {
        backToMainMenu();
    }
    else if (input.length === 3) {
        var searchKey = parseInt(input);
        var reg = /^\d+$/;
        if (!reg.test(input)) {
            displayErrorMessage();
            dispayScreenMessage();
        }
        else if (isNaN(searchKey)) {
            displayErrorMessage();
            dispayScreenMessage();
        }
        else {
            search(input);
        }
    }
    else {
        displayErrorMessage();
        dispayScreenMessage();
    }
}