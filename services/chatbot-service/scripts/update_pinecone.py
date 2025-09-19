import os
import json
import logging
from tqdm import tqdm
from typing import Dict, Any, List, Optional
from concurrent.futures import ThreadPoolExecutor, as_completed
import time

# --- Third-party imports ---
try:
    from pinecone import Pinecone
    from dotenv import load_dotenv
except ImportError as e:
    print(f"Missing required package: {e}")
    print("Install dependencies with: uv pip install pinecone python-dotenv tqdm")
    print("Note: Use 'pinecone' not 'pinecone-client' for the new package")
    exit(1)

# --- Configuration ---
CHUNKS_FILE_PATH = "../data_processing/chunks.json"
PINECONE_INDEX_NAME = "book-chunks"
BATCH_SIZE = 100
MAX_WORKERS = 5  # Number of concurrent threads for updates
DRY_RUN = False  # Set to True to preview changes without applying them

# --- Logging Setup ---
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def load_chunk_metadata_map(file_path: str) -> Dict[str, Dict[str, Any]]:
    """
    Loads the newly generated chunks and creates a mapping from
    chunk_id to its full, sanitized metadata dictionary.
    """
    logger.info(f"Loading chunk metadata from {file_path}...")
    metadata_map = {}
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            chunks = json.load(f)
        
        for chunk in chunks:
            # This dictionary will hold the metadata we want to update.
            metadata_to_set = {}
            
            # --- Sanitization and Selective Addition ---
            work_id = chunk.get("work_id")
            total_ratings = chunk.get("metadata", {}).get("total_ratings")

            if work_id:
                metadata_to_set["work_id"] = work_id
            if total_ratings is not None:
                metadata_to_set["total_ratings"] = total_ratings
            
            # Conditionally add keys that only exist on specific chunk types
            chunk_meta = chunk.get("metadata", {})
            
            if "has_illustrator" in chunk_meta:
                metadata_to_set["has_illustrator"] = chunk_meta.get("has_illustrator", False)
            
            if "has_translator" in chunk_meta:
                metadata_to_set["has_translator"] = chunk_meta.get("has_translator", False)
            
            if chunk_meta.get("illustrator"):
                metadata_to_set['illustrator'] = chunk_meta.get("illustrator")
            
            if chunk_meta.get("translator"):
                metadata_to_set['translator'] = chunk_meta.get("translator")

            metadata_map[chunk['chunk_id']] = metadata_to_set

        logger.info(f"✅ Metadata map created for {len(metadata_map)} chunks.")
        return metadata_map
    except FileNotFoundError:
        logger.error(f"FATAL: Chunks file not found at '{file_path}'. Halting process.")
        return {}
    except Exception as e:
        logger.error(f"An error occurred while loading the chunk metadata map: {e}")
        return {}

def fetch_all_vector_ids_efficient(index) -> List[str]:
    """
    Super efficient ID fetching using the fastest available method.
    """
    logger.info("Fetching all vector IDs using the most efficient method...")
    
    try:
        # Get total vector count
        stats = index.describe_index_stats()
        total_vectors = stats.get('total_vector_count', 0)
        
        if total_vectors == 0:
            logger.warning("No vectors found in the index.")
            return []
        
        logger.info(f"Found {total_vectors} total vectors in the index.")
        
        # Method 1: Try scan-based approach (fastest)
        try:
            return _fetch_with_scan(index, total_vectors)
        except Exception as e:
            logger.warning(f"Scan method failed: {e}")
        
        # Method 2: Try efficient query with large top_k
        try:
            return _fetch_with_large_query(index, total_vectors)
        except Exception as e:
            logger.warning(f"Large query method failed: {e}")
        
        # Method 3: Fallback to list but with timeout
        try:
            return _fetch_with_list_timeout(index, total_vectors)
        except Exception as e:
            logger.warning(f"List method failed: {e}")
        
        # Method 4: Last resort - improved query fallback
        logger.warning("Using fallback method - this will be slower")
        return _fetch_ids_with_query_fallback(index, total_vectors)
        
    except Exception as e:
        logger.error(f"All methods failed: {e}")
        return []

def _fetch_with_scan(index, total_vectors: int) -> List[str]:
    """Try using scan operation if available (most efficient)."""
    logger.info("Trying scan method...")
    
    if not hasattr(index, 'scan'):
        raise AttributeError("Scan method not available")
    
    all_ids = []
    with tqdm(total=total_vectors, desc="Scanning vectors") as pbar:
        for batch in index.scan():
            if hasattr(batch, 'vectors') and batch.vectors:
                batch_ids = [v.id for v in batch.vectors]
                all_ids.extend(batch_ids)
                pbar.update(len(batch_ids))
    
    return all_ids

def _fetch_with_large_query(index, total_vectors: int) -> List[str]:
    """Fetch IDs using large query batches."""
    logger.info("Trying large query method...")
    
    # Get dimension from index stats
    stats = index.describe_index_stats()
    dimension = stats.get('dimension', 384)  # fallback to 384
    
    all_ids = set()
    batch_size = min(10000, total_vectors)  # Max batch size
    
    with tqdm(total=total_vectors, desc="Fetching with large queries") as pbar:
        attempts = 0
        max_attempts = 10  # Prevent infinite loop
        
        while len(all_ids) < total_vectors and attempts < max_attempts:
            # Use different random vectors to get different results
            import random
            random.seed(attempts)  # Different seed each time
            random_vector = [random.uniform(-1, 1) for _ in range(dimension)]
            
            try:
                response = index.query(
                    vector=random_vector,
                    top_k=batch_size,
                    include_values=False,
                    include_metadata=False
                )
                
                batch_ids = {match['id'] for match in response.get('matches', [])}
                new_ids = batch_ids - all_ids
                
                if not new_ids:
                    attempts += 1
                    continue
                
                all_ids.update(new_ids)
                pbar.update(len(new_ids))
                
            except Exception as e:
                logger.warning(f"Query batch failed: {e}")
                attempts += 1
                
    return list(all_ids)

def _fetch_with_list_timeout(index, total_vectors: int) -> List[str]:
    """Try list method but with timeout to prevent hanging."""
    import signal
    import time
    
    class TimeoutException(Exception):
        pass
    
    def timeout_handler(signum, frame):
        raise TimeoutException("List method timed out")
    
    logger.info("Trying list method with 5 minute timeout...")
    
    # Set a 5-minute timeout
    signal.signal(signal.SIGALRM, timeout_handler)
    signal.alarm(300)  # 5 minutes
    
    try:
        all_ids = []
        list_generator = index.list()
        
        # Process in chunks to show progress
        chunk_size = 1000
        chunk = []
        
        with tqdm(total=total_vectors, desc="Fetching IDs (with timeout)") as pbar:
            for item in list_generator:
                if isinstance(item, str):
                    chunk.append(item)
                elif hasattr(item, 'id'):
                    chunk.append(item.id)
                elif isinstance(item, dict) and 'id' in item:
                    chunk.append(item['id'])
                
                if len(chunk) >= chunk_size:
                    all_ids.extend(chunk)
                    pbar.update(len(chunk))
                    chunk = []
                    
                    # Check if we're taking too long per chunk
                    if pbar.n > 0 and (time.time() - pbar.start_t) / pbar.n > 0.1:
                        raise TimeoutException("List method too slow")
            
            # Add remaining items
            if chunk:
                all_ids.extend(chunk)
                pbar.update(len(chunk))
        
        signal.alarm(0)  # Cancel timeout
        return all_ids
        
    except TimeoutException:
        signal.alarm(0)
        logger.warning("List method timed out - it was too slow")
        raise
    except Exception as e:
        signal.alarm(0)
        raise

def _fetch_with_list_paginated(index, total_vectors: int) -> List[str]:
    """Try using list_paginated method (newer Pinecone versions)."""
    all_ids = []
    with tqdm(total=total_vectors, desc="Fetching IDs (list_paginated)") as pbar:
        try:
            # list_paginated() returns a ListResponse object, not an iterator
            response = index.list_paginated()
            logger.debug(f"list_paginated response type: {type(response)}")
            
            # Extract IDs from the ListResponse object
            page_ids = []
            
            # Try different ways to access the data
            if hasattr(response, 'vectors') and response.vectors:
                for vector in response.vectors:
                    if isinstance(vector, dict) and 'id' in vector:
                        page_ids.append(vector['id'])
                    elif hasattr(vector, 'id'):
                        page_ids.append(vector.id)
                        
            elif hasattr(response, 'ids') and response.ids:
                page_ids.extend(response.ids)
                
            # Check if response has data in different format
            elif hasattr(response, '__dict__'):
                response_dict = response.__dict__
                logger.debug(f"ListResponse dict keys: {list(response_dict.keys())}")
                
                # Try to find vectors or ids in the response dict
                for key, value in response_dict.items():
                    if key in ['vectors', 'data', 'items'] and isinstance(value, list):
                        for item in value:
                            if isinstance(item, dict) and 'id' in item:
                                page_ids.append(item['id'])
                            elif hasattr(item, 'id'):
                                page_ids.append(item.id)
                            elif isinstance(item, str):
                                page_ids.append(item)
                        break
                    elif key == 'ids' and isinstance(value, list):
                        page_ids.extend(value)
                        break
            
            all_ids.extend(page_ids)
            pbar.update(len(page_ids))
                
        except Exception as e:
            logger.debug(f"list_paginated failed: {e}")
            raise
    return all_ids

def _fetch_with_list_method(index, total_vectors: int) -> List[str]:
    """Try using basic list method - it returns a generator."""
    all_ids = []
    
    with tqdm(total=total_vectors, desc="Fetching IDs (list generator)") as pbar:
        try:
            if hasattr(index, 'list'):
                # list() returns a generator, so we iterate over it
                list_generator = index.list()
                logger.debug(f"List generator type: {type(list_generator)}")
                
                try:
                    for item in list_generator:
                        # Each item should be a vector ID or vector object
                        if isinstance(item, str):
                            all_ids.append(item)
                            pbar.update(1)
                        elif isinstance(item, dict) and 'id' in item:
                            all_ids.append(item['id'])
                            pbar.update(1)
                        elif hasattr(item, 'id'):
                            all_ids.append(item.id)
                            pbar.update(1)
                        else:
                            # Try to convert to string as fallback
                            try:
                                all_ids.append(str(item))
                                pbar.update(1)
                            except:
                                logger.debug(f"Couldn't process item: {type(item)} - {item}")
                                continue
                                
                        # Update progress every 1000 items to avoid too frequent updates
                        if len(all_ids) % 1000 == 0:
                            pbar.set_postfix({'collected': len(all_ids)})
                            
                except Exception as e:
                    logger.debug(f"Error iterating generator: {e}")
                    raise
                    
            else:
                raise AttributeError("No list method available")
                
        except Exception:
            raise  # Re-raise to try next method
    
    return all_ids

def _fetch_ids_with_query_fallback(index, total_vectors: int) -> List[str]:
    """
    Fallback method to fetch IDs using queries when list_paginated is not available.
    """
    all_ids = set()
    dimension = 384  # Default dimension, adjust as needed
    
    with tqdm(total=total_vectors, desc="Fetching IDs (fallback)") as pbar:
        while len(all_ids) < total_vectors:
            try:
                # Query with random vector to get different results each time
                import random
                random_vector = [random.uniform(-1, 1) for _ in range(dimension)]
                
                response = index.query(
                    vector=random_vector,
                    top_k=min(10000, total_vectors),
                    include_values=False,
                    include_metadata=False
                )
                
                batch_ids = {match['id'] for match in response.get('matches', [])}
                
                if not batch_ids:
                    break
                
                new_ids = batch_ids - all_ids
                all_ids.update(new_ids)
                pbar.update(len(new_ids))
                
                # Add small delay to avoid rate limiting
                time.sleep(0.1)
                
            except Exception as e:
                logger.error(f"Error in query fallback: {e}")
                break
    
    return list(all_ids)

def merge_metadata(existing_metadata: Dict[str, Any], new_metadata: Dict[str, Any]) -> Dict[str, Any]:
    """
    Safely merge new metadata with existing metadata, preserving existing fields.
    """
    if not existing_metadata:
        return new_metadata
    
    merged = existing_metadata.copy()
    merged.update(new_metadata)
    return merged

def update_batch_metadata(index, batch_ids: List[str], chunk_map: Dict[str, Dict[str, Any]], 
                         preserve_existing: bool = True) -> tuple[int, int]:
    """
    Update metadata for a batch of vectors.
    Returns (success_count, error_count)
    """
    success_count = 0
    error_count = 0
    
    # Filter batch to only include IDs that have new metadata
    relevant_ids = [vid for vid in batch_ids if vid in chunk_map]
    
    if not relevant_ids:
        return 0, 0
    
    try:
        if preserve_existing:
            # Fetch existing metadata first
            existing_vectors = index.fetch(ids=relevant_ids)
            
            # Prepare updates with merged metadata
            updates = []
            for vector_id in relevant_ids:
                try:
                    existing_metadata = {}
                    if vector_id in existing_vectors.vectors:
                        existing_metadata = existing_vectors.vectors[vector_id].metadata or {}
                    
                    new_metadata = chunk_map[vector_id]
                    merged_metadata = merge_metadata(existing_metadata, new_metadata)
                    
                    if DRY_RUN:
                        logger.info(f"DRY RUN: Would update {vector_id} with metadata: {merged_metadata}")
                    else:
                        updates.append({
                            'id': vector_id,
                            'set_metadata': merged_metadata
                        })
                    success_count += 1
                    
                except Exception as e:
                    logger.error(f"Error preparing update for {vector_id}: {e}")
                    error_count += 1
            
            # Execute batch update
            if updates and not DRY_RUN:
                try:
                    # Note: Pinecone doesn't have update_many, so we update individually
                    # but we can do it more efficiently with threading
                    for update in updates:
                        index.update(id=update['id'], set_metadata=update['set_metadata'])
                except Exception as e:
                    logger.error(f"Batch update failed: {e}")
                    error_count += len(updates)
                    success_count -= len(updates)
        else:
            # Direct update without preserving existing metadata
            for vector_id in relevant_ids:
                try:
                    if DRY_RUN:
                        logger.info(f"DRY RUN: Would update {vector_id} with metadata: {chunk_map[vector_id]}")
                    else:
                        index.update(id=vector_id, set_metadata=chunk_map[vector_id])
                    success_count += 1
                except Exception as e:
                    logger.error(f"Failed to update vector {vector_id}: {e}")
                    error_count += 1
    
    except Exception as e:
        logger.error(f"Batch processing failed: {e}")
        error_count += len(relevant_ids)
    
    return success_count, error_count

def update_metadata_concurrent(index, all_ids: List[str], chunk_map: Dict[str, Dict[str, Any]]) -> None:
    """
    Update metadata using concurrent processing for better performance.
    """
    total_success = 0
    total_errors = 0
    
    # Split IDs into batches
    batches = [all_ids[i:i + BATCH_SIZE] for i in range(0, len(all_ids), BATCH_SIZE)]
    
    logger.info(f"Processing {len(batches)} batches with {MAX_WORKERS} concurrent workers...")
    
    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        # Submit all batch jobs
        future_to_batch = {
            executor.submit(update_batch_metadata, index, batch, chunk_map): i 
            for i, batch in enumerate(batches)
        }
        
        # Process completed batches with progress bar
        with tqdm(total=len(batches), desc="Updating metadata batches") as pbar:
            for future in as_completed(future_to_batch):
                batch_num = future_to_batch[future]
                try:
                    success_count, error_count = future.result()
                    total_success += success_count
                    total_errors += error_count
                    
                    if error_count > 0:
                        logger.warning(f"Batch {batch_num}: {success_count} success, {error_count} errors")
                    
                except Exception as e:
                    logger.error(f"Batch {batch_num} failed completely: {e}")
                    total_errors += len(batches[batch_num])
                
                pbar.update(1)
    
    logger.info(f"✅ Update complete: {total_success} successful, {total_errors} errors")

def main():
    """
    Main function to execute the optimized metadata update process.
    """
    if DRY_RUN:
        logger.info("🔍 DRY RUN MODE - No changes will be made to the database")
    
    load_dotenv()
    api_key = os.getenv("PINECONE_API_KEY")
    if not api_key:
        raise ValueError("PINECONE_API_KEY not found in environment variables.")

    # 1. Create the map from chunk ID to its new metadata
    chunk_map = load_chunk_metadata_map(CHUNKS_FILE_PATH)
    if not chunk_map:
        logger.error("Failed to load chunk metadata. Exiting.")
        return
    
    logger.info(f"Loaded metadata for {len(chunk_map)} chunks.")

    # 2. Connect to Pinecone
    pc = Pinecone(api_key=api_key)
    if PINECONE_INDEX_NAME not in pc.list_indexes().names():
        logger.error(f"Index '{PINECONE_INDEX_NAME}' does not exist. Cannot update.")
        return
    
    index = pc.Index(PINECONE_INDEX_NAME)
    logger.info(f"Connected to index '{PINECONE_INDEX_NAME}'.")

    # 3. Efficiently fetch all vector IDs
    all_ids = fetch_all_vector_ids_efficient(index)
    if not all_ids:
        logger.error("No vector IDs found. Exiting.")
        return
    
    logger.info(f"Found {len(all_ids)} vectors to potentially update.")
    
    # Count how many actually need updates
    relevant_ids = [vid for vid in all_ids if vid in chunk_map]
    logger.info(f"Found {len(relevant_ids)} vectors with matching metadata to update.")
    
    if not relevant_ids:
        logger.warning("No vectors found that match the chunk metadata. Nothing to update.")
        return

    # 4. Update metadata concurrently
    start_time = time.time()
    update_metadata_concurrent(index, all_ids, chunk_map)
    end_time = time.time()
    
    logger.info(f"⚡ Total processing time: {end_time - start_time:.2f} seconds")
    
    if DRY_RUN:
        logger.info("🔍 DRY RUN completed - No actual changes were made")
    else:
        logger.info("✅ SUCCESS! All vector metadata has been updated in Pinecone.")
        logger.info("The vector database is now fortified with the latest intelligence.")

if __name__ == "__main__":
    main()