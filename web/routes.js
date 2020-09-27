/*
* Real time private chatting app using Angular 2, Nodejs, mongodb and Socket.io
* @author Shashank Tiwari
*/

'use strict';

const routeHandler = require('./../handlers/route-handler');

class Routes{

	constructor(app){
		this.app = app;
	}

	/* creating app Routes starts */
	appRoutes(){
		this.app.post('/usernameAvailable', routeHandler.userNameCheckHandler);

		this.app.post('/register', routeHandler.registerRouteHandler);

		this.app.post('/login', routeHandler.loginRouteHandler);

		this.app.post('/userSessionCheck', routeHandler.userSessionCheckRouteHandler);

		this.app.post('/getMessages', routeHandler.getMessagesRouteHandler);

		this.app.post('/group/info', routeHandler.getGroupInfo_rh);

		this.app.post('/group/add', routeHandler.groupAdd_rh);

		this.app.post('/group/updateUser', routeHandler.updateGroupAdd_rh);

		this.app.post('/group/delete', routeHandler.getGroupDelete_rh);

		this.app.get('/group/all', routeHandler.getAllGroupInfo_rh);

    this.app.post('/user/info', routeHandler.getUserInfo_rh);

    this.app.get('/user/all', routeHandler.getUserAll_rh);

    this.app.get('*', routeHandler.routeNotFoundHandler);

    this.app.post('/getMessagesGroup', routeHandler.getMessagesGroupRouteHandler);
	}

	routesConfig(){
		this.appRoutes();
	}
}
module.exports = Routes;