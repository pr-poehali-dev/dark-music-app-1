import json
import os
import uuid
import base64
import psycopg2
import boto3
from mutagen import File as MutagenFile
from io import BytesIO

SCHEMA = os.environ.get("MAIN_DB_SCHEMA", "public")
CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}

def get_db():
    return psycopg2.connect(os.environ["DATABASE_URL"])

def get_s3():
    return boto3.client(
        "s3",
        endpoint_url="https://bucket.poehali.dev",
        aws_access_key_id=os.environ["AWS_ACCESS_KEY_ID"],
        aws_secret_access_key=os.environ["AWS_SECRET_ACCESS_KEY"],
    )

def handler(event: dict, context) -> dict:
    """Управление треками: загрузка аудио в S3 и работа с библиотекой пользователя."""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")

    if method == "GET":
        conn = get_db()
        cur = conn.cursor()
        cur.execute(f'SELECT id, title, artist, genre, duration, file_url, cover_emoji, color, created_at FROM {SCHEMA}.tracks ORDER BY created_at DESC')
        rows = cur.fetchall()
        cur.close()
        conn.close()
        tracks = [
            {"id": r[0], "title": r[1], "artist": r[2], "genre": r[3],
             "duration": r[4], "file_url": r[5], "cover_emoji": r[6],
             "color": r[7], "created_at": str(r[8])}
            for r in rows
        ]
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"tracks": tracks})}

    if method == "POST":
        body = json.loads(event.get("body") or "{}")
        file_b64 = body.get("file")
        title = body.get("title", "Без названия")
        artist = body.get("artist", "Неизвестный")
        genre = body.get("genre", "Other")
        cover_emoji = body.get("cover_emoji", "🎵")
        color = body.get("color", "#a78bfa")

        if not file_b64:
            return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Файл не передан"})}

        audio_bytes = base64.b64decode(file_b64)

        # Получить длительность через mutagen
        duration = 0
        try:
            audio = MutagenFile(BytesIO(audio_bytes))
            if audio and audio.info:
                duration = int(audio.info.length)
        except Exception:
            duration = 0

        # Загрузить в S3
        s3 = get_s3()
        key = f"audio/{uuid.uuid4()}.mp3"
        s3.put_object(Bucket="files", Key=key, Body=audio_bytes, ContentType="audio/mpeg")
        access_key = os.environ["AWS_ACCESS_KEY_ID"]
        file_url = f"https://cdn.poehali.dev/projects/{access_key}/bucket/{key}"

        # Сохранить в БД
        conn = get_db()
        cur = conn.cursor()
        cur.execute(
            f'INSERT INTO {SCHEMA}.tracks (title, artist, genre, duration, file_url, cover_emoji, color) VALUES (%s, %s, %s, %s, %s, %s, %s) RETURNING id',
            (title, artist, genre, duration, file_url, cover_emoji, color)
        )
        track_id = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()

        return {"statusCode": 200, "headers": CORS, "body": json.dumps({
            "id": track_id, "title": title, "artist": artist, "genre": genre,
            "duration": duration, "file_url": file_url, "cover_emoji": cover_emoji, "color": color
        })}

    if method == "DELETE":
        params = event.get("queryStringParameters") or {}
        track_id = params.get("id")
        if not track_id:
            return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "id не передан"})}

        conn = get_db()
        cur = conn.cursor()
        cur.execute(f'SELECT file_url FROM {SCHEMA}.tracks WHERE id = %s', (track_id,))
        row = cur.fetchone()
        if row:
            # Удалить из S3
            file_url = row[0]
            key = file_url.split("/bucket/")[-1]
            try:
                get_s3().delete_object(Bucket="files", Key=key)
            except Exception:
                pass
            cur.execute(f'DELETE FROM {SCHEMA}.tracks WHERE id = %s', (track_id,))
            conn.commit()
        cur.close()
        conn.close()
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"ok": True})}

    return {"statusCode": 405, "headers": CORS, "body": json.dumps({"error": "Method not allowed"})}
