/*
* Real time private chatting app using Angular 2, Nodejs, mongodb and Socket.io
* @author Raman Agrawal
*/


'use strict';

const path = require('path');
const queryHandler = require('./../handlers/query-handler');
const CONSTANTS = require('./../config/constants');

class GroupSocket{




	constructor(socket){
		this.io = socket;
	}

	socketEvents(){

		this.io.on('connection', (socket) => {

			/* Get the user's Chat list	*/
			socket.on(`group-chat-list`, async (data) => {
				if (data.userId == '') {
					this.io.emit(`group-chat-list-response`, {
						error : true,
						message : CONSTANTS.USER_NOT_FOUND
					});
				}else{
					try {
						const [UserInfoResponse, chatlistResponse] = await Promise.all([
							queryHandler.getUserInfo( {
								userId: data.userId,
								socketId: false
							}),
							queryHandler.getChatList( socket.id )
							]);
						this.io.to(socket.id).emit(`group-chat-list-response`, {
							error : false,
							singleUser : false,
							chatList : chatlistResponse
						});
						socket.broadcast.emit(`group-chat-list-response`,{
							error : false,
							singleUser : true,
							chatList : UserInfoResponse
						});
					} catch ( error ) {
						this.io.to(socket.id).emit(`group-chat-list-response`,{
							error : true ,
							chatList : []
						});
					}
				}
			});

			/**
			* send the messages to the user
			*/
			socket.on(`group-add-message`, async (data) => {
        console.log(" group add msg 1 ", data);
        data.datetime = new Date();
				if (data.message === '') {
					this.io.to(socket.id).emit(`group-add-message-response`,{
						error : true,
						message: CONSTANTS.MESSAGE_NOT_FOUND
					});
				}else if(data.fromUserId === ''){
					this.io.to(socket.id).emit(`group-add-message-response`,{
						error : true,
						message: CONSTANTS.SERVER_ERROR_MESSAGE
					});
				}else if(data.users && data.users.length === 0 ){
					this.io.to(socket.id).emit(`group-add-message-response`,{
						error : true,
						message: CONSTANTS.SELECT_USER
					});
				}else{
					try{
						const [userSocketList, messageResult ] = await Promise.all([
							queryHandler.getUsersInfo({
								users: data.users,
								socketId: true
							}),
							  queryHandler.insertGroupMessages(data)	 // saveing msg for history
              ]);
                        console.log(' userSocketList ', userSocketList);
                        userSocketList.forEach(toSocketId => {
                          console.log(' toSocketId ', toSocketId);
                            this.io.to(toSocketId.socketId).emit(`group-add-message-response`,data);
                        });

					} catch (error) {
            console.log(" CONSTANTS.MESSAGE_STORE_ERROR error ", error)
						this.io.to(socket.id).emit(`group-add-message-response`,{
							error : true,
							message : CONSTANTS.MESSAGE_STORE_ERROR
						});
					}
				}
			});



			/**
			* send the messages to a group
			*/
			socket.on(`group-add-group-message`, async (data) => {
				if (data.message === '') {
					this.io.to(socket.id).emit(`group-add-group-message-response`,{
						error : true,
						message: CONSTANTS.MESSAGE_NOT_FOUND
					});
				}else if(data.fromUserId === ''){
					this.io.to(socket.id).emit(`group-add-group-message-response`,{
						error : true,
						message: CONSTANTS.SERVER_ERROR_MESSAGE
					});
				}else if(data.groupName === ''){
					this.io.to(socket.id).emit(`group-add-group-message-response`,{
						error : true,
						message: CONSTANTS.SELECT_GROUP
					});
				}else{
					try{
						const [toSocketId, messageResult ] = await Promise.all([
							queryHandler.getUserInfo({
								userId: data.toUserId,
								socketId: true
							}),
							queryHandler.insertMessages(data)
						]);
						this.io.to(toSocketId).emit(`group-add-message-response`,data);
					} catch (error) {
						this.io.to(socket.id).emit(`group-add-message-response`,{
							error : true,
							message : CONSTANTS.MESSAGE_STORE_ERROR
						});
					}
				}
			});

			/**
			* Logout the user
			*/


			/**
			* sending the disconnected user to all socket users.
			*/
			socket.on('group-disconnect',async () => {
				socket.broadcast.emit(`group-chat-list-response`,{
					error : false ,
					userDisconnected : true ,
					userid : socket.request._query['userId']
				});

			});

		});

	}

	socketConfig(){
		this.io.use( async (socket, next) => {
			try {
				await queryHandler.addSocketId({
					userId: socket.request._query['userId'],
					socketId: socket.id
				});
				next();
			} catch (error) {
          		// Error
          		console.error(error);
          	}
          });

		this.socketEvents();
	}
}
module.exports = GroupSocket;
