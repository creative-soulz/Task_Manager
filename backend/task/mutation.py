import graphene
from .models import *
from datetime import timezone





class CreateUser(graphene.Mutation):
    class Arguments:
        username = graphene.String(required=True)
        email = graphene.String(required=True)
        password = graphene.String(required=True)
        role = graphene.String()

    username = graphene.String()
    email = graphene.String()
    success = graphene.Boolean()
    error = graphene.String()

    def mutate(self, info, username, email, password, role=None):
        if User.objects.filter(username=username).exists():
            return CreateUser(error="Username already exists", success=False)
        if User.objects.filter(email=email).exists():
            return CreateUser(error="Email already exists", success=False)
        if role not in ['admin', 'normal']:
            role = 'normal'
        if not username or not email or not password:
            return CreateUser(error="Please fill in all fields", success=False)

        user = User(username=username, email=email, role=role)
        user.set_password(password)
        user.save()
        return CreateUser(username=username, email=email, success=True, error=None)


class UpdateUser(graphene.Mutation):
    class Arguments:
        user_id = graphene.Int(required=True)
        username = graphene.String()
        email = graphene.String(required=False)
        password = graphene.String(required=False)
        role = graphene.String()

    username = graphene.String()
    email = graphene.String()
    success = graphene.Boolean()
    error = graphene.String()

    def mutate(self, info, user_id, username=None, email=None, password=None, role=None):
        
        current_user = info.context.user

       
        try:
            user_to_update = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return UpdateUser(error="User does not exist", success=False)

       
        if role and current_user.role != 'admin':
            return UpdateUser(error="Only admins can update user roles", success=False)

        if not username:
            username = user_to_update.username
        if username:
            if User.objects.filter(username=username).exclude(id=user_id).exists():
                return UpdateUser(error="Username already exists", success=False)
            user_to_update.username = username

        if email:
            if User.objects.filter(email=email).exclude(id=user_id).exists():
                return UpdateUser(error="Email already exists", success=False)
            user_to_update.email = email

        if not password:
            password = user_to_update.password
        if password:
            user_to_update.set_password(password)  
        # if password:
            
        #     user_to_update.set_password(password)

       
        if not role:
            role = user_to_update.role
        if role:
            user_to_update.role = role
            

        user_to_update.save()

        return UpdateUser(username=user_to_update.username, email=user_to_update.email, success=True)


class DeleteUser(graphene.Mutation):
    class Arguments:
        user_id = graphene.Int(required=True)

    success = graphene.Boolean()
    error = graphene.String()

    def mutate(self, info, user_id):
       
        current_user = info.context.user

        try:
            user_to_delete = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return DeleteUser(error="User does not exist", success=False)

        if current_user.role != 'admin':
            return DeleteUser(error="Only admins can delete users", success=False)

        user_to_delete.delete()

        return DeleteUser(success=True)


import graphene
from .models import Project, User


class CreateProject(graphene.Mutation):
    class Arguments:
        project_name = graphene.String(required=True)
        due_date = graphene.Date(required=True)

    project_name = graphene.String()
    due_date = graphene.Date()
    success = graphene.Boolean()
    error = graphene.String()

    def mutate(self, info, project_name=None, due_date=None):
        current_user = info.context.user

         
        if current_user.role != 'admin':
            return CreateProject(error="Only admin can create a project", success=False)

        # Validate inputs
        if not project_name or not due_date:
            return CreateProject(error="Please fill in all fields", success=False)

        
        if Project.objects.filter(project_name=project_name).exists():
            return CreateProject(error="Project already exists", success=False)


        project = Project.objects.create(project_name=project_name, due_date=due_date, created_by=current_user)
        project.save()

        return CreateProject(project_name=project.project_name, due_date=project.due_date, success=True)


class UpdateProject(graphene.Mutation):
    class Arguments:
        project_id = graphene.Int(required=True)
        project_name = graphene.String(required=False)
        due_date = graphene.Date(required=False)

    project_name = graphene.String()
    due_date = graphene.Date()
    success = graphene.Boolean()
    error = graphene.String()

    def mutate(self, info, project_id, project_name=None, due_date=None):
        current_user = info.context.user

        
        if current_user.role != 'admin':
            return UpdateProject(error="Only admin can update a project", success=False)

        
        try:
            project = Project.objects.get(id=project_id)
        except Project.DoesNotExist:
            return UpdateProject(error="Project not found", success=False)

        
        if project_name:
            if Project.objects.filter(project_name=project_name).exclude(id=project_id).exists():
                return UpdateProject(error="Another project with the same name already exists", success=False)
            project.project_name = project_name

        if due_date:
            project.due_date = due_date

        
        project.save()

        return UpdateProject(project_name=project.project_name, due_date=project.due_date, success=True)


class DeleteProject(graphene.Mutation):
    class Arguments:
        project_id = graphene.Int(required=True)

    success = graphene.Boolean()
    error = graphene.String()

    def mutate(self, info, project_id):
        current_user = info.context.user

        if current_user.role != 'admin':
            return DeleteProject(error="Only admin can delete a project", success=False)

     
        try:
            project = Project.objects.get(id=project_id)
        except Project.DoesNotExist:
            return DeleteProject(error="Project not found", success=False)

        
        project.delete()

        return DeleteProject(success=True)


import graphene


class CreateTask(graphene.Mutation):
    class Arguments:
        project = graphene.Int(required=True)
        user = graphene.Int(required=True)
        due_date = graphene.Date(required=True)
        task_name = graphene.String(required=True)
        priority = graphene.Int(required=True)

    success = graphene.Boolean()
    error = graphene.String()
    task_name = graphene.String()

    def mutate(self, info, project=None, user=None, due_date=None, task_name=None, priority=None):
        current_user = info.context.user
    
        if not current_user:
            return CreateTask(error="User not authenticated", success=False)

        if not project or not user or not due_date or not task_name or not priority:        
            return CreateTask(error="Please fill in all fields", success=False)
        
        # if Task.objects.filter(task_name=task_name).exists():
        #     return CreateTask(error="Task already exists", success=False)
        # if Task.objects.due_date(due_date)<=timezone.now():
        #     return CreateTask(error="Due date must be in the future", success=False)
        task = Task.objects.create(
            project_id=project,
            due_date=due_date,
            task_name=task_name,
            user_id=user,  
            priority=priority,
            created_by=current_user
        )
        task.save()

        return CreateTask(success=True, task_name=task.task_name) 
class UpdateTask(graphene.Mutation):
    class Arguments:
        task_id = graphene.Int(required=True)
        project = graphene.Int(required=False)
        user = graphene.Int(required=False)
        due_date = graphene.Date(required=False)
        task_name = graphene.String(required=False)
        priority = graphene.Int(required=False)
        status = graphene.String(required=False)

    success = graphene.Boolean()
    error = graphene.String()

    def mutate(self, info, task_id, project=None, user=None, due_date=None,status=None, task_name=None, priority=None):
        current_user = info.context.user

     
        try:
            task = Task.objects.get(id=task_id)
        except Task.DoesNotExist:
            return UpdateTask(error="Task not found", success=False)

        if project:
            task.project_id = project
        else:
            task.project_id = task.project_id
        if user:
            task.user_id = user
        else:
            task.user_id = task.user_id
        if due_date:
            task.due_date = due_date
        if task_name:
            if Task.objects.filter(task_name=task_name).exclude(id=task_id).exists():
                return UpdateTask(error="Another task with the same name already exists", success=False)
            task.task_name = task_name
        else:
            task.task_name = task.task_name
            # if Task.objects.due_date(due_date)<=timezone.now():
            #     return UpdateTask(error="Due date must be in the future", success=False)
        if priority:
            task.priority = priority
        else:
            task.priority = task.priority
        if status:
            task.status = status
        else:
            task.status = 'todo'
        task.save()

        return UpdateTask(success=True)
class DeleteTask(graphene.Mutation):
    class Arguments:
        task_id = graphene.Int(required=True)

    success = graphene.Boolean()
    error = graphene.String()
    task_name = graphene.String()

    def mutate(self, info, task_id):
        current_user = info.context.user
        task_name = Task.objects.get(id=task_id).task_name
        try:
            task = Task.objects.get(id=task_id)
        except Task.DoesNotExist:
            return DeleteTask(error="Task not found", success=False)

        task.delete()

        return DeleteTask(success=True) 

class CreateComment(graphene.Mutation):
    class Arguments:
        task = graphene.Int(required=True)
        from_user = graphene.Int(required=True)
        to_user = graphene.Int(required=True)
        comment = graphene.String(required=True)

    success = graphene.Boolean()
    error = graphene.String()

    def mutate(self, info, task=None, from_user=None, to_user=None, comment=None):
        current_user = info.context.user

        if not current_user:
            return CreateComment(error="User not authenticated", success=False)


        comment = Comment.objects.create(
            task_id=task,
            from_user_id=from_user,
            to_user_id=to_user,
            comment=comment
        )

        comment.save()

        return CreateComment(success=True)

class UpdateComment(graphene.Mutation):
    class Arguments:    
        comment_id = graphene.Int(required=True)
        from_user = graphene.Int(required=False)
        to_user = graphene.Int(required=False)
        comment = graphene.String(required=False)

    success = graphene.Boolean()
    error = graphene.String()

    def mutate(self, info, comment_id, from_user=None, to_user=None, comment=None):
        current_user = info.context.user

        try:
            comment = Comment.objects.get(id=comment_id)
        except Comment.DoesNotExist:
            return UpdateComment(error="Comment not found", success=False)

        if from_user:
            comment.from_user_id = from_user
        if to_user:
            comment.to_user_id = to_user
        if comment:
            comment.comment = comment

        comment.save()

        return UpdateComment(success=True)
class DeleteComment(graphene.Mutation):
    class Arguments:
        comment_id = graphene.Int(required=True)

    success = graphene.Boolean()
    error = graphene.String()

    def mutate(self, info, comment_id):
        current_user = info.context.user

        try:
            comment = Comment.objects.get(id=comment_id)
        except Comment.DoesNotExist:
            return DeleteComment(error="Comment not found", success=False)
        if current_user != comment.from_user:
            return DeleteComment(error="You can only delete your own comments", success=False)
            
        comment.delete()

        return DeleteComment(success=True)