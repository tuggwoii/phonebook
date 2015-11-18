var fs = require('fs');
var dbPath = 'data/db.json';
var cacheData = 0;

function writeFile (data, success, fail) {
    fs.writeFile(dbPath, data, function (e) {
        if (e) {
            console.log(e);
            fail();
        }
        else {
            success();
        }
    });
}

function readFile () {
    try {
        var data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
        return data;
    }
    catch (e) {
        console.log('Error: ' + e.message);
        return false;
    }
}

function tryGetData(success, fail, count) {
    cacheData = readFile();
    if (count < 3) {
        if (!cacheData) {
            count++;
            console.log('Get data fail. Retry (' + count + ') in 3 seconds');
            setTimeout(function () {
                loadData(success, fail, count);
            }, 3000);
        }
        else {
            success(cacheData);
        }
    }
    else {
        console.log('maximum retry to get the data.');
        fail();
    }
}

exports.saveData = function (data, success, fail) {
    try {
        if (data) {
            var content = JSON.stringify(data);
            
            writeFile(content, function(){
                cacheData = data;
                success();
            }, fail)
        }
        else {
            fail();
        }
    }
    catch (e) {
        console.log('Error: ' + e.message);
        fail();
    }
}

exports.getData = function (success, fail) {
    if (cacheData) {
        success(cacheData);
    }
    else {
        tryGetData(success, fail, 0);
    }
}