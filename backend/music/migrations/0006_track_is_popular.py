from django.db import migrations, models


def mark_popular(apps, schema_editor):
    Track = apps.get_model('music', 'Track')
    ids = list(Track.objects.order_by('created_at').values_list('pk', flat=True)[:8])
    if ids:
        Track.objects.filter(pk__in=ids).update(is_popular=True)


class Migration(migrations.Migration):

    dependencies = [
        ('music', '0005_price_usd_label'),
    ]

    operations = [
        migrations.AddField(
            model_name='track',
            name='is_popular',
            field=models.BooleanField(
                default=False,
                help_text='Галочка для блока Популярное',
                verbose_name='Выводить в популярном',
            ),
        ),
        migrations.RunPython(mark_popular, migrations.RunPython.noop),
    ]
