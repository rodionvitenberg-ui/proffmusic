from django.contrib.auth.models import AbstractUser
from django.contrib.auth.base_user import BaseUserManager
from django.db import models
from django.utils.translation import gettext_lazy as _

class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError(_('Email должен быть указан'))
        email = self.normalize_email(email)
        
        # --- ВАЖНОЕ ИСПРАВЛЕНИЕ ---
        # Мы принудительно делаем username равным email.
        # Это удовлетворяет базу данных (поле не пустое) и твое требование.
        extra_fields['username'] = email 
        # --------------------------

        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError(_('Superuser must have is_staff=True.'))
        if extra_fields.get('is_superuser') is not True:
            raise ValueError(_('Superuser must have is_superuser=True.'))

        return self.create_user(email, password, **extra_fields)

class User(AbstractUser):
    # Убираем "username = None", чтобы поле осталось в базе (так как оно уже там есть)
    # username = None  <-- Эту строку писать НЕ НАДО, если хочешь username=email

    email = models.EmailField(_('email address'), unique=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = [] # username здесь не нужен, он заполнится сам

    objects = CustomUserManager()

    def __str__(self):
        return self.email