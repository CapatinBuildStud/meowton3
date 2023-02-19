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

    temp_top_dict = {}

    for i in range(len(list(top_results[1]))):
        temp_top_dict[top_results[1][i].item()] = i

    sentence_list = list(all_sentences.values())

    #for i in range(len(top_list)-1):
    #    print(top_list[i], sentence_list[i])

    #print(all_sentences)

    text_score_list = {}
    text_score = {}

    for i in range(len(temp_top_dict.keys())-1):
        text = sentence_list[i]
        if text not in text_score_list.keys():
            text_score_list[text] = [temp_top_dict[i]]
        else:
            text_score_list[text].append(temp_top_dict[i])

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
        for line in f:
            corpus.append(line.split('\t')[3])
            link_list.append(line.split('\t')[0])
            source_list.append(line.split('\t')[1])
            type_list.append(line.split('\t')[2])

    i = best_text(corpus, query)

    return link_list[i], source_list[i], type_list[i]