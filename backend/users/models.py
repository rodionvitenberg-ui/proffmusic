from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    # Делаем email обязательным и уникальным
    email = models.EmailField(unique=True)
    
    # Аватарка
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    
    # Требуем email при создании суперюзера через консоль
    REQUIRED_FIELDS = ['first_name', 'last_name']
    USERNAME_FIELD = 'email' # Логин по email

    def __str__(self):
        return self.email