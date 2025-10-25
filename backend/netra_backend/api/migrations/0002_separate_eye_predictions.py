from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='retinalscan',
            name='ai_prediction',
        ),
        migrations.RemoveField(
            model_name='retinalscan',
            name='ai_confidence',
        ),
        migrations.AddField(
            model_name='retinalscan',
            name='left_eye_prediction',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
        migrations.AddField(
            model_name='retinalscan',
            name='left_eye_prediction_class',
            field=models.IntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='retinalscan',
            name='right_eye_prediction',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
        migrations.AddField(
            model_name='retinalscan',
            name='right_eye_prediction_class',
            field=models.IntegerField(blank=True, null=True),
        ),
    ]
