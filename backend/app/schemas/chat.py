from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional

class ChatMessageBase(BaseModel):
    role: str
    content: str

class ChatMessageCreate(ChatMessageBase):
    pass

class ChatMessageResponse(ChatMessageBase):
    id: str
    timestamp: datetime

    class Config:
        from_attributes = True

class ChatHistoryResponse(BaseModel):
    messages: List[ChatMessageResponse]

class ChatRequest(BaseModel):
    message: str
