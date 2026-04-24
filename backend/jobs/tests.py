from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient

from .models import JobApplication

User = get_user_model()

BASE_JOB = {
    'company_name': 'Acme',
    'job_title': 'Software Engineer',
    'location': 'Remote',
    'status': 'New',
    'date_applied': '2026-01-01',
}


class JobApplicationAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='alice@example.com',
            email='alice@example.com',
            password='password123',
            first_name='Alice',
        )
        self.token = Token.objects.create(user=self.user)

    def _auth(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token.key}')

    # ── Happy paths ──────────────────────────────────────────────────────────

    def test_list_jobs(self):
        self._auth()
        response = self.client.get('/api/jobs/')
        self.assertEqual(response.status_code, 200)

    def test_create_job(self):
        self._auth()
        response = self.client.post('/api/jobs/', BASE_JOB)
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['company_name'], 'Acme')

    def test_stats_shape_matches_frontend_contract(self):
        self._auth()
        self.client.post('/api/jobs/', BASE_JOB)
        response = self.client.get('/api/jobs/stats/')
        self.assertEqual(response.status_code, 200)
        for key in ('new', 'applied', 'follow_up', 'interview', 'offer', 'rejected', 'total'):
            self.assertIn(key, response.data)

    def test_update_status(self):
        self._auth()
        create = self.client.post('/api/jobs/', BASE_JOB)
        job_id = create.data['id']
        response = self.client.patch(
            f'/api/jobs/{job_id}/update-status/',
            {'status': 'Applied'},
            format='json',
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['status'], 'Applied')

    # ── Validation ───────────────────────────────────────────────────────────

    def test_invalid_url_rejected(self):
        self._auth()
        payload = {**BASE_JOB, 'job_url': 'javascript:alert(1)'}
        response = self.client.post('/api/jobs/', payload)
        self.assertEqual(response.status_code, 400)
        self.assertIn('job_url', response.data)

    def test_invalid_status_on_create_rejected(self):
        self._auth()
        payload = {**BASE_JOB, 'status': 'Vibes'}
        response = self.client.post('/api/jobs/', payload)
        self.assertEqual(response.status_code, 400)
        self.assertIn('status', response.data)

    def test_invalid_status_on_update_rejected(self):
        self._auth()
        create = self.client.post('/api/jobs/', BASE_JOB)
        job_id = create.data['id']
        response = self.client.patch(
            f'/api/jobs/{job_id}/update-status/',
            {'status': 'Vibes'},
            format='json',
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn('status', response.data)

    def test_negative_salary_rejected(self):
        self._auth()
        payload = {**BASE_JOB, 'salary': '-1'}
        response = self.client.post('/api/jobs/', payload)
        self.assertEqual(response.status_code, 400)
        self.assertIn('salary', response.data)

    def test_healthz(self):
        response = self.client.get('/healthz/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {'status': 'ok'})

    # ── Anonymous access returns 401 ─────────────────────────────────────────

    def test_anon_cannot_list_jobs(self):
        response = self.client.get('/api/jobs/')
        self.assertEqual(response.status_code, 401)

    def test_anon_cannot_create_job(self):
        response = self.client.post('/api/jobs/', BASE_JOB)
        self.assertEqual(response.status_code, 401)

    def test_anon_cannot_access_stats(self):
        response = self.client.get('/api/jobs/stats/')
        self.assertEqual(response.status_code, 401)

    # ── Data isolation ───────────────────────────────────────────────────────

    def test_user_sees_only_own_jobs(self):
        self._auth()
        self.client.post('/api/jobs/', BASE_JOB)

        bob = User.objects.create_user(
            username='bob@example.com',
            email='bob@example.com',
            password='password123',
        )
        bob_token = Token.objects.create(user=bob)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {bob_token.key}')
        self.client.post('/api/jobs/', {**BASE_JOB, 'company_name': 'Bob Corp'})

        self._auth()
        response = self.client.get('/api/jobs/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['company_name'], 'Acme')

    # ── Auth endpoints ────────────────────────────────────────────────────────

    def test_register_creates_user_and_returns_token(self):
        response = self.client.post(
            '/api/auth/register/',
            {'email': 'bob@example.com', 'password': 'securepass1', 'first_name': 'Bob'},
            format='json',
        )
        self.assertEqual(response.status_code, 201)
        self.assertIn('token', response.data)

    def test_register_duplicate_email_rejected(self):
        self.client.post(
            '/api/auth/register/',
            {'email': 'bob@example.com', 'password': 'securepass1', 'first_name': 'Bob'},
            format='json',
        )
        response = self.client.post(
            '/api/auth/register/',
            {'email': 'bob@example.com', 'password': 'securepass1', 'first_name': 'Bob'},
            format='json',
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn('email', response.data)

    def test_register_invalid_email_rejected(self):
        response = self.client.post(
            '/api/auth/register/',
            {'email': 'not-an-email', 'password': 'securepass1', 'first_name': 'Bob'},
            format='json',
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn('email', response.data)

    def test_register_missing_first_name_rejected(self):
        response = self.client.post(
            '/api/auth/register/',
            {'email': 'bob@example.com', 'password': 'securepass1', 'first_name': ''},
            format='json',
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn('first_name', response.data)

    def test_register_short_password_rejected(self):
        response = self.client.post(
            '/api/auth/register/',
            {'email': 'bob@example.com', 'password': 'short', 'first_name': 'Bob'},
            format='json',
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn('password', response.data)

    def test_login_returns_token(self):
        response = self.client.post(
            '/api/auth/login/',
            {'email': 'alice@example.com', 'password': 'password123'},
            format='json',
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn('token', response.data)

    def test_login_wrong_password_rejected(self):
        response = self.client.post(
            '/api/auth/login/',
            {'email': 'alice@example.com', 'password': 'wrongpassword'},
            format='json',
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn('non_field_errors', response.data)
