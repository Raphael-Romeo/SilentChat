from django.db import models
from django.contrib import admin
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

# CUSTOM USER MODEL

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    profile_pic = models.ImageField(upload_to='profile_pics', blank=True)
    friends = models.ManyToManyField(User, related_name='friends', blank=True)
    bio = models.TextField(max_length=500, blank=True)
    last_connection_date = models.DateTimeField(blank=True)

    def __str__(self):
        return self.user.username
    
    def create_user_profile(sender, instance, created, **kwargs):
        if created:
            UserProfile.objects.create(user=instance)

    def save_user_profile(sender, instance, **kwargs):
        instance.profile.save()

admin.site.register(UserProfile)



# CHAT ROOMS MODELS

# The ChatRoom is not deleted when the User or GroupChatRoom is deleted

class ChatRoom(models.Model):
    CHAT_ROOM_TYPES = (
        ('user', 'User Chat Room'),
        ('group', 'Group Chat Room'),
    )
    id = models.AutoField(primary_key=True)
    created_at = models.DateTimeField(auto_now_add=True)
    chat_room_type = models.CharField(max_length=10, choices=CHAT_ROOM_TYPES)

    def __str__(self):
        return f"Chat room {self.id}"

admin.site.register(ChatRoom)


class UserChatRoom(models.Model):
    chat_room = models.OneToOneField(ChatRoom, on_delete=models.CASCADE)
    user_A = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user_A')
    user_B = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user_B')

    def __str__(self):
        return f"{self.user_A.username} and {self.user_B.username}"
    
admin.site.register(UserChatRoom)

class GroupChatRoom(models.Model): 
    chat_room = models.OneToOneField(ChatRoom, on_delete=models.CASCADE)
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='creator')
    name = models.CharField(max_length=100)
    chat_picture = models.ImageField(upload_to='chat_picture', blank=True, default='chat_picture/default.png')
    users = models.ManyToManyField(User)

    def __str__(self):
        return f"Group chat room id: {self.id}"

admin.site.register(GroupChatRoom)



# MESSAGES MODEL

class Message(models.Model):
    id = models.AutoField(primary_key=True)
    chatroom_id = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name='chatroom_id')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sender')
    data = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.sender.username}: {self.data} | id: {self.id}"

admin.site.register(Message)
