class Config:
    MYSQL_HOST = 'mysql-write'
    MYSQL_PORT = 3306
    MYSQL_USER = 'administrator'
    MYSQL_PASSWORD = 'password420'
    MYSQL_DATABASE = 'ballcom'

    SQLALCHEMY_DATABASE_URI = f"mysql+pymysql://{MYSQL_USER}:{MYSQL_PASSWORD}@{MYSQL_HOST}/{MYSQL_DATABASE}"
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    RABBITMQ_HOST = 'rabbitmq-queue'
    RABBITMQ_VHOST = '/'
    RABBITMQ_PORT = 5672
    RABBITMQ_QUEUE = 'Invoice'
    RABBITMQ_USER = 'guest'
    RABBITMQ_PASSWORD = 'guest'
