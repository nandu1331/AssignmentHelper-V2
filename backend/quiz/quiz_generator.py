from groq import Groq
import json
import re

class QuizGenerator:
    def __init__(self):
        self.client = Groq()
    
    def generate_quiz(self, topic, context=None):
        prompt = f"""Generate a quiz about {topic}. 
        {f'Additional context: {context}' if context else ''}
        
        Create a JSON response with the following structure:
        {{
            "title": "Quiz title",
            "timeLimit": 600,
            "questions": [
                {{
                    "text": "Question text",
                    "options": ["option1", "option2", "option3", "option4"],
                    "correctOption": 0,
                    "explanation": "Explanation for the correct answer"
                }}
            ]
        }}
        
        Generate 5 questions with 4 options each. Ensure questions are challenging but fair.
        Important: Return only the JSON object, no additional text before or after.
        """
    
        try:
            completion = self.client.chat.completions.create(
                model="llama3-8b-8192",
                messages=[{"role": "user", "content": prompt}],
                temperature=1,
                max_tokens=4000,
                top_p=1,
                stream=False,
                stop=None,
            )
            
            # Extract content and clean it
            raw_response = completion.choices[0].message.content.strip()
            
            def extract_json(text):
                # Helper function to extract and validate JSON
                def find_json_boundaries(s):
                    # Find all potential JSON start positions
                    starts = [i for i, char in enumerate(s) if char == '{']
                    # Find all potential JSON end positions
                    ends = [i + 1 for i, char in enumerate(s) if char == '}']
                    
                    valid_jsons = []
                    
                    # Try all possible combinations of starts and ends
                    for start in starts:
                        for end in ends:
                            if end > start:
                                try:
                                    potential_json = s[start:end]
                                    # Quick check for balanced braces
                                    if potential_json.count('{') != potential_json.count('}'):
                                        continue
                                        
                                    parsed = json.loads(potential_json)
                                    
                                    # Validate required structure
                                    if all(key in parsed for key in ['title', 'timeLimit', 'questions']):
                                        if isinstance(parsed['questions'], list):
                                            # Validate question structure
                                            valid_questions = all(
                                                isinstance(q, dict) and
                                                all(key in q for key in ['text', 'options', 'correctOption', 'explanation'])
                                                for q in parsed['questions']
                                            )
                                            if valid_questions:
                                                valid_jsons.append((parsed, len(potential_json)))
                                                
                                except json.JSONDecodeError:
                                    continue
                                
                    # Return the longest valid JSON if found (assuming it's the most complete)
                    return max(valid_jsons, key=lambda x: x[1])[0] if valid_jsons else None
    
                # Clean common formatting issues
                text = text.replace('\n', ' ').replace('\r', ' ')
                text = re.sub(r'```json\s*|\s*```', '', text)  # Remove markdown code blocks
                text = re.sub(r'`', '', text)  # Remove backticks
                
                # Try to parse the entire text first
                try:
                    return json.loads(text)
                except json.JSONDecodeError:
                    pass
                
                # If that fails, try to find valid JSON within the text
                extracted_json = find_json_boundaries(text)
                if extracted_json:
                    return extracted_json
                
                # If still no valid JSON, try more aggressive cleaning
                text = re.sub(r'[^\x20-\x7E]', '', text)  # Remove non-printable characters
                text = re.sub(r'\\(?!["\\/bfnrt]|u[0-9a-fA-F]{4})', '', text)  # Fix invalid escapes
                
                try:
                    return json.loads(text)
                except json.JSONDecodeError:
                    return None
    
            # Try to extract and parse JSON
            quiz_data = extract_json(raw_response)
            
            if quiz_data:
                # Validate and sanitize the extracted data
                sanitized_data = {
                    "title": str(quiz_data.get("title", "Quiz"))[:200],  # Limit title length
                    "timeLimit": min(max(int(quiz_data.get("timeLimit", 600)), 60), 3600),  # Limit between 1-60 minutes
                    "questions": []
                }
                
                # Process questions
                for q in quiz_data.get("questions", [])[:10]:  # Limit to 5 questions
                    if isinstance(q, dict):
                        sanitized_question = {
                            "text": str(q.get("text", ""))[:500],  # Limit question length
                            "options": [str(opt)[:200] for opt in q.get("options", [])[:4]],  # Limit option length and count
                            "correctOption": min(max(int(q.get("correctOption", 0)), 0), 3),  # Ensure valid option index
                            "explanation": str(q.get("explanation", ""))[:500]  # Limit explanation length
                        }
                        sanitized_data["questions"].append(sanitized_question)
                
                return sanitized_data if sanitized_data["questions"] else None
                
            print("Failed to extract valid JSON from response")
            return None
            
        except Exception as e:
            print(f"Error in Groq API call: {str(e)}")
            return None