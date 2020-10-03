const queryHandler = require('./../handlers/query-handler');
const CONSTANTS = require('./../config/constants');
const passwordHash = require('./../utils/password-hash');

'use strict';
class RouteHandler{

	async userNameCheckHandler(request, response){
		const username = request.body.username;
		if (username === "") {
			response.status(CONSTANTS.SERVER_ERROR_HTTP_CODE).json({
				error : true,
				message : CONSTANTS.USERNAME_NOT_FOUND
			});
		} else {
			try {
				const count = await queryHandler.userNameCheck( {
					username : username.toLowerCase()
				});
				if (count > 0) {
					response.status(200).json({
						error : true,
						message : CONSTANTS.USERNAME_AVAILABLE_FAILED
					});
				} else {
					response.status(200).json({
						error : false,
						message : CONSTANTS.USERNAME_AVAILABLE_OK
					});
				}
			} catch ( error ){
				console.log(" query error ", error);
				response.status(CONSTANTS.SERVER_ERROR_HTTP_CODE).json({
					error : true,
					message : CONSTANTS.SERVER_ERROR_MESSAGE
				});
			}
		}
	}

	async loginRouteHandler(request, response){
		const data = {
			username : (request.body.username).toLowerCase(),
			password : request.body.password
		};
		if(data.username === '' || data.username === null) {
			response.status(CONSTANTS.SERVER_ERROR_HTTP_CODE).json({
				error : true,
				message : CONSTANTS.USERNAME_NOT_FOUND
			});
		}else if(data.password === '' || data.password === null) {
			response.status(CONSTANTS.SERVER_ERROR_HTTP_CODE).json({
				error : true,
				message : CONSTANTS.PASSWORD_NOT_FOUND
			});
		} else {
			try {
				const result = await queryHandler.getUserByUsername(data.username);
				if(result ===  null || result === undefined) {
					response.status(CONSTANTS.SERVER_NOT_FOUND_HTTP_CODE).json({
						error : true,
						message : CONSTANTS.USER_LOGIN_FAILED
					});
				} else {
					if( passwordHash.compareHash(data.password, result.password)) {
						await queryHandler.makeUserOnline(result._id);
						response.status(CONSTANTS.SERVER_OK_HTTP_CODE).json({
							error : false,
							userId : result._id,
							message : CONSTANTS.USER_LOGIN_OK
						});
					} else {
						response.status(CONSTANTS.SERVER_NOT_FOUND_HTTP_CODE).json({
							error : true,
							message : CONSTANTS.USER_LOGIN_FAILED
						});
					}
				}
			} catch (error) {
				response.status(CONSTANTS.SERVER_NOT_FOUND_HTTP_CODE).json({
					error : true,
					message : CONSTANTS.USER_LOGIN_FAILED
				});
			}
		}
	}

	async registerRouteHandler(request, response){
		const data = {
			username : (request.body.username).toLowerCase(),
			password : request.body.password
		};
		if(data.username === '') {
			response.status(CONSTANTS.SERVER_ERROR_HTTP_CODE).json({
				error : true,
				message : CONSTANTS.USERNAME_NOT_FOUND
			});
		}else if(data.password === '') {
			response.status(CONSTANTS.SERVER_ERROR_HTTP_CODE).json({
				error : true,
				message : CONSTANTS.PASSWORD_NOT_FOUND
			});
		} else {
			try {
				data.online = 'Y' ;
				data.socketId = '' ;
				data.password = passwordHash.createHash(data.password);
				const result = await queryHandler.registerUser(data);
				if (result === null || result === undefined) {
					response.status(CONSTANTS.SERVER_OK_HTTP_CODE).json({
						error : false,
						message : CONSTANTS.USER_REGISTRATION_FAILED
					});
				} else {
					response.status(CONSTANTS.SERVER_OK_HTTP_CODE).json({
						error : false,
						userId : result.insertedId,
						message : CONSTANTS.USER_REGISTRATION_OK
					});
				}
			} catch ( error ) {
				response.status(CONSTANTS.SERVER_NOT_FOUND_HTTP_CODE).json({
					error : true,
					message : CONSTANTS.SERVER_ERROR_MESSAGE
				});
			}
		}
	}

	async userSessionCheckRouteHandler(request, response){
		let userId = request.body.userId;
		if (userId === '') {
			response.status(CONSTANTS.SERVER_ERROR_HTTP_CODE).json({
				error : true,
				message : CONSTANTS.USERID_NOT_FOUND
			});
		} else {
			try {
				const result = await queryHandler.userSessionCheck({ userId : userId });
				response.status(CONSTANTS.SERVER_OK_HTTP_CODE).json({
					error : false,
					username : result.username,
					message : CONSTANTS.USER_LOGIN_OK
				});
			} catch(error) {
				response.status(CONSTANTS.SERVER_NOT_ALLOWED_HTTP_CODE).json({
					error : true,
					message : CONSTANTS.USER_NOT_LOGGED_IN
				});
			}
		}
	}

	async getMessagesRouteHandler(request, response){
		let userId = request.body.userId;
		let toUserId = request.body.toUserId;
		console.log(" userId ", userId , '  toUserId  ', toUserId);
		if (userId == '') {
			response.status(CONSTANTS.SERVER_ERROR_HTTP_CODE).json({
				error : true,
				message : CONSTANTS.USERID_NOT_FOUND
			});
		}else{
			try {
				const messagesResponse = await queryHandler.getMessages({
					userId:userId,
					toUserId: toUserId
				});
				response.status(CONSTANTS.SERVER_OK_HTTP_CODE).json({
					error : false,
					messages : messagesResponse
				});
			} catch ( error ){
				response.status(CONSTANTS.SERVER_NOT_ALLOWED_HTTP_CODE).json({
					error : error,
					messages : CONSTANTS.USER_NOT_LOGGED_IN
				});
			}
		}
	}
	//
	// async getMessagesRouteHandler(request, response){

	// 		try {
	// 			const messagesResponse = await queryHandler.getGroupChatList();
	// 			response.status(CONSTANTS.SERVER_OK_HTTP_CODE).json({
	// 				error : false,
	// 				messages : messagesResponse
	// 			});
	// 		} catch ( error ){
	// 			response.status(CONSTANTS.SERVER_NOT_ALLOWED_HTTP_CODE).json({
	// 				error : true,
	// 				messages : CONSTANTS.USER_NOT_LOGGED_IN
	// 			});
	// 		}

	// }

  async getMessagesGroupRouteHandler(request, response){
		let groupId = request.body.groupId;
		console.log(" groupId ", groupId );
		if (groupId == '') {
			response.status(CONSTANTS.SERVER_ERROR_HTTP_CODE).json({
				error : true,
				message : CONSTANTS.USERID_NOT_FOUND
			});
		}else{
			try {
				const messagesResponse = await queryHandler.getMessagesGroup({
					groupId:groupId
				});
				response.status(CONSTANTS.SERVER_OK_HTTP_CODE).json({
					error : false,
					messages : messagesResponse
				});
			} catch ( error ){
				response.status(CONSTANTS.SERVER_NOT_ALLOWED_HTTP_CODE).json({
					error : true,
					messages : CONSTANTS.USER_NOT_LOGGED_IN
				});
			}
		}
	}


	/* Register a group */

	async groupAdd_rh(request, response){
		const data = {
				groupName : (request.body.groupName).toLowerCase()
		};
		if(data.groupName === '') {
			response.status(CONSTANTS.SERVER_ERROR_HTTP_CODE).json({
				error : true,
				message : CONSTANTS.GROUPNAME_NOT_FOUND
			});
		} else {
			try {
				data.isDeleted = 'N';
				data.users = [];
				const result = await queryHandler.registerGroup(data);
				if (result === null || result === undefined) {
					response.status(CONSTANTS.SERVER_OK_HTTP_CODE).json({
						error : false,
						message : CONSTANTS.GROUP_REGISTRATION_FAILED
					});
				} else {
					response.status(CONSTANTS.SERVER_OK_HTTP_CODE).json({
						error : false,
						groupId : result.insertedId,
						message : CONSTANTS.GROUP_REGISTRATION_OK
					});
				}
			} catch ( error ) {
				response.status(CONSTANTS.SERVER_NOT_FOUND_HTTP_CODE).json({
					error : true,
					message : CONSTANTS.SERVER_ERROR_MESSAGE
				});
			}
		}
	}

   /* Update Register a group */

	async updateGroupAdd_rh(request, response){
		console.log('this is updateGroupAdd_rh ');
		const data = {
				groupId : (request.body.groupId),
				users : (request.body.users)
		};
		if(data.groupId === '') {
			response.status(CONSTANTS.SERVER_ERROR_HTTP_CODE).json({
				error : true,
				message : CONSTANTS.GROUPID_NOT_FOUND
			});
		} else {
			try {
				const result = await queryHandler.addUserToGroup(data);
				if (result === null || result === undefined) {
					response.status(CONSTANTS.SERVER_OK_HTTP_CODE).json({
						error : false,
						message : CONSTANTS.GROUP_UPDATION_FAILED
					});
					console.log('this is updateGroupAdd_rh 2');
				} else {
					response.status(CONSTANTS.SERVER_OK_HTTP_CODE).json({
						error : false,
						userId : result.insertedId,
						message : CONSTANTS.GROUP_UPDATION_OK
					});
				}
			} catch ( error ) {
				response.status(CONSTANTS.SERVER_NOT_FOUND_HTTP_CODE).json({
					error : true,
					message : CONSTANTS.SERVER_ERROR_MESSAGE
				});
			}
		}
	}

	/* Get group Info*/
	async getGroupInfo_rh(request, response){
		let groupId = request.body.groupId;
		console.log( '  groupId aaa ', groupId);
		if (groupId == '') {
			response.status(CONSTANTS.SERVER_ERROR_HTTP_CODE).json({
				error : true,
				message : CONSTANTS.GROUPID_NOT_FOUND
			});
		}else{
			console.log( '  groupId aaa1 ', groupId);

			try {
				console.log( '  groupId aaa2 ', groupId);
				const messagesResponse = await queryHandler.getGroupInfo({
					groupId: groupId
				});
				response.status(CONSTANTS.SERVER_OK_HTTP_CODE).json({
					error : false,
					messages : messagesResponse
				});
			} catch ( error ){
				console.log( '  groupId aaa error ', error);
				response.status(CONSTANTS.SERVER_NOT_ALLOWED_HTTP_CODE).json({
					error : true,
					messages : CONSTANTS.USER_NOT_LOGGED_IN
				});
			}
		}
	}


	/* Get group Info*/
	async getAllGroupInfo_rh(request, response){

			try {
				const messagesResponse = await queryHandler.getAllGroup();
				response.status(CONSTANTS.SERVER_OK_HTTP_CODE).json({
					error : false,
					messages : messagesResponse
				});
			} catch ( error ){
				response.status(CONSTANTS.SERVER_NOT_ALLOWED_HTTP_CODE).json({
					error : true,
					messages : CONSTANTS.USER_NOT_LOGGED_IN
				});
			}

	}

	/* Delete group*/
	async getGroupDelete_rh(request, response){
		let groupId = request.body.groupId;
		console.log( '  groupId  ', groupId);
		if (groupId == '') {
			response.status(CONSTANTS.SERVER_ERROR_HTTP_CODE).json({
				error : true,
				message : CONSTANTS.GROUPID_NOT_FOUND
			});
		}else{
			try {
				const messagesResponse = await queryHandler.deleteGroup({
					groupId:groupId
				});
				response.status(CONSTANTS.SERVER_OK_HTTP_CODE).json({
					error : false,
					messages : messagesResponse
				});
			} catch ( error ){
				response.status(CONSTANTS.SERVER_NOT_ALLOWED_HTTP_CODE).json({
					error : true,
					messages : CONSTANTS.USER_NOT_LOGGED_IN
				});
			}
		}
	}

	/* Get user Info*/
	async getUserInfo_rh(request, response){
    console.log(" getUserInfo_rh request.body", request.body)
		let usersId = request.body.usersId;
		let socketId = request.body.socketId || false;
		let users = usersId.split(",");

		console.log( '  usersId aaa ', usersId);
		if (usersId == '') {
			response.status(CONSTANTS.SERVER_ERROR_HTTP_CODE).json({
				error : true,
				message : CONSTANTS.GROUPID_NOT_FOUND
			});
		}else{
			console.log( '  usersId aaa1 ', usersId);

			try {
				console.log( '  users aaa2 ', users);
				const messagesResponse = await queryHandler.getUsersInfo({
					users: users,
					socketId: socketId
				});
				response.status(CONSTANTS.SERVER_OK_HTTP_CODE).json({
					error : false,
					messages : messagesResponse
				});
			} catch ( error ){
				console.log( '  groupId aaa error ', error);
				response.status(CONSTANTS.SERVER_NOT_ALLOWED_HTTP_CODE).json({
					error : true,
					messages : CONSTANTS.USER_NOT_LOGGED_IN
				});
			}
		}
	}

  async getUserAll_rh(request, response){
			try {
				const messagesResponse = await queryHandler.getUsersAll();
				response.status(CONSTANTS.SERVER_OK_HTTP_CODE).json({
					error : false,
					messages : messagesResponse
				});
			} catch ( error ){
				console.log( '  groupId aaa error ', error);
				response.status(CONSTANTS.SERVER_NOT_ALLOWED_HTTP_CODE).json({
					error : true,
					messages : CONSTANTS.USER_NOT_LOGGED_IN
				});
			}
  }

	routeNotFoundHandler(request, response){
		response.status(CONSTANTS.SERVER_NOT_FOUND_HTTP_CODE).json({
			error : true,
			message : CONSTANTS.ROUTE_NOT_FOUND
		});
	}
}

module.exports = new RouteHandler();
