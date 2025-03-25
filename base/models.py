import os
import shutil
from django.db import models
from django.utils.timezone import now
from django.contrib.auth.models import AbstractUser

def user_avatar_path(instance, filename):
    return f"user_avatar/{instance.username}_{filename}"

class User(AbstractUser):
    name = models.CharField(max_length=200, null=True)
    email = models.EmailField(unique=True ,null=True)
    bio = models.TextField(null=True, blank=True)

    avatar = models.ImageField(upload_to=user_avatar_path, null=True, default="avatar.svg")
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
    def save(self, *args, **kwargs):
        try:
            old_user = User.objects.get(id=self.id)
            if old_user.avatar and old_user.avatar.name != "avatar.svg":
                old_avatar_path = old_user.avatar.path

                if self.avatar and old_user.avatar != self.avatar:
                    if os.path.exists(old_avatar_path):
                        os.remove(old_avatar_path)

        except User.DoesNotExist:
            pass  

        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        self.room_set.all().delete()
        for message in self.message_set.all():
            message.delete()

        if self.avatar and self.avatar.name != "avatar.svg":
            avatar_path = self.avatar.path
            if os.path.exists(avatar_path):
                os.remove(avatar_path)

        super().delete(*args, **kwargs)

class Topic(models.Model):
    name = models.CharField(max_length=200)
    def __str__(self):
        return self.name

class Room(models.Model):
    host = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    topic = models.ForeignKey(Topic, on_delete=models.SET_NULL, null=True, blank=True)
    name = models.CharField(max_length=200)
    description = models.TextField(null=True, blank=True)
    participants = models.ManyToManyField(User, related_name='participants', blank=True)
    updated = models.DateTimeField(auto_now=True)
    created = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-updated', '-created']

    def __str__(self):
        return str(self.name)


class Message(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    room = models.ForeignKey(Room, on_delete=models.CASCADE)
    body = models.TextField(blank=True)
    updated = models.DateTimeField(auto_now=True)
    created = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-updated', '-created']
    def __str__(self):
        return self.body[:50] if self.body else "File Upload"
    def delete(self, *args, **kwargs):
        for file in self.files.all(): 
            if file.file and os.path.isfile(file.file.path): 
                os.remove(file.file.path)  
            file.delete()

        for audio in self.audiomessage.all():
            if audio.audio_file and os.path.isfile(audio.audio_file.path):
                os.remove(audio.audio_file.path) 
            user_folder = os.path.dirname(audio.audio_file.path)
            audio.delete()

            if os.path.exists(user_folder) and not os.listdir(user_folder):
                shutil.rmtree(user_folder) 

        super().delete(*args, **kwargs)  

class MessageFile(models.Model):
    message = models.ForeignKey(Message, on_delete=models.CASCADE, related_name='files')
    file = models.FileField(upload_to='messages/')
    original_name = models.CharField(max_length=255, default="unknown")
    
def audio_upload_path(instance, filename):
    extension = filename.split('.')[-1]
    timestamp = now().strftime('%Y%m%d - %H_%M_%S') 
    filename = f"{instance.user.username}_{timestamp}.{extension}"
    return os.path.join("audio_messages", instance.user.username, filename)

class AudioMessage(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    room = models.ForeignKey(Room, on_delete=models.CASCADE)
    audio_file = models.FileField(upload_to=audio_upload_path)
    created = models.DateTimeField(auto_now_add=True)
    message = models.ForeignKey(Message, related_name="audiomessage", on_delete=models.CASCADE, null=False) 

    class Meta:
        ordering = ['-created']

    def __str__(self):
        return f"AudioMessage from {self.user.name or self.user.username} in {self.room.name}"
    
