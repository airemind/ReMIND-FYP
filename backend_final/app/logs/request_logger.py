from app.logs.logger import setup_logger


request_logger = setup_logger(
    logger_name="REQUEST",
    log_file="app.log"
)