from .settings import *  # noqa: F401, F403

DEBUG = True
SECURE_SSL_REDIRECT = False

# Use a dummy cache so throttle state doesn't bleed between tests.
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.dummy.DummyCache',
    }
}
