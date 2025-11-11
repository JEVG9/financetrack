| Field              | Type   | Description                                               |
|---------------------|--------|-----------------------------------------------------------|
| id                  | int    | Unique identifier of the debt.                           |
| type                | str    | Type of debt (e.g., loan, credit card, mortgage).        |
| principal           | float  | Original amount borrowed or owed without interest.       |
| due                 | float  | Total outstanding balance to be paid (principal + interest). |
| installments        | int    | Total number of agreed installments.                     |
| interest            | float  | Interest rate applied to the debt.                       |
| interest_type       | str    | Method of calculating interest (fixed, variable, compound). |
| next_due_date       | date   | Scheduled date of the next payment.                      |
| min_payment         | float  | Minimum payment required on the next due date.           |
| linked_account      | str    | Account associated with making the debt payment.         |
| creditor            | str    | Name of the creditor or lending entity.                  |
| start_date          | date   | Start date of the debt or contract.                      |
| installments_paid   | int    | Number of installments already paid.                     |
| status              | str    | Current status of the debt (active, overdue, paid).      |
| collateral          | str    | Asset or guarantee backing the debt.                     |
| currency            | str    | Currency in which the debt is expressed.                 |
