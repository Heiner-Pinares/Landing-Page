from django.shortcuts import render
from django.shortcuts import render
from .models import Announcement, TransitionImage
from django.views.generic import TemplateView
from django.shortcuts import render


def landing_page(request):
    announcement = Announcement.objects.last()  # Obtener el último anuncio
    transition_images = TransitionImage.objects.all()  # Obtener todas las imágenes de transición
    return render(request, 'landing_modern.html', {
        'announcement': announcement,
        'transition_images': transition_images,
    })
# Vista para mostrar el historial de anuncios
def announcements_history(request):
    announcements = Announcement.objects.order_by('-created_at')  # Anuncios ordenados por fecha
    return render(request, 'announcements_history.html', {'announcements': announcements})



def my_view(request):
    announcement = Announcement.objects.last()  # Obtener el último anuncio
    transition_images = TransitionImage.objects.all()  # Obtener todas las imágenes de transición
    return render(request, 'conoce_mas.html',{
        'announcement': announcement,
        'transition_images': transition_images,
    }) 

def  find_person(request):
      return render(request, 'buscar_personas_modern.html')
