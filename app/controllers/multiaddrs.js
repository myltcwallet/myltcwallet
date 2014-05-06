var mongoose = require('mongoose');
var Wallet = mongoose.model('Wallet');
var crypto = require('crypto');



exports.multiaddr = function (req, res) {



	if ('true' == req.param('simple')){


	}else{

		var addr = req.param('active');

		





	}

	var ret = {};

	res.json(ret);




}