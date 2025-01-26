function new_websocket_messages(chatroom_id){
    return new WebSocket(
        'ws://' + window.location.host + '/ws/app/socket/messages/' + chatroom_id + '/'
    );
}

let chatSocket_app = null;

function new_websocket_app(){
    let socket =  new WebSocket(
        'ws://' + window.location.host + '/ws/app/socket/app/'
    );
    socket.onmessage = function(e){
        let data = JSON.parse(e.data);
        if(data.type == "presence_indicator"){
            check_presence(data);
        }
    }
    return socket;
}

function send_message_socket(chatroom_id, message, sender){
    const message_id = Date.now();
    chatSocket_messages.send(JSON.stringify({
        'type': 'sendMessage',
        'message_id': message_id,
        'chatroom_id': chatroom_id,
        'message': message,
        'sender': sender
    }));
    return message_id;
}

function send_new_chat_socket(chatroom_id){
    chatSocket_app.send(JSON.stringify({
        'type': 'new_chat',
        'chatroom_id': chatroom_id
    }));
}

