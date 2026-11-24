

from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.mail import EmailMessage,EmailMultiAlternatives
from datetime import datetime
import smtplib
import time
import base64
from email.mime.image import MIMEImage

class Announcement(models.Model):
    image = models.ImageField(upload_to='announcements/')
    description = models.TextField(max_length=500, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Anuncio - {self.id}"

class TransitionImage(models.Model):
    image = models.ImageField(upload_to='transitions/')

    def __str__(self):
        return f"Imagen de transición - {self.id}"

# myapp/models.py
from django.contrib.auth.models import User
from django.db import models

class UserIP(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    ip_address = models.GenericIPAddressField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.user} - {self.ip_address}'

@receiver(post_save, sender=Announcement)
def send_announcement_email(sender, instance, created, **kwargs):
    fecha = datetime.now().strftime("%d/%m/%Y")
    if created:  # Solo ejecuta si el objeto es nuevo
        remitente = 'anuncio_facturacion@claro.com.pe'
        destinatarios = [       
            'haruo.oyola@claro.com.pe',
            'C27851@claro.com.pe',
            'c27229@claro.com.pe',
            'carlos.farfan@claro.com.pe',
            'angela.felix@claro.com.pe',            
            'c27358@claro.com.pe',
            'c27232@claro.com.pe',
            'bianca.cahuana@claro.com.pe',
            'fabiola.sanchez@claro.com.pe',
            'luis.huatuco@claro.com.pe',
            'rhurtado@claro.com.pe',
            'jose.quezada@claro.com.pe',
            'antoinette.calmett@claro.com.pe',
            'carlos.valenzuela@claro.com.pe',
            'eiko.nalvarte@claro.com.pe',
            'pmarreros@claro.com.pe',
            'vilma.cuestas@claro.com.pe',
            'bgonzales@claro.com.pe',
            'carlos.zambrano@claro.com.pe',
            'rocio.mejia@claro.com.pe',
            'haruo.oyola@claro.com.pe',
            'renzo.rossell@claro.com.pe',
            'smith.serna@claro.com.pe',
            'c27289@claro.com.pe',
            'xiomara.rojas@claro.com.pe',
            'cfarfan@claro.com.pe',
            'dhiga@claro.com.pe',
            'c27229@claro.com.pe',
            'FacturacionPostpago@claro.com.pe',            
        ]
        
        # Configura el mensaje
        mensaje = f"""
        <h1>Nuevo Anuncio</h1>
        <p>{instance.description}</p>
        <p>Publicado el: {instance.created_at.strftime('%Y-%m-%d %H:%M:%S')}</p>
        <img src="cid:banner_anuncio" alt="Imagen del anuncio" />
        <p>Saludos,<br>Gerencia Facturación a Clientes</p>
        """

        email = EmailMultiAlternatives(
            subject=f"¡ANUNCIO IMPORTANTE FACTURACIÓN! - {fecha}",
            body=mensaje,
            from_email=remitente,
            to=destinatarios,
        )
        email.attach_alternative(mensaje, "text/html")  # Define el contenido como HTML

        # Adjuntar imagen del anuncio
        if instance.image:
            try:
                with open(instance.image.path, "rb") as image_file:
                    img = MIMEImage(image_file.read())
                    img.add_header('Content-ID', '<banner_anuncio>')  
                    email.attach(img)                
            except FileNotFoundError:
                print(f"Error: La imagen {instance.image.path} no se encontró.")
            except Exception as ex:
                print(f"Error al adjuntar la imagen: {ex}")

        correo_enviado = False
        while not correo_enviado:
            try:
                server = smtplib.SMTP("amp.claro.com.pe", port=587)
                server.sendmail(remitente, destinatarios, email.message().as_string().encode('utf-8'))
                server.quit()
                correo_enviado = True
                print("\nCorreo enviado.")                
            except Exception as ex:
                print("\nError al enviar correo.")
                print(f"{ex}")
                print("Reintentando...")
                time.sleep(2)



