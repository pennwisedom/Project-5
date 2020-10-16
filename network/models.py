from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    pass

class Post(models.Model):
    user = models.ForeignKey(User, on_delete=models.PROTECT, related_name="poster")
    timestamp = models.DateTimeField(auto_now_add=True)
    text = models.CharField(max_length=280)

    def __str__(self):
        return f"{self.user} made a post at {self.timestamp}."


    def serialize(self, yes=0, user=0):
        return {
            "id": self.id,
            "user": self.user.username,
            "user_id": self.user.id,
            "user_is_following": yes,
            "text": self.text,
            "timestamp": self.timestamp.strftime("%b %d %Y, %I:%M %p"),
            "likes": Likes.objects.filter(post=self.pk).count(),
            "user_has_liked": 'yes' if Likes.objects.filter(post=self.id, user=user).count() > 0 else 'no',
            "followers": WatchList.objects.filter(userwatchee=self.user.id).count(),
            "following": WatchList.objects.filter(userwatcher=self.user.id).count()
        }

class Likes(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="likes")
    user = models.ManyToManyField(User, related_name="liker")

    def __str__(self):
        return f"{self.post.user.username}'s post ({self.post.id}) was liked by {self.user.get().username}."

class WatchList(models.Model):
    userwatcher = models.ManyToManyField(User, related_name="watchee")
    userwatchee = models.ManyToManyField(User, related_name="watchers")

    def __str__(self):
        return f"{self.userwatcher.get().username} is watching {self.userwatchee.get().username}."