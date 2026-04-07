// Comprehensive course data with learning paths and assessments
export const courseData = {
  cpp: {
    title: 'C++ Programming',
    description: 'Master C++ from basics to advanced concepts',
    subtopics: {
      basics: {
        title: 'C++ Basics',
        lessons: [
          { id: 1, type: 'text', content: 'Welcome to C++! C++ is a powerful programming language that supports object-oriented programming, low-level memory manipulation, and high performance.' },
          { id: 2, type: 'code', language: 'cpp', content: '#include <iostream>\nint main() {\n    std::cout << "Hello, World!" << std::endl;\n    return 0;\n}' },
          { id: 3, type: 'text', content: 'C++ programs start execution from the main() function. The return value 0 indicates successful program execution.' },
          { id: 4, type: 'code', language: 'cpp', content: '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello World!";\n    return 0;\n}' },
          { id: 5, type: 'text', content: 'Variables in C++ must be declared with their data type before use. Common data types include int, float, double, char, and bool.' },
          { id: 6, type: 'code', language: 'cpp', content: 'int age = 25;\nfloat height = 5.9f;\ndouble pi = 3.14159;\nchar grade = \'A\';\nbool isStudent = true;' },
          { id: 7, type: 'quiz', question: 'What is the correct way to declare an integer variable in C++?', options: ['int num = 5;', 'integer num = 5;', 'num = 5;', 'var num = 5;'], correctAnswer: 'int num = 5;', explanation: 'In C++, variables must be declared with their data type. int specifies an integer type.' },
          { id: 8, type: 'quiz', question: 'What does the main() function return in C++?', options: ['void', 'int', 'string', 'char'], correctAnswer: 'int', explanation: 'The main() function in C++ returns an integer value, typically 0 for success.' },
          { id: 9, type: 'quiz', question: 'Which header file is needed for input/output operations?', options: ['<string>', '<vector>', '<iostream>', '<algorithm>'], correctAnswer: '<iostream>', explanation: 'The <iostream> header provides cin and cout for input/output operations.' },
          { id: 10, type: 'quiz', question: 'What is the purpose of the using namespace std; statement?', options: ['To include all standard libraries', 'To avoid writing std:: before standard objects', 'To declare variables', 'To define functions'], correctAnswer: 'To avoid writing std:: before standard objects', explanation: 'using namespace std; allows you to use cout, cin, etc. without the std:: prefix.' },
          { id: 11, type: 'quiz', question: 'Which of these is NOT a valid C++ data type?', options: ['int', 'float', 'string', 'number'], correctAnswer: 'number', explanation: 'C++ does not have a built-in "number" type. Use int, float, double, etc. instead.' },
          { id: 12, type: 'quiz', question: 'What is the output of cout << "Hello";?', options: ['Hello', 'Error', 'Nothing', 'Hello\n'], correctAnswer: 'Hello', explanation: 'cout displays the text "Hello" to the console output.' }
        ]
      },
      controlFlow: {
        title: 'Control Flow',
        lessons: [
          { id: 13, type: 'text', content: 'Control flow statements allow programs to make decisions and repeat actions. The if-else statement executes code based on conditions.' },
          { id: 14, type: 'code', language: 'cpp', content: 'int age = 18;\nif (age >= 18) {\n    cout << "Adult" << endl;\n} else {\n    cout << "Minor" << endl;\n}' },
          { id: 15, type: 'text', content: 'The for loop is used when you know how many times to repeat. It consists of initialization, condition, and increment.' },
          { id: 16, type: 'code', language: 'cpp', content: 'for (int i = 0; i < 5; i++) {\n    cout << i << " ";\n}\n// Output: 0 1 2 3 4' },
          { id: 17, type: 'text', content: 'The while loop continues as long as the condition is true. Be careful to avoid infinite loops!' },
          { id: 18, type: 'code', language: 'cpp', content: 'int count = 0;\nwhile (count < 3) {\n    cout << "Count: " << count << endl;\n    count++;\n}' },
          { id: 19, type: 'quiz', question: 'What is the output of: for(int i=1; i<=3; i++) cout << i;', options: ['123', '012', '321', 'Error'], correctAnswer: '123', explanation: 'The loop starts at 1 and prints 1, 2, 3 before stopping.' },
          { id: 20, type: 'quiz', question: 'Which loop is guaranteed to execute at least once?', options: ['for', 'while', 'do-while', 'none'], correctAnswer: 'do-while', explanation: 'do-while checks the condition after executing the loop body.' },
          { id: 21, type: 'quiz', question: 'What keyword is used to exit a loop prematurely?', options: ['stop', 'end', 'break', 'exit'], correctAnswer: 'break', explanation: 'The break statement immediately terminates the loop.' },
          { id: 22, type: 'quiz', question: 'In an if-else statement, what happens if the condition is false?', options: ['Nothing', 'Error occurs', 'else block executes', 'Program crashes'], correctAnswer: 'else block executes', explanation: 'If the if condition is false, the else block (if present) will execute.' },
          { id: 23, type: 'quiz', question: 'What is the correct syntax for a while loop?', options: ['while condition { }', 'while (condition) { }', 'while condition:', 'while [condition]'], correctAnswer: 'while (condition) { }', explanation: 'While loops use parentheses around the condition and curly braces for the body.' },
          { id: 24, type: 'quiz', question: 'What will happen if you forget to increment the counter in a while loop?', options: ['Loop runs once', 'Infinite loop', 'Compilation error', 'Loop never runs'], correctAnswer: 'Infinite loop', explanation: 'Without incrementing, the condition never becomes false, creating an infinite loop.' }
        ]
      },
      functions: {
        title: 'Functions',
        lessons: [
          { id: 25, type: 'text', content: 'Functions allow you to organize code into reusable blocks. A function declaration tells the compiler about the function, while the definition contains the actual code.' },
          { id: 26, type: 'code', language: 'cpp', content: 'int add(int a, int b) {\n    return a + b;\n}\n\nint main() {\n    int result = add(5, 3);\n    cout << result; // Output: 8\n}' },
          { id: 27, type: 'text', content: 'Function parameters are passed by value by default in C++. Changes to parameters inside the function don\'t affect the original variables.' },
          { id: 28, type: 'code', language: 'cpp', content: 'void increment(int x) {\n    x++;\n    cout << "Inside function: " << x << endl;\n}\n\nint main() {\n    int num = 5;\n    increment(num);\n    cout << "Outside function: " << num << endl;\n}' },
          { id: 29, type: 'text', content: 'Function overloading allows multiple functions with the same name but different parameters. The compiler chooses the correct function based on arguments.' },
          { id: 30, type: 'code', language: 'cpp', content: 'int max(int a, int b) {\n    return (a > b) ? a : b;\n}\n\ndouble max(double a, double b) {\n    return (a > b) ? a : b;\n}' },
          { id: 31, type: 'quiz', question: 'What is the purpose of a function declaration?', options: ['Execute code', 'Tell compiler about function', 'Define function logic', 'Call the function'], correctAnswer: 'Tell compiler about function', explanation: 'Function declarations provide the compiler with function signatures before they are defined.' },
          { id: 32, type: 'quiz', question: 'What does void return type indicate?', options: ['Returns integer', 'Returns nothing', 'Returns string', 'Returns boolean'], correctAnswer: 'Returns nothing', explanation: 'void functions do not return any value.' },
          { id: 33, type: 'quiz', question: 'How are parameters passed by default in C++?', options: ['By reference', 'By value', 'By pointer', 'By address'], correctAnswer: 'By value', explanation: 'By default, C++ passes parameters by value, creating copies of the arguments.' },
          { id: 34, type: 'quiz', question: 'What is function overloading?', options: ['Multiple functions with same name', 'Functions calling each other', 'Recursive functions', 'Inline functions'], correctAnswer: 'Multiple functions with same name', explanation: 'Function overloading allows multiple functions with the same name but different parameter lists.' },
          { id: 35, type: 'quiz', question: 'What keyword is used to return a value from a function?', options: ['send', 'give', 'return', 'output'], correctAnswer: 'return', explanation: 'The return statement sends a value back to the calling function.' },
          { id: 36, type: 'quiz', question: 'Can a function be called before it is defined?', options: ['Always', 'Never', 'Only if declared', 'Only in main'], correctAnswer: 'Only if declared', explanation: 'A function can be called before definition if it has been declared (prototyped) earlier.' }
        ]
      },
      oop: {
        title: 'Object-Oriented Programming',
        lessons: [
          { id: 37, type: 'text', content: 'Object-Oriented Programming (OOP) is based on four pillars: Encapsulation, Inheritance, Polymorphism, and Abstraction.' },
          { id: 38, type: 'code', language: 'cpp', content: 'class Car {\nprivate:\n    string brand;\n    int year;\npublic:\n    void setBrand(string b) { brand = b; }\n    string getBrand() { return brand; }\n};' },
          { id: 39, type: 'text', content: 'Inheritance allows a class to inherit properties and methods from another class. The derived class can add new features or override existing ones.' },
          { id: 40, type: 'code', language: 'cpp', content: 'class Vehicle {\npublic:\n    void start() { cout << "Engine started" << endl; }\n};\n\nclass Car : public Vehicle {\npublic:\n    void drive() { cout << "Car is driving" << endl; }\n};' },
          { id: 41, type: 'text', content: 'Polymorphism allows objects of different classes to be treated as objects of a common base class. Function overriding is a form of runtime polymorphism.' },
          { id: 42, type: 'code', language: 'cpp', content: 'class Animal {\npublic:\n    virtual void makeSound() { cout << "Some sound" << endl; }\n};\n\nclass Dog : public Animal {\npublic:\n    void makeSound() override { cout << "Woof!" << endl; }\n};' },
          { id: 43, type: 'quiz', question: 'What are the four pillars of OOP?', options: ['Classes, Objects, Methods, Variables', 'Encapsulation, Inheritance, Polymorphism, Abstraction', 'Functions, Loops, Arrays, Pointers', 'Syntax, Semantics, Logic, Algorithms'], correctAnswer: 'Encapsulation, Inheritance, Polymorphism, Abstraction', explanation: 'The four fundamental principles of Object-Oriented Programming are Encapsulation, Inheritance, Polymorphism, and Abstraction.' },
          { id: 44, type: 'quiz', question: 'What is encapsulation?', options: ['Hiding data and methods', 'Inheriting from base class', 'Multiple forms of function', 'Creating objects'], correctAnswer: 'Hiding data and methods', explanation: 'Encapsulation is the bundling of data and methods that operate on that data within a single unit (class).' },
          { id: 45, type: 'quiz', question: 'Which keyword is used for inheritance in C++?', options: ['extends', 'inherits', 'public', ':'], correctAnswer: ':', explanation: 'The colon (:) is used in C++ for inheritance, like class Derived : public Base.' },
          { id: 46, type: 'quiz', question: 'What is polymorphism?', options: ['Multiple inheritance', 'Multiple classes', 'Same interface, different behavior', 'Data hiding'], correctAnswer: 'Same interface, different behavior', explanation: 'Polymorphism allows objects of different classes to be treated as objects of a common base class.' },
          { id: 47, type: 'quiz', question: 'What does the virtual keyword do?', options: ['Makes function static', 'Enables polymorphism', 'Creates abstract class', 'Hides data'], correctAnswer: 'Enables polymorphism', explanation: 'Virtual functions enable runtime polymorphism by allowing derived classes to override base class methods.' },
          { id: 48, type: 'quiz', question: 'What is a constructor?', options: ['Function to destroy objects', 'Function called when object is created', 'Function to copy objects', 'Function to compare objects'], correctAnswer: 'Function called when object is created', explanation: 'Constructors are special member functions called automatically when an object is created.' }
        ]
      },
      pointers: {
        title: 'Pointers and Memory',
        lessons: [
          { id: 49, type: 'text', content: 'Pointers are variables that store memory addresses. They are powerful but require careful handling to avoid memory errors.' },
          { id: 50, type: 'code', language: 'cpp', content: 'int num = 42;\nint* ptr = &num; // ptr stores address of num\ncout << *ptr; // Output: 42 (dereferencing)' },
          { id: 51, type: 'text', content: 'Dynamic memory allocation allows you to allocate memory at runtime using new and deallocate using delete.' },
          { id: 52, type: 'code', language: 'cpp', content: 'int* arr = new int[5]; // Allocate array of 5 integers\narr[0] = 10;\ndelete[] arr; // Deallocate memory' },
          { id: 53, type: 'text', content: 'References provide an alias to an existing variable. They must be initialized when declared and cannot be changed to refer to another variable.' },
          { id: 54, type: 'code', language: 'cpp', content: 'int num = 5;\nint& ref = num; // ref is an alias for num\nref = 10; // num becomes 10\ncout << num; // Output: 10' },
          { id: 55, type: 'quiz', question: 'What operator is used to get the address of a variable?', options: ['*', '&', '@', '#'], correctAnswer: '&', explanation: 'The address-of operator (&) returns the memory address of a variable.' },
          { id: 56, type: 'quiz', question: 'What does the * operator do when used with pointers?', options: ['Multiplication', 'Dereferencing', 'Declaration', 'Assignment'], correctAnswer: 'Dereferencing', explanation: 'When used with pointers, * accesses the value at the memory address stored in the pointer.' },
          { id: 57, type: 'quiz', question: 'What is dynamic memory allocation?', options: ['Memory allocated at compile time', 'Memory allocated at runtime', 'Memory in stack', 'Memory in heap'], correctAnswer: 'Memory allocated at runtime', explanation: 'Dynamic memory allocation uses new/delete to allocate/deallocate memory during program execution.' },
          { id: 58, type: 'quiz', question: 'What happens if you forget to delete dynamically allocated memory?', options: ['Program crashes', 'Memory leak', 'Compilation error', 'Nothing'], correctAnswer: 'Memory leak', explanation: 'Forgetting to delete causes memory leaks, where memory cannot be reused until program ends.' },
          { id: 59, type: 'quiz', question: 'Can references be null?', options: ['Yes', 'No', 'Sometimes', 'Only in arrays'], correctAnswer: 'No', explanation: 'References must always refer to valid objects and cannot be null.' },
          { id: 60, type: 'quiz', question: 'What is the difference between pointers and references?', options: ['No difference', 'Pointers can be null, references cannot', 'References can be null, pointers cannot', 'Pointers are faster'], correctAnswer: 'Pointers can be null, references cannot', explanation: 'Pointers can be null or uninitialized, while references must always refer to valid objects.' }
        ]
      },
      fileio: {
        title: 'File I/O',
        lessons: [
          { id: 61, type: 'text', content: 'File I/O allows programs to read from and write to files. C++ provides fstream library for file operations.' },
          { id: 62, type: 'code', language: 'cpp', content: '#include <fstream>\n#include <iostream>\nusing namespace std;\n\nint main() {\n    ofstream outFile("example.txt");\n    outFile << "Hello, File!";\n    outFile.close();\n}' },
          { id: 63, type: 'text', content: 'Reading from files is done using ifstream. You can read line by line or read the entire file.' },
          { id: 64, type: 'code', language: 'cpp', content: 'ifstream inFile("example.txt");\nstring line;\nwhile (getline(inFile, line)) {\n    cout << line << endl;\n}\ninFile.close();' },
          { id: 65, type: 'text', content: 'fstream provides both input and output operations. You can open files in different modes like append, binary, etc.' },
          { id: 66, type: 'code', language: 'cpp', content: 'fstream file;\nfile.open("data.txt", ios::app); // Open in append mode\nfile << "New data" << endl;\nfile.close();' },
          { id: 67, type: 'quiz', question: 'Which header file is needed for file operations?', options: ['<iostream>', '<fstream>', '<string>', '<vector>'], correctAnswer: '<fstream>', explanation: 'The <fstream> header provides classes like ifstream, ofstream, and fstream for file I/O.' },
          { id: 68, type: 'quiz', question: 'What does ofstream stand for?', options: ['Output file stream', 'Open file stream', 'Object file stream', 'Ordered file stream'], correctAnswer: 'Output file stream', explanation: 'ofstream is used for writing to files (output file stream).' },
          { id: 69, type: 'quiz', question: 'What does ifstream stand for?', options: ['Input file stream', 'Internal file stream', 'Integer file stream', 'Interactive file stream'], correctAnswer: 'Input file stream', explanation: 'ifstream is used for reading from files (input file stream).' },
          { id: 70, type: 'quiz', question: 'What is the purpose of ios::app mode?', options: ['Create new file', 'Append to existing file', 'Read only', 'Binary mode'], correctAnswer: 'Append to existing file', explanation: 'ios::app opens the file in append mode, adding new data to the end of existing content.' },
          { id: 71, type: 'quiz', question: 'What should you always do after file operations?', options: ['Delete file', 'Close the file', 'Rename file', 'Copy file'], correctAnswer: 'Close the file', explanation: 'Always close files after operations to ensure data is written and resources are freed.' },
          { id: 72, type: 'quiz', question: 'What function is used to read an entire line from a file?', options: ['read()', 'getline()', 'get()', 'extract()'], correctAnswer: 'getline()', explanation: 'getline() reads an entire line from the input stream, including spaces.' }
        ]
      }
    }
  },
  python: {
    title: 'Python Programming',
    description: 'Learn Python for data science, web development, and automation',
    subtopics: {
      basics: {
        title: 'Python Basics',
        lessons: [
          { id: 73, type: 'text', content: 'Python is a high-level, interpreted programming language known for its simplicity and readability. It uses indentation for code blocks instead of braces.' },
          { id: 74, type: 'code', language: 'python', content: 'print("Hello, World!")\n\n# Variables\name = "Alice"\nage = 25\nheight = 5.6\n\nprint(f"My name is {name}, I am {age} years old.")' },
          { id: 75, type: 'text', content: 'Python has dynamic typing, meaning you don\'t need to declare variable types. It supports multiple data types including strings, numbers, lists, and dictionaries.' },
          { id: 76, type: 'code', language: 'python', content: '# Different data types\ninteger_num = 42\nfloat_num = 3.14\nstring_text = "Hello"\nboolean_val = True\n\nprint(type(integer_num))  # <class \'int\'>\nprint(type(float_num))   # <class \'float\'>' },
          { id: 77, type: 'text', content: 'Python uses meaningful indentation to define code blocks. Consistent indentation (usually 4 spaces) is crucial for Python code.' },
          { id: 78, type: 'code', language: 'python', content: 'if age >= 18:\n    print("Adult")\n    print("Can vote")\nelse:\n    print("Minor")\n    print("Cannot vote")' },
          { id: 79, type: 'quiz', question: 'What is the output of print(2 + 3 * 4)?', options: ['20', '14', '24', 'Error'], correctAnswer: '14', explanation: 'Python follows operator precedence: multiplication before addition, so 3*4=12, then 2+12=14.' },
          { id: 80, type: 'quiz', question: 'Which of these is NOT a valid Python variable name?', options: ['my_var', 'my-var', '_private', '123var'], correctAnswer: 'my-var', explanation: 'Variable names cannot contain hyphens. Use underscores instead.' },
          { id: 81, type: 'quiz', question: 'What does the type() function return?', options: ['Variable value', 'Variable type', 'Variable name', 'Variable size'], correctAnswer: 'Variable type', explanation: 'type() returns the data type of the variable as a type object.' },
          { id: 82, type: 'quiz', question: 'How do you write comments in Python?', options: ['// comment', '/* comment */', '# comment', '-- comment'], correctAnswer: '# comment', explanation: 'Python uses # for single-line comments.' },
          { id: 83, type: 'quiz', question: 'What is the result of 10 // 3 in Python?', options: ['3.33', '3', '4', 'Error'], correctAnswer: '3', explanation: 'The // operator performs floor division, returning the integer part of the division.' },
          { id: 84, type: 'quiz', question: 'Which keyword is used for string formatting in Python?', options: ['format', 'f-string', 'printf', 'Both format and f-string'], correctAnswer: 'Both format and f-string', explanation: 'Python supports both .format() method and f-strings for string formatting.' }
        ]
      },
      dataStructures: {
        title: 'Data Structures',
        lessons: [
          { id: 85, type: 'text', content: 'Python has built-in data structures: lists (mutable sequences), tuples (immutable sequences), dictionaries (key-value pairs), and sets (unique elements).' },
          { id: 86, type: 'code', language: 'python', content: '# Lists\nfruits = ["apple", "banana", "orange"]\nfruits.append("grape")\nprint(fruits[0])  # apple\n\n# Tuples\ncoordinates = (10, 20)\nprint(coordinates[1])  # 20' },
          { id: 87, type: 'text', content: 'Lists are mutable and can contain different data types. They support indexing, slicing, and various methods like append(), insert(), remove().' },
          { id: 88, type: 'code', language: 'python', content: 'numbers = [1, 2, 3, 4, 5]\nprint(numbers[1:4])  # [2, 3, 4]\nnumbers.insert(0, 0)\nprint(numbers)  # [0, 1, 2, 3, 4, 5]' },
          { id: 89, type: 'text', content: 'Dictionaries store key-value pairs. Keys must be immutable, values can be any type. They provide fast lookups and are very useful for structured data.' },
          { id: 90, type: 'code', language: 'python', content: 'student = {\n    "name": "Alice",\n    "age": 20,\n    "grades": [85, 90, 88]\n}\nprint(student["name"])  # Alice\nstudent["major"] = "Computer Science"' },
          { id: 91, type: 'quiz', question: 'Which data structure is immutable in Python?', options: ['List', 'Dictionary', 'Tuple', 'Set'], correctAnswer: 'Tuple', explanation: 'Tuples cannot be modified after creation, making them immutable.' },
          { id: 92, type: 'quiz', question: 'How do you access the last element of a list?', options: ['list[-1]', 'list[last]', 'list.end()', 'list.final()'], correctAnswer: 'list[-1]', explanation: 'Negative indexing allows accessing elements from the end, with -1 being the last element.' },
          { id: 93, type: 'quiz', question: 'What is the main difference between lists and tuples?', options: ['Size', 'Speed', 'Mutability', 'Syntax'], correctAnswer: 'Mutability', explanation: 'Lists are mutable (can be changed), while tuples are immutable (cannot be changed).' },
          { id: 94, type: 'quiz', question: 'How do you add an item to the end of a list?', options: ['add()', 'push()', 'append()', 'insert()'], correctAnswer: 'append()', explanation: 'append() adds an item to the end of the list.' },
          { id: 95, type: 'quiz', question: 'What type of keys can dictionaries have?', options: ['Only strings', 'Only numbers', 'Immutable types', 'Any type'], correctAnswer: 'Immutable types', explanation: 'Dictionary keys must be immutable (strings, numbers, tuples), not mutable (lists, dictionaries).' },
          { id: 96, type: 'quiz', question: 'How do you check if a key exists in a dictionary?', options: ['key in dict', 'dict.has_key()', 'dict.contains()', 'dict.exists()'], correctAnswer: 'key in dict', explanation: 'The "in" operator checks if a key exists in the dictionary.' }
        ]
      },
      functions: {
        title: 'Functions',
        lessons: [
          { id: 97, type: 'text', content: 'Functions in Python are defined using the def keyword. They can take parameters and return values. Functions help organize code into reusable blocks.' },
          { id: 98, type: 'code', language: 'python', content: 'def greet(name):\n    return f"Hello, {name}!"\n\nmessage = greet("Alice")\nprint(message)  # Hello, Alice!' },
          { id: 99, type: 'text', content: 'Python functions can have default parameter values and can return multiple values using tuples.' },
          { id: 100, type: 'code', language: 'python', content: 'def calculate(a, b, operation="add"):\n    if operation == "add":\n        return a + b\n    elif operation == "multiply":\n        return a * b\n\nprint(calculate(5, 3))  # 8\nprint(calculate(5, 3, "multiply"))  # 15' },
          { id: 101, type: 'text', content: 'Python supports lambda functions (anonymous functions) for simple operations. They are often used with functions like map(), filter(), and sorted().' },
          { id: 102, type: 'code', language: 'python', content: 'square = lambda x: x ** 2\nprint(square(5))  # 25\n\nnumbers = [1, 2, 3, 4, 5]\nsquares = list(map(lambda x: x**2, numbers))\nprint(squares)  # [1, 4, 9, 16, 25]' },
          { id: 103, type: 'quiz', question: 'What keyword is used to define a function in Python?', options: ['function', 'def', 'func', 'define'], correctAnswer: 'def', explanation: 'The def keyword is used to define functions in Python.' },
          { id: 104, type: 'quiz', question: 'Can Python functions return multiple values?', options: ['No', 'Yes, using tuples', 'Yes, using lists', 'Only one value'], correctAnswer: 'Yes, using tuples', explanation: 'Python functions can return multiple values as a tuple.' },
          { id: 105, type: 'quiz', question: 'What is a lambda function?', options: ['Named function', 'Anonymous function', 'Recursive function', 'Built-in function'], correctAnswer: 'Anonymous function', explanation: 'Lambda functions are small anonymous functions defined with the lambda keyword.' },
          { id: 106, type: 'quiz', question: 'What happens if a function doesn\'t have a return statement?', options: ['Error', 'Returns None', 'Returns 0', 'Returns empty string'], correctAnswer: 'Returns None', explanation: 'Functions without return statements implicitly return None.' },
          { id: 107, type: 'quiz', question: 'How do you define default parameter values?', options: ['param = default', 'default param', 'param: default', 'param -> default'], correctAnswer: 'param = default', explanation: 'Default parameter values are defined using the assignment operator (=).' },
          { id: 108, type: 'quiz', question: 'What is the scope of a variable defined inside a function?', options: ['Global', 'Local to function', 'Module level', 'Class level'], correctAnswer: 'Local to function', explanation: 'Variables defined inside functions have local scope and are not accessible outside.' }
        ]
      },
      oop: {
        title: 'Object-Oriented Programming',
        lessons: [
          { id: 109, type: 'text', content: 'Python supports object-oriented programming with classes and objects. Classes are blueprints for creating objects.' },
          { id: 110, type: 'code', language: 'python', content: 'class Dog:\n    def __init__(self, name, breed):\n        self.name = name\n        self.breed = breed\n    \n    def bark(self):\n        return f"{self.name} says woof!"\n\nmy_dog = Dog("Buddy", "Golden Retriever")\nprint(my_dog.bark())  # Buddy says woof!' },
          { id: 111, type: 'text', content: 'The __init__ method is a constructor that initializes object attributes. The self parameter refers to the instance of the class.' },
          { id: 112, type: 'code', language: 'python', content: 'class Car:\n    def __init__(self, make, model, year):\n        self.make = make\n        self.model = model\n        self.year = year\n        self.mileage = 0\n    \n    def drive(self, miles):\n        self.mileage += miles\n        return f"Driven {miles} miles"\n\nmy_car = Car("Toyota", "Camry", 2020)\nprint(my_car.drive(100))  # Driven 100 miles' },
          { id: 113, type: 'text', content: 'Inheritance allows a class to inherit attributes and methods from another class. Python supports multiple inheritance.' },
          { id: 114, type: 'code', language: 'python', content: 'class Animal:\n    def speak(self):\n        return "Some sound"\n\nclass Dog(Animal):\n    def speak(self):\n        return "Woof!"\n\nclass Cat(Animal):\n    def speak(self):\n        return "Meow!"\n\ndog = Dog()\nprint(dog.speak())  # Woof!' },
          { id: 115, type: 'quiz', question: 'What is the purpose of the __init__ method?', options: ['Create class', 'Initialize object', 'Define methods', 'Delete object'], correctAnswer: 'Initialize object', explanation: 'The __init__ method is called when an object is created and initializes its attributes.' },
          { id: 116, type: 'quiz', question: 'What does self refer to in a class method?', options: ['The class', 'The method', 'The object instance', 'Global scope'], correctAnswer: 'The object instance', explanation: 'self refers to the current instance of the class.' },
          { id: 117, type: 'quiz', question: 'How is inheritance implemented in Python?', options: ['extends', 'inherits', 'Parentheses after class name', 'import'], correctAnswer: 'Parentheses after class name', explanation: 'Inheritance is specified by putting the parent class name in parentheses after the child class name.' },
          { id: 118, type: 'quiz', question: 'What is method overriding?', options: ['Creating new methods', 'Redefining inherited methods', 'Deleting methods', 'Hiding methods'], correctAnswer: 'Redefining inherited methods', explanation: 'Method overriding allows a child class to provide a specific implementation of a method from its parent class.' },
          { id: 119, type: 'quiz', question: 'Can Python classes have multiple inheritance?', options: ['No', 'Yes', 'Only two parents', 'Only with interfaces'], correctAnswer: 'Yes', explanation: 'Python supports multiple inheritance, allowing a class to inherit from multiple parent classes.' },
          { id: 120, type: 'quiz', question: 'What is encapsulation in OOP?', options: ['Data hiding', 'Method creation', 'Object creation', 'Class definition'], correctAnswer: 'Data hiding', explanation: 'Encapsulation is the bundling of data and methods that operate on that data, often with access control.' }
        ]
      },
      filehandling: {
        title: 'File Handling',
        lessons: [
          { id: 121, type: 'text', content: 'Python provides built-in functions for file operations. The open() function is used to open files in different modes.' },
          { id: 122, type: 'code', language: 'python', content: '# Writing to a file\nwith open("example.txt", "w") as file:\n    file.write("Hello, World!\\n")\n    file.write("This is a text file.\\n")\n\nprint("File written successfully")' },
          { id: 123, type: 'text', content: 'The with statement ensures files are properly closed after operations. It\'s the recommended way to handle files.' },
          { id: 124, type: 'code', language: 'python', content: '# Reading from a file\nwith open("example.txt", "r") as file:\n    content = file.read()\n    print(content)\n\n# Reading line by line\nwith open("example.txt", "r") as file:\n    for line in file:\n        print(line.strip())' },
          { id: 125, type: 'text', content: 'Python can handle different file modes: "r" for reading, "w" for writing, "a" for appending, "r+" for reading and writing.' },
          { id: 126, type: 'code', language: 'python', content: '# Appending to a file\nwith open("example.txt", "a") as file:\n    file.write("This line is appended.\\n")\n\n# Reading and writing\nwith open("data.txt", "w+") as file:\n    file.write("Initial data\\n")\n    file.seek(0)  # Go back to beginning\n    print(file.read())' },
          { id: 127, type: 'quiz', question: 'What is the purpose of the with statement for file handling?', options: ['Faster reading', 'Automatic file closing', 'Better formatting', 'Error handling'], correctAnswer: 'Automatic file closing', explanation: 'The with statement automatically closes the file when the block is exited, even if an exception occurs.' },
          { id: 128, type: 'quiz', question: 'What does the "w" mode do when opening a file?', options: ['Read only', 'Write (overwrite)', 'Append', 'Read and write'], correctAnswer: 'Write (overwrite)', explanation: '"w" mode opens the file for writing and overwrites existing content or creates a new file.' },
          { id: 129, type: 'quiz', question: 'How do you read an entire file at once?', options: ['readline()', 'readlines()', 'read()', 'get()'], correctAnswer: 'read()', explanation: 'The read() method reads the entire file content as a single string.' },
          { id: 130, type: 'quiz', question: 'What does readlines() return?', options: ['Single string', 'List of lines', 'First line only', 'File size'], correctAnswer: 'List of lines', explanation: 'readlines() returns a list where each element is a line from the file.' },
          { id: 131, type: 'quiz', question: 'What mode should you use to append to an existing file?', options: ['w', 'r', 'a', 'x'], correctAnswer: 'a', explanation: '"a" mode opens the file for appending, adding new content to the end of existing content.' },
          { id: 132, type: 'quiz', question: 'What happens if you try to open a non-existent file in "r" mode?', options: ['Creates file', 'Returns None', 'Raises FileNotFoundError', 'Opens empty file'], correctAnswer: 'Raises FileNotFoundError', explanation: 'Opening a non-existent file in read mode raises a FileNotFoundError exception.' }
        ]
      },
      modules: {
        title: 'Modules and Packages',
        lessons: [
          { id: 133, type: 'text', content: 'Modules are Python files containing functions, classes, and variables. They help organize code and promote reusability.' },
          { id: 134, type: 'code', language: 'python', content: '# Creating a module (in mymodule.py)\ndef greet(name):\n    return f"Hello, {name}!"\n\nPI = 3.14159\n\n# Using the module\nimport mymodule\nprint(mymodule.greet("Alice"))  # Hello, Alice!\nprint(mymodule.PI)  # 3.14159' },
          { id: 135, type: 'text', content: 'You can import specific items from modules or use aliases to make code more readable.' },
          { id: 136, type: 'code', language: 'python', content: '# Different import methods\nfrom math import sqrt, pi\nimport math as m\nfrom datetime import datetime as dt\n\nprint(sqrt(16))  # 4.0\nprint(m.sin(m.pi/2))  # 1.0\nprint(dt.now())' },
          { id: 137, type: 'text', content: 'Packages are directories containing multiple modules. They use __init__.py files to define package structure.' },
          { id: 138, type: 'code', language: 'python', content: '# Package structure:\n# mypackage/\n#   __init__.py\n#   module1.py\n#   module2.py\n\n# Using packages\nimport mypackage.module1\nmypackage.module1.function()\n\nfrom mypackage import module1\nmodule1.function()' },
          { id: 139, type: 'quiz', question: 'What is a Python module?', options: ['A function', 'A class', 'A .py file with code', 'A package'], correctAnswer: 'A .py file with code', explanation: 'A module is any Python file (.py) that contains executable code, functions, classes, or variables.' },
          { id: 140, type: 'quiz', question: 'How do you import an entire module?', options: ['from module import *', 'import module', 'use module', 'load module'], correctAnswer: 'import module', explanation: 'The import statement loads the entire module, and you access its contents using dot notation.' },
          { id: 141, type: 'quiz', question: 'What does "from math import sqrt" do?', options: ['Imports entire math module', 'Imports only sqrt function', 'Imports all functions', 'Creates alias'], correctAnswer: 'Imports only sqrt function', explanation: 'This imports only the sqrt function from the math module, making it available directly.' },
          { id: 142, type: 'quiz', question: 'What is the purpose of __init__.py?', options: ['Initialize variables', 'Define package', 'Run startup code', 'Import modules'], correctAnswer: 'Define package', explanation: '__init__.py files tell Python that a directory should be treated as a package.' },
          { id: 143, type: 'quiz', question: 'Can modules contain classes?', options: ['No', 'Yes', 'Only functions', 'Only variables'], correctAnswer: 'Yes', explanation: 'Modules can contain functions, classes, variables, and any other Python code.' },
          { id: 144, type: 'quiz', question: 'What happens when you import the same module multiple times?', options: ['Error', 'Module loaded multiple times', 'Module loaded once', 'Memory leak'], correctAnswer: 'Module loaded once', explanation: 'Python caches imported modules, so importing the same module multiple times loads it only once.' }
        ]
      }
    }
  }
};

// Helper function to get all courses
export const getAllCourses = () => {
  return Object.keys(courseData).map(key => ({
    id: key,
    ...courseData[key]
  }));
};

// Helper function to get course by ID
export const getCourseById = (courseId) => {
  return courseData[courseId] || null;
};

// Helper function to get subtopic by course and subtopic ID
export const getSubtopicById = (courseId, subtopicId) => {
  const course = courseData[courseId];
  return course ? course.subtopics[subtopicId] : null;
};

// Helper function to get lessons for a subtopic
export const getLessonsForSubtopic = (courseId, subtopicId) => {
  const subtopic = getSubtopicById(courseId, subtopicId);
  return subtopic ? subtopic.lessons : [];
};
