import chromadb
import json
import os
import shutil

# 1. Determine Paths
current_dir = os.path.dirname(os.path.abspath(__file__))
db_path = os.path.join(current_dir, "medical_db_v2")
json_path = os.path.join(current_dir, "processed_nhsrc.json")

# RESET DB for fresh start (Safety to remove old schema)
if os.path.exists(db_path):
    print(f"🗑️ Clearing old database at {db_path}...")
    shutil.rmtree(db_path)

# Initialize Client
db_client = chromadb.PersistentClient(path=db_path)

# 2. Setup GATE 1: The Golden Gate (Precision)
golden_coll = db_client.get_or_create_collection(name="golden_collection")

# 3. Setup GATE 2: The Reference Gate (Intelligence)
reference_coll = db_client.get_or_create_collection(name="reference_collection")

def setup():
    if not os.path.exists(json_path):
        print(f"❌ Error: {json_path} not found. Run preprocess_pdf.py first.")
        return

    print(f"📖 Reading {json_path}...")
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    print(f"📦 Loading {len(data)} items into ChromaDB...")

    # Batch lists for efficiency
    ref_ids, ref_docs, ref_metas = [], [], []
    gold_ids, gold_docs, gold_metas = [], [], []

    for item in data:
        # Reference Data
        ref_ids.append(item['id'])
        ref_docs.append(item['content'])
        ref_metas.append(item['metadata'])

        # Golden Data
        if item['metadata'].get('is_golden'):
            golden_rule = item['metadata'].get('golden_rule_content')
            if golden_rule:
                gold_ids.append(f"{item['id']}_GOLD")
                gold_docs.append(golden_rule)
                gold_metas.append(item['metadata'])

    # Bulk Upsert
    if ref_ids:
        reference_coll.upsert(ids=ref_ids, documents=ref_docs, metadatas=ref_metas)
    if gold_ids:
        golden_coll.upsert(ids=gold_ids, documents=gold_docs, metadatas=gold_metas)

    print(f"✅ Golden Collection: {golden_coll.count()} rules")
    print(f"✅ Reference Collection: {reference_coll.count()} chunks")
    print(f"📍 DB Location: {db_path}")
    print("Technical Execution: Tiered Collections are now READY!")

if __name__ == "__main__":
    setup()