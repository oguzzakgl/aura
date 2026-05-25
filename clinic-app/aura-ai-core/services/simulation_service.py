import os
import time
from typing import List, Dict

class SimulationService:
    def __init__(self):
        """
        P1-1 / P4-4: Aura Smile Design (Generative Tedavi Simülatörü)
        Stable Diffusion (Img2Img) veya türevi üretken modellerle çalışacak servis.
        """
        self.api_key = os.getenv("GENERATIVE_AI_KEY", None)
    
    def _build_prompt(self, treatments: List[str]) -> str:
        """
        Prompt Engineering: Hekimin yazdığı basit tedavi isimlerini,
        AI'ın anlayacağı 'Fotogerçekçi Inpainting' promptlarına dönüştürür.
        """
        base_prompt = "photorealistic close-up of a human smile, perfect symmetric teeth, "
        base_prompt += "high quality dental photography, natural white, "
        
        treatment_keywords = []
        for t in treatments:
            t_lower = t.lower()
            if "zirkonyum" in t_lower or "porselen" in t_lower or "kaplama" in t_lower:
                treatment_keywords.append("flawless ceramic veneers, perfectly aligned")
            elif "beyazlatma" in t_lower or "bleaching" in t_lower:
                treatment_keywords.append("bright white teeth, glowing smile")
            elif "diastema" in t_lower or "aralık" in t_lower:
                treatment_keywords.append("no gaps between teeth, closed diastema")
            elif "implant" in t_lower:
                treatment_keywords.append("complete dentition, no missing teeth")
            else:
                treatment_keywords.append(t)
        
        final_prompt = base_prompt + ", ".join(treatment_keywords)
        return final_prompt

    def generate_smile(self, image_path: str, treatments: List[str]) -> Dict:
        """
        Görseli ve tedavileri alıp 'After' (Sonrası) görseli üretir.
        """
        ai_prompt = self._build_prompt(treatments)
        print(f"[AURA GENERATIVE AI] Smile Design Initiated.")
        print(f"[AURA GENERATIVE AI] Target Prompt: {ai_prompt}")
        
        # TODO: Prod ortamında buraya Replicate API (ControlNet / Img2Img) çağrısı eklenecek.
        # replicate.run("stability-ai/stable-diffusion-img2img", input={"image": open(image_path), "prompt": ai_prompt})
        
        # API maliyetlerini engellemek için şimdilik Mock Output dönülüyor
        time.sleep(2.5)  # Yapay zeka üretim süresi (Simülasyon)
        
        mock_output_url = "https://via.placeholder.com/800x400.png?text=Aura+Smile+Design+(After)"
        
        return {
            "status": "success",
            "message": "Gülüş tasarımı başarıyla tamamlandı.",
            "original_image": image_path,
            "generated_image_url": mock_output_url,
            "applied_treatments": treatments,
            "ai_prompt_used": ai_prompt
        }
