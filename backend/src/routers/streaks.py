from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from datetime import datetime, timezone, date, timedelta
from typing import Dict

from src.database import get_db
from src.models import StreakLog, User
from src.security import get_current_user

router = APIRouter(prefix="/api/streaks", tags=["Streaks"])

@router.get("", status_code=status.HTTP_200_OK)
async def get_streak_info(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get the current user's reading streak count and monthly log details.
    """
    stmt = select(StreakLog).where(StreakLog.user_id == current_user.id)
    result = await db.execute(stmt)
    logs = result.scalars().all()
    
    logs_map: Dict[str, bool] = {}
    for log in logs:
        # Convert created_at to local date string YYYY-MM-DD
        date_str = log.created_at.date().isoformat()
        logs_map[date_str] = log.have_read
        
    # Calculate streak count
    today = date.today()
    current_streak = 0
    check_date = today
    
    # Check if read today
    today_key = today.isoformat()
    read_today = logs_map.get(today_key, False)
    
    # If not read today, check if yesterday was read to keep streak alive
    if not read_today:
        check_date = today - timedelta(days=1)
        
    while True:
        key = check_date.isoformat()
        if logs_map.get(key, False):
            current_streak += 1
            check_date -= timedelta(days=1)
        else:
            break
            
    return {
        "streak": current_streak,
        "logs": logs_map
    }

@router.post("/sync", status_code=status.HTTP_200_OK)
async def sync_streaks(
    payload: Dict[str, bool],
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Sync streak logs from the client's local storage.
    """
    for date_str, have_read in payload.items():
        try:
            log_date = date.fromisoformat(date_str)
            # Create datetime at start of that day in UTC
            dt = datetime(log_date.year, log_date.month, log_date.day, tzinfo=timezone.utc)
            
            # Check if log already exists for this date
            # We filter by the date portion of created_at
            stmt = select(StreakLog).where(
                and_(
                    StreakLog.user_id == current_user.id,
                    # Cast created_at to date and compare
                    # In Postgres we can do func.date(created_at) == log_date
                    # Or just compare range
                    StreakLog.created_at >= dt,
                    StreakLog.created_at < dt + timedelta(days=1)
                )
            )
            result = await db.execute(stmt)
            existing_log = result.scalars().first()
            
            if not existing_log:
                log = StreakLog(
                    user_id=current_user.id,
                    created_at=dt,
                    have_read=have_read
                )
                db.add(log)
            else:
                existing_log.have_read = have_read
        except ValueError:
            continue
            
    await db.commit()
    return {"message": "Streaks synced successfully."}
