import graphene
from graphene_django import DjangoObjectType
from graphene import ObjectType, Int, Field,List
from .models import User, Project, Task, Comment
from .mutation import *
from graphql_auth.schema import UserQuery, MeQuery,UserNode
from graphql_auth import mutations

class UserType(DjangoObjectType):
    class Meta:
        model = User
    

class ProjectType(DjangoObjectType):
    class Meta:
        model = Project

class TaskType(DjangoObjectType):
    class Meta:
        model = Task
        convert_choices_to_enum = False

class CommentType(DjangoObjectType):
    class Meta:
        model = Comment

class TaskStats(ObjectType):
    completed = Int()
    incompleted = Int()
    topImportantTasks = List(TaskType)
class MyUserNode(UserNode):
    class Meta:
        model = User
        intterfaces = (graphene.relay.Node, )
        skip_registry = True
        convert_choices_to_enum = False
   

# Queries
class Query(UserQuery, MeQuery,graphene.ObjectType):
    users = graphene.List(UserType,id=graphene.Int())
    projects = graphene.List(ProjectType)
    tasks = graphene.List(TaskType,created=graphene.Boolean())
    comments = graphene.List(CommentType, task_id=graphene.Int(), id=graphene.Int())
    stats = Field(TaskStats)
    me = graphene.Field(MyUserNode)

    
    def resolve_stats(self, info, completed=None, important=None):
        user_id = info.context.user.id
        completed_task_count = Task.objects.filter(status="done",user=user_id).count()
        incompleted_task_count = Task.objects.filter(status="todo",user=user_id).count()
        top_important_tasks = Task.objects.filter(user=user_id).order_by('-priority')
        stats = {}
        stats = {
            'completed': completed_task_count,
            'incompleted': incompleted_task_count,
            'topImportantTasks': top_important_tasks
        }
        return TaskStats(**stats)

    def resolve_users(self, info,id=None):
        if id:
            return User.objects.filter(id=id)
        return User.objects.all()

    def resolve_projects(self, info):
        return Project.objects.all()

    def resolve_tasks(self, info, created=None):
        user = info.context.user
        assigned_to_me = Task.objects.filter(user__id=user.id)
        created_by_me = Task.objects.filter(created_by__id=user.id)
        if user.is_anonymous:
            return Task.objects.none()
        if created:
            return created_by_me
        return assigned_to_me
        
    def resolve_comments(self, info, task_id=None, id=None):
        if task_id:
            return Comment.objects.filter(task__id=task_id)

        if id:
            return Comment.objects.filter(id=id)
        return Comment.objects.all()


class Mutation(graphene.ObjectType):
    create_user = CreateUser.Field()
    update_user = UpdateUser.Field()
    delete_user = DeleteUser.Field()

    create_project = CreateProject.Field()
    update_project = UpdateProject.Field()
    delete_project = DeleteProject.Field()

    create_task= CreateTask.Field()
    update_task = UpdateTask.Field()
    delete_task = DeleteTask.Field()

    create_comment = CreateComment.Field()
    update_comment = UpdateComment.Field()
    delete_comment = DeleteComment.Field()


    token_auth = mutations.ObtainJSONWebToken.Field()
    verify_token = mutations.VerifyToken.Field()
    refresh_token = mutations.RefreshToken.Field()
   

schema = graphene.Schema(query=Query, mutation=Mutation)
