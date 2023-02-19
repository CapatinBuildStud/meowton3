import random
from sympy import symbols, integrate, Function, exp, sin, cos
import json

# Create a list to store the functions and their integral
functions = []

# Define the symbols to use in the functions
x = symbols('x')

# Generate 10k random functions
for i in range(10000):
    # Generate a random expression for the function
    expr = 0
    # Randomly select the type of function to generate
    function_type = random.choice(['polynomial', 'exponential', 'trigonometric', 'rational'])
    if function_type == 'polynomial':
        for j in range(random.randint(1, 5)):
            coef = random.randint(1, 10)
            power = random.randint(1, 3)
            expr += coef * x ** power
    elif function_type == 'exponential':
        coef = random.randint(1, 10)
        power = random.randint(1, 3)
        expr = coef * exp(power * x)
    elif function_type == 'trigonometric':
        coef = random.randint(1, 10)
        freq = random.randint(1, 5)
        if random.random() < 0.5:
            expr = coef * sin(freq * x)
        else:
            expr = coef * cos(freq * x)
    elif function_type == 'rational':
        num_coef = [random.randint(1, 10) for j in range(random.randint(1, 3))]
        den_coef = [random.randint(1, 10) for j in range(random.randint(1, 3))]
        num_expr = sum([coef * x ** j for j, coef in enumerate(num_coef)])
        den_expr = sum([coef * x ** j for j, coef in enumerate(den_coef)])
        expr = num_expr / den_expr
    
    # Compute the integral of the function
    try:
        integral = integrate(expr, x)
    except NotImplementedError:
        continue

    # Add the function and its integral to the list
    functions.append((expr, integral))

# Export the functions and their integrals to a JSON file
data = []
for func, integral in functions:
    prompt = "f'(x) = {}, f(x) = ".format(func)
    completion = "{} + C".format(integral)
    data.append('{"prompt": "' + prompt + '\n\n###\n\n", "completion": " ' + completion + '###"}')

with open("integrals.txt", "w") as f:
    for i in data:
        f.write(i + "\n")