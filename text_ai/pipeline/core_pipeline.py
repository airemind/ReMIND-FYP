import time
from text_ai.services.rag.vector_store import VectorStore
from text_ai.services.rag.retriever import retrieve_context
from text_ai.services.fusion.input_merger import build_memory_context
from text_ai.services.nlp.preprocessor import preprocess_text
from text_ai.services.nlp.intent_classifier import classify_intent
from text_ai.services.nlp.entity_extractor import extract_entities
from text_ai.services.llm.prompt_builder import build_prompt
from text_ai.services.llm.grok_service import generate_text
from text_ai.services.evaluation.response_evaluator import evaluate_response
from text_ai.utils.logger import get_logger

logger = get_logger()
store = VectorStore()
store.load()


def run_pipeline(
    user_input: str,
    audio=None,
    image=None,
    profile=None,
    conversation_history=None,
):
    start_time = time.time()
    logger.info("Text AI pipeline started")

    # NLP processing
    clean_input = preprocess_text(user_input)
    intent = classify_intent(clean_input)
    entities = extract_entities(user_input)
    logger.info(f"Intent: {intent}")
    logger.info(f"Entities: {entities}")

    # Restrict non-memory requests
    if intent == "restricted":
        return {
            "success": False,
            "response": (
                "I am ReMIND AI, designed specifically "
                "for memory reconstruction and "
                "dementia-care assistance."
            ),
            "intent": intent,
        }

    # Build multimodal context
    merged_input = build_memory_context(
        user_input=user_input,
        audio_context=audio,
        image_context=image,
        profile_context=profile,
        retrieved_memories=[],
    )

    logger.info("Multimodal inputs merged")

    # Retrieve related memories
    retrieved_context = retrieve_context(
        store,
        merged_input,
    )

    retrieved_context = retrieved_context[:5]
    logger.info(f"Retrieved memories: " f"{len(retrieved_context)}")

    # Build prompt

    prompt = build_prompt(
        merged_input,
        retrieved_context,
        intent,
        entities,
        conversation_history or [],
        {},
    )

    logger.info("Generating response from LLM")
    response = generate_text(prompt)

    # Evaluate output
    metrics, metadata = evaluate_response(
        response,
        start_time,
        retrieved_context,
    )

    logger.info("Pipeline completed")

    return {
        "success": True,
        "response": response,
        "intent": intent,
        "entities": entities,
        "retrieved_context": retrieved_context,
        "metrics": metrics,
        "metadata": metadata,
        "multimodal_context": merged_input,
    }
