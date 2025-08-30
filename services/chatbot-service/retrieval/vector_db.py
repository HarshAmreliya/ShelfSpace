import os
import logging
from typing import List, Dict, Optional

try:
    from pinecone import Pinecone, ServerlessSpec
    from dotenv import load_dotenv
    from embedding import EmbeddingGenerator