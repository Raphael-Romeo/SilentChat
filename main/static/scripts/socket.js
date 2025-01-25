function new_websocket_messages(chatroom_id){
    return new WebSocket(
        'ws://' + window.location.host + '/ws/app/socket/messages/' + chatroom_id + '/'
    );
}

function new_websocket_app(){
    return new WebSocket(
        'ws://' + window.location.host + '/ws/app/socket/app/'
    );
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

