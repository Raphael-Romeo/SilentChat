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


def chat_room(request, room_name):
    search_query = request.GET.get('search', '')
    users = User.objects.exclude(id=request.user.id)
    chats = Message.objects.filter(
        (Q(sender=request.user) & Q(receiver__username=room_name) |
        Q(receiver=request.user) & Q(sender__username=room_name))
    )

    if search_query:
        chats = chats.filter(Q(content__icontains=search_query))

    chats = chats.order_by('timestamp')
    user_last_message = []

    for user in users:
        last_message = Message.objects.filter(
            (Q(sender=request.user) & Q(receiver=user) |
            Q(receiver=request.user) & Q(sender=user))
        ).order_by('-timestamp').first()

        user_last_message.append({
            'user': user,
            'last_message': last_message
        })

    user_last_message.sort(
        key=lambda x: x['last_message'].timestamp if x['last_message'] else None,
        reverse=True
    )
    
    return render(request, 'chat.html', {
        'room_name': room_name,
        'chats': chats,
        'users': user_last_message,
        'search_query': search_query,
        'user_last_message': user_last_message
    })


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
                "chat_room": chat.chat_room.id,
                "name": chatname,
                "photo": "/static/images/placeholder_profile_picture.webp"
            })

        for chat in GroupChats:
            serialized_user_chats.append({
                "chat_room": chat.chat_room.id,
                "name": chat.name,
                "photo": chat.chat_picture.url
        })
        data = {"username": user.username, "profile_pic": "/static/images/placeholder_profile_picture.webp", "user_chats": serialized_user_chats}

        return HttpResponse(json.dumps(data), content_type="application/json")
    else:
        return HttpResponseRedirect("/signup")
    