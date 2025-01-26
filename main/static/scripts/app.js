const side_panel_drag_handle = document.getElementById("side-panel-drag-handle");
const application = document.getElementById("application-wrapper");
const application_settings_page = document.getElementById("settings-page");
const application_chat_page_wrapper = document.getElementById("chat-page-wrapper");
const application_create_chat_room_page = document.getElementById("create-chatroom-page");
const application_friends_page = document.getElementById("friends-page");

const application_pages = [application_settings_page, application_chat_page_wrapper, application_create_chat_room_page, application_friends_page];

let chatSocket_messages = null;
let chatSocket_app = new_websocket_app()
let mouse_down_side_panel_drag_handle_initial_pos = null;
let mouse_down_side_panel_drag_handle_initial_width = null;
let max_side_panel_width = null;
let minimum_side_panel_width = 215;
let compact_side_panel_mode = false;
let app_fullscreen = false;
let session_user = null;
let sent_message_identifier = 0;
let current_chatroom = null;

max_side_panel_width = application.clientWidth/3;
if (max_side_panel_width <= minimum_side_panel_width){
    max_side_panel_width = minimum_side_panel_width;
}

let is_max_width = false;
let mouse_down_side_panel_drag_handle = false;
let current_side_panel_size = null;

if (current_side_panel_size > max_side_panel_width){
    current_side_panel_size = max_side_panel_width;
}

side_panel_drag_handle.onmousedown = function(e){
    mouse_down_side_panel_drag_handle = true;
    mouse_down_side_panel_drag_handle_initial_pos = e.x;
    mouse_down_side_panel_drag_handle_initial_width = current_side_panel_size;
    side_panel_drag_handle.classList.add("held");
    enable_animations(false);
}

function release_mouse_down_side_panel_drag_handle(){
    mouse_down_side_panel_drag_handle = false;
    mouse_down_side_panel_drag_handle_initial_pos = null;
    side_panel_drag_handle.classList.remove("held");
    enable_animations(true);
}

document.onmouseup = function(e){
    if (mouse_down_side_panel_drag_handle){
        release_mouse_down_side_panel_drag_handle();
    }
}

document.onmousemove = function(e){
    if (mouse_down_side_panel_drag_handle){
        let delta = mouse_down_side_panel_drag_handle_initial_pos - e.x;
        set_side_panel_width(mouse_down_side_panel_drag_handle_initial_width - delta);
    }
}

window.onresize = function(e){
    let new_size = null;
    new_size = application.clientWidth/3;
    if (new_size <= minimum_side_panel_width){
        new_size = minimum_side_panel_width;
    }
    max_side_panel_width = new_size;
    set_side_panel_width(current_side_panel_size);
    setTimeout(function(){enable_animations(true)},200)
}

let animations_enabled = true;
function enable_animations(b){
    if (!b && animations_enabled){
        animations_enabled = false;
        const animated_elements = [
            "message-controls-wrapper",
            "message-controls",
            "user-details-wrapper",
            "page-view",
            "side-panel-wrapper"
        ];
        for (let i=0;i<animated_elements.length;++i){
            document.getElementById(animated_elements[i]).style.transition = "none";
        }
    }else if(b && !animations_enabled){
        animations_enabled = true;
        const animated_elements = [
            "message-controls-wrapper",
            "message-controls",
            "user-details-wrapper",
            "page-view",
            "side-panel-wrapper"
        ];
        for (let i=0;i<animated_elements.length;++i){
            document.getElementById(animated_elements[i]).style.transition = null;
        }
    }
}

function set_side_panel_compact(b){
    if (b){
        application.classList.add("side-panel-compact");
        setTimeout(function(){if (!app_fullscreen && compact_side_panel_mode){document.getElementById("side-panel").classList.add("compact");}}, 200)
    }else{
        application.classList.remove("side-panel-compact");
        document.getElementById("side-panel").classList.remove("compact");
    }
}

function set_side_panel_fullscreen(b){
    app_fullscreen = b;
    if (b){
        application.classList.add("page-view-full-screen");
        document.getElementById("side-panel").classList.remove("compact");
    }else{
        application.classList.remove("page-view-full-screen");
        setTimeout(function(){if (!app_fullscreen && compact_side_panel_mode){document.getElementById("side-panel").classList.add("compact");}}, 200)
    }
}

function set_side_panel_width(c, force=false){
    if ((c < minimum_side_panel_width || compact_side_panel_mode || app_fullscreen) && !force){
        if (c < 30){
            enable_animations(true);
            application.style.setProperty('--side-panel-extended-width', null);
            current_side_panel_size = 0;
            //release_mouse_down_side_panel_drag_handle();
            set_side_panel_fullscreen(true);
            return;
        }else if (c >= 30 && app_fullscreen){
            set_side_panel_fullscreen(false);
            enable_animations(true);
            application.style.setProperty('--side-panel-extended-width', minimum_side_panel_width + "px");
            current_side_panel_size = 76;
            set_side_panel_compact(true);
            return;
        }else if (c < 76 + 50 && !compact_side_panel_mode){
            enable_animations(true);
            compact_side_panel_mode = true;
            application.style.setProperty('--side-panel-extended-width', minimum_side_panel_width + "px");
            current_side_panel_size = 76;
            set_side_panel_compact(true);
            return;
        }else if (c >= 76 + 50 && compact_side_panel_mode){
            enable_animations(true);
            set_side_panel_compact(false);
            compact_side_panel_mode = false;
            current_side_panel_size = minimum_side_panel_width;
            application.style.setProperty('--side-panel-extended-width', minimum_side_panel_width + "px");
        }else if (!compact_side_panel_mode){
            current_side_panel_size = minimum_side_panel_width;
            application.style.setProperty('--side-panel-extended-width', minimum_side_panel_width + "px");
        }
    }else if(c > max_side_panel_width){
        if (!mouse_down_side_panel_drag_handle && !force){
            enable_animations(false);
        }
        current_side_panel_size = max_side_panel_width;
        application.style.setProperty('--side-panel-extended-width', max_side_panel_width + "px");
    }else{
        if (!force){
            enable_animations(false);
        }
        current_side_panel_size = c;
        application.style.setProperty('--side-panel-extended-width', c + "px");
    }
}

/* Textarea */

const chat_page_message_container = document.getElementById("chat-page-message-container");
const application_message_box_wrapper = document.getElementById("message-controls");
const application_message_controls_wrapper = document.getElementById("message-controls-wrapper");

function format_date(timestamp){
    let date = new Date(timestamp)
    let hours = String(date.getHours()).padStart(2, '0');
    let minutes = String(date.getMinutes()).padStart(2, '0');
    if (hours[0] == "0"){
        hours = hours.slice(1,2);
    }
    const timeHHMM = hours + ":" + minutes;
    return timeHHMM;
}

function create_message_elem(t, username, timestamp, owner=false, waiting_for_server=false, this_sent_message_identifier=null){
    let message_element = document.createElement("div");
    if (waiting_for_server){
        message_element.classList.add("loading");
        message_element.id = "message-" + this_sent_message_identifier;
    }
    message_element.classList.add("chat-page-message-wrapper");
    let message_text_element = document.createElement("div");
    message_text_element.classList.add("chat-page-message-content");
    message_element.innerHTML = "<div class='message-header'><span class='strong' style='color:var(--text-color-lighter)'>" + username + "</span><span style='color:gray;font-weight:100;font-size:12px;'>" + format_date(timestamp) + "</span></div>";
    message_element.appendChild(message_text_element);
    if (owner){
        message_element.classList.add("self");
    }
    message_text_element.innerHTML = text_to_md_html(t);
    chat_page_message_container.appendChild(message_element);
}

function is_message_valid(text){
    if (text.replaceAll("\n","").replaceAll("<br>","").replaceAll(" ","").replaceAll(" ","").replaceAll("&nbsp;","") != ""){ // REDO THIS BETTER.
        return true;
    }
    return false;
}

function clear_message_input(){
    application_message_input.innerHTML = "";
    application_message_input_wrapper.classList.add("empty");
    message_input_empty = true;
}

function init_send_animation(){
    message_input_animation_playing  = true;
    application_message_controls_wrapper.style.transition = "transform 0.05s ease";
    setTimeout(function(){application_message_controls_wrapper.style.transform = "translateY(2px) scale(1)";},0);
    setTimeout(function(){application_message_controls_wrapper.style.transform = "translateY(-4px) scale(1)";},50);
    setTimeout(function(){application_message_controls_wrapper.style.transform = null;application_message_controls_wrapper.style.transition = null;message_input_animation_playing  = false;},120);
    update_message_box_height();
}

function send_message(){
    let message = application_message_input.innerHTML;
    let message_raw_text = application_message_input.innerText;
    if (is_message_valid(message)){
        message = message.replaceAll("&nbsp;"," ");
        message = message.replaceAll(/^(?:[ \u00A0\n]+|<br>)+|(?:[ \u00A0\n]+|<br>)+$/g, ""); //Clean up message
        message_raw_text = message_raw_text.replaceAll(/^(?:[ \u00A0\n]+|<br>)+|(?:[ \u00A0\n]+|<br>)+$/g, ""); //Clean up message
        let this_sent_message_identifier = ++sent_message_identifier;
        post_message(current_chatroom_selector.data.id, message_raw_text, this_sent_message_identifier);
        const message_id = send_message_socket(current_chatroom_selector.data.id, message_raw_text, session_user.username);
        sessionStorage.setItem(message_id, message_id);
        create_message_elem(message, session_user.username, Date.now(), true, true, this_sent_message_identifier);
        clear_message_input();
        application_chat_page_wrapper.scrollTo({top: application_chat_page_wrapper.scrollHeight, behavior: 'smooth'});
        init_send_animation();
    }
    return;
}

function update_message_box_height(){
    let old_scroll_height = application.style.getPropertyValue('--message-box-height');
    let at_bottom = parseInt(application_message_input_wrapper.scrollTop) >= application_message_input_wrapper.scrollHeight - application_message_input_wrapper.clientHeight - 50;
    //application_message_input.style.height = "auto";
    let new_scroll_height = application_message_input_wrapper.scrollHeight - 20 + "px";
    //application_message_input.style.height = null;
    application.style.setProperty('--message-box-height', new_scroll_height);
    if (old_scroll_height != new_scroll_height){
        let at_bottom_chat = parseInt(application_chat_page_wrapper.scrollTop) >= application_chat_page_wrapper.scrollHeight - application_chat_page_wrapper.clientHeight - 20;
        chat_page_message_container.style.paddingBottom = application_message_box_wrapper.clientHeight - 40 + "px";
        if (at_bottom_chat){
            chat_page_message_container.style.transition = "none";
            application_chat_page_wrapper.scrollTo({top: application_chat_page_wrapper.scrollHeight});
            setTimeout(function(){chat_page_message_container.style.transition = null;},1);
        }
        if (at_bottom){
            application_message_input_wrapper.scrollTop = application_message_input_wrapper.scrollHeight;
        }else{
            application_message_input_wrapper.scrollTop += 20;
        }
    }
}

const application_message_input = document.getElementById("message-input");
const application_message_input_wrapper = document.getElementById("message-input-wrapper"); 
let shift_is_held = false;
let message_input_empty = true;

function if_cleared(e){
    if (e.inputType == "deleteContentBackward" || e.inputType == "deleteWordBackward"){
        if (application_message_input.innerText.replace("\n","") == ""){
            application_message_input_wrapper.classList.add("empty");
            application_message_input.innerText = "";
            message_input_empty = true;
        }
    }else if (message_input_empty){
        application_message_input_wrapper.classList.remove("empty");
        message_input_empty = false;
    }
}

function text_to_md_html(t){
    let htmlText = t.replace(/<br[^>]*>/gi, '<br>');
    htmlText = htmlText.replaceAll("&nbsp;"," ")
    htmlText = htmlText.replaceAll(/<(?!\/?(marker|br)\b)[^>]*>/g, "");
    htmlText = htmlText.replace(/\*\*([\s\S]+?)\*\*/g, "<span class='strong-wrapper'></span><span class='strong'>$1</span><span class='strong-wrapper'></span>");
    htmlText = htmlText.replace(/\*([\s\S]+?)\*/g, "<span class='italic-wrapper'></span><span class='italic'>$1</span><span class='italic-wrapper'></span>");
    htmlText = htmlText.replace(/(^|<br\s*\/?>|\n)# (.*?)(?=$|<br\s*\/?>|\n)/g, '$1<span class="header-hashtag"></span><span class="header1">$2</span>');
    return htmlText;
}

let lastRenderCall = 0;
let renderDelay = 150;
let renderCallTimeout = false;

function render_text(realtime=false){
    if (realtime && lastRenderCall >= (Date.now() - renderDelay)) {
        if (!renderCallTimeout){
            renderCallTimeout = true;
            return setTimeout(
                function(){
                    if (Date.now() + renderDelay > lastRenderCall) {
                        render_text(true);
                        renderCallTimeout = false; 
                    }
            }, 
            renderDelay)
        }else{
            return;
        }
    }
    lastRenderCall = Date.now();

    saveSelectionAsMarker();
    let application_message_input_native_text = application_message_input.innerHTML;
    application_message_input.innerHTML = text_to_md_html(application_message_input_native_text);
    const iw = application_message_input.getElementsByClassName("italic-wrapper");
    for (let i=0;i<iw.length;i++){
        iw[i].textContent = "*";
    }
    const sw = application_message_input.getElementsByClassName("strong-wrapper");
    for (let i=0;i<sw.length;i++){
        sw[i].textContent = "**"
    }
    const hh = application_message_input.getElementsByClassName("header-hashtag");
    for (let i=0;i<hh.length;i++){
        hh[i].textContent = "# "
    }
    restoreSelectionFromMarker();
}

application_message_input.addEventListener("input", function(e){render_text(true);if_cleared(e);update_message_box_height()});

let message_input_animation_playing = false;
application_message_input.onkeydown = function(e){
    if (e.key == "Shift"){
        shift_is_held = true;
    }else if(e.key == "Enter"){
        if (!shift_is_held){
            send_message();
            e.preventDefault();
        }
    }else if(e.key == "Backspace"){
        if (message_input_empty){
            if (!message_input_animation_playing ){
                message_input_animation_playing  = true;
                application_message_controls_wrapper.style.transition = "transform 0.1s ease";
                setTimeout(function(){application_message_controls_wrapper.style.transform = "translateX(-10px) rotate(-0.2deg)";},0);
                setTimeout(function(){application_message_controls_wrapper.style.transform = "translateX(5px) rotate(0deg)";},100);
                setTimeout(function(){application_message_controls_wrapper.style.transform = null;application_message_controls_wrapper.style.transition = null;message_input_animation_playing  = false;},200);
            };
        }
    }
}

application_message_input.onkeyup = function(e){
    if (e.key == "Shift"){
        shift_is_held = false;
    }
}

function toggle_bottom_panel(b){
    if (b){
        application.classList.remove("bottom-panel-hidden");
    }else{
        application.classList.add("bottom-panel-hidden");
    }
}

const message_controls_element = document.getElementById('message-controls');
function disable_message_box(b){
    if (b){
        message_controls_element.classList.add("disabled");
        application_message_input.contentEditable = false;
    }else{
        message_controls_element.classList.remove("disabled");
        application_message_input.contentEditable = true;
    }
}

function hide_side_panel(b){
    if (b){
        application.classList.remove("side-panel-visible");
        side_panel_drag_handle.style.display = "none";
    }else{
        application.classList.add("side-panel-visible");
        side_panel_drag_handle.style.display = null;
    }
}

function load_message_data(d){
    messages = d["messages"];
    for (let i=0;i<messages.length;i++){
        create_message_elem(messages[i].data.replaceAll('\n','<br>'), messages[i].sender, messages[i].timestamp, messages[i].owner, false);
    }
    application_chat_page_wrapper.scrollTo({top: application_chat_page_wrapper.scrollHeight});
}

function set_chatpage(chatroom, elem=null){
    current_chatroom_selector = elem;
    current_chatroom = chatroom;
    document.getElementById("titlebar-content-user-name").innerText = chatroom.name;
    document.getElementById("titlebar-content-user-profile-picture-elem").src = chatroom.photo;
    document.getElementById("message-input-placeholdertext").innerText = "Send message to " + chatroom.name;
    //document.getElementById("titlebar-content-user-status").innerText = check_presence
    chat_page_message_container.innerHTML = ""; // CLEAR CHATROOM MESSAGES
    if(chatSocket_messages != null) {
        chatSocket_messages.close();
    }
    chatSocket_messages = new_websocket_messages(chatroom.id);
    chatSocket_messages.onmessage = function(e){
        let data = JSON.parse(e.data);
        const last_message_id = sessionStorage.getItem(data.message_id);
        if (last_message_id != data.message_id){
            create_message_elem(data.message.replaceAll('\n','<br>'), data.sender, Date.now());
            application_chat_page_wrapper.scrollTo({top: application_chat_page_wrapper.scrollHeight, behavior: 'smooth'});
        }
    }

    get_messages(chatroom.id);
}

function set_chatpage_transition(n, elem=null){
    if (!chat_room_selected){
        chat_room_selected = true;
        document.getElementById("chat-page-titlebar-content").classList.remove("hidden");
        document.getElementById("chat-page-no-room-selected").classList.add("hidden");
        disable_message_box(false);
    }
    if (current_page == 1){
        application_page_transition_element.style.transition = "background 0.1s ease"
        application_page_transition_element.classList.remove("hidden");
        document.getElementById("chat-page-titlebar-content").classList.add("hidden");
        setTimeout(function(){set_chatpage(n, elem)}, 100);
        setTimeout(function(){application_page_transition_element.classList.add("hidden");}, 200)
        setTimeout(function(){application_page_transition_element.style.transition = null;document.getElementById("chat-page-titlebar-content").classList.remove("hidden")}, 300)
    }else{
        set_chatpage(n, elem);
        set_page_view_transition(1);
    }
}

/* page initialisation */

let chat_room_selected = false;

function no_chat_room_selected(){
    chat_room_selected = false;
    document.getElementById("chat-page-titlebar-content").classList.add("hidden");
    document.getElementById("chat-page-no-room-selected").classList.remove("hidden");
    disable_message_box(true);
}

const chatrooms = [
]
let current_chatroom_selector = null;

function load_user_data(d){
    session_user = new User(d.id, d.username, d.profile_pic);
    document.getElementById("user-details-card-user-name").innerText = d.username;
    document.getElementById("settings-page-user-name").innerText = d.username;
    document.getElementById("user-details-card-profile-picture").src = d.profile_pic;
    document.getElementById("settings-page-user-profile").src = d.profile_pic;
    if (d.user_chats.length > 0){
        for(let i = 0; i < d.user_chats.length; ++i) {
            chatrooms.push(d.user_chats[i]);
            let userchat_element = document.createElement("li");
            userchat_element.classList.add("direct-message-button");
            userchat_element.data = d.user_chats[i];
            userchat_element.innerHTML = "<img class='direct-message-picture' src='" + d.user_chats[i].photo + "'><span class='direct-message-name'>" + d.user_chats[i].name + "</span>";
            document.getElementById("direct-messages-container").appendChild(userchat_element);
            userchat_element.onclick = function(){
                if(this != current_chatroom_selector) {
                    set_page_view_transition(1);
                    set_chatpage_transition(this.data, this);
                    remove_class("selected");
                    this.classList.add("selected");
                }else if(current_page != 1){
                    set_page_view_transition(1);
                }
            }
        }
        chat_room_selected = true;
        //document.getElementById("direct-messages-container").children[0].click();
        set_chatpage(chatrooms[0], document.getElementById("direct-messages-container").children[0]);
    }else{
        let userchat_element = document.createElement("li");
        userchat_element.classList.add("direct-message-button");
        userchat_element.classList.add("create-chatroom");
        userchat_element.innerHTML = "<span class='material-symbols-outlined'>add</span> <span class='direct-message-name'>" + "Create Chatroom" + "</span>";
        userchat_element.onclick = function(){
            if (current_page == 2) return;
            set_page_view_transition(2);
        }
        document.getElementById("direct-messages-container").appendChild(userchat_element);
        no_chat_room_selected();
    }
}

function remove_class(class_name) {
    let selected = document.getElementsByClassName(class_name);
        for(let i = selected.length - 1; i >= 0; i--) {
            selected[i].classList.remove(class_name);
    }
}

function wait_for_fonts_to_load(){
    document.fonts.ready.then(() => {setTimeout(load_page, 100);}).catch(() => {
        alert("Whoops ! It looks like some files didn't load correctly. Try restarting your browser or clearing your cache and try again.");
    });
}

get_user_details();

set_side_panel_fullscreen(true);
function load_page(){
    set_side_panel_fullscreen(false);
    set_page_view(1, false);
    setTimeout(function(){set_side_panel_width(360, true);application.classList.remove("loading");document.getElementById("side-panel").classList.remove("content-hidden")}, 200);
    setTimeout(function(){toggle_bottom_panel(true);if(chatrooms.length > 0) document.getElementById("chat-page-titlebar-content").classList.remove("hidden")}, 300);
    setTimeout(function(){application_chat_page_wrapper.scrollTo({top: application_chat_page_wrapper.scrollHeight})}, 500);
}

/* Need to eventually add a rotating loading animation at the center of the screen to let the user know that something is happening before initiating load_page function.
/* The idea behind the load page is to wait that all static files are correctly loaded on the client, but also, to ensure that the socket has established correct handshake.
/* If for some reason something goes wrong during the socket initialisation we need to display an error prompt to the user during the loading phase.

/

/* page initialisation */

/* App navigation */
const application_page_transition_element = document.getElementById("page-transition")
let current_page = null;

function previous_page(){
    remove_class("selected");
    let n = null;
    if (page_history.length > 1){
        page_history.pop();
        n = page_history[page_history.length - 1];
    }else{
        n = default_page
    }
    set_page_view_transition(n, true);
}

function set_page_view(n, auto=true, from_history=false){
    if (n != current_page){
        if (!from_history) page_history.push(n);
        if (current_page != null){
            application_pages[current_page].classList.remove("active");
        }

        current_page = n;
        application_pages[n].classList.add("active");

        if (current_page == 0){ /* Settings page */
            if (auto) {toggle_bottom_panel(false);disable_message_box(true);hide_side_panel(true);} /*toggle_bottom_panel(false); */
        }else if(current_page == 1){ /* Chat page */
            if (auto) {toggle_bottom_panel(true);if (chat_room_selected) disable_message_box(false);hide_side_panel(false);}
            if (current_chatroom_selector != null){
                remove_class("selected");current_chatroom_selector.classList.add("selected");
            }
        }else if(current_page == 2){ /* Create Chat Room page */
            if (auto) {toggle_bottom_panel(true);disable_message_box(true);hide_side_panel(false);}
            remove_class("selected");
        }else if(current_page == 3){ /* Friends page */
            if (auto) {toggle_bottom_panel(true);disable_message_box(true);hide_side_panel(false);}
            remove_class("selected");document.getElementById("friends-page-button").classList.add("selected");
        }
    }
}

let current_transition_id = 0;

function set_page_view_transition(n, from_history=false){
    if (n != current_page){
        let this_transition = ++current_transition_id;
        application_page_transition_element.classList.remove("hidden");
        setTimeout(function(){if (this_transition != current_transition_id) return;set_page_view(n, true, from_history)}, 200);
        setTimeout(function(){if (this_transition != current_transition_id) return;application_page_transition_element.classList.add("hidden");}, 400)
    }
}

/* App navigation */



let chat_page_focused = true;
let default_page = 1;
let page_history = [];
const chat_page_titlebar_content = document.getElementById("chat-page-titlebar-content");

onmousemove = function(e){
    if (chat_page_focused){
        chat_page_titlebar_content.style.transform = "translate(" + ((e.x - window.innerWidth)/300) + "px," + (e.y/300) + "px)";
    }
}

document.getElementById("settings-button").onclick = function(){
    if (current_page == 0) return;
    set_page_view_transition(0);
}

document.getElementById("create-chat-room-page-button").onclick = function(){
    if (current_page == 2) return;
    set_page_view_transition(2);
}

document.getElementById("friends-page-button").onclick = function(){
    if (current_page == 3) return;
    set_page_view_transition(3);
    remove_class("selected");document.getElementById("friends-page-button").classList.add("selected");
}

document.getElementById("settings-page-close-button").onclick = function(){
    previous_page();
}

document.getElementById("create-chat-room-page-close-button").onclick = function(){
    previous_page();
}

document.getElementById("friends-page-close-button").onclick = function(){
    previous_page();
}

document.getElementById("settings-page-logout-button").onclick = function(){
    window.location.href = "/logout";
}

const settings_page_theme_button = document.getElementById("settings-page-theme-button");
settings_page_theme_button.onclick = function(){
    if (application.classList.contains("lightmode")){
        application.classList.remove("lightmode");
        settings_page_theme_button.innerHTML = '<span class="material-symbols-outlined">light_mode</span> Light Theme'
    }else{
        application.classList.add("lightmode");
        settings_page_theme_button.innerHTML = '<span class="material-symbols-outlined">dark_mode</span> Dark Theme'
    }
}

document.addEventListener("keydown", function(e){
    if (e.key == "Escape"){
        if (!document.activeElement.isContentEditable){
            if (current_page != 1){
                previous_page();
            }
        }
    }
})


/* Presence handling */
chatSocket_app.onmessage = function(e){
    let data = JSON.parse(e.data);
    setTimeout(function(){check_presence(data)}, 100);
}

function check_presence(data){
    let user_status = document.getElementById("titlebar-content-user-status");
    for (let i=0;i<data.users_id.length;++i){
        if (data.users_id[i] == current_chatroom.id){
            user_status.innerText = "Online";
            return;
        }
    }
    user_status.innerText = "Offline";
}