from celery import Celery
from backend.engine.vision import parse_chart_image

celery_app = Celery("janma_chino", broker="redis://redis:6379/0", backend="redis://redis:6379/1")

@celery_app.task
def parse_chart_image_task(path: str) -> dict:
    return parse_chart_image(path)

