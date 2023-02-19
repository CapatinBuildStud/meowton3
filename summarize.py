import torch
import json
import os
from transformers import T5Tokenizer, T5ForConditionalGeneration, T5Config

model = T5ForConditionalGeneration.from_pretrained('t5-small')
tokenizer = T5Tokenizer.from_pretrained('t5-small')
device = torch.device('cpu')

with open('scraped_data.csv', 'r') as f:
    with open('summaries.csv', 'w+') as g:
        for line in f:
            line_list = line.split('\t')
            text = line_list[3]
            text_shortened = ''
            i = 0

            for word in text:
                if i > 1024:
                    break
                text_shortened += word
                i += 1

            preprocess_text = text_shortened.strip().replace("\n","")
            t5_prepared_Text = "summarize: "+ preprocess_text

            tokenized_text = tokenizer.encode(t5_prepared_Text, return_tensors="pt").to(device)


            # summmarize 
            summary_ids = model.generate(tokenized_text,
                                                num_beams=4,
                                                no_repeat_ngram_size=2,
                                                min_length=30,
                                                max_length=120,
                                                early_stopping=True)

            output = tokenizer.decode(summary_ids[0], skip_special_tokens=True)
            g.write(f"{line_list[0]}\t{line_list[1]}\t{line_list[2]}\t{output}")