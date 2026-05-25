import asyncio
import os
import sys

# Add current dir to path
sys.path.append(os.getcwd())

from services.gemini_service import gemini_service

async def main():
    try:
        res = await gemini_service._execute_gemini_call("../public/test-images/human_teeth_elite.glb")
        print("SUCCESS:", res[:100])
    except Exception as e:
        print(f"FAILED WITH EXCEPTION: {type(e).__name__}: {e}")

if __name__ == "__main__":
    asyncio.run(main())
