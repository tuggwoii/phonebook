var sys = require("sys");
var searchModule = require('./search.js');
var insertModule = require('./insert.js');
var deleteModule = require('./delete.js');
var editModule = require('./edit.js');
var stdin = process.openStdin();
var screen = 0;

function appStasrt () {
    mainScreen();
}

stdin.addListener("data", function (d) {
    var input = d.toString().trim();
    if (screen === 0) {
        mainScreenInput(input);
    }
    else if (screen === 1) {
        searchModule.recieveInput(input);
    }
    else if (screen === 2) {
        insertModule.recieveInput(input);
    }
    else if (screen === 3) {
        editModule.recieveInput(input);
    }
    else if (screen === 4) {
        deleteModule.recieveInput(input);
    }
});

function mainScreen () {
    screen = 0;
    console.log('');
    console.log('.............PHONE BOOK MAIN SCREEN............');
    console.log('input your command (h for help) :');
}

function exit () {
    console.log('');
    console.log('.....................EXIT......................');
    console.log('program has been close......');
    process.exit(0);
}

function mainScreenInput(input) {
    if (input === 'x') {
        exit();
    }
    else if (input === 'h') {
        console.log('');
        console.log('....................HELP.......................');
        console.log('i - insert a phone number');
        console.log('d - delete a phone number');
        console.log('m - modify a phone number');
        console.log('s - search');
        console.log('x - exit program');
        console.log('...............................................');
    }
    else if (input === 's') {
        screen = 1;
        searchModule.start(mainScreen);
    }
    else if (input === 'i') {
        screen = 2;
        insertModule.start(mainScreen);
    }
    else if (input === 'm') {
        screen = 3;
        editModule.start(mainScreen);
    }
    else if (input === 'd') {
        screen = 4;
        deleteModule.start(mainScreen);
    }
    else {
        console.log('');
        console.log('.....................ERROR.....................');
        console.log('invalid command!');
        mainScreen();
    }
}
appStasrt();
