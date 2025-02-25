from groq import Groq
import json
import re

def get_answers_with_llama(questions, ans_detailing, marks=None):
    """
    Fetch answers from Groq AI for a list of question objects.

    Args:
        questions (list): A list of dictionaries with 'id' and 'text' keys representing questions.
        ans_detailing (str): The level of detail required in the answers ("short", "medium", or "long").
        marks (int, optional): The number of marks each question is worth.

    Returns:
        dict: A dictionary with question IDs as keys and answers as values.
    """
    print("Fetching answers from Groq.")
    client = Groq()

    # Convert list of question objects to a dictionary
    if isinstance(questions, list) and all('id' in q and 'text' in q for q in questions):
        questions_map = {q['id']: q['text'] for q in questions}
    else:
        raise ValueError("Invalid input: questions must be a list of objects with 'id' and 'text' keys.")

    questions_list = [f"{id}: {text}" for id, text in questions_map.items()]
    prompt = (
        f"Generate {ans_detailing} answers for these questions:\n\n"
        + "\n\n".join(questions_list)
        + "\n\nReturn your answers in a STRICTLY VALID JSON object with the following format:\n"
        + "```json\n"
        + "{\n"
        + "    \"1\": \"Answer to question 1...\",\n"
        + "    \"2\": \"Answer to question 2...\",\n"
        + "    // ... more questions\n"
        + "}\n"
        + "```\n"
        + "Keys MUST be numbers (integers), and values MUST be strings enclosed in double quotes. "
        + "Do NOT include any extra text before or after the JSON object. Only return the valid JSON."
    )
    if marks is not None:
        prompt += f"\nConsider that these questions are worth {marks} marks each."

    # Send the prompt to Groq AI
    completion = client.chat.completions.create(
        model="llama3-8b-8192",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.5,
        max_tokens=6000,
        top_p=1,
        stream=False,
        stop=None,
    )

    # Extract the JSON object from the response content
    response_content = completion.choices[0].message.content.strip()

    try:
        # Use regex to find the JSON-like structure
        match = re.search(r"\{.*", response_content, re.DOTALL)
        if match:
            answers_json = match.group(0)
            # Ensure it ends with a closing brace
            if not answers_json.strip().endswith("}"):
                answers_json += "}"  # Add missing closing brace
        else:
            raise ValueError("No JSON object found in the response.")

        answers = json.loads(answers_json)
        if not isinstance(answers, dict):
            raise ValueError("Expected a JSON object, but got a different format.")
        # Convert String keys to Integer Keys
        answers = {int(k): v for k, v in answers.items()}
        return answers
    
    except json.JSONDecodeError as e:
        print(f"JSONDecodeError: {e}")
        print(f"Problematic JSON: {answers_json}")
        raise ValueError(f"Failed to parse JSON from the response: {e}")

