import asyncio
import sys
from pathlib import Path

# Add backend and src directories to sys.path
backend_dir = Path(__file__).resolve().parent
sys.path.insert(0, str(backend_dir))
sys.path.insert(0, str(backend_dir / "src"))

from src.database import AsyncSessionLocal
from src.models import User, UserRole
from src.security import create_hash
from sqlalchemy import select

async def create_admin_user():
    async with AsyncSessionLocal() as session:
        # Check if the admin user already exists
        stmt = select(User).where(User.email == "admin@example.com")
        res = await session.execute(stmt)
        admin = res.scalars().first()
        
        if not admin:
            # Create a new admin user
            hashed_pw = create_hash("password123")
            admin = User(
                username="admin",
                email="admin@example.com",
                hashed_password=hashed_pw,
                full_name="Admin Librarian",
                role=UserRole.ADMIN,
                bio="System administrator and chief librarian.",
                avatar_url="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120"
            )
            session.add(admin)
            await session.commit()
            print("Admin user 'admin@example.com' created successfully!")
        else:
            # Ensure the existing user has the ADMIN role
            admin.role = UserRole.ADMIN
            await session.commit()
            print("Admin user 'admin@example.com' already exists. Verified administrative privileges.")

if __name__ == "__main__":
    asyncio.run(create_admin_user())
