# Default urls.py file 

from django.contrib import admin
from django.urls import path
from .views import *
from .consumers import ChatConsumer, PresenceConsumer

urlpatterns = [
    path('', home, name='home'),
    path('signup', signup_user, name='signup'),
    path('login/', login_user, name='login'),
    path('logout/', logout_user, name='logout'),    
    path('app', app, name='app'),

    # API CALLS

    # GET
    path('app/get/user_details', app_get_user_details),
    path('app/get/messages/<int:chatroom_id>', app_get_messages),
    # ...

    # POST
    path('app/post/message', app_post_message),
    path('app/post/group_chatroom', app_post_group_chatroom),
    path('app/post/delete_self', app_post_delete_self),
    path('app/post/delete_chatroom', app_post_delete_chatroom),
    path('app/post/delete_message', app_post_delete_message),
    path('app/post/user_chatroom', app_post_user_chatroom),
    # ...
]