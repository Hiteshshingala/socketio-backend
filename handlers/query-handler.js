/*
* Real time private chatting app using Angular 2, Nodejs, mongodb and Socket.io
* @author Shashank Tiwari
*/

'use strict';
class QueryHandler{

	constructor(){
		this.Mongodb = require("./../config/db");
	}

	userNameCheck(data){
		return new Promise( async (resolve, reject) => {
			try {
				const [DB, ObjectID] = await this.Mongodb.onConnect();
				DB.collection('users').find(data).count( (error, result) => {
					DB.close();
					if( error ){
						reject(error);
					}
					resolve(result);
				});
			} catch (error) {
				reject(error)
			}
		});
	}

	getUserByUsername(username){
		return new Promise( async (resolve, reject) => {
			try {
				const [DB, ObjectID] = await this.Mongodb.onConnect();
				DB.collection('users').find({
					username :  username
				}).toArray( (error, result) => {
					DB.close();
					if( error ){
						reject(error);
					}
					resolve(result[0]);
				});
			} catch (error) {
				reject(error)
			}
		});
	}

	makeUserOnline(userId){
		return new Promise( async (resolve, reject) => {
			try {
				const [DB, ObjectID] = await this.Mongodb.onConnect();
				DB.collection('users').findAndModify({
					_id : ObjectID(userId)
				},[],{ "$set": {'online': 'Y'} },{new: true, upsert: true}, (err, result) => {
					DB.close();
					if( err ){
						reject(err);
					}
					resolve(result.value);
				});
			} catch (error) {
				reject(error)
			}
		});
	}

	registerUser(data){
		return new Promise( async (resolve, reject) => {
			try {
				const [DB, ObjectID] = await this.Mongodb.onConnect();
				DB.collection('users').insertOne(data, (err, result) =>{
					DB.close();
					if( err ){
						reject(err);
					}
					resolve(result);
				});
			} catch (error) {
				reject(error)
			}
		});
	}

	userSessionCheck(data){
		return new Promise( async (resolve, reject) => {
			try {
				const [DB, ObjectID] = await this.Mongodb.onConnect();
				DB.collection('users').findOne( { _id : ObjectID(data.userId) , online : 'Y'}, (err, result) => {
					DB.close();
					if( err ){
						reject(err);
					}
					resolve(result);
				});
			} catch (error) {
				reject(error)
			}
		});
	}

	getUserInfo({userId,socketId = false}){
		let queryProjection = null;
		if(socketId){
			queryProjection = {
				"socketId" : true
			}
		} else {
			queryProjection = {
				"username" : true,
				"online" : true,
				'_id': false,
				'id': '$_id'
			}
		}
		return new Promise( async (resolve, reject) => {
			try {
				const [DB, ObjectID] = await this.Mongodb.onConnect();
				DB.collection('users').aggregate([{
					$match:  {
						_id : ObjectID(userId)
					}
				},{
					$project : queryProjection
				}
				]).toArray( (err, result) => {
					DB.close();
					if( err ){
						reject(err);
					}
					socketId ? resolve(result[0]['socketId']) : resolve(result);
				});
			} catch (error) {
				reject(error)
			}
		});
	}
	getUsersInfo({users,socketId = false}){
		let queryProjection = null;
		if(socketId){
			queryProjection = {
        "socketId" : true,
        '_id': false,
			}
		} else {
			queryProjection = {
				"username" : true,
				"online" : true,
				'_id': false,
				'id': '$_id'
			}
		}

console.log(' users ', users);
		return new Promise( async (resolve, reject) => {
			try {
        const [DB, ObjectID] = await this.Mongodb.onConnect();
        /* creating in query*/
          let isUsers = [];
          users.forEach(userId => {
            console.log("for loop  ", userId);
            isUsers.push(ObjectID(userId));
          //isUsers.push[userId+')'];
          })

          //console.log("isUsers ", isUsers);

          let inObj = {"$in" : isUsers};
          //console.log("inObj ", inObj);
				DB.collection('users').aggregate([{
					$match:  {
						_id : inObj
					}
				},{
					$project : queryProjection
				}
				]).toArray( (err, result) => {
					DB.close();
					if( err ){
						reject(err);
          }
          console.log("result ", result);

          // if(socketId){
          //   result.forEach(function(ele){

          //   })
          //   resolve(result);
          // }else{
          //   resolve(result);
          // }
          resolve(result);
					//socketId ? resolve(result[0]['socketId']) : resolve(result);
				});
			} catch (error) {
				reject(error)
			}
		});
	}

  getUsersAll(){

		return new Promise( async (resolve, reject) => {
			try {
        const [DB, ObjectID] = await this.Mongodb.onConnect();

				DB.collection('users').find({}).toArray( (err, result) => {
					DB.close();
					if( err ){
						reject(err);
          }
          resolve(result);
				});
			} catch (error) {
				reject(error)
			}
		});
	}

	addSocketId({userId, socketId}){
		const data = {
			id : userId,
			value : {
				$set :{
					socketId : socketId,
					online : 'Y'
				}
			}
		};
		return new Promise( async (resolve, reject) => {
			try {
				const [DB, ObjectID] = await this.Mongodb.onConnect();
				DB.collection('users').update( { _id : ObjectID(data.id)}, data.value ,(err, result) => {
					DB.close();
					if( err ){
						reject(err);
					}
					resolve(result);
				});
			} catch (error) {
				reject(error)
			}
		});
	}

	getChatList(userId){
		return new Promise( async (resolve, reject) => {
			try {
				const [DB, ObjectID] = await this.Mongodb.onConnect();
				DB.collection('users').aggregate([{
					$match: {
						'socketId': { $ne : userId}
					}
				},{
					$project:{
						"username" : true,
						"online" : true,
						'_id': false,
						'id': '$_id'
					}
				}
				]).toArray( (err, result) => {
					DB.close();
					if( err ){
						reject(err);
					}
					resolve(result);
				});
			} catch (error) {
				reject(error)
			}
		});
	}
	//
	getGroupList(userId){
		return new Promise( async (resolve, reject) => {
			try {
				const [DB, ObjectID] = await this.Mongodb.onConnect();
				DB.collection('group').aggregate([
				]).toArray( (err, result) => {
					DB.close();
					if( err ){
						reject(err);
					}
					resolve(result);
				});
			} catch (error) {
				reject(error)
			}
		});
	}

	insertMessages(messagePacket){
		return new Promise( async (resolve, reject) => {
			try {
				const [DB, ObjectID] = await this.Mongodb.onConnect();
				DB.collection('messages').insertOne(messagePacket, (err, result) =>{
					DB.close();
					if( err ){
						reject(err);
					}
					resolve(result);
				});
			} catch (error) {
				reject(error)
			}
		});
	}


	insertGroupMessages(groupmessagePacket){
    let data =  {datetime: new Date(), fromUserId: groupmessagePacket.fromUserId, message: groupmessagePacket.message, groupId: groupmessagePacket.groupId, name: groupmessagePacket.name };
		return new Promise( async (resolve, reject) => {
			try {
				const [DB, ObjectID] = await this.Mongodb.onConnect();
				DB.collection('groupmessages').insertOne(data, (err, result) =>{
					DB.close();
					if( err ){
						reject(err);
					}
					resolve(result);
				});
			} catch (error) {
				reject(error)
			}
		});
	}

	getMessages({userId, toUserId}){
		const data = {
				'$or' : [
					{ '$and': [
						{
							'toUserId': userId
						},{
							'fromUserId': toUserId
						}
					]
				},{
					'$and': [
						{
							'toUserId': toUserId
						}, {
							'fromUserId': userId
						}
					]
				},
			]
		};
		return new Promise( async (resolve, reject) => {
			try {
				const [DB, ObjectID] = await this.Mongodb.onConnect();
				DB.collection('messages').find(data).sort({'timestamp':1}).toArray( (err, result) => {
					DB.close();
					if( err ){
						reject(err);
					}
					resolve(result);
				});
			} catch (error) {
				reject(error)
			}
		});
  }

  getMessagesGroup({groupId}){
		const data = { 'groupId': groupId};
		return new Promise( async (resolve, reject) => {
			try {
				const [DB, ObjectID] = await this.Mongodb.onConnect();
				DB.collection('groupmessages').find(data).sort({'timestamp':1}).toArray( (err, result) => {
					DB.close();
					if( err ){
						reject(err);
					}
					resolve(result);
				});
			} catch (error) {
				reject(error)
			}
		});
	}

	logout(userID,isSocketId){
		const data = {
			$set :{
				online : 'N'
			}
		};
		return new Promise( async (resolve, reject) => {
			try {
				const [DB, ObjectID] = await this.Mongodb.onConnect();
				let condition = {};
				if (isSocketId) {
					condition.socketId = userID;
				}else{
					condition._id = ObjectID(userID);
				}
				DB.collection('users').update( condition, data ,(err, result) => {
					DB.close();
					if( err ){
						reject(err);
					}
					resolve(result);
				});
			} catch (error) {
				reject(error)
			}
		});
	}

	registerGroup(data){
		return new Promise( async (resolve, reject) => {
			try {
				const [DB, ObjectID] = await this.Mongodb.onConnect();
				DB.collection('groups').insertOne(data, (err, result) =>{
					DB.close();
					if( err ){
						reject(err);
					}
					resolve(result);
				});
			} catch (error) {
				reject(error)
			}
		});
	}

	getGroupInfo({groupId,users = false}){
		let queryProjection = null;
		console.log(" groupId ", groupId);
		if(users){
			queryProjection = {
				"users" : true
			}
		} else {
			queryProjection = {
				"groupName" : true,
				"users" : true,
				"isDeleted": true,
				'_id': false,
				'id': '$_id'
			}
		}
		return new Promise( async (resolve, reject) => {
			try {
				const [DB, ObjectID] = await this.Mongodb.onConnect();
				DB.collection('groups').aggregate([{
					$match:  {
						_id : ObjectID(groupId)
					}
				},{
					$project : queryProjection
				}
				]).toArray( (err, result) => {
					DB.close();
					if( err ){
						reject(err);
					}
					users ? resolve(result[0]['users']) : resolve(result);
				});
			} catch (error) {
				reject(error)
			}
		});
	}

	getAllGroup(){
		let queryProjection = null;
		queryProjection = {
				"groupName" : true,
				"users" : true,
				"isDeleted": true,
				'_id': false,
				'id': '$_id'
		}
		return new Promise( async (resolve, reject) => {
			try {
				const [DB, ObjectID] = await this.Mongodb.onConnect();
				DB.collection('groups').find({}).toArray( (err, result) => {
					DB.close();
					if( err ){
						console.log("erro query handler ", err)
						reject(err);
					}
					resolve(result);
				});
			} catch (error) {
				console.log("erro query handler ", error)
				reject(error)
			}
		});
	}

	addUserToGroup({groupId, users}){
		console.log(" addUserToGroup ", groupId , 'users ', users);

		const data = {
			id : groupId,
			value : {
				$set :{
					users : users
				}
			}
		};
		return new Promise( async (resolve, reject) => {
			try {
				const [DB, ObjectID] = await this.Mongodb.onConnect();
				DB.collection('groups').update( { _id : ObjectID(data.id)}, data.value ,(err, result) => {
					DB.close();
					if( err ){
						reject(err);
					}
					resolve(result);
				});
			} catch (error) {
				reject(error)
			}
		});
	}

	deleteGroup({groupId}){
		const data = {
			id : groupId,
			value : {
				$set :{
					isDeleted : 'Y'
				}
			}
		};
		return new Promise( async (resolve, reject) => {
			try {
				const [DB, ObjectID] = await this.Mongodb.onConnect();
				DB.collection('groups').update( { _id : ObjectID(data.id)}, data.value ,(err, result) => {
					DB.close();
					if( err ){
						reject(err);
					}
					resolve(result);
				});
			} catch (error) {
				reject(error)
			}
		});
	}
}

module.exports = new QueryHandler();
