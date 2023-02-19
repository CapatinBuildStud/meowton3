from sentence_transformers import SentenceTransformer, util
import torch

embedder = SentenceTransformer('all-MiniLM-L6-v2')

def best_text(corpus, query):
    all_sentences = {}
    i = 0

    for t in corpus:
        text_sentences = t.split('. ')
        for s in text_sentences:
            all_sentences[s] = i
        i += 1

    corpus_embeddings = embedder.encode(list(all_sentences.keys()), convert_to_tensor=True)

    # Find the closest 5 sentences of the corpus for each query sentence based on cosine similarity
    query_embedding = embedder.encode(query, convert_to_tensor=True)

    # We use cosine-similarity and torch.topk to rank the scores
    cos_scores = util.cos_sim(query_embedding, corpus_embeddings)[0]
    top_results = torch.topk(cos_scores, k=len(list(all_sentences.keys())))

    text_score_list = {}
    text_score = {}

    for rank, text in zip(range(len(all_sentences.keys())-1), all_sentences.values()):
        if text not in text_score_list.keys():
            text_score_list[text] = [rank]
        else:
            text_score_list[text].append(rank)

    for i in text_score_list.keys():
        text_score[i] = sum(text_score_list[i]) / len(text_score_list[i])

    sorted_scores = dict(sorted(text_score.items(), key=lambda item: item[1]))

    return min(sorted_scores, key=sorted_scores.get)

def best_file(texts, query):
    corpus = []
    link_list = []
    source_list = []
    type_list = []

    with open(texts, 'r') as f:
        for line in texts:
            corpus.append(line.split('\t')[3])
            link_list.append(line.split('\t')[0])
            source_list.append(line.split('\t')[1])
            type_list.append(line.split('\t')[2])

    i = best_text(corpus, query)

    return link_list[i], source_list[i], type_list[i]





