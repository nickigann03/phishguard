import logging
import json
from app.core.config import settings
from app.modules.ai.schemas import GenerateTemplateRequest, GeneratedTemplateContent

logger = logging.getLogger(__name__)

class AIService:
    def __init__(self):
        self.provider = settings.AI_PROVIDER
        self.api_key = settings.AI_API_KEY
        self.model = settings.AI_MODEL

    async def generate_template(self, request: GenerateTemplateRequest) -> GeneratedTemplateContent:
        """
        Generate a phishing template using Generative AI.
        """
        if self.provider == "gemini":
            return await self._generate_gemini(request)
        else:
            # Fallback to Mock for now
            return self._generate_mock(request)

    async def _generate_gemini(self, request: GenerateTemplateRequest) -> GeneratedTemplateContent:
        try:
            import google.generativeai as genai
            
            if not self.api_key:
                logger.warning("AI_API_KEY is missing. Falling back to mock.")
                return self._generate_mock(request)
                
            genai.configure(api_key=self.api_key)
            model = genai.GenerativeModel(self.model)
            
            prompt = self._construct_prompt(request)
            
            # Using async generation if supported, otherwise sync
            # Note: google-generativeai is mostly sync, wrap in asyncio.to_thread in real app
            response = model.generate_content(prompt)
            
            # Clean up response (handle code blocks)
            text = response.text.replace("```json", "").replace("```", "").strip()
            data = json.loads(text)
            
            return GeneratedTemplateContent(**data)
            
        except ImportError:
            logger.error("google-generativeai not installed. Using mock.")
            return self._generate_mock(request)
        except Exception as e:
            logger.error(f"Gemini generation failed: {e}")
            return self._generate_mock(request)

    def _generate_mock(self, request: GenerateTemplateRequest) -> GeneratedTemplateContent:
        """Fallback mock generator"""
        return GeneratedTemplateContent(
            subject=f"URGENT: {request.brand_category.title()} Alert",
            body_html=f"<h1>{request.brand_category.title()} Alert</h1><p>Please update your details for {request.prompt}.</p><a href='{{{{link}}}}'>Verify Now</a>",
            body_text=f"Please update your details for {request.prompt}. Verify at: {{link}}",
            difficulty="intermediate",
            estimated_success_rate="high"
        )
        
    def _construct_prompt(self, request: GenerateTemplateRequest) -> str:
        return f"""
        You are an expert social engineering analyst and cybersecurity trainer.
        Generate a realistic phishing email template based on the following parameters:
        
        Topic/Scenario: {request.prompt}
        Target Country: {request.country_code} (Use local context/dialect if applicable)
        Language: {request.language}
        Brand Category: {request.brand_category}
        
        The output MUST be valid JSON with the following structure:
        {{
            "subject": "The email subject line (make it urgent/clickable)",
            "body_html": "The HTML body content. Use placeholders {{link}} for the phishing link and {{name}} for the user's name. Use inline CSS for styling.",
            "body_text": "Plain text version of the body",
            "difficulty": "beginner|intermediate|advanced",
            "estimated_success_rate": "low|medium|high"
        }}
        
        Do not include any explanation, only the JSON object.
        """
