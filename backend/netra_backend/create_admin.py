import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'netra_backend.settings')
django.setup()

from api.models import User

username = 'admin'
email = 'admin@admin.com'
password = 'password'
full_name = 'admin admin'
role = 'admin'

if User.objects.filter(username=username).exists():
    print(f'Admin user "{username}" already exists.')
    user = User.objects.get(username=username)
    user.role = role
    user.full_name = full_name
    user.email = email
    user.set_password(password)
    user.save()
    print('Admin user updated successfully.')
else:
    user = User.objects.create_user(
        username=username,
        email=email,
        password=password,
        full_name=full_name,
        role=role
    )
    print(f'Admin user "{username}" created successfully.')

print(f'Username: {username}')
print(f'Email: {email}')
print(f'Password: {password}')
print(f'Role: {role}')
