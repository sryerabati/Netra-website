from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0002_separate_eye_predictions'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='role',
            field=models.CharField(
                choices=[('patient', 'Patient'), ('nurse', 'Nurse'), ('doctor', 'Doctor'), ('admin', 'Admin')],
                default='patient',
                max_length=20
            ),
        ),
    ]
