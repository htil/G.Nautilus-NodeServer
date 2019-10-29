const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('readings.db');
const markDb = new sqlite3.Database('markings.db');

const MASTER_IP = "10.123.147.26";

const WebSocket = require('ws');
const ws = new WebSocket("ws://" + MASTER_IP + ":3000");
const server = new WebSocket.Server({ port: 3002 });

var recordData = true;

ws.binaryType = "arraybuffer";

ws.onopen = () => {
	console.log("Connection opened");
}

queue = [];
ws.onmessage = (msg) => {
	if (recordData) {
		let d = new Float32Array(msg.data);
		let date = Date.now();
	
		queue.push({time: date, data: d});
	}
};

server.on("connection", (cli) => {

	cli.on("message", stuff => {
		console.log(JSON.parse(stuff));
		let data = JSON.parse(stuff);
		let stmt = markDb.prepare("INSERT INTO message VALUES (?, ?, ?)");
		stmt.run(data.time, data.type, data.value);
		stmt.finalize();
		if (data.value == "Record") {
			console.log("Recording session started");
			recordData = true;
		}
		else if (data.value == "Stop") {
			console.log("Rest recording time");
		} else if (data.value == "Start") {
			console.log("Data recording begins");
		} else if (data.value == "Quit") {
			closeProcess();
		}
	});
});

db.serialize(function() {
	db.run("CREATE TABLE IF NOT EXISTS signals (time INTEGER, channel INTEGER, val REAL)");
});

markDb.serialize(function() {
	markDb.run("CREATE TABLE IF NOT EXISTS message (time INTEGER, type INTEGER, value TEXT)");
});

// Use transactions for very quick insertions (>10k)
let insert = () => {
	len = queue.length;
	
	console.log("Inserting " + len + " values");
	db.run("BEGIN TRANSACTION");
	let stmt = db.prepare("INSERT INTO signals VALUES (?, ?, ?)");
	for (let i = 0; i != len; ++i) {
		let d = queue.shift();
		d.data.forEach((signal, index) => {
			stmt.run(d.time, index, signal);
		});
	}
	stmt.finalize(() => db.run("END TRANSACTION"));
	
	console.log("Finished inserting " + len + " values");
};

handle = setInterval(insert, 2000);

function closeProcess() {
	ws.close();
	insert();
	
	console.log("Start close...");
	clearInterval(handle);
	
 	try {
 		let p = db.close((err) => {
			if (err)
				throw err;
			
			console.log("Closed signals DB");
			process.exit();
		});
 	} catch (e) {
 		console.log("Couldn't close signals DB. good luck.");
	 }
	 
	 try {
		let p = markDb.close((err) => {
		   if (err)
			   throw err;
		   
		   console.log("Closed marks DB");
		   process.exit();
	   });
	} catch (e) {
		console.log("Couldn't close marks DB. good luck.");
	}
}

process.on('SIGINT', () => {
	ws.close();
	insert();
	
	console.log("Start close...");
	clearInterval(handle);
	
 	try {
 		let p = db.close((err) => {
			if (err)
				throw err;
			
			console.log("Closed DB");
			process.exit();
		});
 	} catch (e) {
 		console.log("Couldn't close DB. good luck.");
 	}
});