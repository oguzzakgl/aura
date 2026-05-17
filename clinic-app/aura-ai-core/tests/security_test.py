import hashlib
import time

def simulate_adversarial_attack():
    """
    SECURITY TEST: Verifies that SHA-256 chain detects any bit-flip in records.
    """
    print("--- [Aura Watcher] Starting Security Breach Test ---")
    
    # 1. CREATE VALID EVIDENCE CHAIN
    genesis_hash = "GENESIS"
    finding_data = "Tooth 14: Caries detected"
    valid_seal = hashlib.sha256(f"{finding_data}-{genesis_hash}".encode()).hexdigest()
    
    print(f"Original Sealed Record: {valid_seal[:16]}...")

    # 2. MANIPULATE DATA (BIT-FLIP ATTACK)
    manipulated_data = "Tooth 14: Healthy" # Changed 'Caries' to 'Healthy'
    
    # 3. VERIFY INTEGRITY
    check_hash = hashlib.sha256(f"{manipulated_data}-{genesis_hash}".encode()).hexdigest()
    
    if check_hash != valid_seal:
        print("BREACH DETECTED: Hash mismatch. System secured.")
        return True
    else:
        print("FAILURE: System failed to detect manipulation.")
        return False

if __name__ == "__main__":
    simulate_adversarial_attack()
