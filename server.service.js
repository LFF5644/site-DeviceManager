const socketIo=require("socket.io");

const services={
	account: service_require("server/account/account.new"),
}

this.start=()=>{
	this.clients=new Map();
	this.io=socketIo(7849,{
		//allowEIO3: true,	// legacy clients allow connect!
		cors:{
			origin:"*",
		},
	});
	this.io.on("connect",socket=>{
		const {token,deviceName}=socket.handshake.auth;
		const login=services.account.authUserByInput({token});
		if(!login.allowed||!token){
			socket.emit("error_code","wrong-token");
			socket.disconnect();
			return;
		}
		if(!deviceName){
			socket.emit("error_code","wrong-deviceName");
			socket.disconnect();
			return;
		}

		


	});
};
this.stop=()=>{
	this.io.close();
};