var http = require('http');
var sys = require('util');
var fs = require('fs');
var static = require( 'node-static' );
var file = new static.Server( './public', {
    cache: 3600,
    gzip: true
} );

http.createServer(function(req, res) {
  debugHeaders(req);

  if (req.headers.accept && req.headers.accept == 'text/event-stream') {
    if (req.url == '/events') {
      sendSSE(req, res);
    } else {
      res.writeHead(404);
      res.end();
    }
  } else {
    //res.writeHead(200, {'Content-Type': 'text/html'});
    //res.write(fs.readFileSync(__dirname + '/index.html'));
    //res.end();
		req.addListener( 'end', function () {
        file.serve( req, res );
    } ).resume();
  }
}).listen(8080);

function sendSSE(req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
		// Security issue below!
		"Access-Control-Allow-Origin": "*",
		"Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept"
  });

  var id = (new Date()).toLocaleTimeString();

  // Sends a SSE every 5 seconds on a single connection.
  setInterval(function() {
    constructSSE(res, id, getRandomPosition() );
  }, 5000);

  constructSSE(res, id, getRandomPosition());
}

function constructSSE(res, id, data) {
  res.write('id: ' + id + '\n');
  res.write("data: " + data + '\n\n');
}

function debugHeaders(req) {
  sys.puts('URL: ' + req.url);
  for (var key in req.headers) {
    sys.puts(key + ': ' + req.headers[key]);
  }
  sys.puts('\n\n');
}

function getRandomPosition() {
	return '{ lat: ' + getRandomInRange(-180, 180, 3)+', lon: ' + getRandomInRange(-90, 90, 3) + '}'
}

function getRandomInRange(from, to, fixed) {
  return (Math.random() * (to - from) + from).toFixed(fixed) * 1;
}
