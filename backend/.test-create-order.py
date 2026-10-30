import json
import getpass
import urllib.request
import urllib.error

BASE = "http://localhost:3000"
EMAIL = "cliente.prueba@example.com"

password = getpass.getpass("Contraseña del usuario de prueba: ")

def request_json(path, payload, token=None):
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"

    request = urllib.request.Request(
        BASE + path,
        data=json.dumps(payload).encode("utf-8"),
        headers=headers,
        method="POST",
    )
    return urllib.request.urlopen(request, timeout=15)

try:
    with request_json(
        "/api/auth/login",
        {"email": EMAIL, "password": password},
    ) as response:
        auth = json.loads(response.read())

    token = auth.get("token")
    if not token:
        print("Login sin token. No se creó ningún pedido.")
        raise SystemExit(1)

    print("Login correcto. Enviando el pedido de prueba una sola vez...")

    try:
        with request_json(
            "/api/pedidos",
            {
                "restaurantId": 1,
                "zone": "cercana",
                "items": [{"dishId": 1, "quantity": 1}],
            },
            token,
        ) as response:
            result = json.loads(response.read())
            print("HTTP:", response.status)
            data = result.get("data", result)
            print("Respuesta:", json.dumps(data, ensure_ascii=False))

    except urllib.error.HTTPError as error:
        print("El pedido devolvió HTTP", error.code)
        print(error.read().decode("utf-8", "replace"))

except urllib.error.HTTPError as error:
    print("Falló la solicitud de autenticación. HTTP", error.code)
    print(error.read().decode("utf-8", "replace"))
except Exception as error:
    print("No se pudo completar la operación:", type(error).__name__)
finally:
    password = None
