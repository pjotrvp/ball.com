class Config:
    MYSQL_HOST = 'mysql-write'
    MYSQL_PORT = 3306
    MYSQL_USER = 'administrator'
    MYSQL_PASSWORD = 'password420'
    MYSQL_DATABASE = 'ballcom'

    SQLALCHEMY_DATABASE_URI = f"mysql+pymysql://{MYSQL_USER}:{MYSQL_PASSWORD}@{MYSQL_HOST}/{MYSQL_DATABASE}"
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    MYSQL_HOST_READ = 'mysql-read'
    MYSQL_PORT_READ = 3306
    MYSQL_USER_READ = 'administrator'
    MYSQL_PASSWORD_READ = 'password420'
    MYSQL_DATABASE_READ = 'ballcom'

    SQLALCHEMY_DATABASE_URI_READ = f"mysql+pymysql://{MYSQL_USER_READ}:{MYSQL_PASSWORD_READ}@{MYSQL_HOST_READ}/{MYSQL_DATABASE_READ}"
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    SQLALCHEMY_BINDS = { 
        'write' : SQLALCHEMY_DATABASE_URI,
        'read' : SQLALCHEMY_DATABASE_URI_READ 
        }


    RABBITMQ_HOST = 'rabbitmq-queue'
    RABBITMQ_VHOST = '/'
    RABBITMQ_PORT = 5672
    RABBITMQ_QUEUE = 'Invoice'
    RABBITMQ_QUEUE_ORDER = 'order_queue'
    RABBITMQ_USER = 'guest'
    RABBITMQ_PASSWORD = 'guest'


    EVENTSTOREDB_CONNECTIONSTRING = 'esdb://eventstoredb?tls=false'