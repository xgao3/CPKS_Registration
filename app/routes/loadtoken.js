var csv = require('csv'); 
var obj = csv(); 
function MyCSV(Fone, Ftwo) {
    this.FieldOne = Fone;
    this.FieldTwo = Ftwo;
}; 
var MyData = []; 
obj.from.path('../sampleorg.csv').to.array(function (data) {
    for (var index = 0; index < data.length; index++) {
        MyData.push(new MyCSV(data[index][0], data[index][1]));
    }
    console.log(MyData);
});

var http = require('http');
//Load the http module.

var server = http.createServer(function (req, resp) {
    resp.writeHead(200, { 'content-type': 'application/json' });
    resp.end(JSON.stringify(MyData));
});
