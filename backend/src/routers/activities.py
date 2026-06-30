from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, delete, and_
from sqlalchemy.orm import selectinload
from datetime import datetime, timezone
from typing import List, Optional
from pydantic import BaseModel

from src.database import get_db
from src.models import Review, ReviewStatus, User, Book, Like, Comment, EntityType
from src.security import get_current_user

router = APIRouter(prefix="/api/activities", tags=["Activities"])

class CommentRequest(BaseModel):
    body: str

class ActivitySync(BaseModel):
    id: str
    bookTitle: str
    comment: str
    timestamp: float

@router.get("", status_code=status.HTTP_200_OK)
async def get_activities(
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """
    Get the social timeline. Merges book reviews and custom user updates.
    """
    # Fetch all public reviews
    stmt = (
        select(Review)
        .where(Review.status == ReviewStatus.PUBLIC)
        .options(selectinload(Review.user), selectinload(Review.book))
        .order_by(Review.created_at.desc())
    )
    result = await db.execute(stmt)
    reviews = result.scalars().all()
    
    activities = []
    for r in reviews:
        # Count likes
        stmt_likes = select(func.count(Like.id)).where(
            and_(Like.entity == EntityType.REVIEW, Like.entity_id == r.id)
        )
        res_likes = await db.execute(stmt_likes)
        likes_count = res_likes.scalar() or 0
        
        # Count comments
        stmt_comments = select(func.count(Comment.id)).where(
            and_(Comment.entity == EntityType.REVIEW, Comment.entity_id == r.id)
        )
        res_comments = await db.execute(stmt_comments)
        comments_count = res_comments.scalar() or 0
        
        # Check if liked by current user
        liked_by_me = False
        saved_by_me = False
        if current_user:
            stmt_my_like = select(Like).where(
                and_(
                    Like.user_id == current_user.id,
                    Like.entity == EntityType.REVIEW,
                    Like.entity_id == r.id
                )
            )
            res_my_like = await db.execute(stmt_my_like)
            liked_by_me = res_my_like.scalars().first() is not None
            
            # We use EntityType.BOOK to represent saved/bookmarked reviews
            stmt_my_save = select(Like).where(
                and_(
                    Like.user_id == current_user.id,
                    Like.entity == EntityType.BOOK,
                    Like.entity_id == r.id
                )
            )
            res_my_save = await db.execute(stmt_my_save)
            saved_by_me = res_my_save.scalars().first() is not None
            
        # Calculate time ago
        time_diff = datetime.now(timezone.utc) - r.created_at
        if time_diff.days > 0:
            time_ago = f"{time_diff.days} days ago" if time_diff.days > 1 else "1 day ago"
        elif time_diff.seconds // 3600 > 0:
            hours = time_diff.seconds // 3600
            time_ago = f"{hours} hours ago" if hours > 1 else "1 hour ago"
        elif time_diff.seconds // 60 > 0:
            mins = time_diff.seconds // 60
            time_ago = f"{mins} minutes ago" if mins > 1 else "1 minute ago"
        else:
            time_ago = "Just now"

        activities.append({
            "id": f"act-rev-{r.id}",
            "user": {
                "name": r.user.username,
                "avatar": r.user.avatar_url or "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120",
                "isCurrentUser": current_user and r.user_id == current_user.id
            },
            "timeAgo": time_ago,
            "timestamp": int(r.created_at.timestamp() * 1000),
            "bookTitle": r.book.title,
            "bookCover": r.book.thumbnail_url or "",
            "comment": r.body,
            "likes": likes_count,
            "commentsCount": comments_count,
            "saved": saved_by_me,
            "liked": liked_by_me
        })
        
    return activities

@router.post("/sync", status_code=status.HTTP_200_OK)
async def sync_activities(
    payload: List[ActivitySync],
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Synchronize custom posts written by the user.
    """
    for act in payload:
        # Find book by title
        stmt_book = select(Book).where(Book.title == act.bookTitle)
        res_book = await db.execute(stmt_book)
        book = res_book.scalars().first()
        
        if not book:
            # Create a placeholder book if it doesn't exist
            book = Book(
                title=act.bookTitle,
                description="Custom book entry created via social update.",
                total_pages=0
            )
            db.add(book)
            await db.flush()

        # Check if review already exists for this exact comment and timestamp
        dt = datetime.fromtimestamp(act.timestamp / 1000, tz=timezone.utc)
        stmt_rev = select(Review).where(
            and_(
                Review.user_id == current_user.id,
                Review.book_id == book.id,
                Review.body == act.comment
            )
        )
        res_rev = await db.execute(stmt_rev)
        existing_rev = res_rev.scalars().first()
        
        if not existing_rev:
            review = Review(
                title="Reading Update",
                body=act.comment,
                user_id=current_user.id,
                book_id=book.id,
                status=ReviewStatus.PUBLIC,
                created_at=dt,
                modified_at=dt
            )
            db.add(review)
            
    await db.commit()
    return {"message": "Activities synced successfully."}

@router.post("/{activity_id}/like", status_code=status.HTTP_200_OK)
async def toggle_like(
    activity_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Like or unlike a social timeline activity.
    """
    if not activity_id.startswith("act-rev-"):
        raise HTTPException(status_code=400, detail="Invalid activity ID.")
        
    review_id = int(activity_id.replace("act-rev-", ""))
    
    # Check if like already exists
    stmt = select(Like).where(
        and_(
            Like.user_id == current_user.id,
            Like.entity == EntityType.REVIEW,
            Like.entity_id == review_id
        )
    )
    result = await db.execute(stmt)
    like = result.scalars().first()
    
    if like:
        await db.delete(like)
        await db.commit()
        return {"liked": False, "message": "Activity unliked."}
    else:
        new_like = Like(
            user_id=current_user.id,
            entity=EntityType.REVIEW,
            entity_id=review_id
        )
        db.add(new_like)
        await db.commit()
        return {"liked": True, "message": "Activity liked."}

@router.post("/{activity_id}/save", status_code=status.HTTP_200_OK)
async def toggle_save(
    activity_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Save/bookmark or unsave a social timeline activity.
    """
    if not activity_id.startswith("act-rev-"):
        raise HTTPException(status_code=400, detail="Invalid activity ID.")
        
    review_id = int(activity_id.replace("act-rev-", ""))
    
    # Check if save already exists (using EntityType.BOOK to represent saves)
    stmt = select(Like).where(
        and_(
            Like.user_id == current_user.id,
            Like.entity == EntityType.BOOK,
            Like.entity_id == review_id
        )
    )
    result = await db.execute(stmt)
    save = result.scalars().first()
    
    if save:
        await db.delete(save)
        await db.commit()
        return {"saved": False, "message": "Activity unsaved."}
    else:
        new_save = Like(
            user_id=current_user.id,
            entity=EntityType.BOOK,
            entity_id=review_id
        )
        db.add(new_save)
        await db.commit()
        return {"saved": True, "message": "Activity saved."}

@router.post("/{activity_id}/comment", status_code=status.HTTP_201_CREATED)
async def add_comment(
    activity_id: str,
    payload: CommentRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Add a supportive comment to a social activity.
    """
    if not activity_id.startswith("act-rev-"):
        raise HTTPException(status_code=400, detail="Invalid activity ID.")
        
    review_id = int(activity_id.replace("act-rev-", ""))
    
    comment = Comment(
        user_id=current_user.id,
        entity=EntityType.REVIEW,
        entity_id=review_id,
        body=payload.body
    )
    db.add(comment)
    await db.commit()
    
    return {"message": "Comment added successfully."}
