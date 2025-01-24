from django.db import models
from django.contrib import admin
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

# Create your models here.
class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    profile_pic = models.ImageField(upload_to='profile_pics', blank=True)
    bio = models.TextField(max_length=500, blank=True)

    def __str__(self):
        return self.user.username
    
    def create_user_profile(sender, instance, created, **kwargs):
        if created:
            UserProfile.objects.create(user=instance)

    def save_user_profile(sender, instance, **kwargs):
        instance.profile.save()

admin.site.register(UserProfile)

class Message(models.Model):
    id = models.AutoField(primary_key=True)
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sender')
    data = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.sender.username}: {self.data}"

admin.site.register(Message)


class ChatRoom(models.Model): 
    id = models.AutoField(primary_key=True)
    messages = models.ManyToManyField(Message)
    created_at = models.DateTimeField(auto_now_add=True)

admin.site.register(ChatRoom)

class UserChatRoom(models.Model):
    chat_room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE)
    user_A= models.ForeignKey(User, on_delete=models.CASCADE, related_name='user_A')
    user_B = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user_B')

    def __str__(self):
        return f"{self.user_A.username} and {self.user_B.username}"
    
admin.site.register(UserChatRoom)
    

class GroupChatRoom(models.Model): 
    chat_room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    chat_picture = models.ImageField(upload_to='chat_picture', blank=True)
    users = models.ManyToManyField(User)

    def __str__(self):
        return f"Group chat room {self.id}"

admin.site.register(GroupChatRoom)

