var mongoose = require('mongoose')
  , Schema = mongoose.Schema;






var WalletSchema = new Schema({
	guid: { type: String, required: true, index: { unique: true} },
	sharedKey: { type: String, default: '' },
	payload: { type: String, default: '' },
	email: { type: String, default: '' },
  	address: [{ type: String, default: '' }],
  	checksum: { type: String, default: '' },
  	nickname: { type: String, default: '' },
  	

  	backups: [{
		guid: { type : String, default : '' },
		name: { type : String, default : '' },
		size: { type: Number },
		payload: { type: String, default: '' },
		last_modified: { type : Date, default : Date.now }
  }]


});



mongoose.model('Wallet', WalletSchema);