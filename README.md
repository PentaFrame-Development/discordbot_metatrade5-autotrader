# discord-bot
config.json
persistence/idReletionForReply.json

# input for relay
    {
        "api_key": hashed security key,
        "message": {
            "id": int,
            "text": string,
            "reply_to": int,
            "reply_to_top": int,
            "time": timestamp string,
            "statuses": {
                "has_protected_content": bool,
                "is_mention": bool,
            }
        },
        "chat": {
            "id": int,
            "type": str,
            "title": str,
            "from_user": {
                "id": int,
                "username": string
            }
        },
        "attach": {
            "data": b64,
            "caption": string
        }
    }
