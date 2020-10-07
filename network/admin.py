from django.contrib import admin
from .models import Post, Likes, WatchList

class PostAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "timestamp")

# Register your models here.
admin.site.register(Post, PostAdmin)
admin.site.register(Likes)
admin.site.register(WatchList)