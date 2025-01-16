const side_panel_drag_handle = document.getElementById("side-panel-drag-handle");
const application = document.getElementById("application-wrapper");
let mouse_down_side_panel_drag_handle_initial_pos = null;
let mouse_down_side_panel_drag_handle_initial_width = null;
let max_side_panel_width = null;
let minimum_side_panel_width = 215;
let compact_side_panel_mode = false;
let app_fullscreen = false;

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
}

function enable_animations(b){
    if (!b){
        const animated_elements = [
            "message-input-wrapper",
            "user-details-wrapper",
            "message-input-wrapper",
            "page-view",
            "side-panel-wrapper"
        ];
        for (let i=0;i<animated_elements.length;++i){
            document.getElementById(animated_elements[i]).style.transition = "none";
        }
    }else{
        const animated_elements = [
            "message-input-wrapper",
            "user-details-wrapper",
            "message-input-wrapper",
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
    }else{
        application.classList.remove("side-panel-compact");
    }
}

function set_side_panel_fullscreen(b){
    app_fullscreen = b;
    if (b){
        application.classList.add("page-view-full-screen");
    }else{
        application.classList.remove("page-view-full-screen");
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
            set_side_panel_fullscreen(false);
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

function send_message(){
    console.log(application_message_box.value);
    application_message_box.value = "";
}

const application_message_box = document.getElementById("message-box");
let shift_is_held = false;

application_message_box.style.height = application_message_box.scrollHeight - 20 + "px";
application_message_box.addEventListener("input", function() {
    this.style.height = "auto";
    this.style.height = this.scrollHeight + "px";
});

application_message_box.onkeydown = function(e){
    if (e.key == "Shift"){
        shift_is_held = true;
    }else if(e.key == "Enter"){
        if (!shift_is_held){
            send_message();
            e.preventDefault();
            application_message_box.style.height = "auto";
            application_message_box.style.height = application_message_box.scrollHeight + "px";
        }
    }
}

application_message_box.onkeyup = function(e){
    if (e.key == "Shift"){
        shift_is_held = false;
    }
}

/* page startup animation */
set_side_panel_fullscreen(true);
function load_page(){
    set_side_panel_fullscreen(false);setTimeout(function(){set_side_panel_width(360, true);application.classList.remove("bottom-panel-hidden");application.classList.remove("loading");}, 200);
}
setTimeout(load_page, 200);

/* Need to eventually add a rotating loading animation at the center of the screen to let the user know that something is happening before initiating load_page function.
/* The idea behind the load page is to wait that all static files are correctly loaded on the client, but also, to ensure that the socket has established correct handshake.
/* If for some reason something goes wrong during the socket initialisation we need to display an error prompt to the user during the loading phase.

/* page startup animation */


/* App navigation */

function set_page_view(n){

}

/* App navigation */