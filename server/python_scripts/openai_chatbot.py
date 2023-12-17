import openai
import sys

class OpenAIChatbot:
    def __init__(self, api_key):
        openai.api_key = api_key

    def get_recommendation(self, prompt, model="text-davinci-003", max_tokens=100):
        try:
            response = openai.Completion.create(
                engine=model,
                prompt=prompt,
                max_tokens=max_tokens,
                temperature=0.7
            )
            return response.choices[0].text.strip()
        except openai.error.OpenAIError as e:
            return f"Se produjo un error al obtener la recomendación: {str(e)}"

        
    def save_to_file(self, file_name, prompt, recommendation):
        """Guarda el prompt y la recomendación en un archivo."""
        with open(file_name, 'w') as file:
            file.write("Prompt:\n" + prompt + "\n\n")
            if recommendation is not None:
                file.write("Recommendation:\n" + recommendation)
            else:
                file.write("Recommendation:\nNo se pudo obtener una recomendación.")


    def read_from_file(self, file_name):
        """Lee el contenido de un archivo y lo retorna."""
        with open(file_name, 'r') as file:
            return file.read()

if __name__ == "__main__":
    # Comprueba si se proporcionó el prompt como un argumento
    if len(sys.argv) != 2:
        print("Uso: python tu_script.py 'prompt'")
        sys.exit(1)
    
    prompt = sys.argv[1]
    api_key = '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'
    chatbot = OpenAIChatbot(api_key)
    # prompt = "Dime 10 nombres de animales"
    recommendation = chatbot.get_recommendation(prompt)
    
    # Imprime la recomendación para que Node.js pueda capturarla
    print(recommendation)