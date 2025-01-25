/* WebSocket */


function get_user_details(){
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "/app/get/user_details", true);

    xhr.onload = () => {
        load_user_data(JSON.parse(xhr.responseText));
        wait_for_fonts_to_load();
    };

    xhr.send(null);
}

function get_messages(chatroom_id){
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "app/get/messages/" + chatroom_id, true);

    xhr.onload = () => {
        load_message_data(JSON.parse(xhr.responseText));
    }

    xhr.send(null);
}


function post_message(chatroom_id, message){
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/app/post/message", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
    xhr.setRequestHeader("X-CSRFToken", csrftoken);

    xhr.send(JSON.stringify({
        chatroom_id: chatroom_id,
        message: message
    }));
}