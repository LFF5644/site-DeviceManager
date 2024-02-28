const {
	hook_effect,
	hook_memo,
	hook_model,
	init,
	node_dom,
	node_map,
	node,
}=lui;

const model={
	init:()=>({
		connected: false,
		deviceName: "?",
		nickname: "?",
		username: "?",
		view: "devices",
	}),
	setConnected:(state,connected)=>({
		...state,
		connected,
	}),
	setView:(state,view)=>({
		...state,
		view,
	}),
	setState:(state,newState)=>({
		...state,
		...newState,
	}),
};

function getToken(){
	const cookie=document.cookie.split("; ").find(item=>item.startsWith("token="));
	if(cookie) return unescape(cookie.substring(6));
	return null;
}
function askDeviceName(){
	const cookie=document.cookie.split("; ").find(item=>item.startsWith("deviceName="));
	if(cookie) return unescape(cookie.substring(6));
	else{
		const deviceName=prompt("Bitte Gerätename eingeben:");
		if(confirm("Den Gerätenamen fürs nähste mal Speichern?")) document.cookie="deviceName="+escape(deviceName);
		return deviceName;
	}
}

init(()=>{
	const [state,actions]=hook_model(model);
	const socket=hook_memo(()=>{
		const token=getToken();
		const deviceName=askDeviceName();
		if(!token){
			if(confirm("Sie sind NICHT angemeldet. Jetzt anmelden?")) location.href="/account?goto=DeviceManager";
			else history.back();
			return;
		}
		const [username,nickname]=atob(unescape(token)).split("|");
		actions.setState({username,nickname,deviceName});
		return io({
			path: "/bind/socket/DeviceManager",
			auth: {token,deviceName},
		});
	});
	hook_effect(()=>{
		socket.on("connect",()=>actions.setConnected(true));
		socket.on("disconnect",()=>actions.setConnected(false));
	});

	return[null,[
		node_dom("h1[innerText=Geräte-Manager]"),
		node_dom("p",{
			innerHTML: "Verbindungsstatus: <b>"+(state.connected?"Verbunden":"Keine Verbindung")+"</b>",
		}),
	]];
});