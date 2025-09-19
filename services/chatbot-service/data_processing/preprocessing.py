import pandas as pd
import numpy as np
import json
from typing import List, Dict, Optional
from dataclasses import dataclass
import hashlib
from tqdm import tqdm
import re
from enum import Enum
from collections import defaultdict, Counter



@dataclass
class BookRecord:
    """Streamlined book record for your dataset"""
    book_id: str
    title: str
    primary_author: str
    all_authors: List[str]
    description: str
    genres: List[str]
    themes: List[str]
    popularity_score: float
    quality_score: float
    reading_metadata: Dict
    user_engagement: Dict
    publication_info: Dict
    searchable_text: str

class ChunkPriority(Enum):
    """Priority levels for chunk retrieval"""
    ESSENTIAL = 1    # Always retrieve first
    IMPORTANT = 2    # High relevance chunks
    CONTEXTUAL = 3   # Supporting information
    SUPPLEMENTARY = 4 # Additional details

class QueryIntent(Enum):
    """Different types of user queries"""
    QUICK_INFO = "quick"           # "What's this book about?"
    DETAILED_ANALYSIS = "detailed" # "Tell me everything about this book"
    RECOMMENDATION = "recommend"   # "Should I read this?"
    COMPARISON = "compare"         # "How does this compare to X?"
    DISCOVERY = "discover"         # "Find me books like this"

class HierarchicalChunkGenerator:
    """Creates hierarchical chunks with different granularities and priorities"""
    
    def __init__(self):
        self.chunk_templates = {
            'overview': {
                'priority': ChunkPriority.ESSENTIAL,
                'max_length': 200,
                'intent_relevance': [QueryIntent.QUICK_INFO, QueryIntent.RECOMMENDATION]
            },
            'detailed_description': {
                'priority': ChunkPriority.IMPORTANT,
                'max_length': 500,
                'intent_relevance': [QueryIntent.DETAILED_ANALYSIS, QueryIntent.COMPARISON]
            },
            'reader_experience': {
                'priority': ChunkPriority.IMPORTANT,
                'max_length': 300,
                'intent_relevance': [QueryIntent.RECOMMENDATION, QueryIntent.COMPARISON]
            },
            'discovery_metadata': {
                'priority': ChunkPriority.CONTEXTUAL,
                'max_length': 400,
                'intent_relevance': [QueryIntent.DISCOVERY, QueryIntent.RECOMMENDATION]
            },
            'themes_analysis': {
                'priority': ChunkPriority.CONTEXTUAL,
                'max_length': 250,
                'intent_relevance': [QueryIntent.DETAILED_ANALYSIS, QueryIntent.COMPARISON]
            },
            'similar_recommendations': {
                'priority': ChunkPriority.SUPPLEMENTARY,
                'max_length': 300,
                'intent_relevance': [QueryIntent.DISCOVERY, QueryIntent.COMPARISON]
            }
        }
    
    def create_hierarchical_chunks(self, enhanced_record: Dict) -> List[Dict]:
        """Create hierarchical chunks with priority and intent mapping"""
        chunks = []
        book_id = enhanced_record['book_id']
        
        # 1. OVERVIEW CHUNK (Essential - always retrieved first)
        overview_chunk = self._create_overview_chunk(enhanced_record)
        chunks.append(overview_chunk)
        
        # 2. DETAILED DESCRIPTION CHUNK (Important for detailed queries)
        if enhanced_record.get('description'):
            detailed_chunk = self._create_detailed_description_chunk(enhanced_record)
            chunks.append(detailed_chunk)
        
        # 3. READER EXPERIENCE CHUNK (Important for recommendations)
        experience_chunk = self._create_reader_experience_chunk(enhanced_record)
        chunks.append(experience_chunk)
        
        # 4. DISCOVERY METADATA CHUNK (Contextual for discovery)
        discovery_chunk = self._create_discovery_metadata_chunk(enhanced_record)
        chunks.append(discovery_chunk)
        
        # 5. THEMES ANALYSIS CHUNK (Contextual for detailed analysis)
        if enhanced_record.get('themes'):
            themes_chunk = self._create_themes_analysis_chunk(enhanced_record)
            chunks.append(themes_chunk)
        
        # 6. SIMILAR RECOMMENDATIONS CHUNK (Supplementary)
        if enhanced_record.get('similar_books'):
            similar_chunk = self._create_similar_recommendations_chunk(enhanced_record)
            chunks.append(similar_chunk)
        
        return chunks
    
    def _create_overview_chunk(self, record: Dict) -> Dict:
        """Essential information chunk - always retrieved first"""
        title = record['title']
        author = record['primary_author']
        
        # Build concise overview
        overview_parts = [
            f"📚 {title} by {author}"
        ]

        illustrators = record.get('publication_info', {}).get('illustrators', [])
        if illustrators:
            overview_parts.append(f"✍️ Illustrated by: {', '.join(illustrators)}")
            
        translators = record.get('publication_info', {}).get('translators', [])
        if translators:
            overview_parts.append(f"🌍 Translated by: {', '.join(translators)}")
        
        # Add rating if available
        if record['user_engagement']['avg_rating'] > 0:
            rating = record['user_engagement']['avg_rating']
            total_ratings = record['user_engagement']['total_ratings']
            if total_ratings:
                overview_parts.append(f"⭐ {rating:.1f}/5 ({total_ratings:,} ratings)")
        
        # Add basic info
        pages = record['reading_metadata'].get('pages')
        if pages:
            overview_parts.append(f"📖 {pages} pages • {record['reading_metadata']['complexity']} read")
        
        overview_parts.append(f"🎯 {record['popularity_label']} book")
        
        # Add genres
        if record.get('genres'):
            overview_parts.append(f"📂 Genres: {', '.join(record['genres'][:3])}")
        
        overview_text = "\n".join(overview_parts)
        
        return {
            'chunk_id': f"{record['book_id']}_overview",
            'text': overview_text,
            'chunk_type': 'overview',
            'priority': ChunkPriority.ESSENTIAL.value,
            'intent_relevance': ['quick', 'recommend'],
            'book_id': record['book_id'],
            'metadata': {
                'length': len(overview_text),
                'contains_rating': record['user_engagement']['avg_rating'] > 0,
                'contains_genres': bool(record.get('genres')),
                'has_illustrator': bool(illustrators),
                'has_translator': bool(translators),
                'has_illustrator': bool(illustrators),
                'has_translator': bool(translators),
                'work_id': record.get('work_id'), # --- ADDED work_id ---
                'total_ratings': total_ratings or 0 # Ensure this is present for de-duplication
            }
        }
    
    def _create_detailed_description_chunk(self, record: Dict) -> Dict:
        """Detailed content analysis chunk"""
        title = record['title']
        author = record['primary_author']
        description = record['description']
        
        detailed_parts = [
            f"📖 About {title}",
            f"Author: {author}",
            "",
            f"Description: {description}",
        ]

        illustrators = record.get('publication_info', {}).get('illustrators', [])
        if illustrators:
            detailed_parts.append(f"Illustrator(s): {', '.join(illustrators)}")
            
        translators = record.get('publication_info', {}).get('translators', [])
        if translators:
            detailed_parts.append(f"Translator(s): {', '.join(translators)}")

        if record['user_engagement']['avg_rating'] > 0:
            rating = record['user_engagement']['avg_rating']
            total_ratings = record['user_engagement']['total_ratings']
        
        detailed_text = "\n".join(detailed_parts)
        
        return {
            'chunk_id': f"{record['book_id']}_detailed",
            'text': detailed_text,
            'chunk_type': 'detailed_description',
            'priority': ChunkPriority.IMPORTANT.value,
            'intent_relevance': ['detailed', 'compare'],
            'book_id': record['book_id'],
            'work_id': record.get('work_id'), # --- ADDED work_id ---
            'metadata': {
                'length': len(detailed_text),
                'description_length': len(description),
                'has_illustrator': bool(illustrators),
                'has_translator': bool(translators),
                'work_id': record.get('work_id'), # --- ADDED work_id ---
                'total_ratings': total_ratings or 0 # Ensure this is present for de-duplication
            }
        }
    
    def _create_reader_experience_chunk(self, record: Dict) -> Dict:
        """Reading experience and quality indicators"""
        experience_parts = [
            f"📊 Reader Experience for {record['title']}",
            ""
        ]
        
        # Rating analysis
        if record['user_engagement']['avg_rating'] > 0:
            rating = record['user_engagement']['avg_rating']
            total_ratings = record['user_engagement']['total_ratings']
            
            if rating >= 4.5:
                experience_parts.append(f"⭐ Exceptional book ({rating:.1f}★) - Readers absolutely love it!")
            elif rating >= 4.0:
                experience_parts.append(f"⭐ Highly rated ({rating:.1f}★) - Strong reader satisfaction")
            elif rating >= 3.5:
                experience_parts.append(f"⭐ Well-received ({rating:.1f}★) - Generally positive reviews")
            else:
                experience_parts.append(f"⭐ Mixed reception ({rating:.1f}★) - Varied reader opinions")
            
            if total_ratings:
                experience_parts.append(f"📈 Based on {total_ratings:,} reader reviews")
        
        # Reading commitment
        pages = record['reading_metadata'].get('pages', 0)
        reading_time = record['reading_metadata'].get('reading_time_minutes', 0)

        if record['user_engagement']['avg_rating'] > 0:
            rating = record['user_engagement']['avg_rating']
            total_ratings = record['user_engagement']['total_ratings']
        
        if pages and reading_time:
            hours = reading_time // 60
            if hours <= 3:
                commitment = "Quick read"
            elif hours <= 8:
                commitment = "Moderate commitment"
            elif hours <= 15:
                commitment = "Substantial read"
            else:
                commitment = "Major time investment"
            
            experience_parts.append(f"⏱️ {commitment} (~{hours} hours, {pages} pages)")
        
        # Complexity indicator
        complexity = record['reading_metadata'].get('complexity', 'Medium')
        complexity_desc = {
            'Very Easy': 'Perfect for casual reading',
            'Easy': 'Light, accessible read',
            'Medium': 'Standard reading experience',
            'Hard': 'Challenging but rewarding',
            'Very Hard': 'Requires focused attention'
        }
        experience_parts.append(f"🎯 {complexity_desc.get(complexity, 'Standard reading experience')}")
        
        experience_text = "\n".join(experience_parts)
        
        return {
            'chunk_id': f"{record['book_id']}_experience",
            'text': experience_text,
            'chunk_type': 'reader_experience',
            'priority': ChunkPriority.IMPORTANT.value,
            'intent_relevance': ['recommend', 'compare'],
            'book_id': record['book_id'],
            'work_id': record.get('work_id'), # --- ADDED work_id ---
            'metadata': {
                'has_rating_analysis': record['user_engagement']['avg_rating'] > 0,
                'reading_time_hours': reading_time // 60 if reading_time else 0,
                'complexity_level': complexity,
                'work_id': record.get('work_id'), # --- ADDED work_id ---
                'total_ratings': total_ratings or 0 # Ensure this is present for de-duplication
            }
        }
    
    def _create_discovery_metadata_chunk(self, record: Dict) -> Dict:
        """Discovery and categorization information"""
        discovery_parts = [
            f"🔍 Discovery Info for {record['title']}",
            ""
        ]

        if record['user_engagement']['avg_rating'] > 0:
            rating = record['user_engagement']['avg_rating']
            total_ratings = record['user_engagement']['total_ratings']
        
        # Publication context
        pub_year = record['publication_info'].get('year')
        if pub_year:
            current_year = 2024  # Update as needed
            age = current_year - pub_year
            if age <= 2:
                discovery_parts.append(f"📅 Recent release ({pub_year}) - Fresh content!")
            elif age <= 10:
                discovery_parts.append(f"📅 Modern book ({pub_year}) - Contemporary perspectives")
            elif age <= 30:
                discovery_parts.append(f"📅 Established work ({pub_year}) - Time-tested")
            else:
                discovery_parts.append(f"📅 Classic literature ({pub_year}) - Historical significance")
        
        # Popularity context
        pop_score = record['popularity_score']
        if pop_score >= 80:
            discovery_parts.append(f"🔥 Cultural phenomenon - Everyone's talking about it!")
        elif pop_score >= 65:
            discovery_parts.append(f"📈 Very popular - Widely read and discussed")
        elif pop_score >= 50:
            discovery_parts.append(f"👥 Popular choice - Strong readership")
        elif pop_score >= 35:
            discovery_parts.append(f"📚 Solid following - Appreciated by readers")
        else:
            discovery_parts.append(f"💎 Hidden gem - For discerning readers")
        
        # Reader community insights
        shelves = record['user_engagement'].get('popular_shelves', [])
        if shelves:
            # Extract meaningful shelf categories (avoiding generic ones)
            meaningful_shelves = []
            stop_shelves = {'to-read', 'currently-reading', 'favorites', 'owned', 'books-i-own'}
            
            for shelf in shelves[:10]:  # Look at top shelves
                if isinstance(shelf, str) and shelf!="":
                    shelf_name = shelf.lower()
                    if shelf_name not in stop_shelves and len(shelf_name.split()) <= 2:
                        meaningful_shelves.append(shelf_name)
            
            if meaningful_shelves:
                discovery_parts.append(f"🏷️ Readers categorize as: {', '.join(meaningful_shelves[:5])}")
        
        discovery_text = "\n".join(discovery_parts)
        
        return {
            'chunk_id': f"{record['book_id']}_discovery",
            'text': discovery_text,
            'chunk_type': 'discovery_metadata',
            'priority': ChunkPriority.CONTEXTUAL.value,
            'intent_relevance': ['discover', 'recommend'],
            'book_id': record['book_id'],
            'work_id': record.get('work_id'),
            'metadata': {
                'publication_year': pub_year,
                'popularity_tier': record['popularity_label'],
                'has_shelf_data': bool(shelves),
                'work_id': record.get('work_id'), # --- ADDED work_id ---
                'total_ratings': total_ratings or 0 # Ensure this is present for de-duplication
            }
        }
    
    def _create_themes_analysis_chunk(self, record: Dict) -> Dict:
        """Thematic analysis chunk"""
        themes_parts = [
            f"🎭 Themes in {record['title']}",
            ""
        ]

        if record['user_engagement']['avg_rating'] > 0:
            rating = record['user_engagement']['avg_rating']
            total_ratings = record['user_engagement']['total_ratings']
        
        themes = record.get('themes', [])
        if themes:
            # Group themes by category for better presentation
            theme_descriptions = {
                'love_romance': 'Love and Romance',
                'family': 'Family Relationships',
                'friendship': 'Friendship and Loyalty',
                'coming_of_age': 'Growing Up and Maturity',
                'identity': 'Self-Discovery and Identity',
                'war_conflict': 'War and Conflict',
                'survival': 'Survival and Perseverance',
                'justice': 'Justice and Morality',
                'power_politics': 'Power and Politics',
                'social_issues': 'Social Issues',
                'mystery_suspense': 'Mystery and Suspense',
                'adventure': 'Adventure and Discovery',
                'magic_supernatural': 'Magic and Supernatural',
                'religion_spirituality': 'Religion and Spirituality'
            }
            
            themes_parts.append("This book explores:")
            for theme in themes:
                theme_name = theme_descriptions.get(theme, theme.replace('_', ' ').title())
                themes_parts.append(f"• {theme_name}")
        
        # Add genre context
        if record.get('genres'):
            themes_parts.extend([
                "",
                f"📂 Genre context: {', '.join(record['genres'])}"
            ])
        
        themes_text = "\n".join(themes_parts)
        
        return {
            'chunk_id': f"{record['book_id']}_themes",
            'text': themes_text,
            'chunk_type': 'themes_analysis',
            'priority': ChunkPriority.CONTEXTUAL.value,
            'intent_relevance': ['detailed', 'compare'],
            'book_id': record['book_id'],
            'work_id': record.get('work_id'),
            'metadata': {
                'theme_count': len(themes),
                'has_genres': bool(record.get('genres')),
                'work_id': record.get('work_id'), # --- ADDED work_id ---
                'total_ratings': total_ratings or 0 # Ensure this is present for de-duplication
            }
        }
    
    def _create_similar_recommendations_chunk(self, record: Dict) -> Dict:
        """Similar books and recommendations"""
        similar_books = record.get('similar_books', [])
        
        rec_parts = [
            f"📚 If you like {record['title']}, you might enjoy:",
            ""
        ]

        if record['user_engagement']['avg_rating'] > 0:
            rating = record['user_engagement']['avg_rating']
            total_ratings = record['user_engagement']['total_ratings']
        
        if similar_books:
            for i, book in enumerate(similar_books[:3], 1):
                rec_parts.append(f"{i}. {book}")
        else:
            rec_parts.append("Similar recommendations not available for this title.")
        
        # Add genre-based suggestions
        if record.get('genres'):
            rec_parts.extend([
                "",
                f"🎭 Explore more books in: {', '.join(record['genres'][:3])}"
            ])
        
        if record.get('themes'):
            rec_parts.append(f"🎯 Or books exploring: {', '.join(record['themes'][:3])}")
        
        rec_text = "\n".join(rec_parts)
        
        return {
            'chunk_id': f"{record['book_id']}_similar",
            'text': rec_text,
            'chunk_type': 'similar_recommendations',
            'priority': ChunkPriority.SUPPLEMENTARY.value,
            'intent_relevance': ['discover', 'compare'],
            'book_id': record['book_id'],
            'work_id': record.get('work_id'),
            'metadata': {
                'similar_count': len(similar_books[:3]),
                'has_genre_suggestions': bool(record.get('genres')),
                'has_theme_suggestions': bool(record.get('themes')),
                'work_id': record.get('work_id'), # --- ADDED work_id ---
                'total_ratings': total_ratings or 0 # Ensure this is present for de-duplication
            }
        }
    
class SmartChunkSelector:
    """Intelligent chunk selection based on query intent"""
    
    def __init__(self):
        self.intent_patterns = {
            QueryIntent.QUICK_INFO: [
                r'\b(what is|tell me about|summary|brief|quick)\b',
                r'\b(genre|author|rating|pages)\b'
            ],
            QueryIntent.DETAILED_ANALYSIS: [
                r'\b(detailed|in-depth|analysis|everything|comprehensive)\b',
                r'\b(plot|story|character|theme|meaning)\b'
            ],
            QueryIntent.RECOMMENDATION: [
                r'\b(should i read|recommend|worth|good book|like it)\b',
                r'\b(opinion|review|experience|quality)\b'
            ],
            QueryIntent.COMPARISON: [
                r'\b(compare|similar|different|better|versus|vs)\b',
                r'\b(like this|alternative|instead)\b'
            ],
            QueryIntent.DISCOVERY: [
                r'\b(find|discover|suggest|more books|other books)\b',
                r'\b(genre|author|similar|recommendations)\b'
            ]
        }
    
    def detect_intent(self, query: str) -> QueryIntent:
        """Detect user intent from query"""
        query_lower = query.lower()
        
        intent_scores = defaultdict(int)
        
        for intent, patterns in self.intent_patterns.items():
            for pattern in patterns:
                if re.search(pattern, query_lower):
                    intent_scores[intent] += 1
        
        if intent_scores:
            return max(intent_scores.items(), key=lambda x: x[1])[0]
        
        return QueryIntent.QUICK_INFO  # Default
    
    def select_chunks_for_intent(self, all_chunks: List[Dict], intent: QueryIntent, max_chunks: int = 3) -> List[Dict]:
        """Select optimal chunks based on detected intent"""
        # Filter chunks by intent relevance
        relevant_chunks = []
        for chunk in all_chunks:
            if intent.value in chunk.get('intent_relevance', []):
                relevant_chunks.append(chunk)
        
        # Sort by priority (lower number = higher priority)
        relevant_chunks.sort(key=lambda x: x.get('priority', 4))
        
        # Always include overview if available and not already included
        overview_chunks = [c for c in all_chunks if c['chunk_type'] == 'overview']
        if overview_chunks and overview_chunks[0] not in relevant_chunks:
            relevant_chunks.insert(0, overview_chunks[0])
        
        return relevant_chunks[:max_chunks]

class OptimizedBookScorer:
    """Scoring system optimized for your actual dataset quality"""
    
    def __init__(self):
        # Weights based on your actually available reliable data
        self.weights = {
            'ratings_count': 0.45,        # Your most reliable engagement metric
            'avg_rating': 0.35,           # Quality indicator
            'shelf_engagement': 0.15,     # Use popular_shelves data creatively
            'data_completeness': 0.05     # Basic completeness check
        }
    
    def calculate_popularity_score(self, row: pd.Series) -> float:
        """Calculate popularity score using your strongest available data"""
        score = 0.0
        
        # Ratings count score (your most reliable engagement metric)
        ratings_count = row.get('ratings_count', 0)
        if pd.notna(ratings_count) and ratings_count > 0:
            try:
                ratings_count = float(ratings_count)
                # Log scale optimized for your dataset range
                ratings_score = min(100, np.log10(ratings_count + 1) * 13)
                score += ratings_score * self.weights['ratings_count']
            except (TypeError, ValueError):
                pass  # Skip if conversion fails
        
        # Average rating score (excellent quality indicator)
        avg_rating = row.get('average_rating', 0)
        if pd.notna(avg_rating) and avg_rating > 0:
            try:
                avg_rating = float(avg_rating)
                # Your EDA: range 1.98-5.00, most books 3.5-4.5
                # Normalize with emphasis on higher ratings
                rating_score = ((avg_rating - 1.98) / (5.0 - 1.98)) * 100
                rating_score = max(0, min(100, rating_score))
                
                # Bonus system based on your rating distribution
                if avg_rating >= 4.5:  # Outstanding books
                    rating_score *= 1.3
                elif avg_rating >= 4.0:  # Excellent books  
                    rating_score *= 1.2
                elif avg_rating >= 3.5:  # Very good books
                    rating_score *= 1.1
                    
                score += rating_score * self.weights['avg_rating']
            except (TypeError, ValueError):
                pass  # Skip if conversion fails
        
        # Popular shelves engagement (creative use of your rich shelf data)
        shelf_engagement = self.calculate_shelf_engagement(row)
        if shelf_engagement is not None:
            score += shelf_engagement * self.weights['shelf_engagement']
        
        # Data completeness (essential fields only)
        completeness = self.calculate_completeness(row)
        if completeness is not None:
            score += completeness * self.weights['data_completeness']
        
        return min(100.0, max(0.0, score))
    
    def calculate_shelf_engagement(self, row: pd.Series) -> float:
        """Use popular_shelves as engagement indicator"""
        shelves = row.get('popular_shelves', '')
        
        # Handle None case first
        if shelves is None:
            return 0.0
            
        # Handle list case (when data is already parsed)
        if isinstance(shelves, list):
            if len(shelves) == 0:
                return 0.0
            shelf_list = shelves
        # Handle string case (when data needs parsing)
        elif isinstance(shelves, str):
            if not shelves.strip() or shelves.strip() == '[]':
                return 0.0
            try:
                import ast
                shelf_list = ast.literal_eval(shelves) if shelves.startswith('[') else []
            except:
                return 0.0
        # Handle pandas Series or numpy array
        elif hasattr(shelves, '__iter__') and not isinstance(shelves, str):
            try:
                shelf_list = list(shelves)
                if len(shelf_list) == 0:
                    return 0.0
            except:
                return 0.0
        else:
            return 0.0
        
        # Check if shelf_list is empty
        if not shelf_list or len(shelf_list) == 0:
            return 0.0
        
        # More shelves = more engagement
        shelf_count = len(shelf_list)
        
        # Log scale for shelf count (similar to ratings)
        engagement_score = min(100, np.log10(shelf_count + 1) * 25)
        
        # Bonus for quality shelf categories
        quality_shelves = {
            'favorites', 'favourites', 'owned', 'books-i-own', 'owned-books',
            'library', 'my-library', 'kindle', 'ebook', 'classics'
        }
        
        quality_count = 0
        for shelf in shelf_list:
            if isinstance(shelf, dict) and 'name' in shelf:
                shelf_name = str(shelf['name']).lower()
                if shelf_name in quality_shelves:
                    quality_count += 1
        
        if quality_count > 0:
            engagement_score *= (1 + quality_count * 0.1)  # 10% bonus per quality shelf
        
        return min(100.0, engagement_score)
    
    def calculate_completeness(self, row: pd.Series) -> float:
        """Calculate completeness using only reliable fields"""
        score = 0
        
        # Essential fields (weight: 25 points each)
        essential_fields = ['title', 'authors', 'genres']
        for field in essential_fields:
            if str(row.get(field)).strip():
                score += 33.33  # 100/3 for essential fields
        
        # Description bonus (your analysis shows 96.3% have descriptions)
        if len(str(row.get('description'))) > 50:
            score += 10  # Bonus for good description
        
        # Series info bonus (helps with discoverability)
        if str(row.get('series')).strip() != '[]':
            score += 5
        
        return min(100.0, score)

class ImprovedThemeExtractor:
    """Enhanced theme extraction using description analysis"""
    
    def __init__(self):
        # Comprehensive theme patterns based on common book themes
        self.theme_patterns = {
            # Relationship themes
            'love_romance': [
                r'\b(love|romance|romantic|relationship|marriage|dating|couple)\b',
                r'\b(heart|passion|affair|wedding|bride|groom)\b'
            ],
            'family': [
                r'\b(family|parent|mother|father|mom|dad|sibling|brother|sister)\b',
                r'\b(child|children|son|daughter|generation|ancestry)\b'
            ],
            'friendship': [
                r'\b(friend|friendship|companion|ally|bond|loyalty)\b',
                r'\b(together|support|trust|betrayal|fellowship)\b'
            ],
            
            # Life stage themes
            'coming_of_age': [
                r'\b(growing up|adolescent|teenager|young adult|youth|maturity)\b',
                r'\b(childhood|school|college|graduation|first time)\b'
            ],
            'identity': [
                r'\b(identity|self-discovery|belonging|purpose|meaning)\b',
                r'\b(who am i|find yourself|inner|soul|spirit)\b'
            ],
            
            # Conflict themes
            'war_conflict': [
                r'\b(war|battle|conflict|military|soldier|army|navy|fight)\b',
                r'\b(violence|weapon|combat|enemy|victory|defeat)\b'
            ],
            'survival': [
                r'\b(survival|survive|endure|overcome|struggle|hardship)\b',
                r'\b(danger|threat|rescue|escape|disaster|crisis)\b'
            ],
            'justice': [
                r'\b(justice|fairness|right|wrong|moral|ethics|law)\b',
                r'\b(crime|criminal|police|court|legal|innocent|guilty)\b'
            ],
            
            # Power themes
            'power_politics': [
                r'\b(power|control|authority|dominance|leadership|ruler)\b',
                r'\b(politics|government|king|queen|empire|revolution)\b'
            ],
            'social_issues': [
                r'\b(society|social|class|poverty|wealth|inequality)\b',
                r'\b(racism|discrimination|prejudice|civil rights)\b'
            ],
            
            # Mystery/Adventure themes
            'mystery_suspense': [
                r'\b(mystery|secret|hidden|unknown|puzzle|clue|detective)\b',
                r'\b(suspense|thriller|investigation|murder|crime)\b'
            ],
            'adventure': [
                r'\b(adventure|journey|quest|travel|explore|discovery)\b',
                r'\b(treasure|map|expedition|voyage|wilderness)\b'
            ],
            
            # Supernatural/Fantasy themes
            'magic_supernatural': [
                r'\b(magic|spell|wizard|witch|supernatural|paranormal)\b',
                r'\b(ghost|spirit|demon|angel|vampire|werewolf)\b'
            ],
            'religion_spirituality': [
                r'\b(god|religion|faith|spiritual|church|prayer|divine)\b',
                r'\b(heaven|hell|soul|sacred|holy|priest|monk)\b'
            ]
        }
        
        # Genre-to-theme mapping for supplementing extracted themes
        self.genre_theme_mapping = {
            'romance': ['love_romance'],
            'mystery': ['mystery_suspense'],
            'thriller': ['mystery_suspense', 'survival'],
            'fantasy': ['magic_supernatural', 'adventure'],
            'science fiction': ['adventure', 'identity'],
            'sci-fi': ['adventure', 'identity'],
            'historical fiction': ['war_conflict', 'social_issues'],
            'young adult': ['coming_of_age', 'identity'],
            'family': ['family'],
            'war': ['war_conflict', 'survival'],
            'biography': ['identity'],
            'memoir': ['identity', 'family'],
            'horror': ['survival', 'mystery_suspense'],
            'adventure': ['adventure', 'survival'],
            'contemporary': ['identity', 'love_romance']
        }
    
    def extract_themes(self, description: str, genres: List[str]) -> List[str]:
        """Extract themes from description with genre supplementation"""
        themes = set()
        
        if description and len(description) > 20:
            desc_lower = description.lower()
            
            # Extract themes from description using patterns
            for theme, patterns in self.theme_patterns.items():
                for pattern in patterns:
                    if re.search(pattern, desc_lower):
                        themes.add(theme)
                        break  # Found this theme, move to next
        
        # Supplement with genre-based themes
        if genres and len(genres) > 0:
            for genre in genres:
                genre_lower = str(genre).lower().strip()
                if genre_lower in self.genre_theme_mapping:
                    themes.update(self.genre_theme_mapping[genre_lower])
        
        # Convert back to list and limit to avoid overwhelming
        theme_list = list(themes)[:6]  # Max 6 themes per book
        
        return sorted(theme_list)  # Sort for consistency

class StreamlinedBookRAGProcessor:
    """Optimized for your actual dataset characteristics"""
    
    def __init__(self, min_quality_threshold: float = 30.0):
        self.scorer = OptimizedBookScorer()
        self.theme_extractor = ImprovedThemeExtractor()
        self.min_quality_threshold = min_quality_threshold
        self.mappings = {}
        self.chunk_generator = HierarchicalChunkGenerator()
        self.chunk_selector = SmartChunkSelector()
        try:
            print("Loading book ID to title mappings...")
            # Use regular `open` since the file is not actually compressed
            with open("data/goodreads_books.json.gz", 'r', encoding='utf-8') as f:
                for line in f:
                    if line.strip():
                        info = json.loads(line)
                        self.mappings[info['book_id']] = info["title"]
            print(f"Mapping created with {len(self.mappings)} entries.")
        except FileNotFoundError:
            print("WARNING: 'goodreads_books.json.gz' not found. Similar book titles will not be resolved.")
        except Exception as e:
            print(f"An error occurred while loading mappings: {e}")
    
    def safe_len_check(self, obj) -> bool:
        """Safely check if an object has length > 0 - FIXED VERSION"""
        if obj is None:
            return False
        
        # Handle pandas Series - use .empty instead of len() in boolean context
        if isinstance(obj, pd.Series):
            return not obj.empty and not obj.isna().all()
        
        # Handle numpy arrays - use .size instead of len() in boolean context
        if isinstance(obj, np.ndarray):
            return obj.size > 0
        
        # Handle regular lists/strings
        try:
            return len(obj) > 0
        except (TypeError, AttributeError):
            return False
    
    def parse_list_field(self, field_value) -> List[str]:
        """Robust parsing for list fields including strings, lists, and List[Dict] like popular_shelves"""
        # Handle None and empty cases first
        if field_value is None:
            return []
        
        # Handle pandas Series/numpy array edge cases - FIXED
        if isinstance(field_value, pd.Series):
            if field_value.empty:
                return []
            # Convert to list first
            try:
                field_value = field_value.tolist()
            except:
                return []
        elif isinstance(field_value, np.ndarray):
            if field_value.size == 0:
                return []
            try:
                field_value = field_value.tolist()
            except:
                return []
        
        # Handle string cases
        if isinstance(field_value, str):
            if field_value.strip() in ['', '[]']:
                return []
            try:
                import ast
                parsed = ast.literal_eval(field_value)
                if isinstance(parsed, list):
                    return self._extract_from_list(parsed)
                return []
            except:
                # Fallback for delimited strings
                if ',' in field_value:
                    return [s.strip() for s in field_value.split(',') if s.strip()]
                elif '|' in field_value:
                    return [s.strip() for s in field_value.split('|') if s.strip()]
                else:
                    cleaned = field_value.strip()
                    return [cleaned] if cleaned else []
        
        # Handle list cases
        if isinstance(field_value, list):
            if len(field_value) == 0:
                return []
            return self._extract_from_list(field_value)

        return []
    
    def _extract_from_list(self, list_value):
        """Helper to extract strings from various list formats"""
        if not list_value:
            return []
            
        result = []
        for item in list_value:
            if isinstance(item, dict):
                # Handle different dict structures
                if 'name' in item:  # popular_shelves format
                    name = item.get('name', '')
                    if isinstance(name, str) and name.strip():
                        result.append(name.lower().strip())
                elif 'author_id' in item:  # authors format - we'll skip for now in this method
                    continue
                else:
                    # Generic dict - try to find a string value
                    for key, value in item.items():
                        if isinstance(value, str) and value.strip():
                            result.append(value.lower().strip())
                            break
            elif isinstance(item, str):
                if item.strip():
                    result.append(item.lower().strip())
            else:
                # Convert other types to string
                str_item = str(item).strip()
                if str_item:
                    result.append(str_item.lower())
        
        return result
    
    def parse_contributors(self, contributors_data: List[Dict]) -> Dict[str, List[str]]:
        """
        Parses a list of contributor dictionaries that ALREADY CONTAIN the name and role.
        1. The first entry is ALWAYS the primary author.
        2. Subsequent entries are only processed if they have a specific role.
        """
        # Default return value if the input is empty or invalid
        if not contributors_data or not isinstance(contributors_data, list):
            return {"authors": ["Unknown Author"], "translators": [], "illustrators": []}

        contributors = defaultdict(list)
        
        # --- Step 1: Process the Primary Author (the first entry) ---
        primary_author_data = contributors_data[0]
        if isinstance(primary_author_data, dict):
            # Directly get the name, no mapping needed
            primary_author_name = primary_author_data.get('name')
            if primary_author_name:
                contributors['authors'].append(primary_author_name)

        # --- Step 2: Process all other contributors ---
        if len(contributors_data) > 1:
            for person in contributors_data[1:]: # Loop starts from the second person
                if not isinstance(person, dict):
                    continue

                role = person.get('role', '').lower().strip()

                # --- The Key Logic: Ignore if the role is empty ---
                if not role:
                    continue # This is a secondary author and will be ignored

                # Directly get the name, no mapping needed
                name = person.get('name')

                if name:
                    if 'translator' in role:
                        contributors['translators'].append(name)
                    elif 'illustrator' in role:
                        contributors['illustrators'].append(name)
                    # Note: We do not add any more authors in this loop

        # Final check: Ensure there's always at least one author listed
        if not contributors.get('authors'):
            contributors['authors'] = ["Unknown Author"]
            
        return dict(contributors)



    def parse_authors(self, authors_field) -> list[str]:
        """Special parsing for authors field which has different structure"""
        if authors_field is None:
            return ["Unknown Author"]
            
        # Handle pandas Series/numpy array edge cases - FIXED
        if isinstance(authors_field, pd.Series):
            if authors_field.empty:
                return ["Unknown Author"]
            try:
                authors_field = authors_field.tolist()
            except:
                return ["Unknown Author"]
        elif isinstance(authors_field, np.ndarray):
            if authors_field.size == 0:
                return ["Unknown Author"]
            try:
                authors_field = authors_field.tolist()
            except:
                return ["Unknown Author"]
        
        # Handle string representation
        if isinstance(authors_field, str):
            if authors_field.strip() in ['', '[]']:
                return ["Unknown Author"]
            try:
                import ast
                parsed = ast.literal_eval(authors_field)
                if isinstance(parsed, list):
                    return self._extract_author_names(parsed)
                return ["Unknown Author"]
            except:
                return [authors_field.strip()] if authors_field.strip() else ["Unknown Author"]
        
        # Handle list
        if isinstance(authors_field, list):
            if len(authors_field) == 0:
                return ["Unknown Author"]
            return self._extract_author_names(authors_field)
            
        return ["Unknown Author"]
    
    def _extract_author_names(self, author_list: List[str]) -> List[str]:
        """
        Extracts author names from a simple list of strings, tailored to the dataset.
        """
        # 1. Handle cases where the list might be empty or None
        if not author_list:
            return ["Unknown Author"]
            
        # 2. Clean up the names and filter out any empty strings
        # This removes whitespace and handles potential empty values like [""]
        cleaned_authors = [
            str(name).strip() for name in author_list if name and str(name).strip()
        ]
        
        # 3. Return the cleaned list, or a default if the list becomes empty after cleaning
        return cleaned_authors if cleaned_authors else ["Unknown Author"]
    
    def clean_text(self, text : str):
        """Clean text data"""
        if pd.isna(text) or not isinstance(text, str):
            return ""
        
        # Basic cleaning
        text = re.sub(r'<[^>]+>', '', text)  # Remove HTML tags
        text = re.sub(r'http[s]?://\S+', '', text)  # Remove URLs
        text = re.sub(r'\s+', ' ', text)  # Normalize whitespace
        text = re.sub(r'[^\w\s.,!?;:()\-"\']', ' ', text)  # Keep basic punctuation
        
        return text.strip()
    
    def get_popularity_label(self, score: float) -> str:
        """Converts a numerical popularity score into a discrete category."""
        if score >= 80:
            return "Iconic"
        if score >= 65:
            return "Very Popular"
        if score >= 50:
            return "Popular"
        if score >= 35:
            return "Moderately Popular"
        return "Niche"
    
    def calculate_shelf_engagement_score(self, row: pd.Series) -> float:
        """Enhanced scoring using shelf 'count' as engagement proxy"""
        import ast
        shelves = row.get('popular_shelves', [])
        
        # Handle string representation
        if isinstance(shelves, str):
            if not shelves.strip() or shelves.strip() == '[]':
                return 0.0
            try:
                shelves = ast.literal_eval(shelves)
            except:
                return 0.0

        # Handle None case
        if shelves is None:
            return 0.0
            
        # Convert to list if it's numpy array or other iterable
        if not isinstance(shelves, list):
            try:
                shelves = list(shelves)
            except:
                return 0.0

        # Check if empty
        if len(shelves) == 0:
            return 0.0

        total_count = 0
        quality_bonus = 0
        quality_indicators = {'favorites', 'favourites', 'classics', 'must-read', 'best-books'}

        for shelf in shelves:
            if isinstance(shelf, dict) and 'name' in shelf and 'count' in shelf:
                try:
                    count = int(shelf['count'])
                    total_count += count
                    if shelf['name'].lower() in quality_indicators:
                        quality_bonus += min(5, count // 100)  # 1 point per 100 tags, max 5 per shelf
                except:
                    continue

        # Use log scale for engagement score
        base_score = min(100, np.log10(total_count + 1) * 10)  # Scale of 0-100
        final_score = base_score + min(quality_bonus, 10)

        return min(100.0, final_score)
    
    def _get_descriptive_shelves(self, popular_shelves: List[str]) -> List[str]:
        """
        Filters a book's popular shelves to get the most descriptive, content-related tags.
        """
        if not popular_shelves:
            return []

        # Create a set of common, non-descriptive shelves to ignore.
        # This is based on your EDA.
        STOP_SHELVES = {
            'to-read', 'currently-reading', 'favorites', 'owned', 'books-i-own',
            'library', 'kindle', 'ebook', 'to-buy', 'owned-books', 'wish-list',
            'ebooks', 'default', 'my-books', 'e-book', 'audiobooks', 'audio',
            'i-own', 'my-library', 'favourites', 'maybe', 'dnf', 'did-not-finish',
            'read-in-2023', 'read-in-2022', 'read-in-2021', 'read-in-2020',
            'read-in-2019', 'read-in-2018', 'read-in-2017', 'read-in-2016', 'read-in-2015',
            'books', 'all-time-favorites', 'favorite-books', 'audiobook'
        }

        descriptive_shelves = []
        for shelf in popular_shelves:
            # The shelf name is in shelf['name']
            shelf_name = shelf.lower().strip()
            
            # Check if the shelf is not in our stop list and is a single word (more likely to be a tag)
            if shelf_name and shelf_name not in STOP_SHELVES and ' ' not in shelf_name:
                descriptive_shelves.append(shelf_name)

        # Return the top 4 most common descriptive shelves for this book
        return descriptive_shelves[:4]
    
    def get_book_titles(self, books: List[str]) -> List[str]:
        res = []
        for book_id in books:
            # Check for the key directly in the mapping dictionary
            # and get the title. Use .get() to safely handle missing keys.
            title = self.mappings.get(book_id)
            if title:  # This ensures we don't append None or empty titles
                res.append(title)
        return res
    
    def estimate_reading_time(self, num_pages: Optional[int]) -> int:
        """
        Estimates the reading time in minutes based on the number of pages.
        Assumes an average reading speed of ~1.5 minutes per page.
        """
        if not num_pages or num_pages <= 0:
            return 0
        
        # Calculation is based on an average of 200 words per minute
        # and roughly 300 words per page.
        return int(num_pages * 1.5)
    
    def estimate_complexity(self, description: str, genres: List[str], num_pages: Optional[int]) -> str:
        """Estimates reading complexity on a five-point scale."""
        if not isinstance(description, str): description = ""
        
        genre_lower = {str(g).lower() for g in genres} if self.safe_len_check(genres) else set()

        # Rule-based checks from most to least specific

        # Very Hard: Academic, technical, philosophical
        if any(g in genre_lower for g in ['philosophy', 'academic', 'science', 'history']):
            if any(term in description.lower() for term in ['theoretical', 'scholarly', 'treatise', 'in-depth analysis']):
                return 'Very Hard'
            return 'Hard'

        # Very Easy: Picture books or very short children's books
        if 'picture book' in genre_lower or (num_pages and num_pages < 40 and 'childrens' in genre_lower):
            return 'Very Easy'

        # Easy: Children's chapter books and standard Young Adult
        if 'childrens' in genre_lower or 'young adult' in genre_lower:
            return 'Easy'

        # Hard: Dense literary fiction or complex non-fiction
        if 'literary fiction' in genre_lower or 'non-fiction' in genre_lower:
            if (num_pages and num_pages > 400) or len(description.split()) > 300:
                return 'Hard'

        # Default to Medium
        return 'Medium'
    
    def create_enhanced_record(self, row: pd.Series) -> (Optional[Dict], Optional[str]):
        """Create enhanced record with quality filtering, returning a skip reason."""
        # Basic info extraction
        title = self.clean_text(str(row.get('title', ''))).strip()
        if not title:
            return None, "missing_title"  # Return reason for skip
        
        contributors = self.parse_contributors(row.get('authors', []))
        authors = contributors.get('authors', ["Unknown Author"])
        translators = contributors.get('translators', [])
        illustrators = contributors.get('illustrators', [])
        
        # authors = self.parse_authors(row.get('authors', ''))
        primary_author = authors[0] if authors else "Unknown Author"
        num_pages = row.get('num_pages')
        if not num_pages:
            num_pages = 0
        
        description = self.clean_text(str(row.get('description', ''))).strip()
        genres = self.parse_list_field(row.get('genres', ''))
        
        # Calculate scores
        popularity_score = self.scorer.calculate_popularity_score(row)
        popularity_label = self.get_popularity_label(popularity_score)
        complexity = self.estimate_complexity(description, genres, num_pages)
        quality_score = self.calculate_quality_score(row, description)
        
        # Skip very low quality books
        if quality_score < self.min_quality_threshold:
            return None, "low_quality_score" # Return reason for skip

        # (The rest of the function is the same as before)
        themes = self.theme_extractor.extract_themes(description, genres)
        enhanced_record = {
            'book_id': str(row.get('book_id', '')),
            'work_id': str(row.get('work_id', '')),
            'title': title,
            'primary_author': primary_author,
            'all_authors': authors,
            'description': description if description else f"A book by {primary_author}",
            'genres': genres,
            'themes': themes,
            'popularity_score': popularity_score,
            'popularity_label': popularity_label,
            'quality_score': quality_score,
            'reading_metadata': {
                'pages': self.safe_convert_int(row.get('num_pages')),
                'reading_time_minutes': self.estimate_reading_time(self.safe_convert_int(row.get('num_pages'))),
                'complexity': complexity,
                'series': self.get_book_titles(self.parse_list_field(row.get('series', '')))
            },
            'user_engagement': {
                'avg_rating': self.safe_convert_float(row.get('average_rating')),
                'total_ratings': self.safe_convert_int(row.get('ratings_count')),
                'popular_shelves': self.parse_list_field(row.get('popular_shelves', ''))[:15],
                'shelf_count': len(self.parse_list_field(row.get('popular_shelves', '')))
            },
            'publication_info': {
                'year': self.safe_convert_int(row.get('publication_year')),
                'publisher': str(row.get('publisher', '')) if pd.notna(row.get('publisher')) and str(row.get('publisher', '')).strip() else None,
                'language': str(row.get('language_code', 'eng')) if pd.notna(row.get('language_code')) else 'eng',
                'translators': translators,
                'illustrators': illustrators
            },
            'identifiers': {
                'isbn13': str(row.get('isbn13', '')) if pd.notna(row.get('isbn13')) else '',
                'image_url': str(row.get('image_url', '')) if pd.notna(row.get('image_url')) else ''
            },
            'similar_books': self.get_book_titles(self.parse_list_field(row.get('similar_books', ''))),
            'searchable_text': self.create_searchable_text(title, primary_author, description, genres, themes, illustrators, translators)
        }
        
        return enhanced_record, None # Success, no skip reason
    
    def safe_convert_int(self, value) -> Optional[int]:
        """Safely convert value to int"""
        if pd.isna(value):
            return None
        try:
            val = float(value)
            return int(val) if val > 0 else None
        except (TypeError, ValueError):
            return None
    
    def safe_convert_float(self, value) -> float:
        """Safely convert value to float"""
        if pd.isna(value):
            return 0.0
        try:
            return float(value)
        except (TypeError, ValueError):
            return 0.0
    
    def create_targeted_chunks(self, enhanced_record: Dict) -> List[Dict]:
        # """
        # FIX: Safely handles cases where numbers for formatting might be None.
        # The previous version would cause a "processing_error" if 'pages' or
        # 'total_ratings' was missing for a book.
        # """
        # chunks = []
        # book_id = enhanced_record['book_id']
        # title = enhanced_record['title']
        # author = enhanced_record['primary_author']
        
        # # --- 1. Quick Reference Chunk ---
        # quick_text_parts = [f"Title: {title}", f"Author: {author}"]
        
        # if self.safe_len_check(enhanced_record['genres']):
        #     quick_text_parts.append(f"Genres: {', '.join(enhanced_record['genres'][:4])}")
        
        # rating = enhanced_record['user_engagement']['avg_rating']
        # rating_count = enhanced_record['user_engagement']['total_ratings']
        # # SAFE CHECK: Only format if rating_count is a number
        # if rating > 0 and rating_count is not None:
        #     quick_text_parts.append(f"Rating: {rating:.1f}/5.0 ({rating_count:,} ratings)")
        
        # # SAFE CHECK: Only format if pages is a number
        # pages = enhanced_record['reading_metadata'].get('pages')
        # if pages:
        #     quick_text_parts.append(f"Pages: {pages:,}")
        
        # quick_text_parts.append(f"Complexity: {enhanced_record['reading_metadata']['complexity']}")
        # quick_text_parts.append(f"Popularity: {enhanced_record['popularity_label']}")
        
        # if enhanced_record['publication_info'].get('year'):
        #     quick_text_parts.append(f"Published: {enhanced_record['publication_info']['year']}")

        # chunks.append({
        #     'chunk_id': f"{book_id}_quick",
        #     'text': "\n".join(quick_text_parts),
        #     'chunk_type': 'quick_reference',
        #     'book_id': book_id
        # })
        
        # # --- 2. Description Chunk ---
        # if enhanced_record['description']:
        #     desc_text = f"Book: {title} by {author}\n\nDescription: {enhanced_record['description']}"
        #     if self.safe_len_check(enhanced_record['themes']):
        #         desc_text += f"\n\nKey themes: {', '.join(enhanced_record['themes'])}"
        #     chunks.append({
        #         'chunk_id': f"{book_id}_description", 'text': desc_text,
        #         'chunk_type': 'description', 'book_id': book_id
        #     })

        # # --- 3. Discovery Chunk ---
        # discovery_text_parts = [f"{title} by {author}"]
        # if self.safe_len_check(enhanced_record['genres']):
        #     discovery_text_parts.append(f"Genres: {', '.join(enhanced_record['genres'])}")
        # if self.safe_len_check(enhanced_record['themes']):
        #     discovery_text_parts.append(f"Themed around: {', '.join(enhanced_record['themes'])}")
        
        # discovery_text_parts.append(f"Popularity: {enhanced_record['popularity_label']} ({enhanced_record['popularity_score']:.0f}/100)")
        
        # # SAFE CHECK: Only format if rating_count is a number
        # if rating > 0 and rating_count is not None:
        #     discovery_text_parts.append(f"Reader Rating: {rating:.1f}/5.0 from {rating_count:,} readers")
        
        # reading_time = enhanced_record['reading_metadata'].get('reading_time_minutes', 0)
        # if reading_time > 0:
        #     hours = reading_time // 60
        #     discovery_text_parts.append(f"Reading Time: ~{hours} hours ({enhanced_record['reading_metadata']['complexity']})")

        # raw_shelves = enhanced_record['user_engagement']['popular_shelves']
        # descriptive_shelves = self._get_descriptive_shelves(raw_shelves)
        # if descriptive_shelves:
        #     discovery_text_parts.append(f"Readers often shelve this as: {', '.join(descriptive_shelves)}")
            
        # # ADDITION: Include similar books
        # similar_books = enhanced_record['similar_books']
        # if similar_books:
        #     discovery_text_parts.append(f"You might also like: {', '.join(similar_books[:5])}")
        
        # chunks.append({
        #     'chunk_id': f"{book_id}_discovery",
        #     'text': "\n".join(discovery_text_parts),
        #     'chunk_type': 'discovery',
        #     'book_id': book_id
        # })
        
        # return chunks
        return self.chunk_generator.create_hierarchical_chunks(enhanced_record)
    
    def calculate_quality_score(self, row: pd.Series, description: str) -> float:
        """
        FIX: This is the balanced, weighted quality score function.
        The previous version was incorrectly giving every book a score of 100,
        which made the quality filter ineffective. This version provides a
        realistic score based on multiple factors.
        """
        score = 0.0
        
        # Component 1: Core Information (Max 30 points)
        if self.clean_text(str(row.get('title', ''))): score += 10
        if self.parse_authors(row.get('authors'))[0] != 'Unknown Author': score += 10
        if self.safe_len_check(self.parse_list_field(row.get('genres'))): score += 10
        
        # Component 2: Description Quality (Max 20 points)
        if description:
            if len(description) > 200: score += 20
            elif len(description) > 50: score += 10

        # Component 3: Rating Quality & Confidence (Max 40 points)
        avg_rating = self.safe_convert_float(row.get('average_rating'))
        ratings_count = self.safe_convert_int(row.get('ratings_count'))

        if avg_rating and ratings_count:
            # Scale rating score (0-20 points)
            rating_points = max(0, (avg_rating - 3.0) / (5.0 - 3.0)) * 20
            score += rating_points
            
            # Scale confidence score based on number of ratings (0-20 points)
            confidence_points = min(20, np.log10(ratings_count + 1) * 4.25)
            score += confidence_points

        # Component 4: Community Engagement (Max 10 points)
        shelf_engagement = self.calculate_shelf_engagement_score(row)
        if shelf_engagement:
            score += min(10, shelf_engagement / 10.0)
            
        return min(100.0, round(score, 1))
    
    def create_searchable_text(self, title: str, author: str, description: str, 
                              genres: List[str], themes: List[str], translators: List[str], illustrators: List[str]) -> str:
        """Create optimized searchable text"""
        parts = [title, author]
        
        if description and len(description) > 20:
            # Use first 300 characters for search to avoid overwhelming
            search_desc = description[:300] + "..." if len(description) > 300 else description
            parts.append(search_desc)
        
        # Use safe length checking for lists
        if self.safe_len_check(genres):
            parts.append(" ".join(genres))
            
        if self.safe_len_check(themes):
            parts.append(" ".join(themes))

        if self.safe_len_check(translators):
            parts.append("Translated by " + " ".join(translators))
            
        if self.safe_len_check(illustrators):
            parts.append("Illustrated by " + " ".join(illustrators))
        
        return " | ".join(parts)
    
    def debug_field_types(self, row: pd.Series, idx: int):
        """Debug helper to show field types and values"""
        fields_to_check = ['authors', 'genres', 'popular_shelves', 'series', 'similar_books']
        print(f"\n=== DEBUGGING ROW {idx} ===")
        
        for field in fields_to_check:
            value = row.get(field)
            print(f"{field}:")
            print(f"  Type: {type(value)}")
            print(f"  Value: {repr(value)}")
            
            # Check if it's pandas Series
            if isinstance(value, pd.Series):
                print(f"  Series length: {len(value)}")
                print(f"  Series empty: {value.empty}")
                print(f"  Series values: {value.values}")
            
            # Check if it's numpy array
            elif isinstance(value, np.ndarray):
                print(f"  Array shape: {value.shape}")
                print(f"  Array size: {value.size}")
                print(f"  Array contents: {value}")
            
            print()
    
    
    def process_dataset(self, df: pd.DataFrame, output_prefix: str = "optimized_books") -> Dict:
        # """
        # Process the complete dataset with detailed debugging, statistics, and file output.
        # """
        # print(f"Processing {len(df)} books with optimized pipeline...")
        # from collections import Counter  # Import Counter

        # enhanced_records = []
        # all_chunks = []
        # skip_reasons = Counter()  # Use a Counter for skip reasons

        # for idx, row in tqdm(df.iterrows(), total=len(df), desc="Processing books"):
        #     try:
        #         # Call the main function to get the record and a potential skip reason
        #         enhanced_record, reason = self.create_enhanced_record(row)

        #         if enhanced_record is None:
        #             # If the record is None, a reason should be provided
        #             # Increment the counter for that specific reason and continue
        #             skip_reasons[reason or 'unknown_reason'] += 1
        #             continue

        #         # If successful, add the record and its chunks to our lists
        #         enhanced_records.append(enhanced_record)
        #         chunks = self.create_targeted_chunks(enhanced_record)
        #         all_chunks.extend(chunks)

        #     except Exception as e:
        #         # --- DEBUGGING STEP: Print the error to see the root cause ---
        #         # This will show you the exact error for the first book that fails.
        #         print(f"\nCRITICAL ERROR at index {idx}: {e}\n")
        #         skip_reasons['processing_error'] += 1
        #         # For debugging, we can stop after the first error
        #         # break 
        #         continue

        # # --- Correctly Calculate Statistics and Build the Results Dictionary ---

        # total_skipped = sum(skip_reasons.values())
        # theme_counts = Counter()
        # chunk_type_counts = Counter(chunk['chunk_type'] for chunk in all_chunks)

        # if enhanced_records:
        #     avg_popularity = np.mean([r['popularity_score'] for r in enhanced_records])
        #     avg_quality = np.mean([r['quality_score'] for r in enhanced_records])
        #     # Calculate theme counts from the processed records
        #     for record in enhanced_records:
        #         theme_counts.update(record.get('themes', []))
        # else:
        #     # Set defaults if no records were processed
        #     avg_popularity = 0.0
        #     avg_quality = 0.0

        # # Build the final results dictionary to be returned
        # results = {
        #     'enhanced_records': enhanced_records,
        #     'targeted_chunks': all_chunks,
        #     'statistics': {
        #         'total_processed': len(enhanced_records),
        #         'total_skipped': total_skipped,
        #         'skip_reasons': dict(skip_reasons),
        #         'total_chunks': len(all_chunks),
        #         'avg_popularity_score': avg_popularity,
        #         'avg_quality_score': avg_quality,
        #         'top_themes': dict(theme_counts.most_common(10)),
        #         'chunk_types': dict(chunk_type_counts)
        #     }
        # }

        # # --- Save Results to Files ---
        # try:
        #     with open(f"{output_prefix}_enhanced.json", 'w', encoding='utf-8') as f:
        #         json.dump(enhanced_records, f, indent=2, ensure_ascii=False)

        #     with open(f"{output_prefix}_chunks.json", 'w', encoding='utf-8') as f:
        #         json.dump(all_chunks, f, indent=2, ensure_ascii=False)

        #     with open(f"{output_prefix}_stats.json", 'w', encoding='utf-8') as f:
        #         json.dump(results['statistics'], f, indent=2)
        # except Exception as e:
        #     print(f"\nError saving output files: {e}")


        # # --- Print Final Summary ---
        # print(f"\n✅ Processing Complete!")
        # print(f"📚 Processed: {len(enhanced_records)} books")
        # print(f"⚠️ Skipped: {total_skipped} books")
        # # Print detailed skip reasons
        # for reason, count in skip_reasons.items():
        #     print(f"   - {reason}: {count}")

        # print(f"📄 Created: {len(all_chunks)} chunks")
        # print(f"📊 Average Popularity Score: {avg_popularity:.1f}/100")
        # print(f"🎯 Average Quality Score: {avg_quality:.1f}/100")

        # # --- Return the complete results dictionary ---
        # return results
        print(f"Processing {len(df)} books with hierarchical chunking...")
    
        enhanced_records = []
        all_chunks = []
        skip_reasons = Counter()
        chunk_type_stats = Counter()
        
        for idx, row in tqdm(df.iterrows(), total=len(df), desc="Processing books"):
            try:
                enhanced_record, reason = self.create_enhanced_record(row)
                
                if enhanced_record is None:
                    skip_reasons[reason or 'unknown_reason'] += 1
                    continue
                
                enhanced_records.append(enhanced_record)
                
                # Use hierarchical chunks instead of targeted chunks
                chunks = self.create_targeted_chunks(enhanced_record)
                all_chunks.extend(chunks)
                
                # Track chunk type statistics
                for chunk in chunks:
                    chunk_type_stats[chunk['chunk_type']] += 1
            
            except Exception as e:
                print(f"\nError at index {idx}: {e}")
                skip_reasons['processing_error'] += 1
                continue
        
        # Calculate statistics
        total_skipped = sum(skip_reasons.values())
        theme_counts = Counter()
        
        if enhanced_records:
            avg_popularity = np.mean([r['popularity_score'] for r in enhanced_records])
            avg_quality = np.mean([r['quality_score'] for r in enhanced_records])
            
            for record in enhanced_records:
                theme_counts.update(record.get('themes', []))
        else:
            avg_popularity = avg_quality = 0.0
        
        results = {
            'enhanced_records': enhanced_records,
            'hierarchical_chunks': all_chunks,
            'statistics': {
                'total_processed': len(enhanced_records),
                'total_skipped': total_skipped,
                'skip_reasons': dict(skip_reasons),
                'total_chunks': len(all_chunks),
                'avg_popularity_score': avg_popularity,
                'avg_quality_score': avg_quality,
                'chunk_type_distribution': dict(chunk_type_stats),
                'top_themes': dict(theme_counts.most_common(10))
            }
        }
        
        # Save results
        try:
            with open(f"{output_prefix}_enhanced.json", 'w', encoding='utf-8') as f:
                json.dump(enhanced_records, f, indent=2, ensure_ascii=False)
            
            with open(f"{output_prefix}_hierarchical_chunks.json", 'w', encoding='utf-8') as f:
                json.dump(all_chunks, f, indent=2, ensure_ascii=False)
            
            with open(f"{output_prefix}_stats.json", 'w', encoding='utf-8') as f:
                json.dump(results['statistics'], f, indent=2)
        except Exception as e:
            print(f"Error saving files: {e}")
        
        # Print summary
        print(f"\n✅ Hierarchical Processing Complete!")
        print(f"📚 Processed: {len(enhanced_records)} books")
        print(f"📄 Created: {len(all_chunks)} hierarchical chunks")
        print(f"📊 Chunk type distribution: {dict(chunk_type_stats)}")
        
        return results

# if __name__ == "__main__":
#     # Load your actual dataset
#     # df = pd.read_json("data/complete_goodreads_books_authors.json", lines=True)
#     with open("data/complete_goodreads_books_authors.json", "r", encoding="utf-8") as f:
#         books = [json.loads(line) for line in f if line.strip() and line[0]!="Unknown Author"]
#     # books = books[:10]
#     df = pd.DataFrame(books)

#     print("\n--- CONVERTING DATA TYPES ---")
    
#     # List of columns that should be numeric
#     numeric_columns = [
#         'ratings_count',
#         'average_rating',
#         'num_pages',
#         'publication_year',
#         'text_reviews_count',
#         'work_id'
#     ]

#     for col in numeric_columns:
#             # Use errors='coerce' to handle any non-numeric values gracefully
#         df[col] = pd.to_numeric(df[col], errors='coerce')
#         print(f"Converted '{col}' to numeric.")

#         # Fill NaN values in key numeric columns with 0 after conversion
#     df['ratings_count'] = df['ratings_count'].fillna(0)
#     df['average_rating'] = df['average_rating'].fillna(0)
        
#     print("---------------------------\n")
    
#     # Process with optimized settings for your dataset
#     processor = StreamlinedBookRAGProcessor(min_quality_threshold=35.0)
#     sample_row_series = df.iloc[0]
#     print("\n--- Testing: clean_text ---")
#     raw_description = sample_row_series['description']
#     cleaned_description = processor.clean_text(raw_description)
#     print(f"Input: {raw_description!r}")
#     print(f"Output: {cleaned_description!r}")
#     print("-"*40)
    
#     print("\n--- Testing: safe_convert_int ---")
#     num_pages = sample_row_series['num_pages']
#     converted_int = processor.safe_convert_int(num_pages)
#     print(f"Input: {num_pages} (type: {type(num_pages).__name__})")
#     print(f"Output: {converted_int} (type: {type(converted_int).__name__})")
#     print("-"*40)

#     print("\n--- Testing: safe_convert_float ---")
#     avg_rating = sample_row_series['average_rating']
#     converted_float = processor.safe_convert_float(avg_rating)
#     print(f"Input: {avg_rating} (type: {type(avg_rating).__name__})")
#     print(f"Output: {converted_float} (type: {type(converted_float).__name__})")
#     print("-"*40)
    
#     print("\n--- Testing: parse_authors ---")
#     authors = sample_row_series['authors']
#     parsed_authors = processor.parse_authors(authors)
#     print(f"Input: {authors}")
#     print(f"Output: {parsed_authors}")
#     print("-"*40)
    
#     print("\n--- Testing: parse_list_field (for genres) ---")
#     genres = sample_row_series['genres']
#     parsed_genres = processor.parse_list_field(genres)
#     print(f"Input (string): {genres}")
#     print(f"Output: {parsed_genres}") #there is some error in this
#     print("-"*40)
    
#     print("\n--- Testing: scorer.calculate_completeness ---")
#     completeness_score = processor.scorer.calculate_completeness(sample_row_series)
#     print(f"Output Score: {completeness_score}")
#     print("-"*40)
    
#     print("\n--- Testing: scorer.calculate_shelf_engagement ---")
#     shelf_score = processor.scorer.calculate_shelf_engagement(sample_row_series)
#     print(f"Output Score: {shelf_score}")
#     print("-"*40)
    
#     print("\n--- Testing: scorer.calculate_popularity_score ---")
#     popularity_score = processor.scorer.calculate_popularity_score(sample_row_series)
#     print(f"Output Score: {popularity_score}")
#     print("-"*40)
    
#     print("\n--- Testing: theme_extractor.extract_themes ---")
#     # We use the cleaned description and parsed genres from earlier tests
#     themes = processor.theme_extractor.extract_themes(cleaned_description, parsed_genres)
#     print(f"Input Description: '{cleaned_description[:50]}...'")
#     print(f"Input Genres: {parsed_genres}")
#     print(f"Output Themes: {themes}")
#     print("-"*40)
    
#     print("\n--- Testing: calculate_quality_score ---")
#     # This is the most important one to check
#     quality_score = processor.calculate_quality_score(sample_row_series, cleaned_description)
#     print(f"Output Score: {quality_score}")
#     print("-"*40)

#     print("\n--- Testing: create_enhanced_record")
#     # This is the most important one to check
#     enhanced_recrod = processor.create_enhanced_record(sample_row_series)
#     print(f"{enhanced_recrod}")
#     print("-"*40)
    

if __name__ == "__main__":
    # Load your actual dataset
    # df = pd.read_json("data/complete_goodreads_books_authors.json", lines=True)
    with open("../data/complete_goodreads_books_authors2.json", "r", encoding="utf-8") as f:
        books = [json.loads(line) for line in f if line.strip() and line[0]!="Unknown Author"]


    df = pd.DataFrame(books)

    print("\n--- CONVERTING DATA TYPES ---")
    
    # List of columns that should be numeric
    numeric_columns = [
        'ratings_count',
        'average_rating',
        'num_pages',
        'publication_year',
        'text_reviews_count',
        'work_id'
    ]

    for col in numeric_columns:
            # Use errors='coerce' to handle any non-numeric values gracefully
        df[col] = pd.to_numeric(df[col], errors='coerce')
        print(f"Converted '{col}' to numeric.")

        # Fill NaN values in key numeric columns with 0 after conversion
    df['ratings_count'] = df['ratings_count'].fillna(0)
    df['average_rating'] = df['average_rating'].fillna(0)
        
    print("---------------------------\n")
    
    # Process with optimized settings for your dataset
    processor = StreamlinedBookRAGProcessor(min_quality_threshold=35.0)
    results = processor.process_dataset(df, "final_optimized")
    
    print("\n" + "="*60)
    print("SAMPLE RESULTS")
    print("="*60)
    
    print(f"\nProcessing Summary:")
    print(f"- Total books processed: {results['statistics']['total_processed']}")
    print(f"- Books skipped (low quality): {results['statistics']['total_skipped']}")
    print(f"- Chunks created: {results['statistics']['total_chunks']}")
    
    if results['enhanced_records']:
        print(f"\nSample Enhanced Record:")
        sample_record = results['enhanced_records'][0]
        print(f"Title: {sample_record['title']}")
        print(f"Author: {sample_record['primary_author']}")
        print(f"Themes: {sample_record['themes']}")
        print(f"Popularity Score: {sample_record['popularity_score']:.1f}")
        print(f"Quality Score: {sample_record['quality_score']:.1f}")
        
        print(f"\nSample Chunks:")
        for i, chunk in enumerate(results['targeted_chunks'][:3]):
            print(f"\n--- {chunk['chunk_type'].upper()} CHUNK ---")
            print(chunk['text'][:200] + "..." if len(chunk['text']) > 200 else chunk['text'])
    
    print(f"\nTop Themes Found: {list(results['statistics']['top_themes'].keys())}")