import contextlib
from typing import Generator
from .audit_logger import AuditLogger

class DiagnosticTransactionManager:
    """
    ATOMIC CONSISTENCY: Manages diagnostic operations as transactions.
    Ensures that any failure triggers a Gap Log in the Audit Trail.
    """
    def __init__(self, audit_logger: AuditLogger):
        self.audit_logger = audit_logger

    @contextlib.contextmanager
    def start(self, session_id: str) -> Generator[None, None, None]:
        """
        Starts a transaction block. If an exception occurs, logs a rollback gap.
        """
        try:
            self.audit_logger.log_event(session_id, "TRANSACTION_START", {"status": "ACTIVE"})
            yield
            self.audit_logger.log_event(session_id, "TRANSACTION_COMMIT", {"status": "SUCCESS"})
        except Exception as e:
            print(f"[TransactionManager] CRITICAL FAILURE: {str(e)}")
            self.audit_logger.log_rollback(session_id, str(e))
            # Re-raise to ensure the orchestrator knows it failed
            raise e
