"""Alembic environment. The URL comes from the environment, not source control."""

from logging.config import fileConfig

from alembic import context
from daybreak_api.database import get_engine

config = context.config
if config.config_file_name:
    fileConfig(config.config_file_name)


def run_migrations_online() -> None:
    with get_engine().connect() as connection:
        context.configure(connection=connection, target_metadata=None)
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    raise RuntimeError("Offline migrations are not configured")
run_migrations_online()
