from django.contrib import admin
from task.models import *
admin.site.register(User)
admin.site.register(Project)
admin.site.register(Task)
admin.site.register(Comment)

