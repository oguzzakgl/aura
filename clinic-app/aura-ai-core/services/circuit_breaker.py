import time
from typing import Callable, Any

class AICircuitBreaker:
    """
    P2-2: AI Model Failover & Circuit Breaker Pattern.
    Gemini API kesintilerinde sistemi ayakta tutmak için fallback mekanizmasına geçer.
    Durumlar: CLOSED (Normal), OPEN (Hata), HALF_OPEN (İyileşme denemesi)
    """
    def __init__(self, failure_threshold: int = 3, recovery_timeout: int = 60):
        self.failure_count = 0
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.state = "CLOSED"
        self.last_failure_time = 0.0

    async def execute(self, primary_fn: Callable, fallback_fn: Callable, *args, **kwargs) -> Any:
        current_time = time.time()
        
        if self.state == "OPEN":
            if current_time - self.last_failure_time > self.recovery_timeout:
                print("[CIRCUIT BREAKER] State transitioning to HALF_OPEN")
                self.state = "HALF_OPEN"
            else:
                print("[CIRCUIT BREAKER] State OPEN. Using fallback model.")
                return await fallback_fn(*args, **kwargs)

        try:
            result = await primary_fn(*args, **kwargs)
            
            if self.state == "HALF_OPEN":
                print("[CIRCUIT BREAKER] State transitioning to CLOSED (Recovery successful)")
            
            self.failure_count = 0
            self.state = "CLOSED"
            return result
            
        except Exception as e:
            print(f"[CIRCUIT BREAKER] Primary model failed: {str(e)}")
            self.failure_count += 1
            
            if self.failure_count >= self.failure_threshold or self.state == "HALF_OPEN":
                print("[CIRCUIT BREAKER] Threshold reached! State transitioning to OPEN")
                self.state = "OPEN"
                self.last_failure_time = current_time
                
            return await fallback_fn(*args, **kwargs)

circuit_breaker = AICircuitBreaker()
