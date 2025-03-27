class Config():
    DEBUG = False
    SQL_ALCHEMY_TRACK_MODIFICATIONS = False


class LocalDevelopmentConfig(Config):
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///database.db'
    SECURITY_PASSWORD_HASH = 'bcrypt'
    SECURITY_PASSWORD_SALT = 'thisisveryslaty'
    SECRET_KEY = "keyinkingpocket"
    SECURITY_TOKEN_AUTHENTICATION_HEADER = 'Authentication-Token'
    WTF_CSRF_ENABLED = False


    #Cache configuration
    CACHE_TYPE = "RedisCache"
    CACHE_REDIS_HOST = "localhost"
    CACHE_REDIS_PORT = 6379
    CACHE_REDIS_DB = 3