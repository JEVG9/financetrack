# financetrack

## Models

All models used in the project.

**Core models:**
1. Income:
    - id: int
    - date: date | date received
    - amount: float | total amount 
    - name: str | name of the income
    - category: str | ...
    - description: str | ...
    - recurring: bool | this income repeats itself
    - day_income: int | day whne this income arrives
    - payment_method: [str] | cash, transfer
    - currency: [str] | usd, cop
    - account: str | where was it received
    - is_transfer: bool | is this not an income but a transfer
    - received: bool | this is received or still pending

2. expense:
    - id: int
    - date: date | date used
    - amount: float | total amount
    - name: str | ...
    - category: str | ...
    - description: str | ...
    - recurring: bool | this expsense repeats itself
    - day_expense: int | day this payment needs to be done
    - payment_method: [str] | cash, transfer, credit card
    - currency: [str] | usd, cop
    - account: str | account used to pay
    - due_date: date | max day to pay
    - paid: bool | was this expense paid
    - is_transfer: bool | is this a transfer

3. debt:
    - id: int
    - type: [str] | loan, credit card, mortage
    - principal: float | total original amount
    - due: float | current debt amount
    - installments: int | how many installments
    - interest: float | interest%
    - interest_type: [str] | EA% EM% NOMINAL
    - next_due_date: date | Max next day to pay
    - min_payment: float | min payment to installment
    - linked_account: str | auto pay account
    - creditor: str | who own the debt
    - start_date: date | debt initial day  
    - installments_paid: int | installments paid 
    - status: [str] | paid, active, etc
    - currency: [str] | usd, cop

**Accounts & Categories:**

4. account:
    - id: int
    - name: str | ...
    - type: [str] | bank account, fintech bank, credit card 
    - currency: [str] | usd, cop
    - balance: float | cash available
    - credit_limit: float | max credit
    - statement_day: int | cut day
    - due_day: int | pay day
    - interest_rate: float | interest credit card
    - interest_type: str | EA% EM% NOMINAL
    - grace_period_days: int | extra days to pay until cutoff
    - issuer: str | ...
    - min_payment: float | ...
    - return_interest_rate: float | for banks and fintech banks
    - return_interes_rate_type: str | EA% EM% NOMINAL

5. category:
    - id: int
    - name: str
    - type: str
    - icon: str
    - color: str

**Users & settings:**

6. User:
    - id: int
    - email: str
    - pssw_hash: str
    - name: str
    - country: [str]
    - currency: [str]

7. user_settings:
    - user_id: int | user.id
    - lang: str
    - rounding_mode: [str]

8. user_preferences:
    - user_id: int | user.id
    - autocategorize: bool
    - notify_on_low_balance: bool
    - notify_when: PD XXXX

**Investments:**

9. asset:
    - id: int
    - symbol: str
    - name: str
    - type: str
    - currency: [str]
    - issuer: str
    - expense_ratio: float
    - ratio_type: str | EA% EM% NOMINAL
    - risk_level: [str]
    - active: bool  

**reports:**

**Notifications:**

