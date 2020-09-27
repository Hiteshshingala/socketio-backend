/*
* Real time private chatting app using Angular 2, Nodejs, mongodb and Socket.io
* @author Shashank Tiwari
*/
'use strict';
//const bcrypt = require('bcrypt');

class PasswordHash{

	createHash(password) {
		//return bcrypt.hashSync(password, 10);
		return password;
	}

	compareHash(password, hash) {
		//return bcrypt.compareSync(password, hash)
		return password;
	}
}

module.exports = new PasswordHash();
