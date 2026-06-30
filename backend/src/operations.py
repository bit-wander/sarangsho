from sqlalchemy.exc import IntegrityError
from sqlalchemy import select, update, delete
from sqlalchemy.ext.asyncio import AsyncSession
from src.models.user import User
from src.security import create_hash, verify_password


async def create_user(
    db_session: AsyncSession, 
    username: str,
    email: str, 
    password: str, 
    age: int | None = None, 
    bio: str | None = None,
    full_name: str | None = None,
    avatar_url: str | None = None
):
    hashed_password = create_hash(password)
    new_user = User(
        username=username, 
        email=email,
        hashed_password=hashed_password,
        age=age,
        bio=bio,
        full_name=full_name or username,
        avatar_url=avatar_url
    )
    db_session.add(new_user)
    try:
        await db_session.commit()
        await db_session.refresh(new_user)
        return new_user.id
    except IntegrityError:
        await db_session.rollback()
        return None

async def get_users(
    db_session: AsyncSession
):
    query = select(User)
    result = await db_session.execute(query)
    users = result.scalars().all()
    return users

async def get_user(
    db_session: AsyncSession, 
    user_id: int
):
    query = select(User).where(User.id == user_id)
    result = await db_session.execute(query)
    user = result.scalars().first()
    return user

async def update_password(
    db_session: AsyncSession, 
    user_id: int, 
    old_password: str,
    new_password: str
) -> bool:
    user = await get_user(db_session, user_id)
    if not user or not verify_password(old_password, user.hashed_password):
        return False

    query = (
        update(User)
        .where(User.id == user_id)
        .values(hashed_password=create_hash(new_password)) 
    )
    try:
        user_password_updated = await db_session.execute(query) 
        await db_session.commit()
        if user_password_updated.rowcount == 0:
            return False 
        return True
    except Exception:
        await db_session.rollback()
        return False

async def delete_user(
    db_session: AsyncSession, 
    user_id: int
) -> bool:
    query = delete(User).where(User.id == user_id)
    try:
        result = await db_session.execute(query)
        await db_session.commit()
        if result.rowcount == 0:
            return False
        return True
    except Exception:
        await db_session.rollback()
        return False
