"""add pgvector extension and challenge embeddings vector column

Revision ID: 001_add_pgvector
Revises: 
Create Date: 2026-09-13

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '001_add_pgvector'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # 1. Create pgvector extension in PostgreSQL
    op.execute("CREATE EXTENSION IF NOT EXISTS vector;")

    # 2. Add VECTOR(384) column to challenge_embeddings table
    bind = op.get_bind()
    if bind.engine.name == 'postgresql':
        from pgvector.sqlalchemy import Vector
        op.add_column('challenge_embeddings', sa.Column('embedding', Vector(384), nullable=True))
        # Create HNSW index for fast nearest neighbor search
        op.execute("CREATE INDEX IF NOT EXISTS idx_challenge_embeddings_hnsw ON challenge_embeddings USING hnsw (embedding vector_cosine_ops);")


def downgrade():
    bind = op.get_bind()
    if bind.engine.name == 'postgresql':
        op.execute("DROP INDEX IF EXISTS idx_challenge_embeddings_hnsw;")
        op.drop_column('challenge_embeddings', 'embedding')
