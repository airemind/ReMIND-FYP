import json
import logging
import redis
from app.config.settings import settings

logger = logging.getLogger("redis_cache")

redis_client = None
if settings.REDIS_URL:
    try:
        redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)
    except Exception as e:
        logger.warning(f"Could not initialize Redis client: {e}")
        redis_client = None


def set_cache(key: str, value, expiration: int = 3600):
    if not redis_client:
        return
    try:
        redis_client.set(key, json.dumps(value), ex=expiration)
    except Exception as e:
        logger.warning(f"Redis set_cache failed: {e}")


def get_cache(key: str):
    if not redis_client:
        return None
    try:
        value = redis_client.get(key)
        if value:
            return json.loads(value)
    except Exception as e:
        logger.warning(f"Redis get_cache failed: {e}")
    return None


def delete_cache(key: str):
    if not redis_client:
        return
    try:
        redis_client.delete(key)
    except Exception as e:
        logger.warning(f"Redis delete_cache failed: {e}")


def cache_exists(key: str):
    if not redis_client:
        return False
    try:
        return bool(redis_client.exists(key))
    except Exception as e:
        logger.warning(f"Redis cache_exists failed: {e}")
        return False
