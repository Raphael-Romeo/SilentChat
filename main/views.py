from django.shortcuts import render
from django.http import HttpResponse, HttpResponseRedirect
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages
from django.db.models import Q
from .models import *
import json


# index page view, index.html located in templates
def home(request):
    return render(request, 'index.html')

# Login is required to access this view.
def app(request):
    if request.user.is_authenticated:
        return render(request, 'app.html')
    else:
        return HttpResponseRedirect('/signup')

# User registration and login/logout views
def signup_user(request):
    if request.method == 'POST':
        username = request.POST['username']
        email = request.POST['email']
        password = request.POST['password']
        password2 = request.POST['password2']

        if password != password2:
            messages.error(request, 'Passwords do not match')
            return render(request, 'register.html')
        
        if User.objects.filter(username=username).exists():
            messages.error(request, 'Username already exists')
            return render(request, 'register.html')
        
        user = User.objects.create_user(username, email, password)
        user.save()
        messages.success(request, 'You are now registered and can log in')
        # login(request, user)
        return render(request, 'index.html')
    
    return render(request, 'register.html')

def login_user(request):
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']

        user = authenticate(username=username, password=password)
        if user is not None:
            login(request, user)
            messages.success(request, 'You are now logged in')
            return HttpResponseRedirect("/app")
        else:
            messages.error(request, 'Invalid credentials')
            return render(request, 'login.html')
    
    return render(request, 'login.html')

def logout_user(request):
    logout(request)
    messages.success(request, 'You are now logged out')
    return render(request, 'index.html')



# API TYPE CALLS (Functions here return JSON data).

def app_get_user_details(request):
    if request.user.is_authenticated:
        user = request.user
        UserChats = UserChatRoom.objects.all().filter(Q(user_A=user) | Q(user_B=user))
        GroupChats = GroupChatRoom.objects.all().filter(users__in=[user])
        print(UserChats)
        print(GroupChats)
        serialized_user_chats = []
        for chat in UserChats:
            if chat.user_A == user:
                chatname = chat.user_B.username
            else:
                chatname = chat.user_A.username
            serialized_user_chats.append({
                "id": chat.chat_room.id,
                "name": chatname,
                "photo": "/static/images/placeholder_profile_picture.webp",
                "type": "user"
            })

        for chat in GroupChats:
            serialized_user_chats.append({
                "id": chat.chat_room.id,
                "name": chat.name,
                "photo": chat.chat_picture.url,
                "type": "group"
        })
        data = {"username": user.username, "profile_pic": "/static/images/placeholder_profile_picture.webp", "user_chats": serialized_user_chats}

        return HttpResponse(json.dumps(data), content_type="application/json")
    else:
        return HttpResponseRedirect("/signup")


def user_in_chatroom(user, chatroom):
    return True


def app_get_messages(request, chatroom_id:int):
    if request.user.is_authenticated:
        chatroom = ChatRoom.objects.get(id = chatroom_id)
        messages = Message.objects.all().filter(chatroom_id=chatroom_id)
        if user_in_chatroom(request.user, chatroom):
            data = {"messages": []}
            for message in messages:
                data["messages"].append({
                    "id": message.id,
                    "sender": message.sender.username,
                    "data": message.data,
                    "timestamp": str(message.timestamp),
                })
            return HttpResponse(json.dumps(data), content_type="application/json")
    return HttpResponseRedirect("/signup")
    

def app_post_message(request):
    if request.user.is_authenticated:
        if request.method == 'POST':
            data = json.loads(request.body)
            chatroom_id = data['chatroom_id']
            message = data['message']
            chatroom = ChatRoom.objects.get(id = chatroom_id)
            sender = User.objects.get(id = request.user.id)
            if user_in_chatroom(request.user, chatroom):
                new_message = Message.objects.create(
                    chatroom_id=chatroom,
                    sender=sender,
                    data=message
                )
                new_message.save()
                return HttpResponse(json.dumps(data), content_type="application/json")
    return HttpResponseRedirect("/signup")