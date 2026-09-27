import mysql.connector
from dotenv import load_dotenv
import os

load_dotenv()

def get_database_connection():
    connection = mysql.connector.connect(
        host=os.getenv("DB_HOST"),
        port=os.getenv("DB_PORT"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME"),
        ssl_ca=os.getenv("DB_SSL_CA"),
        ssl_verify_cert=True,
        ssl_verify_identity=True
    )

    return connection