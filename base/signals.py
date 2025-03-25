from django.db.models.signals import post_save, post_delete, m2m_changed, pre_save
from django.dispatch import receiver
from .models import Message, Room, Topic

@receiver([post_save, post_delete], sender=Message)
def update_room_on_message_change(sender, instance, **kwargs):
    instance.room.updated = instance.updated
    instance.room.save()


@receiver(m2m_changed, sender=Room.participants.through)
def update_room_on_participant_change(sender, instance, action, **kwargs):
    if action in ["post_add", "post_remove"]:
        instance.updated = instance.updated  
        instance.save()

@receiver(post_delete, sender=Room)
def delete_empty_topics_on_room_delete(sender, instance, **kwargs):
    try:
        topic = instance.topic  
        if topic and not topic.room_set.exists():  
            # topic.delete()
    except Topic.DoesNotExist:
        pass  

@receiver(pre_save, sender=Room)
def delete_empty_topics_on_room_update(sender, instance, **kwargs):
    if instance.pk:
        old_instance = Room.objects.get(pk=instance.pk)
        if old_instance.topic and old_instance.topic != instance.topic:
            topic = old_instance.topic
            if not topic.room_set.exclude(pk=instance.pk).exists():
                topic.delete()