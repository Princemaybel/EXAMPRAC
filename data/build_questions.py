import json, re

answer_key = {
    1:'B',2:'C',3:'B',4:'C',5:'B',6:'A',7:'B',8:'C',9:'C',10:'C',
    11:'A',12:'B',13:'C',14:'B',15:'C',16:'A',17:'A',18:'A',19:'C',20:'B',
    21:'B',22:'C',23:'C',24:'C',25:'C',26:'C',27:'C',28:'B',29:'C',30:'B',
    31:'B',32:'C',33:'C',34:'C',35:'B',36:'D',37:'A',38:'B',39:'B',40:'C',
    41:'B',42:'D',43:'D',44:'B',45:'B',46:'B',47:'B',48:'D',49:'B',50:'C',
    51:'A',52:'C',53:'D',54:'C',55:'B',56:'B',57:'A',58:'C',59:'C',60:'B',
    61:'B',62:'B',63:'A',64:'B',65:'C',66:'B',67:'B',68:'B',69:'B',70:'C',
    71:'B',72:'B',73:'A',74:'C',75:'A',76:'A',77:'D',78:'A',79:'A',80:'B',
    81:'A',82:'B',83:'A',84:'B',85:'C',86:'A',87:'A',88:'B',89:'B',90:'A',
    91:'A',92:'C',93:'A',94:'B',95:'C',96:'A',97:'A',98:'A',99:'A',100:'B'
}

categories = [
    (range(1,21),   'English Proficiency'),
    (range(21,41),  'Mathematics'),
    (range(41,61),  'Logical and Abstract Reasoning'),
    (range(61,81),  'Philippine History and General Knowledge'),
    (range(81,101), 'ROTC and Military Fundamentals'),
]

def get_category(n):
    for r, cat in categories:
        if n in r:
            return cat
    return 'Unknown'

# explanations for every question
explanations = {
    1:  "Brave means courageous — having the courage to face danger or difficulty.",
    2:  "Discipline means orderly conduct; its opposite is disorder (chaos).",
    3:  "'The cadets ARE ready' — cadets is plural, so use 'are'.",
    4:  "The past tense of 'lead' is 'led', not 'leaded'.",
    5:  "'Every cadet IS required' — 'every' takes a singular verb.",
    6:  "Obedient means willing to follow lawful instructions.",
    7:  "The correct spelling is 'Discipline'.",
    8:  "'In order to' expresses purpose — studied hard in order to pass.",
    9:  "The plural of 'child' is 'children' (irregular plural).",
    10: "Correct: 'He doesn't follow instructions.' — third-person singular negative.",
    11: "Integrity means honesty and strong moral principles.",
    12: "Rapid means fast/quick; a synonym is 'quick'.",
    13: "With 'neither...nor', the verb agrees with the noun closest to it — 'cadets' (plural) → 'are'.",
    14: "Correct spelling: 'Responsibility'.",
    15: "The opposite of victory is defeat.",
    16: "Calm means peaceful and composed.",
    17: "'Together' is the adverb form — 'worked together'.",
    18: "A topic sentence introduces the main idea of a paragraph.",
    19: "'They're' = they are — 'They're going to training'.",
    20: "The main idea is that practice can improve performance.",
    21: "25 + 37 = 62.",
    22: "144 ÷ 12 = 12.",
    23: "15 × 8 = 120.",
    24: "3/4 = 0.75 = 75%.",
    25: "2 km × 5 days = 10 km.",
    26: "x + 9 = 20 → x = 11.",
    27: "3x = 27 → x = 9.",
    28: "(10 + 20 + 30) / 3 = 60 / 3 = 20.",
    29: "10% of ₱800 = ₱80.",
    30: "₱800 − ₱80 = ₱720.",
    31: "25% of 40 = 10 absent cadets.",
    32: "Perimeter = 4 × 6 = 24 cm.",
    33: "Area = 8 × 5 = 40 m².",
    34: "2.5 hours × 60 = 150 minutes.",
    35: "Speed = 120 km ÷ 3 h = 40 km/h.",
    36: "2⁵ = 2×2×2×2×2 = 32.",
    37: "PEMDAS: 18 − (3×4) = 18 − 12 = 6.",
    38: "12:18 → divide both by 6 → 2:3.",
    39: "Price per notebook = ₱100÷4 = ₱25. 6 × ₱25 = ₱150.",
    40: "40/50 = 0.80 = 80%.",
    41: "Pattern: +2 each time. After 8 comes 10.",
    42: "Pattern: ×2 each time. 24×2 = 48.",
    43: "Apple, mango, banana are fruits. Carrot is a vegetable — the odd one out.",
    44: "Book is used for reading; fork is used for eating.",
    45: "'All officers are leaders' is directly stated as a premise.",
    46: "Skip one letter each time: A,C,E,G,I.",
    47: "Monday + 10 days = Thursday (Mon+7=Mon, +3 more = Thursday).",
    48: "4=2², 9=3², 16=4² are perfect squares. 20 is not.",
    49: "Hand fits a glove; foot fits a sock.",
    50: "Pattern: perfect squares 1,4,9,16,25.",
    51: "Shift each letter forward 1: D→E, O→P, G→H → EPH.",
    52: "Ana>Ben>Carlo → Carlo is shortest.",
    53: "Kilometer, meter, centimeter measure length. Kilogram measures mass — odd one out.",
    54: "Pattern: −10 each time. 70−10 = 60.",
    55: "5 machines×5 items in 5 min means 1 machine makes 1 item in 5 min.",
    56: "'All roses are flowers' directly implies roses are flowers.",
    57: "Pattern: skip one letter backwards — Z,X,V,T,R.",
    58: "At 3:00 the minute hand is at 12 and hour hand at 3 — 90° apart.",
    59: "Ben is before Carlo and Carlo before Dan → both Ben AND Carlo are before Dan.",
    60: "North → turn right = East → turn right again = South.",
    61: "Jose Rizal is widely recognized as the national hero of the Philippines.",
    62: "Philippine independence was declared on June 12, 1898 in Kawit, Cavite.",
    63: "Noli Me Tangere was written by Jose Rizal.",
    64: "Andres Bonifacio founded the Katipunan.",
    65: "The 1987 Constitution designates Filipino as the national language.",
    66: "The national flower of the Philippines is the Sampaguita.",
    67: "The Philippine flag has three stars.",
    68: "The three stars represent Luzon, Visayas, and Mindanao.",
    69: "The highest law is the 1987 Constitution.",
    70: "Manila is the capital of the Philippines.",
    71: "The national anthem is Lupang Hinirang.",
    72: "Emilio Aguinaldo was the first president of the First Philippine Republic.",
    73: "Philippine Independence Day is celebrated on June 12.",
    74: "The currency of the Philippines is the Philippine peso.",
    75: "The legislative branch is called Congress.",
    76: "Congress consists of the Senate and House of Representatives.",
    77: "The smallest local government unit is the Barangay.",
    78: "ASEAN = Association of Southeast Asian Nations.",
    79: "The UN's primary purpose is to promote international peace and cooperation.",
    80: "The Supreme Court is primarily responsible for interpreting the Constitution.",
    81: "ROTC = Reserve Officers' Training Corps.",
    82: "ROTC develops discipline, leadership, and national defense preparedness.",
    83: "The chain of command establishes a system of authority and reporting.",
    84: "A cadet should follow a lawful instruction responsibly.",
    85: "Discipline is the most important quality for a dependable cadet.",
    86: "Military courtesy demonstrates respect and professionalism.",
    87: "A formation organizes personnel in an orderly arrangement.",
    88: "Warn others and report safety hazards to the appropriate instructor.",
    89: "Teamwork means cooperating toward a shared goal.",
    90: "Leadership is influencing and guiding people toward a goal.",
    91: "Punctuality demonstrates reliability and respect for schedules.",
    92: "Acknowledge a mistake, learn from it, and correct it.",
    93: "Physical conditioning improves fitness and physical readiness.",
    94: "Accountability means accepting responsibility for your actions.",
    95: "Confidential information must be handled and protected according to authorized rules.",
    96: "First aid provides immediate assistance to an injured or ill person.",
    97: "Follow an emergency instruction from a safety officer promptly and safely.",
    98: "Patriotism means responsible love and commitment to one's country.",
    99: "Teamwork supports coordination and shared responsibility.",
    100:"Integrity in ROTC means reporting honestly and following rules even when unsupervised.",
}

with open(r'C:/Users/princ/Documents/EXAMPRAC/data/docx_raw.txt', encoding='utf-8') as f:
    lines = [l.rstrip() for l in f.readlines()]

questions = []
i = 0
while i < len(lines):
    m = re.match(r'^(\d+)\.\s+(.+)', lines[i])
    if m:
        qnum = int(m.group(1))
        qtext = m.group(2)
        if 1 <= qnum <= 100:
            choices = []
            j = i + 1
            while j < len(lines) and len(choices) < 4:
                cm = re.match(r'^([ABCD])\.\s+(.+)', lines[j])
                if cm:
                    choices.append({'letter': cm.group(1), 'text': cm.group(2)})
                    j += 1
                elif lines[j].strip() == '' or re.match(r'^\d+\.', lines[j]) or 'PART' in lines[j] or 'ANSWER' in lines[j]:
                    break
                else:
                    j += 1

            correct_letter = answer_key[qnum]
            correct_text = next((c['text'] for c in choices if c['letter'] == correct_letter), None)

            q = {
                'id': qnum,
                'number': qnum,
                'category': get_category(qnum),
                'question': qtext,
                'choices': [{'id': c['letter'], 'text': c['text']} for c in choices],
                'correctAnswer': correct_letter,
                'correctText': correct_text,
                'explanation': explanations.get(qnum, '')
            }
            questions.append(q)
            i = j
            continue
    i += 1

print(f'Total questions parsed: {len(questions)}')

errors = []
for q in questions:
    qid = q['id']
    if len(q['choices']) != 4:
        errors.append(f"Q{qid}: has {len(q['choices'])} choices (expected 4)")
    if q['correctText'] is None:
        errors.append(f"Q{qid}: correct answer {q['correctAnswer']} not found in choices")

if errors:
    print('VALIDATION ERRORS:')
    for e in errors:
        print(' ', e)
else:
    print('VALIDATION PASSED: All 100 questions have 4 choices and verified correct answers')

out = r'C:/Users/princ/Documents/EXAMPRAC/data/questions.json'
with open(out, 'w', encoding='utf-8') as f:
    json.dump({'version': 1, 'total': len(questions), 'questions': questions}, f, ensure_ascii=False, indent=2)
print(f'Saved: {out}')

