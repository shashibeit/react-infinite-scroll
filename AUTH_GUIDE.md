Question Ordering Logic with Filters

(Question Bank – Ordering Behavior Reference)

Core Rule

When reordering questions in a filtered view, only the filtered questions change order.

The system:

Identifies the original positions (slots) of filtered questions

Applies the new filtered order

Places reordered questions back into the same original slots

All other questions remain unchanged

Example Base List

Original Order:

Position	Question
1	Q1
2	Q2
3	Q3
4	Q4
5	Q5
6	Q6
7	Q7
8	Q8
9	Q9
10	Q10
Filter Criteria Used
Review Type

Due Diligence

Periodic Review

Participant Type

Acquirer

Issuer

Country

USA

Canada

Use Case 1 – Filter by Review Type

Filter: Due Diligence
Filtered Questions: Q2, Q5, Q7
Original Slots: 2, 5, 7

User Reorders:
Q7, Q2, Q5

Apply to slots:

Slot	New Question
2	Q7
5	Q2
7	Q5

Final Order:

Q1 Q7 Q3 Q4 Q2 Q6 Q5 Q8 Q9 Q10

Use Case 2 – Filter by Participant Type

Filter: Acquirer
Filtered Questions: Q1, Q4, Q6, Q9
Slots: 1, 4, 6, 9

Reorder:
Q9, Q1, Q6, Q4

Final Order:

Q9 Q2 Q3 Q1 Q5 Q6 Q7 Q8 Q4 Q10

Use Case 3 – Filter by Country

Filter: USA
Filtered Questions: Q3, Q5, Q8
Slots: 3, 5, 8

Reorder:
Q8, Q3, Q5

Final Order:

Q1 Q2 Q8 Q4 Q3 Q6 Q7 Q5 Q9 Q10

Use Case 4 – Filter by Review Type + Participant Type

Filter:
Periodic Review + Issuer

Filtered Questions:
Q2, Q6, Q10

Slots:
2, 6, 10

Reorder:
Q10, Q2, Q6

Final Order:

Q1 Q10 Q3 Q4 Q5 Q2 Q7 Q8 Q9 Q6

Use Case 5 – Filter by Country + Participant Type + Review Type

Filter:
Canada + Acquirer + Due Diligence

Filtered Questions:
Q4, Q7

Slots:
4, 7

Reorder:
Q7, Q4

Final Order:

Q1 Q2 Q3 Q7 Q5 Q6 Q4 Q8 Q9 Q10