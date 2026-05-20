from sqlalchemy import DateTime, ForeignKey, Integer, JSON, String, func
from sqlalchemy.orm import Mapped, mapped_column
from backend.models.user import Base

class Chart(Base):
    __tablename__ = "charts"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    label: Mapped[str] = mapped_column(String(120))
    raw_telemetry: Mapped[dict] = mapped_column(JSON)
    image_url: Mapped[str | None] = mapped_column(String(500))
    ai_narrative: Mapped[dict | None] = mapped_column(JSON)
    created_at: Mapped[str] = mapped_column(DateTime(timezone=True), server_default=func.now())

