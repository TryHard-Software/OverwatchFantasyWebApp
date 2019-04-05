var ncp = require('ncp').ncp;
var rimraf = require('rimraf');
var fs = require('fs');

fs.readFile('./build/client/app/index.html', 'utf8', (err, data) => {
    if (err) console.error(err);
    data = data.replace(`href="/static/css/`, `href="/app/static/css/`);
    data = data.replace(`src="/static/js/`, `src="/app/static/js/`);
    fs.writeFile('./build/client/app/index.html', data, (err) => {
        if (err) console.error(err);
    });
});

// copy server views folder
copyFolder("./server/views", "./build/server/views", (err) => { if(err) console.error(err);});

// copy client public files
copyFolder("./client/css", "./build/client/css", (err) => { if (err) console.error(err); });
copyFolder("./client/fonts", "./build/client/fonts", (err) => { if (err) console.error(err); });
copyFolder("./client/images", "./build/client/images", (err) => { if (err) console.error(err); });
copyFolder("./client/js", "./build/client/js", (err) => { if (err) console.error(err); });
copyFolder("./client/.well-known", "./build/client/.well-known", (err) => { if (err) console.error(err); });

function copyFolder(source, destination, callback) {
    rimraf(destination, function (err) {
        if (err) {
            callback(err);
            return;
        }
        fs.mkdir(destination, function (err) {
            if (err) {
                callback(err);
                return;
            }
            ncp(source, destination, function (err) {
                if (err) {
                    callback(err);
                    return;
                }
                callback(null);
            });
        });
    });
};



