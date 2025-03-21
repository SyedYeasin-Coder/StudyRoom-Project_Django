from django.db.models.signals import post_save, post_delete, m2m_changed
from django.dispatch import receiver
from .models import Message, Room

@receiver([post_save, post_delete], sender=Message)
def update_room_on_message_change(sender, instance, **kwargs):
    instance.room.updated = instance.updated
    instance.room.save()


@receiver(m2m_changed, sender=Room.participants.through)
def update_room_on_participant_change(sender, instance, action, **kwargs):
    if action in ["post_add", "post_remove"]:
        instance.updated = instance.updated  
        instance.save()
