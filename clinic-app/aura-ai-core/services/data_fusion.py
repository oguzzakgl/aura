import random

class DataFusionSimulator:
    """
    DATA FUSION SIMULATOR: Mocks IOS and CBCT registration precision.
    """
    @staticmethod
    def get_registration_precision() -> float:
        # Mocking 0.05mm to 0.25mm precision
        return round(random.uniform(0.05, 0.25), 2)
