equations = 'output.txt'

def reorder(equation):
	completion = (equation.split())[4]
	prompt = ' '.join([equation.split()[0], equation.split()[1], equation.split()[2], equation.split()[3]])
	output = '{"prompt": "' + prompt + '\n\n###\n\n", "completion": " ' + completion + '###"}'

	return output

with open(equations, "r") as inp:
	with open("finetune.jsonl", "w+") as outp:
		for line in inp:
			outp.write(reorder(str(line)) + '\n')