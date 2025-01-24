# Default urls.py file 

from django.contrib import admin
from django.urls import path
from .views import *

urlpatterns = [
    path('', home, name='home'),
    path('signup', signup_user, name='signup'),
    path('login/', login_user, name='login'),
    path('logout/', logout_user, name='logout'),
    path('chat/<str:room_name>', chat_room, name='chat'),
    
    path('app', app, name='app'),

    # API CALLS

    # GET
    path('app/get/user_details', app_get_user_details),
    path('app/get/messages/<int:chatroom_id>', app_get_messages),
    # ...

    # POST
    # ...
]