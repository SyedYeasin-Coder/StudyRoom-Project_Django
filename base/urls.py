from django.urls import path
from . import views
from django.conf import settings
from django.conf.urls.static import static
urlpatterns = [
    path('login/', views.loginView, name="login"),
    path('logout/', views.Userlogout, name="logout"),
    path('register/', views.registerUser, name="register"),
    path('delete-account/', views.delete_account, name='delete-account'),

    path('', views.home, name="home"),
    path('profile/<str:pk>/', views.userProfile, name='user-profile'),
    path('room/<str:pk>/', views.room, name="room"),
    path('create-room/', views.createRoom, name="create-room"),
    path('update-room/<str:pk>/', views.updateRoom, name="update-room"),
    path('delete-room/<str:pk>/', views.deleteRoom, name="delete-room"),

    path("edit-message/<str:pk>/", views.edit_message, name="edit-message"),
    path('delete-message/<str:pk>/', views.deleteMessage, name="delete-message"),

    path('update-user/', views.updateUser, name='update-user'),
    path('update-avatar/', views.update_avatar, name='update-avatar'),
    
    path('topics/', views.topicsPage, name='topics'),
    path('activity/', views.activityPage, name='activity')
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)