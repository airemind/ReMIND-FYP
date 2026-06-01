import os
import logging

from logging.handlers import RotatingFileHandler


BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.dirname(__file__)
    )
)

LOG_DIR = os.path.join(
    BASE_DIR,
    "logs"
)

os.makedirs(
    LOG_DIR,
    exist_ok=True
)


def setup_logger(
    logger_name: str,
    log_file: str,
    level=logging.INFO
):

    logger = logging.getLogger(
        logger_name
    )

    logger.setLevel(level)

    if logger.handlers:
        return logger

    log_path = os.path.join(
        LOG_DIR,
        log_file
    )

    formatter = logging.Formatter(
        "%(asctime)s | %(levelname)s | %(name)s | %(message)s"
    )

    # FILE HANDLER
    file_handler = RotatingFileHandler(
        log_path,
        maxBytes=5 * 1024 * 1024,
        backupCount=5
    )

    file_handler.setFormatter(
        formatter
    )

    # CONSOLE HANDLER
    console_handler = logging.StreamHandler()

    console_handler.setFormatter(
        formatter
    )

    logger.addHandler(
        file_handler
    )

    logger.addHandler(
        console_handler
    )

    return logger