import logging

from app.logs.logger import setup_logger


error_logger = setup_logger(
    logger_name="ERROR",
    log_file="error.log",
    level=logging.ERROR
)