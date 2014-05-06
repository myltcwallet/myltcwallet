var mongoose = require('mongoose');
var Wallet = mongoose.model('Wallet');
var crypto = require('crypto');
var request = require("request");






exports.insert = function (req, res) {

	var wallet = new Wallet(req.body);

	var sha256 = crypto.createHash("sha256");
	sha256.update(wallet.payload);
	var result = sha256.digest("hex");

	if (result != wallet.checksum) {
		throw new Error('checksum');
		return;
	}
	
	req.param('active').split("|").forEach(function(addr){
		wallet.address.push(addr);
	});
	
	wallet.backups.push({
		guid:wallet.guid,
		payload:wallet.payload,
		size:wallet.payload.length,
		name:wallet.guid+'.aes.json'
	});

	wallet.save(function (err) {
	    if (err) {

	    }
	    res.end("New wallet successfully saved");
	});
}




exports.create = function (req, res) {
	res.render('new');
}



exports.guid = function (req, res) {
	
	if (req.param('format') != "json") {
		crypto.randomBytes(32, function(err, bytes) {
				if (err) throw err;

				var hex = [];
				for (i = 0; i < bytes.length; i++) {
					hex.push((bytes[i] >>> 4).toString(16));
					hex.push((bytes[i] & 0xF).toString(16));
				}

			res.render('index',{guid:req.param('guid'),checksum:"xxxx",seed:hex.join("")});
		});
		return;
	}


	Wallet.findOne({ guid : req.param('guid') }).exec(function (err, wallet) {
		if (err || !wallet) return new Error('Failed to load Wallet ' + req.param('guid'));

      		crypto.randomBytes(32, function(err, bytes) {
				if (err) throw err;

				var hex = [];
				for (i = 0; i < bytes.length; i++) {
					hex.push((bytes[i] >>> 4).toString(16));
					hex.push((bytes[i] & 0xF).toString(16));
				}

				var initial_success="";

				if (!wallet.email ||wallet.email.length==0) {
					initial_success="Reminder: Add an email to your account.";
				}

			

				var serverTime  = new Date().getTime();
			  	var ret = {
						extra_seed:hex.join(""),
			  			real_auth_type:0,
			  			initial_success:initial_success,
			  			auth_type:0,
			  			payload:wallet.payload,
			  			sync_pubkeys: false,
						clientTimeDiff:serverTime-parseFloat(req.param('ct')),
			  			guid:wallet.guid,
			  			war_checksum:"def69daa13cb1541",
			  			serverTime:serverTime,
			  			payload_checksum:wallet.checksum,
					};
				res.json(ret);
			});
    	});

}





exports.aes = function (req, res) {

	var sha256 = crypto.createHash("sha256");
	sha256.update(req.wallet.payload);
	var result = sha256.digest("hex");


	if (result != req.param('checksum')){


	}

	var ret = {
		"payload": "Not modified",

		"symbol_btc": {
			"conversion": 100000000.00000000,
			"symbol": "LTC",
			"name": "Litecoin",
			"symbolAppearsAfter": true,
			"local": false,
			"code": "LTC"
		},
		"symbol_local": {
			"conversion": 200400.80160321,
			"symbol": "$",
			"name": "U.S. dollar",
			"symbolAppearsAfter": false,
			"local": true,
			"code": "USD"
		}


	};

	res.json(ret);
}



exports.wallet = function (req, res) {


	console.log(req.param('method'));

	if (req.param('method') == 'insert') {
		return exports.insert(req,res);
	}else{

		Wallet.findOne({ guid : req.param('guid') }).exec(function (err, wallet) {
			if (err) return new Error('Failed to load Wallet ' + req.param('guid'));
			if (!wallet) return new Error('Failed to load Wallet ' + req.param('guid'));

			req.wallet = wallet;

			if (req.param('method') == 'wallet.aes.json') {
				return exports.aes(req,res);
			}
			if (req.param('method') == 'list-backups') {
				return exports.listbackups(req,res);
			}
			if (req.param('method') == 'update') {
				return exports.update(req,res);
			}
			if (req.param('method') == 'get-backup') {
				return exports.getbackup(req,res);
			}
			
	      
	    });
	}
}


exports.listbackups = function (req, res) {

	var wallet = req.wallet;
	

	var results = [];
	var backups = wallet.backups.reverse();
	backups.forEach(function(back){
		var b = {};
		b.id = back._id;
		b.last_modified = back.last_modified;
		b.name = back.name;
		b.size = back.size;
		b.guid = back.guid;
		results.push(b);
	});
	res.json({results:results});
}

exports.getbackup = function (req, res) {

	var wallet = req.wallet;

	
	var payload = "";

	wallet.backups.forEach(function(back){
		if (back._id == req.param('id') ) {
			payload = back.payload;
		};
	});
	res.json({payload:payload});
}



exports.update = function (req, res) {

	var wallet = req.wallet;

	if (wallet.checksum != req.param('old_checksum')){


	}

	var sha256 = crypto.createHash("sha256");
	sha256.update(req.param('payload'));
	var result = sha256.digest("hex");

	if (result != req.param('checksum')) {
		throw new Error('checksum');
		return;
	}


	wallet.backups.push({
		guid:wallet.guid,
		payload:wallet.payload,
		size:wallet.payload.length,
		name:wallet.guid+'.aes.json'
	});





	wallet.checksum = req.param('checksum');
	wallet.payload = req.param('payload');
	wallet.length = req.param('length');


	wallet.save(function (err) {
	    if (err) {

	    }
	    res.end("Wallet successfully synced with server");
	});
}


exports.findwallet = function (req, res, next, guid) {
  Wallet
    .findOne({ guid : guid })
    .exec(function (err, wallet) {
      if (err) return next(err);
      if (!wallet) return next(new Error('Failed to load Wallet ' + guid));
      req.wallet = wallet;
      next();
    })
}


exports.pushtx = function (req, res) {


	var hash = req.param('hash');
	var tx = req.param('tx');

	console.log(tx);

	var sha256 = crypto.createHash("sha256");
	sha256.update(tx);
	var result = sha256.digest("hex");
	sha256.update(result);
	result = sha256.digest("hex");
	
}

