from django.db import models
from django.contrib.auth.models import AbstractUser

# Custom User Model
class User(AbstractUser):
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('normal', 'Normal User'),
    ]
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='normal')

# Project Model
class Project(models.Model):
    project_name = models.CharField(max_length=255)
    due_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, related_name='created_project', on_delete=models.CASCADE)

    def __str__(self):
        return self.project_name

# Task Model
class Task(models.Model):
    choices = [('todo', 'To Do'), ('doing', 'Doing'), ('done', 'Done')]
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    task_name = models.CharField(max_length=255)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    due_date = models.DateField()
    priority = models.IntegerField(choices=[(i, str(i)) for i in range(1, 6)])  
    status = models.CharField(max_length=10, choices=choices,default='todo')
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, related_name='created_tasks', on_delete=models.CASCADE)

    def __str__(self):
        return f'Task {self.id} for project {self.project.project_name}'

# Comments Model
class Comment(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE)
    comment = models.TextField( max_length=500,null=True, blank=True) 
    from_user = models.ForeignKey(User, related_name='comments_from', on_delete=models.CASCADE)
    to_user = models.ForeignKey(User, related_name='comments_to', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Comment from {self.from_user.username} to {self.to_user.username}'
