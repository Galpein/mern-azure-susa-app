import json
import sys
import requests

class LogMealClient:
    def __init__(self, api_user_token):
        self.headers = {'Authorization': 'Bearer ' + api_user_token}

    def recognize_food(self, image_path):
        url_segmentation = 'https://api.logmeal.es/v2/image/segmentation/complete'
        response_segmentation = requests.post(url_segmentation, files={'image': open(image_path, 'rb')}, headers=self.headers)
        
        if response_segmentation.status_code != 200:
            return None, "Error en la segmentación de la imagen"

        image_id = response_segmentation.json().get('imageId')
        if not image_id:
            return None, "No se encontró imageId en la respuesta"

        url_nutritional = 'https://api.logmeal.es/v2/recipe/nutritionalInfo'
        response_nutritional = requests.post(url_nutritional, json={'imageId': image_id}, headers=self.headers)

        if response_nutritional.status_code != 200:
            return None, "Error en la obtención de la información nutricional"

        return response_nutritional.json()

def main(image_path):
    image_path = 'C:/Users/Msi/Documents/SUSA_pruebas/fotos/lentejas_comida_prueba_1.jpg'
    logmeal_client = LogMealClient(api_user_token='e8e97fa1453f17d5b3d9119188b3694b8943ae74')
    response = logmeal_client.recognize_food(image_path)
    print(response)

    url_backend = 'http://localhost:5000/api/foodAnalysis'  # URL del servidor Node.js
    headers = {'Content-Type': 'application/json'}
    data = json.dumps({'respuestaLogmeal': response})  # Convierte la respuesta a JSON
    
    # Realiza una solicitud POST al backend
    requests.post(url_backend, headers=headers, data=data)

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Uso: python logmeal_client.py <ruta_imagen>")
        print("hola")
        print(sys.argv[0])
    else:
        image_path = sys.argv[1]
        print(image_path)
        main(image_path)

