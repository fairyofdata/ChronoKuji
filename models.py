import uuid
from datetime import datetime, timezone
from typing import Optional, Any
from sqlalchemy import String, Integer, DateTime, ForeignKey, Text, JSON, Uuid
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship

class Base(DeclarativeBase):
    pass

class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    
    # 토큰 시스템 (20시간 쿨타임)
    llm_tokens: Mapped[int] = mapped_column(Integer, default=1)
    last_token_refill_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # 이동 시스템 (상태 관리)
    current_spot_id: Mapped[Optional[int]] = mapped_column(ForeignKey("spots.id"), nullable=True)
    target_spot_id: Mapped[Optional[int]] = mapped_column(ForeignKey("spots.id"), nullable=True)
    arrival_time: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

class Spot(Base):
    """세계관/지역 마스터 데이터 (사이버펑크, 고담 등)"""
    __tablename__ = "spots"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100), unique=True)
    
    # 확장성을 위한 JSON (SQLite 테스트 호환 및 추후 PostgreSQL 완벽 지원)
    theme_metadata: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)

class OmikujiMaster(Base):
    """오미쿠지 마스터 데이터 (비용 최적화 캐싱용)"""
    __tablename__ = "omikuji_masters"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    spot_id: Mapped[int] = mapped_column(ForeignKey("spots.id"))
    luck_level: Mapped[str] = mapped_column(String(50)) # 대길, 길, 흉 등
    original_text: Mapped[str] = mapped_column(Text)
    
    # 특정 오미쿠지에 종속된 추가 데이터 (이미지 URL 등)
    meta_info: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)

class OmikujiHistory(Base):
    """유저의 오미쿠지 뽑기 및 LLM 해석 기록"""
    __tablename__ = "omikuji_histories"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"))
    omikuji_id: Mapped[int] = mapped_column(ForeignKey("omikuji_masters.id"))
    drawn_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    
    # LLM 심층 해석 데이터
    user_context: Mapped[Optional[str]] = mapped_column(Text, nullable=True) # 유저의 고민 입력
    llm_interpretation: Mapped[Optional[dict[str, Any]]] = mapped_column(JSON, nullable=True) # 구조화된 LLM 결과 저장