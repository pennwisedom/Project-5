
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("user/<int:id>", views.userpage, name="userpage"),

    #API Routes
    path("posts", views.posts, name="posts"),
    path("post", views.post, name="post"),
    path("like", views.like, name="like"),
    path("userposts/<int:id>", views.userposts, name="userposts"),
    path("follower", views.follower, name="follower")
]
