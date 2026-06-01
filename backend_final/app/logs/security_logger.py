from app.logs.logger import setup_logger


security_logger = setup_logger(
    logger_name="SECURITY",
    log_file="security.log"
)