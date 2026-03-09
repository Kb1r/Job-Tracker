from django.urls import path
from . import views

urlpatterns = [
    path('jobs/',      views.JobApplicationListCreateView.as_view(), name='job-list-create'),
    path('jobs/<int:pk>/', views.JobApplicationDetailView.as_view(),  name='job-detail'),
    path('stats/',     views.stats_view,                              name='stats'),
]