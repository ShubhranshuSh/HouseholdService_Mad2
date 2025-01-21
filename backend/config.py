class Config():
    DEBUG = False
    SQL_ALCHEMY_TRACK_MODIFICATIONS = False


class LocalDevelopmentConfig(Config):
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///database.db'
    SECURITY_PASSWORD_HASH = 'bcrypt'
    SECURITY_PASSWORD_SALT = 'thisisveryslaty'
    SECRET_KEY = "keyinkingpocket"
    WTF_CSRF_ENABLED = False
