const side_panel_drag_handle = document.getElementById("side-panel-drag-handle");
const application = document.getElementById("application-wrapper");
let mouse_down_side_panel_drag_handle_initial_pos = null;
let mouse_down_side_panel_drag_handle_initial_width = null;
let max_side_panel_width = null;
let minimum_side_panel_width = 215;
let compact_side_panel_mode = false;
let app_fullscreen = false;

if (window.innerWidth < 800){
    max_side_panel_width = 360;
}else{
    max_side_panel_width = window.innerWidth/3;
}

let is_max_width = false;
let mouse_down_side_panel_drag_handle = false;
let current_side_panel_size = null;
set_side_panel_width(360);

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
        let delta = mouse_down_side_panel_drag_handle_initial_pos - e.x
        set_side_panel_width(mouse_down_side_panel_drag_handle_initial_width - delta)
    }
}

window.onresize = function(e){
    let new_size = null;
    if (window.innerWidth > 640){
        new_size = window.innerWidth/3;
    }else{
        new_size = 640/3;
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

function set_side_panel_width(c){
    if (c < minimum_side_panel_width || compact_side_panel_mode){
        if (c < 10){
            application.style.setProperty('--side-panel-extended-width', 0 + "px");
            current_side_panel_size = 0;
            release_mouse_down_side_panel_drag_handle();
            set_side_panel_fullscreen(true);
            return;
        }else if (c < 74 + 50 && !compact_side_panel_mode){
            enable_animations(true);
            compact_side_panel_mode = true;
            application.style.setProperty('--side-panel-extended-width', minimum_side_panel_width + "px");
            current_side_panel_size = 74;
            set_side_panel_compact(true);
            return;
        }else if (c >= 74 + 50 && compact_side_panel_mode){
            enable_animations(true);
            set_side_panel_compact(false);
			setTimeout(function(){enable_animations(false)}, 200);
            compact_side_panel_mode = false;
            current_side_panel_size = minimum_side_panel_width;
            application.style.setProperty('--side-panel-extended-width', minimum_side_panel_width + "px");
        }else if (!compact_side_panel_mode){
            current_side_panel_size = minimum_side_panel_width;
            application.style.setProperty('--side-panel-extended-width', minimum_side_panel_width + "px");
        }
    }else if(c > max_side_panel_width){
        if (!mouse_down_side_panel_drag_handle){
            enable_animations(false);
            setTimeout(function(){enable_animations(true)}, 1);
        }
        current_side_panel_size = max_side_panel_width;
        application.style.setProperty('--side-panel-extended-width', max_side_panel_width + "px");
    }else{
        enable_animations(false);
        current_side_panel_size = c;
        application.style.setProperty('--side-panel-extended-width', c + "px");
    }
}

/* Textarea */

document.querySelectorAll("textarea").forEach(function(textarea) {
  textarea.style.height = textarea.scrollHeight - 20 + "px";

  textarea.addEventListener("input", function() {
    this.style.height = "auto";
    this.style.height = this.scrollHeight + "px";
  });
});

setTimeout(function(){application.classList.remove("bottom-panel-hidden")}, 200);