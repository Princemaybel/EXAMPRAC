# -*- coding: utf-8 -*-
"""
Builder for AFPSAT 2026 Complete Reviewer (100 Questions)
"""
import json

abstract_data = [
    # Q1..Q50
    (1, "Which figure completes the series?", "A", "Step 1: Add a small box every time you move to another 'big box'.\nStep 2: Alternate the color of small boxes each time you move to another 'big box'.", ["Figure A", "Figure B", "Figure C", "Figure D"]),
    (2, "Which figure completes the series?", "C", "Step 1: Add a line inside the 'big circle'.\nStep 2: Alternate the color of 'small circle' from white to black each move.", ["Figure A", "Figure B", "Figure C", "Figure D"]),
    (3, "Which figure completes the series?", "C", "Step 1: Watch only the straight line inside the 'big box'.\nStep 2: Move the straight line 45 degree clockwise.", ["Figure A", "Figure B", "Figure C", "Figure D"]),
    (4, "Which figure completes the series?", "D", "Step 1: Alternate the line.", ["Figure A", "Figure B", "Figure C", "Figure D"]),
    (5, "Which figure completes the series?", "B", "Step 1: Count all the elements inside the 'big box'.\nStep 2: All the given 'big box' has 8 elements.\nStep 3: Find the answer that has 8 elements.", ["Figure A", "Figure B", "Figure C", "Figure D"]),
    (6, "Which figure completes the series?", "B", "Step 1: Watch the white 'small box', it is moving one corner in a counter clockwise move.", ["Figure A", "Figure B", "Figure C", "Figure D"]),
    (7, "Which figure completes the series?", "C", "Step 1: Watch the 'straight line', it is moving 135 degrees clockwise.\nStep 2: The black 'small box' is moving from one corner to another in counter-clockwise move.", ["Figure A", "Figure B", "Figure C", "Figure D"]),
    (8, "Which figure completes the series?", "A", "Step 1: Watch how the white and black rectangle is alternating.\nStep 2: Add 'small box' every move.", ["Figure A", "Figure B", "Figure C", "Figure D"]),
    (9, "Which figure completes the series?", "D", "Step 1: Watch how the straight line adds and subtracts inside the circle.\nStep 2: Eliminate choices that has 3 or more straight lines as the answer should only have 2 straight lines.", ["Figure A", "Figure B", "Figure C", "Figure D"]),
    (10, "Which figure completes the series?", "B", "Step 1: Turn black 'small box' into white 'small box' starting from the bottom right of the 'big box' in a counter-clockwise movement.", ["Figure A", "Figure B", "Figure C", "Figure D"]),
    (11, "Which figure completes the statement?", "B", "Step 1: Just mirror the given elements.", ["Figure A", "Figure B", "Figure C", "Figure D"]),
    (12, "Which figure completes the statement?", "C", "Step 1: Watch how the 2 triangle outside the box comes inside.\nStep 2: Copy the exact pattern using the 2 black rectangle put it inside the box.", ["Figure A", "Figure B", "Figure C", "Figure D"]),
    (13, "Which figure completes the statement?", "D", "Step 1: Move the hexagon from lower position to higher position.\nStep 2: Turn the 'small box' from black to white.", ["Figure A", "Figure B", "Figure C", "Figure D"]),
    (14, "Which figure completes the statement?", "A", "Step 1: Watch the white 'small box', it is moving from one corner to another in a clockwise pattern.\nStep 2: Watch the black 'small box', it is moving from one corner to another in a counter-clockwise pattern.", ["Figure A", "Figure B", "Figure C", "Figure D"]),
    (15, "Which figure completes the statement?", "C", "Step 1: Just rotate the 'big box' 1 move in counter-clockwise.", ["Figure A", "Figure B", "Figure C", "Figure D"]),
    (16, "Which figure completes the statement?", "B", "Step 1: Move the small boxes to the middle of the circle.\nStep 2: Turn the black small box to white small box and vice versa.", ["Figure A", "Figure B", "Figure C", "Figure D"]),
    (17, "Which figure completes the statement?", "B", "Step 1: Move the small box from Top Right corner to Bottom Left corner.\nStep 2: Transform the Vertical straight line to a Horizontal straight line.\nStep 3: Move the small horizontal straight line from Top Left corner to Top Right corner.", ["Figure A", "Figure B", "Figure C", "Figure D"]),
    (18, "Which figure completes the statement?", "D", "Step 1: Watch the white 'small box', it is moving two corner in a clockwise move.\nStep 2: The black 'small box' is moving 1 corner in a counter-clockwise move.", ["Figure A", "Figure B", "Figure C", "Figure D"]),
    (19, "Which figure completes the statement?", "C", "Step 1: Put the black 'small box' to the center of the 'big box'.\nStep 2: Add 1 vertical straight line.", ["Figure A", "Figure B", "Figure C", "Figure D"]),
    (20, "Which figure is the odd one out?", "C", "Explanation: Only letter C has no opposite. Letter A's opposite is letter E while Letter B's opposite is letter D.", ["Figure A", "Figure B", "Figure C", "Figure D", "Figure E"]),
    (21, "Which figure is the odd one out?", "D", "Explanation: The answer is letter D because it is the only one who has only 2 shape that is unrelated to each other (square is polygon while circle is not polygon).", ["Figure A", "Figure B", "Figure C", "Figure D", "Figure E"]),
    (22, "Which figure is the odd one out?", "A", "Explanation: The answer is letter A because it is the only one who has 2 white 'small box' who is facing outward.", ["Figure A", "Figure B", "Figure C", "Figure D", "Figure E"]),
    (23, "Which figure is the odd one out?", "D", "Explanation: The answer is letter D because it is the only one who has 6 'small boxes' only.", ["Figure A", "Figure B", "Figure C", "Figure D", "Figure E"]),
    (24, "Which figure completes the statement?", "C", "Step 1: Put the white 'small box' to the center of the 'big box'.\nStep 2: Add 1 vertical straight line.", ["Figure A", "Figure B", "Figure C", "Figure D"]),
    (25, "Which figure is the odd one out?", "E", "Explanation: The answer is letter E because letter A is the opposite of letter B while letter C is the opposite of letter D.", ["Figure A", "Figure B", "Figure C", "Figure D", "Figure E"]),
    (26, "Which figure is the odd one out?", "D", "Explanation: The answer is letter D because letter A was the opposite of letter B while letter C is the opposite of letter E.", ["Figure A", "Figure B", "Figure C", "Figure D", "Figure E"]),
    (27, "Which figure is the odd one out?", "B", "Explanation: The answer is letter B because it is the only one who has both white and black 'small box' on the bottom part of the 'big box'.", ["Figure A", "Figure B", "Figure C", "Figure D", "Figure E"]),
    (28, "Which figure is the odd one out?", "A", "Explanation: The answer is letter A because it is the only one who has black 'small box' on top of the arrow head.", ["Figure A", "Figure B", "Figure C", "Figure D", "Figure E"]),
    (29, "Which figure is the odd one out?", "E", "Explanation: The answer is letter E because it is the only one with 2 black 'small boxes'.", ["Figure A", "Figure B", "Figure C", "Figure D", "Figure E"]),
    (30, "Which figure completes the series?", "D", "Step 1: Just add white 'small box' to the top right corner.", ["Figure A", "Figure B", "Figure C", "Figure D"]),
    (31, "Which figure completes the series?", "A", "Step 1: Cancel all elements that is similar to the previous box for example if the previous and current box has similar oblong, delete it.\nStep 2: All elements that is unique must remain in their previous position.", ["Figure A", "Figure B", "Figure C", "Figure D"]),
    (32, "Which figure is the odd one out?", "D", "Explanation: The answer is letter D because it is the only one with equal number of white and black 'small box' that is also on the same line.", ["Figure A", "Figure B", "Figure C", "Figure D", "Figure E"]),
    (33, "Which figure completes the series?", "C", "Step 1: Just combine the black 'small box' at the end of the lines.", ["Figure A", "Figure B", "Figure C", "Figure D"]),
    (34, "Which figure completes the series?", "D", "Step 1: Just put the only white 'small box' on the bottom of the 'big box' to the right then rotate it counter-clockwise.", ["Figure A", "Figure B", "Figure C", "Figure D"]),
    (35, "Which figure belongs in neither group?", "C", "Explanation: The answer is letter C because A belongs to Group 1 while B and D belongs to Group 2.", ["Figure A", "Figure B", "Figure C", "Figure D"]),
    (36, "Which figure belongs in neither group?", "A", "Explanation: The answer is letter A because neither Group 1 nor Group 2 does not have similar elements while A has 2 black 'small box'.", ["Figure A", "Figure B", "Figure C", "Figure D"]),
    (37, "Which figure is next in the series?", "B", "Step 1: Find the pattern: the 1st upper portion has 6, 2nd lower portion 5, 3rd upper portion is 4 and so on. So the answer must have upper portion of 0 because the last given is lower portion 1.", ["Figure A", "Figure B", "Figure C", "Figure D"]),
    (38, "Which figure belongs in neither group?", "D", "Explanation: The answer is letter D because letter A and B belong to Group 2 while letter C belongs to Group 1.", ["Figure A", "Figure B", "Figure C", "Figure D"]),
    (39, "Which figure belongs in neither group?", "B", "Explanation: The answer is Letter B because neither group accepts 4 elements.", ["Figure A", "Figure B", "Figure C", "Figure D"]),
    (40, "Which figure is next in the series?", "C", "Step 1: The pattern is 5/2, 4/3, 1/6 then they reverse it in the 4th given: 2/5, 3/4, 6/1. According to this pattern the answer should be 5/2.", ["Figure A", "Figure B", "Figure C", "Figure D"]),
    (41, "Which figure is next in the series?", "D", "Step 1: Watch the bottom of the 1st given it is 0 then the top of the 2nd given is 1 then the bottom of the 3rd given is 2 and so on. The answer should have a bottom of 6 because the last top is 5.", ["Figure A", "Figure B", "Figure C", "Figure D"]),
    (42, "Which figure completes the grid?", "B", "Step 1: Identify all the elements in the 3rd and 4th row; the answer should have at the bottom to complete the elements in the 4th row.", ["Figure A", "Figure B", "Figure C", "Figure D"]),
    (43, "Which figure completes the grid?", "C", "Step 1: The pattern to this question is each row should not have 2 similar element. A, B and D are eliminated because they have this pattern.", ["Figure A", "Figure B", "Figure C", "Figure D"]),
    (44, "Which figure is next in the series?", "B", "Explanation: The pattern is this: the bottom of the 1st given is 5 then the bottom of the 3rd given is 4 then the bottom of the 5th given is 3 and so on. Therefore the answer will have a bottom of 2.", ["Figure A", "Figure B", "Figure C", "Figure D"]),
    (45, "Which figure completes the grid?", "D", "Explanation: The answer is letter D because in the 3rd row the missing is this 2 element.", ["Figure A", "Figure B", "Figure C", "Figure D"]),
    (46, "Which figure completes the grid?", "A", "Step 1: Find an answer that has 2 similar element in the upper part as 3rd row needs 2 similar element.\nStep 2: This leaves us with A and B, but B has a 'small box' in the bottom so it is not the answer.", ["Figure A", "Figure B", "Figure C", "Figure D"]),
    (47, "Which figure is the odd one out?", "C", "Explanation: The odd one is letter C because all of the choices except C has this pattern.", ["Figure A", "Figure B", "Figure C", "Figure D", "Figure E"]),
    (48, "Which figure is the odd one out?", "D", "Explanation: Letter D is the odd one because it is the only one who does not have 2 similar element.", ["Figure A", "Figure B", "Figure C", "Figure D", "Figure E"]),
    (49, "Which figure is the odd one out?", "D", "Explanation: Letter D is the odd one because it is the only one without same element. For example letter A has the same 1st and 3rd element.", ["Figure A", "Figure B", "Figure C", "Figure D", "Figure E"]),
    (50, "Which figure is the odd one out?", "D", "Explanation: The odd one is letter D because it is the only one who has all of its white 'small box' in the center.", ["Figure A", "Figure B", "Figure C", "Figure D", "Figure E"])
]

numerical_data = [
    (51, "5.98 + 6 + ¾ = ____", "B", "When adding numbers with decimals, align the decimal points: 5.98 + 6.00 + 0.75 = 12.73.", ["11.73", "12.73", "13.25", "12.50"]),
    (52, "1.25 + 1.5 + 7.875 = ____", "A", "Align decimal points: 1.250 + 1.500 + 7.875 = 10.625.", ["10.625", "9.875", "11.125", "10.250"]),
    (53, "25 - 8.35 - 1.3 = ____", "C", "Align decimal points: 25.00 - 8.35 - 1.30 = 15.35.", ["14.35", "16.65", "15.35", "15.65"]),
    (54, "3, 5, 7, 9, 11, 13, ___?", "C", "Just complete the sequence of odd numbers (increment of +2).", ["12", "14", "15", "17"]),
    (55, "2, 4, 8, 16, 32, 64, ___?", "D", "Just double the last number (geometric sequence with common ratio 2). 64 x 2 = 128.", ["65", "75", "99", "128"]),
    (56, "8, 16, 24, 32, 40, ___?", "B", "Just complete the multiple of 8 (arithmetic sequence with common difference 8). 40 + 8 = 48.", ["42", "48", "50", "None of the above"]),
    (57, "2187, 729, 243, 81, 27, 9, ___?", "C", "Divide each number by 3 to get the next number: 9 / 3 = 3.", ["8", "6", "3", "0"]),
    (58, "What is -25 + 16?", "B", "If the higher absolute number is negative, the answer is negative: -25 + 16 = -9.", ["9", "-9", "0", "None of the above"]),
    (59, "What is (-9) (-22)?", "A", "Negative times negative is always positive: (-9) x (-22) = +198.", ["198", "-198", "31", "-31"]),
    (60, "(21)(-4) + (8)(-2) = ____?", "B", "Always use PEMDAS: (21)(-4) = -84, (8)(-2) = -16. Then -84 + (-16) = -100.", ["100", "-100", "23", "-23"]),
    (61, "(-560) ÷ 7 = ____?", "A", "Divide then put the negative sign if one operand is negative: -560 / 7 = -80.", ["-80", "80", "553", "-553"]),
    (62, "What is the Greatest Common Factor (GCF) of 36 and 54?", "C", "Prime factorization: 36 = 2 x 2 x 3 x 3; 54 = 2 x 3 x 3 x 3. Common factors = 2 x 3 x 3 = 18.", ["4", "6", "18", "20"]),
    (63, "What is the sum of ½ + 8/4 + 6/12?", "C", "Convert fraction to decimal for easy solving: ½ = 0.5, 8/4 = 2, 6/12 = 0.5. 0.5 + 2 + 0.5 = 3.", ["15/12", "3/12", "3", "3 ½"]),
    (64, "What is ¼ in decimal?", "B", "Just divide 1 by 4: 1 ÷ 4 = 0.25.", ["0.4", "0.25", "0.33", "0.12"]),
    (65, "Find the value of x in the equation: 5x + 25 = 10", "C", "5x = 10 - 25 = -15; x = -15 / 5 = -3. Checking: 5(-3) + 25 = -15 + 25 = 10.", ["5", "3", "-3", "-5"]),
    (66, "If x = 8, find the value of y in the equation: 4x - 2y = 28", "D", "Substitute x = 8: 4(8) - 2y = 28 -> 32 - 2y = 28 -> 2y = 4 -> y = 2.", ["-4", "-2", "4", "2"]),
    (67, "Find the value of x if y = 8 in the equation: 2x + 4y = 50", "C", "Substitute y = 8: 2x + 4(8) = 50 -> 2x + 32 = 50 -> 2x = 18 -> x = 9.", ["3", "6", "9", "12"]),
    (68, "Ana gets a commission of 10% for each bottle of lotion she sells. If a bottle of lotion sells for PHP 87.50, how many bottles will Ana have to sell to receive a commission of PHP 210?", "B", "10% of 87.50 is 8.75 per bottle. Number of bottles = 210 / 8.75 = 24 bottles.", ["20", "24", "28", "32"]),
    (69, "Two numbers are in a ratio of 3 to 5. The lesser number is 42. Find the greater number.", "A", "Lesser ratio = 3 parts = 42 -> 1 part = 14. Greater number = 5 parts = 14 x 5 = 70.", ["70", "75", "80", "85"]),
    (70, "Juan and Pedro decided to split their income in the ratio of 2 to 3. If the greater number is 906, what is the lesser number?", "B", "Greater share (3 parts) = 906 -> 1 part = 302. Lesser share (2 parts) = 302 x 2 = 604.", ["600", "604", "650", "710"])
]

verbal_data = [
    (71, "Find the error in the sentence, if there is none choose E.\n[Accuracy of movement] (A), [like accuracy of words] (B), [are essential to] (C) [the success of magical rites] (D). [No error] (E)", "C", "The right phrase is 'is essential to' because the subject 'Accuracy' is singular.", ["Accuracy of movement", "like accuracy of words", "are essential to", "the success of magical rites", "No error"]),
    (72, "Find the error in the sentence, if there is none choose E.\n[College teaches us] (A) [to form opinions] (B) [by the result] (C) [of careful thought] (D). [No error] (E)", "C", "The right phrase is 'after the result' or 'as a result'.", ["College teaches us", "to form opinions", "by the result", "of careful thought", "No error"]),
    (73, "Find the error in the sentence, if there is none choose E.\n[Learners set goals as motivation for learning] (A), [and their successes and failures in] (B) [achieving these goals determine] (C) [how he sets his future goals] (D). [No error] (E)", "D", "The right phrase is 'how they set their future goals' to maintain pronoun agreement with plural 'Learners'.", ["Learners set goals as motivation for learning", "and their successes and failures in", "achieving these goals determine", "how he sets his future goals", "No error"]),
    (74, "Find the error in the sentence, if there is none choose E.\n[Some people are] (A) [simply too opportunities] (B) [to take a stand] (C) [on controversial issues] (D). [No error] (E)", "B", "The right phrase should use an adjective, such as 'simply too timid' or 'opportunistic'.", ["Some people are", "simply too opportunities", "to take a stand", "on controversial issues", "No error"]),
    (75, "Find the error in the sentence, if there is none choose E.\n[We were discussing about political issues] (A) [so her remarks] (B) [about clothes and fashion] (C) [were completely beside the point] (D). [No error] (E)", "E", "Answer keyed by reviewer is E (No error).", ["We were discussing about political issues", "so her remarks", "about clothes and fashion", "were completely beside the point", "No error"]),
    (76, "Find the error in the sentence, if there is none choose E.\n[The best consultants are those who can suggest] (A) [or apply an array of methods aim at helping their clients] (B) [understand a situation, diagnose it, and] (C) [act accordingly under a given situation] (D). [No error] (E)", "B", "The right phrase is 'methods aimed at helping their clients' or remove 'an'.", ["The best consultants are those who can suggest", "or apply an array of methods aim at helping their clients", "understand a situation, diagnose it, and", "act accordingly under a given situation", "No error"]),
    (77, "This sentence contains an error in grammar or correct usage, find the error. If there is none choose E.\n[you] (A) [should delegate] (B) [the] (C) [task yesterday] (D). [No error] (E)", "A", "The letter 'y' should be capitalized because it is the starting letter of the sentence.", ["you", "should delegate", "the", "task yesterday", "No error"]),
    (78, "This sentence contains an error in spelling, grammar or correct usage, find the error. If there is none choose E.\n[He] (A) [commanded] (B) [a platon] (C) [of tired and hungry soldiers] (D). [No error] (E)", "C", "The right spelling is 'platoon'.", ["He", "commanded", "a platon", "of tired and hungry soldiers", "No error"]),
    (79, "This sentence contains an error in spelling, grammar or correct usage, find the error. If there is none choose E.\n[This project] (A) [was] (B) [indorsed] (C) [by the Chief of Staff] (D). [No error] (E)", "C", "The right spelling is 'endorsed'.", ["This project", "was", "indorsed", "by the Chief of Staff", "No error"]),
    (80, "This sentence contains an error in spelling, grammar or correct usage, find the error. If there is none choose E.\n[The young father] (A) [left] (B) [her] (C) [children orphans] (D). [No error] (E)", "C", "The right word is 'his' (referring to the father).", ["The young father", "left", "her", "children orphans", "No error"]),
    (81, "This sentence contains an error in spelling, grammar or correct usage, find the error. If there is none choose E.\n[Congratulations] (A) [for] (B) [you're] (C) [excellent contributions!] (D) [No error] (E)", "C", "The right word is the possessive 'your', not the contraction 'you're'.", ["Congratulations", "for", "you're", "excellent contributions!", "No error"]),
    (82, "This sentence contains an error in spelling, grammar or correct usage, find the error. If there is none choose E.\n[About twenty-two typhoons] (A) [is expected] (B) [to hit the country] (C) [this year!] (D). [No error] (E)", "B", "The right phrase is 'are expected to' because 'typhoons' is plural.", ["About twenty-two typhoons", "is expected", "to hit the country", "this year!", "No error"]),
    (83, "This sentence contains an error in spelling, grammar or correct usage, find the error. If there is none choose E.\n[Who] (A) [want] (B) [to be a] (C) [millionaire?] (D). [No error] (E)", "B", "The right word is 'wants' (third person singular).", ["Who", "want", "to be a", "millionaire?", "No error"]),
    (84, "Read the sentence carefully, understand it then choose the letter of the correct answer.\n'The Einstein revolution has produced a paradox; while vastly extending humankind's reach, it has also exposed the essentially finite nature of the human scale.'\nThe sentence best supports the statement that Einstein's Discovery ________.", "C", "A paradox involves a real but not obvious contradiction.", ["proclaims only the glory of the universe.", "devalues humanity and science.", "involves a real but not obvious contradiction", "reveals a contradiction between God and his people.", "reveals people's limitations."]),
    (85, "Read the sentence carefully, understand it then choose the letter of the correct answer.\n'For a society to develop, its attitude towards life must not be a fatalistic one; rather, it must have strong faith in its capacity to improve.'\nThe sentence best supports the statement that ________.", "E", "A person/society with an optimistic outlook has faith and confidence in its capacity for advancement.", ["The attitude of a society towards life is indicative of its socio-economic development.", "success in life starts from one's dissatisfaction with the existing state of affairs.", "a society cannot progress unless it is actively committed to the pursuit of a better life.", "a person develops a healthy attitude towards life through constant efforts to improve oneself.", "a person with an optimistic outlook in life is confident of his capacity for advancement."]),
    (86, "Read the sentence carefully, understand it then choose the letter of the correct answer.\n'Two person look out through the same bars; one sees mud and the other, the stars.'\nThe sentence best supports the statement that ________.", "C", "People have varied ways of looking at different things depending on perspective.", ["some people are more blind than others.", "people see things differently depending on their own perspective.", "people have varied ways of looking at different things.", "people have different tastes and interests.", "people tend to influence one another's views of things."]),
    (87, "Read the sentence carefully, understand it then choose the letter of the correct answer.\n'Most researchers in needy countries are based on the thinking and approach of the highly developed Western world, and seldom have they been directed toward meeting the countries' own development needs.'\nThe sentence best supports the statement that ________.", "D", "Reviewer keyed D: needy countries need researchers aligned to reach development status.", ["A highly developed countries offer the best guide for the development of needy countries.", "most researchers done in needy countries are missing their objectives.", "most researchers have universal application.", "needy countries need researchers to help them reach the status of the western world.", "needy countries spend so much time for conducting researchers."]),
    (88, "Read the sentence carefully, understand it then choose the letter of the correct answer.\n'Sixty years ago I know everything; now I know nothing education is a progressive discovery of our own ignorance.'\nThe sentence best supports the statement that ________.", "C", "The more we learn, the more we realize that there's more we need to know.", ["The older we get, the more we forget what we have learned.", "The older we get, the more knowledgeable we become.", "The more we learn, the more we realize that there's more we need to know.", "We learn more as we grow old.", "Ignorance is a lifelong experience."]),
    (89, "Choose the letter of the correct answer.\nKAINGIN is to SOIL EROSION as CONTOUR FARMING is to ________.", "E", "Determine first the relationship: Kaingin causes soil erosion (Cause & Effect); contour farming leads to soil preservation.", ["WATER DISTRIBUTION", "WIND EROSION", "CROP GROWING", "OVER PASTURING", "SOIL PRESERVATION"]),
    (90, "Choose the letter of the correct answer.\nPHOTOGRAPHER is to PICTURE as CARTOGRAPHER is to ________.", "E", "Relationship: Occupation - Their Product. A cartographer creates maps.", ["plan", "design", "graph", "cartoon", "map"]),
    (91, "Choose the letter of the correct answer.\nPERJURY is to LIE as LARCENY is to ________.", "C", "Relationship: Crime - Their Cause. Perjury is the crime of lying under oath; larceny is the crime of stealing.", ["conspire", "kill", "steal", "injure", "trespass"]),
    (92, "Choose the letter of the correct answer.\nHis explanation is as clear as mud. It is ________.", "D", "This idiom means figurative non-literal meaning: 'clear as mud' means completely not understandable.", ["Dirty", "Sticky", "Brownish", "Not understandable"]),
    (93, "Choose the letter of the correct answer.\nA person who aims high to hit mark is ________.", "C", "A person who aims high is ambitious.", ["Diligent", "Intelligent", "Ambitious", "Confident"]),
    (94, "Choose the letter of the correct answer.\nThe phrase 'lightning rod of ideas' suggests which of the following characteristics?", "B", "Reviewer keyed B (Passionate).", ["Intuitive", "Passionate", "Imaginative", "Rich Thinking"]),
    (95, "Choose the letter of the correct answer.\nThe diagnosis is a/an ________.", "B", "Reviewer keyed B (Information / Identification).", ["Prediction", "Information", "Progression", "Identification"]),
    (96, "Choose the letter of the correct answer.\nTo be excluded means to be ________.", "D", "In this examination context, to be excluded means to be disqualified.", ["Isolated", "Included", "Examined", "Disqualified"]),
    (97, "Choose the letter of the correct answer.\nThe opposite of the word hydration is ________.", "D", "Dehydration is the antonym of hydration.", ["Thirst", "Drying up", "Pack of fluid", "Dehydration"]),
    (98, "Choose the letter of the correct answer.\nThe synonym of the word FOSTERING is ________.", "D", "Fostering means nurturing or encouraging development.", ["Safeguarding", "Neglecting", "Ignoring", "Nurturing"]),
    (99, "Choose the letter of the correct answer.\nThe synonym of the word PROPEL is ________.", "A", "Propel means to drive, push, or impel forward.", ["Drive", "Jettison", "Burst", "Acclimatize"]),
    (100, "Choose the letter of the correct answer.\nThe synonym of the word MASSIVE is ________.", "D", "Massive means huge, immense, or very large.", ["Lump Sum", "Strong", "Little", "Huge"])
]

def build_afpsat():
    questions = []
    letters = ["A", "B", "C", "D", "E"]
    
    # 1. Abstract Reasoning (1..50)
    for qnum, text, ans_letter, exp, ch_texts in abstract_data:
        choices = []
        correct_id = None
        for i, ch_t in enumerate(ch_texts):
            cid = f"afpsat_q{qnum}_{letters[i].lower()}"
            choices.append({"id": cid, "text": ch_t})
            if letters[i] == ans_letter:
                correct_id = cid
        questions.append({
            "id": f"afpsat_q{qnum}",
            "qnum": qnum,
            "category": "Abstract Reasoning",
            "question": f"{qnum}. {text}",
            "image": f"abstract/{qnum}.png",
            "choices": choices,
            "correctAnswer": correct_id,
            "explanation": exp
        })
        
    # 2. Numerical Reasoning (51..70)
    for qnum, text, ans_letter, exp, ch_texts in numerical_data:
        choices = []
        correct_id = None
        for i, ch_t in enumerate(ch_texts):
            cid = f"afpsat_q{qnum}_{letters[i].lower()}"
            choices.append({"id": cid, "text": ch_t})
            if letters[i] == ans_letter:
                correct_id = cid
        questions.append({
            "id": f"afpsat_q{qnum}",
            "qnum": qnum,
            "category": "Numerical Reasoning",
            "question": f"{qnum}. {text}",
            "image": None,
            "choices": choices,
            "correctAnswer": correct_id,
            "explanation": exp
        })

    # 3. Verbal Reasoning (71..100)
    for qnum, text, ans_letter, exp, ch_texts in verbal_data:
        choices = []
        correct_id = None
        for i, ch_t in enumerate(ch_texts):
            cid = f"afpsat_q{qnum}_{letters[i].lower()}"
            choices.append({"id": cid, "text": ch_t})
            if letters[i] == ans_letter:
                correct_id = cid
        questions.append({
            "id": f"afpsat_q{qnum}",
            "qnum": qnum,
            "category": "Verbal Reasoning",
            "question": f"{qnum}. {text}",
            "image": None,
            "choices": choices,
            "correctAnswer": correct_id,
            "explanation": exp
        })

    # Save to data/afpsat_questions.json
    with open("data/afpsat_questions.json", "w", encoding="utf-8") as f:
        json.dump({"version": 1, "total": len(questions), "questions": questions}, f, indent=2, ensure_ascii=False)
        
    # Save to data/afpsat_questions_data.js
    with open("data/afpsat_questions_data.js", "w", encoding="utf-8") as f:
        f.write("// AFPSAT 2026 Complete Reviewer (100 Questions)\n")
        f.write("export const AFPSAT_BANK = " + json.dumps({"version": 1, "total": len(questions), "questions": questions}, indent=2, ensure_ascii=False) + ";\n")
        f.write("if (typeof window !== 'undefined') { window.AFPSAT_BANK = AFPSAT_BANK; }\n")
        
    print(f"Successfully generated {len(questions)} AFPSAT questions!")

if __name__ == "__main__":
    build_afpsat()
