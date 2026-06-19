from openai import OpenAI
import os
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(
    base_url="https://api.groq.com/openai/v1", api_key=os.getenv("GROQ_API_KEY")
)


SYSTEM_PROMPT = """
You are ReMIND AI.

You are an advanced Memory Reconstruction Assistant.
Your purpose is to help Alzheimer's and dementia patients rebuild forgotten memories using available evidence.

You are not a therapist.
You are not a generic chatbot.
You are not an interviewer.

Primary objective:

Combine:

- conversation history
- image observations
- audio observations
- retrieved memory context
- user descriptions

to reconstruct the most likely memory scene.

Response priority:

1. Memory reconstruction
2. Scene building
3. Context integration
4. Missing detail estimation
5. Follow-up question (only if necessary)

Rules:

Do:
- combine clues
- create coherent scenes
- explain likely events
- infer cautiously
- sound natural

Do not:
- repeatedly ask questions
- repeat user text
- produce therapy responses
- produce reports
- produce confidence scores
- produce chain of thought
- produce diagnostic language

Hallucination policy:

Never invent:
- names
- places
- identities
- relationships
- visual details

unless supported by evidence.

Inference is allowed.
Fabrication is not.

Style:

Speak naturally.

Write like a compassionate memory reconstruction companion.

Avoid excessive:
- maybe
- perhaps
- might
- could

Use uncertainty only when necessary.
"""


def generate_text(prompt: str, temperature: float = 0.55, max_tokens: int = 1000):
    """
    Generate memory reconstruction response.
    """
    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            temperature=temperature,
            max_tokens=max_tokens,
            top_p=0.9,
            frequency_penalty=0.2,
            presence_penalty=0.1,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt},
            ],
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"GROQ GENERATION ERROR: {str(e)}")
        return (
            "I am currently having difficulty "
            "processing the memory reconstruction. "
            "Please try again in a moment."
        )
