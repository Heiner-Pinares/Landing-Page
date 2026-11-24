from django.contrib import admin


from django.contrib import admin
from .models import Announcement, TransitionImage

@admin.register(Announcement)
class AnnouncementAdmin(admin.ModelAdmin):
    list_display = ('id', 'description')

@admin.register(TransitionImage)
class TransitionImageAdmin(admin.ModelAdmin):
    list_display = ('id',)
