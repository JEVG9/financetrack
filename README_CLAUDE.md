# FINANCETRACK

## Models Documentation

Comprehensive data models for personal finance tracking application.

---

## 📋 Table of Contents

1. [Universal Fields](#universal-fields)
2. [Core Transaction Models](#core-transaction-models)
3. [Accounts & Categories](#accounts--categories)
4. [Debt Management](#debt-management)
5. [Budgets & Goals](#budgets--goals)
6. [Investments](#investments)
7. [Reports](#reports)
8. [Notifications](#notifications)
9. [Users & Settings](#users--settings)
10. [Auxiliary Models](#auxiliary-models)
11. [Enums & Constants](#enums--constants)
12. [Validation Rules](#validation-rules)

---

## 🌐 Universal Fields

All models include these base fields for auditing and multi-user support:
```
- user_id: int | foreign key to User model
- created_at: datetime | timestamp of creation
- updated_at: datetime | timestamp of last modification
- is_active: bool | soft delete flag (default: true)
```

---

## 💰 Core Transaction Models

### 1. Income
Tracks all income sources and receipts.
```yaml
- id: int | primary key
- user_id: int | owner
- date: date | date received or expected
- amount: float | total amount (store in cents/smallest unit)
- name: str | descriptive name
- category_id: int | foreign key to Category
- description: str | additional details
- recurring: bool | repeats automatically
- day_income: int | day of month when income arrives (1-31)
- payment_method: str | cash, transfer, check (see PAYMENT_METHODS enum)
- currency: str | USD, COP, etc (see CURRENCIES enum)
- account_id: int | foreign key to Account where received
- received: bool | confirmed vs pending
- exchange_rate: float | if currency ≠ account.currency
- converted_amount: float | amount in account's currency
- attachment_url: str | link to receipt/proof
- tags: [str] | custom tags for filtering
- notes: str | internal notes
- recurring_template_id: int | foreign key to RecurringTemplate if auto-generated
- created_at: datetime
- updated_at: datetime
- is_active: bool
```

### 2. Expense
Tracks all expenses and purchases.
```yaml
- id: int | primary key
- user_id: int | owner
- date: date | date of expense
- amount: float | total amount (store in cents/smallest unit)
- name: str | descriptive name
- category_id: int | foreign key to Category
- description: str | additional details
- recurring: bool | repeats automatically
- day_expense: int | day of month when payment is due (1-31)
- payment_method: str | cash, transfer, credit_card, debit_card (see PAYMENT_METHODS enum)
- currency: str | USD, COP, etc (see CURRENCIES enum)
- account_id: int | foreign key to Account used
- due_date: date | maximum date to pay (for pending expenses)
- paid: bool | payment confirmed
- exchange_rate: float | if currency ≠ account.currency
- converted_amount: float | amount in account's currency
- attachment_url: str | link to receipt/invoice
- tags: [str] | custom tags
- notes: str | internal notes
- recurring_template_id: int | foreign key if auto-generated
- budget_id: int | foreign key to Budget (optional)
- created_at: datetime
- updated_at: datetime
- is_active: bool
```

### 3. Transfer
Transfers between user's own accounts.
```yaml
- id: int | primary key
- user_id: int | owner
- date: datetime | transfer date and time
- from_account_id: int | source account
- to_account_id: int | destination account
- amount: float | amount transferred from source
- from_currency: str | source currency
- to_currency: str | destination currency
- exchange_rate: float | conversion rate used
- converted_amount: float | amount received in destination
- fee: float | transfer fee/commission
- description: str | transfer purpose
- reference_number: str | bank reference
- status: str | pending, completed, failed, cancelled (see TRANSACTION_STATUS enum)
- notes: str | internal notes
- created_at: datetime
- updated_at: datetime
- is_active: bool
```

---

## 🏦 Accounts & Categories

### 4. Account
Bank accounts, credit cards, and digital wallets.
```yaml
- id: int | primary key
- user_id: int | owner
- name: str | account nickname
- type: str | checking, savings, credit_card, investment (see ACCOUNT_TYPES enum)
- institution_name: str | bank or fintech name
- currency: str | primary currency (see CURRENCIES enum)
- balance: float | current available balance
- account_number_last4: str | last 4 digits for identification
- is_default: bool | primary account flag
- icon: str | icon identifier or emoji
- color: str | hex color for UI
-
# Credit Card Specific Fields (optional for other types):
- credit_limit: float | maximum credit available
- statement_day: int | billing cycle cut day (1-31)
- due_day: int | payment due day (1-31)
- interest_rate: float | annual interest rate
- interest_type: str | EA, EM, NOMINAL, APR (see INTEREST_TYPES enum)
- grace_period_days: int | days before interest accrues
- min_payment_percentage: float | minimum payment % of balance
- issuer: str | card issuer/network
-
# Bank/Savings Account Specific Fields:
- return_interest_rate: float | interest earned on balance
- return_interest_type: str | EA, EM, NOMINAL, APY (see INTEREST_TYPES enum)
- overdraft_limit: float | allowed negative balance
-
# Common Fields:
- notes: str | additional information
- is_closed: bool | account status
- opening_date: date | account opening date
- closing_date: date | account closing date (if applicable)
- created_at: datetime
- updated_at: datetime
- is_active: bool
```

### 5. Category
Categorization for income and expenses.
```yaml
- id: int | primary key
- user_id: int | owner (null for system categories)
- name: str | category name
- transaction_type: str | income, expense, both (see TRANSACTION_TYPES enum)
- parent_category_id: int | for subcategories (nullable)
- icon: str | icon identifier
- emoji: str | emoji representation 🍔
- color: str | hex color
- is_system: bool | predefined vs user-created
- budget_limit: float | suggested monthly limit
- sort_order: int | display order
- description: str | category description
- created_at: datetime
- updated_at: datetime
- is_active: bool
```

---

## 💳 Debt Management

### 6. Debt
Major debts, loans, and credit obligations.
```yaml
- id: int | primary key
- user_id: int | owner
- name: str | debt identifier
- type: str | loan, credit_card, mortgage, student_loan, personal_loan (see DEBT_TYPES enum)
- creditor: str | lender/creditor name
- principal: float | original loan amount
- current_balance: float | remaining debt amount
- installments: int | total number of payments
- installments_paid: int | payments completed
- payment_frequency: str | monthly, biweekly, weekly (see PAYMENT_FREQUENCY enum)
- installment_amount: float | regular payment amount
- min_payment: float | minimum payment required
- interest_rate: float | interest rate
- interest_type: str | EA, EM, NOMINAL, APR (see INTEREST_TYPES enum)
- start_date: date | loan origination date
- end_date: date | expected payoff date
- next_due_date: date | next payment deadline
- last_payment_date: date | most recent payment
- linked_account_id: int | foreign key to Account for auto-pay
- auto_pay_enabled: bool | automatic payment flag
- penalty_rate: float | late payment interest rate
- status: str | active, paid, defaulted, refinanced (see DEBT_STATUS enum)
- currency: str | loan currency
- notes: str | additional information
- created_at: datetime
- updated_at: datetime
- is_active: bool
```

### 7. DebtPayment
Individual debt payment history.
```yaml
- id: int | primary key
- user_id: int | owner
- debt_id: int | foreign key to Debt
- payment_date: date | date payment was made
- amount_paid: float | total payment amount
- principal_paid: float | amount applied to principal
- interest_paid: float | amount applied to interest
- fees_paid: float | late fees or other charges
- remaining_balance: float | balance after payment
- payment_number: int | installment number (e.g., 5 of 36)
- payment_method: str | how payment was made
- account_id: int | foreign key to Account used
- is_extra_payment: bool | payment beyond required amount
- confirmation_number: str | payment reference
- notes: str | payment notes
- created_at: datetime
- updated_at: datetime
- is_active: bool
```

---

## 🎯 Budgets & Goals

### 8. Budget
Spending limits by category and period.
```yaml
- id: int | primary key
- user_id: int | owner
- name: str | budget name
- category_id: int | foreign key to Category
- amount: float | budget limit
- period: str | weekly, monthly, quarterly, yearly (see BUDGET_PERIOD enum)
- start_date: date | budget start
- end_date: date | budget end (optional for rolling budgets)
- spent_amount: float | current spending (calculated)
- alert_threshold: float | % to trigger alert (e.g., 80)
- rollover: bool | carry unused amount to next period
- is_active: bool | budget enabled
- notes: str | budget description
- created_at: datetime
- updated_at: datetime
```

### 9. FinancialGoal
Savings and financial objectives.
```yaml
- id: int | primary key
- user_id: int | owner
- name: str | goal name (e.g., "Vacation 2026")
- description: str | goal details
- target_amount: float | total amount needed
- current_amount: float | amount saved so far
- currency: str | goal currency
- start_date: date | goal creation date
- deadline: date | target completion date
- priority: str | low, medium, high, urgent (see PRIORITY_LEVELS enum)
- category: str | emergency_fund, vacation, education, retirement, etc
- linked_account_id: int | dedicated savings account
- auto_save_amount: float | automatic monthly contribution
- auto_save_day: int | day of month for auto-save (1-31)
- status: str | in_progress, achieved, abandoned, paused (see GOAL_STATUS enum)
- icon: str | goal icon
- color: str | UI color
- notes: str | additional notes
- created_at: datetime
- updated_at: datetime
- is_active: bool
```

### 10. GoalContribution
Track contributions toward financial goals.
```yaml
- id: int | primary key
- user_id: int | owner
- goal_id: int | foreign key to FinancialGoal
- amount: float | contribution amount
- date: date | contribution date
- source: str | manual, automatic, windfall
- account_id: int | source account
- notes: str | contribution notes
- created_at: datetime
- updated_at: datetime
- is_active: bool
```

---

## 📈 Investments

### 11. InvestmentPortfolio
Investment portfolio grouping.
```yaml
- id: int | primary key
- user_id: int | owner
- name: str | portfolio name (e.g., "Retirement", "Aggressive Growth")
- description: str | portfolio strategy
- creation_date: date | portfolio start date
- target_allocation: json | {"stocks": 60, "bonds": 30, "cash": 10}
- risk_profile: str | conservative, moderate, aggressive, very_aggressive (see RISK_PROFILES enum)
- rebalance_frequency: str | monthly, quarterly, semi_annual, annual (see REBALANCE_FREQUENCY enum)
- last_rebalance_date: date | last rebalancing
- next_rebalance_date: date | next planned rebalancing
- currency: str | base currency
- total_value: float | current portfolio value (calculated)
- total_cost: float | total invested (calculated)
- unrealized_gain_loss: float | current P&L (calculated)
- notes: str | portfolio notes
- is_active: bool | portfolio status
- created_at: datetime
- updated_at: datetime
```

### 12. Asset
Investment assets and securities.
```yaml
- id: int | primary key
- symbol: str | ticker symbol (e.g., AAPL, BTC)
- name: str | full asset name
- type: str | stock, bond, etf, mutual_fund, crypto, commodity, real_estate (see ASSET_TYPES enum)
- currency: str | trading currency
- exchange: str | stock exchange or platform
- sector: str | business sector
- issuer: str | company or fund issuer
- expense_ratio: float | annual fee % (for funds)
- interest_rate: float | for bonds
- interest_type: str | for bonds
- risk_level: str | low, medium, high, very_high (see RISK_LEVELS enum)
- is_active: bool | still available for trading
- last_price: float | most recent price
- last_price_date: datetime | price update timestamp
- description: str | asset description
- created_at: datetime
- updated_at: datetime
```

### 13. InvestmentTransaction
Buy/sell transactions for assets.
```yaml
- id: int | primary key
- user_id: int | owner
- portfolio_id: int | foreign key to InvestmentPortfolio
- asset_id: int | foreign key to Asset
- transaction_type: str | buy, sell, dividend, interest, split, transfer_in, transfer_out (see INVESTMENT_TRANSACTION_TYPES enum)
- quantity: float | number of units/shares
- price_per_unit: float | price per share/unit
- total_amount: float | total transaction value
- fees: float | brokerage fees/commissions
- tax: float | taxes paid
- net_amount: float | total_amount + fees + tax
- transaction_date: datetime | transaction timestamp
- settlement_date: date | when transaction settles
- account_id: int | linked bank account for funding
- currency: str | transaction currency
- exchange_rate: float | if currency conversion needed
- confirmation_number: str | broker confirmation
- notes: str | transaction notes
- created_at: datetime
- updated_at: datetime
- is_active: bool
```

### 14. InvestmentHolding
Current investment positions.
```yaml
- id: int | primary key
- user_id: int | owner
- portfolio_id: int | foreign key to InvestmentPortfolio
- asset_id: int | foreign key to Asset
- quantity: float | current shares/units owned
- average_cost: float | average purchase price
- total_cost: float | total amount invested
- current_price: float | latest market price
- current_value: float | quantity × current_price
- unrealized_gain_loss: float | current_value - total_cost
- unrealized_gain_loss_pct: float | percentage gain/loss
- allocation_percentage: float | % of portfolio
- last_updated: datetime | price update timestamp
- notes: str | holding notes
- created_at: datetime
- updated_at: datetime
- is_active: bool
```

---

## 📊 Reports

### 15. Report
Generated financial reports.
```yaml
- id: int | primary key
- user_id: int | owner
- name: str | report name
- type: str | monthly_summary, cash_flow, net_worth, tax_report, income_statement, balance_sheet (see REPORT_TYPES enum)
- period_start: date | reporting period start
- period_end: date | reporting period end
- generated_at: datetime | generation timestamp
- data: json | report data and calculations
- format: str | pdf, excel, json, csv (see REPORT_FORMATS enum)
- file_url: str | link to generated file
- status: str | generating, completed, failed (see REPORT_STATUS enum)
- parameters: json | report configuration used
- notes: str | report notes
- created_at: datetime
- updated_at: datetime
- is_active: bool
```

### 16. ReportSchedule
Automated report generation.
```yaml
- id: int | primary key
- user_id: int | owner
- report_type: str | type of report to generate
- name: str | schedule name
- frequency: str | daily, weekly, monthly, quarterly, yearly (see REPORT_FREQUENCY enum)
- day_of_period: int | day to generate (e.g., 1st of month)
- recipients: [str] | email addresses for delivery
- format: str | desired output format
- parameters: json | report configuration
- last_run: datetime | last execution
- next_run: datetime | next scheduled execution
- is_active: bool | schedule enabled
- created_at: datetime
- updated_at: datetime
```

---

## 🔔 Notifications

### 17. Notification
User notifications and alerts.
```yaml
- id: int | primary key
- user_id: int | recipient
- type: str | payment_due, low_balance, budget_exceeded, goal_reached, debt_payment, bill_reminder (see NOTIFICATION_TYPES enum)
- title: str | notification headline
- message: str | notification body
- priority: str | low, medium, high, urgent (see PRIORITY_LEVELS enum)
- related_entity_type: str | debt, expense, budget, goal, account
- related_entity_id: int | ID of related entity
- action_url: str | deep link to relevant screen
- action_label: str | button text (e.g., "Pay Now")
- is_read: bool | read status
- is_dismissed: bool | dismissed by user
- sent_at: datetime | when notification was sent
- read_at: datetime | when user read it
- expires_at: datetime | expiration for time-sensitive alerts
- created_at: datetime
- updated_at: datetime
- is_active: bool
```

### 18. NotificationSettings
User notification preferences.
```yaml
- id: int | primary key
- user_id: int | owner
- notification_type: str | specific notification category
- enabled: bool | receive this type of notification
- delivery_method: [str] | email, push, sms, in_app (see DELIVERY_METHODS enum)
- advance_days: int | days before event to notify
- send_time: time | preferred notification time (e.g., 09:00)
- frequency: str | immediate, daily_digest, weekly_digest (see NOTIFICATION_FREQUENCY enum)
- quiet_hours_start: time | do not disturb start (e.g., 22:00)
- quiet_hours_end: time | do not disturb end (e.g., 08:00)
- created_at: datetime
- updated_at: datetime
- is_active: bool
```

---

## 👤 Users & Settings

### 19. User
User accounts and authentication.
```yaml
- id: int | primary key
- email: str | unique, indexed
- password_hash: str | hashed password
- name: str | full name
- first_name: str | first name
- last_name: str | last name
- country: str | ISO country code
- default_currency: str | primary currency
- phone: str | phone number (optional)
- avatar_url: str | profile picture
- email_verified: bool | email confirmation status
- phone_verified: bool | phone confirmation status
- is_premium: bool | subscription status
- premium_expires_at: datetime | subscription expiration
- last_login: datetime | last login timestamp
- login_count: int | total logins
- timezone: str | user timezone
- date_format: str | preferred date format
- number_format: str | preferred number format
- created_at: datetime
- updated_at: datetime
- is_active: bool | account status
```

### 20. UserSettings
Application preferences.
```yaml
- id: int | primary key
- user_id: int | foreign key to User
- language: str | en, es, fr, etc (see LANGUAGES enum)
- theme: str | light, dark, auto (see THEMES enum)
- rounding_mode: str | up, down, nearest (see ROUNDING_MODES enum)
- decimal_places: int | number of decimals to display (default: 2)
- currency_display: str | symbol, code, name ($ vs USD vs Dollar)
- date_format: str | MM/DD/YYYY, DD/MM/YYYY, YYYY-MM-DD
- time_format: str | 12h, 24h
- first_day_of_week: int | 0=Sunday, 1=Monday
- fiscal_year_start: int | month fiscal year starts (1-12)
- auto_backup: bool | automatic data backup
- backup_frequency: str | daily, weekly, monthly
- data_retention_days: int | how long to keep old data
- created_at: datetime
- updated_at: datetime
```

### 21. UserPreferences
Feature preferences and automation.
```yaml
- id: int | primary key
- user_id: int | foreign key to User
- auto_categorize: bool | use AI to categorize transactions
- notify_on_low_balance: bool | alert when balance is low
- low_balance_threshold: float | balance threshold for alerts
- notify_on_large_transaction: bool | alert on unusual transactions
- large_transaction_threshold: float | amount threshold
- suggest_budgets: bool | AI budget suggestions
- track_net_worth: bool | calculate net worth automatically
- enable_insights: bool | show financial insights
- show_spending_trends: bool | display trend analysis
- enable_bill_reminders: bool | remind about upcoming bills
- bill_reminder_days: int | days before bill due date
- enable_goal_tracking: bool | track financial goals
- enable_investment_tracking: bool | track investments
- privacy_mode: bool | hide sensitive numbers
- biometric_auth: bool | fingerprint/face ID
- require_auth_for_transactions: bool | confirm before creating transactions
- created_at: datetime
- updated_at: datetime
```

---

## 🛠 Auxiliary Models

### 22. RecurringTemplate
Templates for recurring transactions.
```yaml
- id: int | primary key
- user_id: int | owner
- type: str | income, expense
- name: str | template name
- amount: float | transaction amount
- category_id: int | foreign key to Category
- account_id: int | foreign key to Account
- payment_method: str | payment method
- frequency: str | daily, weekly, biweekly, monthly, quarterly, yearly (see RECURRENCE_FREQUENCY enum)
- interval: int | every X periods (e.g., every 2 weeks)
- day_of_period: int | day of month/week (1-31 for month, 0-6 for week)
- start_date: date | when recurrence starts
- end_date: date | when recurrence ends (optional)
- next_occurrence: date | next scheduled transaction
- last_generated: date | last transaction created
- auto_create: bool | automatically create transactions
- advance_days: int | days before due date to create
- description: str | transaction description
- tags: [str] | default tags
- is_active: bool | template enabled
- created_at: datetime
- updated_at: datetime
```

### 23. Tag
Custom tags for organizing transactions.
```yaml
- id: int | primary key
- user_id: int | owner
- name: str | tag name
- color: str | hex color
- icon: str | icon identifier
- usage_count: int | how many times used
- description: str | tag description
- created_at: datetime
- updated_at: datetime
- is_active: bool
```

### 24. TagRelation
Many-to-many relationship for tags.
```yaml
- id: int | primary key
- tag_id: int | foreign key to Tag
- entity_type: str | income, expense, debt, goal, budget
- entity_id: int | ID of tagged entity
- created_at: datetime
```

### 25. Attachment
File attachments for records.
```yaml
- id: int | primary key
- user_id: int | owner
- entity_type: str | income, expense, debt, asset, etc
- entity_id: int | ID of parent entity
- file_name: str | original filename
- file_type: str | mime type (image/jpeg, application/pdf)
- file_size: int | size in bytes
- file_url: str | storage URL
- thumbnail_url: str | preview image (for images/PDFs)
- description: str | file description
- uploaded_at: datetime
- created_at: datetime
- updated_at: datetime
- is_active: bool
```

### 26. ExchangeRate
Currency conversion rates.
```yaml
- id: int | primary key
- from_currency: str | source currency code
- to_currency: str | target currency code
- rate: float | conversion rate
- date: date | rate date
- source: str | api, manual, central_bank
- provider: str | rate provider name
- created_at: datetime
- updated_at: datetime
```

### 27. ActivityLog
Audit trail for important actions.
```yaml
- id: int | primary key
- user_id: int | user who performed action
- action: str | create, update, delete, login, export
- entity_type: str | model affected
- entity_id: int | ID of affected record
- old_values: json | before changes
- new_values: json | after changes
- ip_address: str | user IP
- user_agent: str | browser/app info
- timestamp: datetime
- created_at: datetime
```

---

## 📚 Enums & Constants

### CURRENCIES
```python
['USD', 'COP', 'EUR', 'MXN', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'BRL', 'ARS']
```

### PAYMENT_METHODS
```python
['cash', 'transfer', 'credit_card', 'debit_card', 'check', 'paypal', 'crypto', 'mobile_payment']
```

### TRANSACTION_STATUS
```python
['pending', 'completed', 'cancelled', 'failed', 'refunded', 'processing']
```

### TRANSACTION_TYPES
```python
['income', 'expense', 'both']
```

### ACCOUNT_TYPES
```python
['checking', 'savings', 'credit_card', 'investment', 'loan', 'cash', 'crypto_wallet', 'digital_wallet']
```

### INTEREST_TYPES
```python
['EA', 'EM', 'NOMINAL', 'TEA', 'APR', 'APY', 'SIMPLE', 'COMPOUND']
```

### DEBT_TYPES
```python
['loan', 'credit_card', 'mortgage', 'student_loan', 'personal_loan', 'car_loan', 'line_of_credit']
```

### DEBT_STATUS
```python
['active', 'paid', 'defaulted', 'refinanced', 'deferred', 'in_collections']
```

### PAYMENT_FREQUENCY
```python
['daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'semi_annual', 'annual']
```

### BUDGET_PERIOD
```python
['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'custom']
```

### PRIORITY_LEVELS
```python
['low', 'medium', 'high', 'urgent']
```

### GOAL_STATUS
```python
['in_progress', 'achieved', 'abandoned', 'paused', 'overdue']
```

### RISK_PROFILES
```python
['conservative', 'moderate', 'aggressive', 'very_aggressive']
```

### RISK_LEVELS
```python
['low', 'medium', 'high', 'very_high']
```

### REBALANCE_FREQUENCY
```python
['monthly', 'quarterly', 'semi_annual', 'annual', 'manual']
```

### ASSET_TYPES
```python
['stock', 'bond', 'etf', 'mutual_fund', 'crypto', 'commodity', 'real_estate', 'cash', 'alternative']
```

### INVESTMENT_TRANSACTION_TYPES
```python
['buy', 'sell', 'dividend', 'interest', 'split', 'transfer_in', 'transfer_out', 'fee', 'tax']
```

### REPORT_TYPES
```python
['monthly_summary', 'cash_flow', 'net_worth', 'tax_report', 'income_statement', 'balance_sheet', 'spending_analysis', 'investment_performance']
```

### REPORT_FORMATS
```python
['pdf', 'excel', 'csv', 'json', 'html']
```

### REPORT_STATUS
```python
['queued', 'generating', 'completed', 'failed']
```

### REPORT_FREQUENCY
```python
['daily', 'weekly', 'monthly', 'quarterly', 'yearly']
```

### NOTIFICATION_TYPES
```python
['payment_due', 'low_balance', 'budget_exceeded', 'goal_reached', 'debt_payment', 'bill_reminder', 'large_transaction', 'unusual_activity', 'price_alert', 'investment_update']
```

### DELIVERY_METHODS
```python
['email', 'push', 'sms', 'in_app']
```

### NOTIFICATION_FREQUENCY
```python
['immediate', 'hourly_digest', 'daily_digest', 'weekly_digest']
```

### RECURRENCE_FREQUENCY
```python
['daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'semi_annual', 'annual', 'custom']
```

### LANGUAGES
```python
['en', 'es', 'fr', 'de', 'it', 'pt', 'zh', 'ja', 'ko', 'ru']
```

### THEMES
```python
['light', 'dark', 'auto']
```

### ROUNDING_MODES
```python
['up', 'down', 'nearest', 'none']
```

---

## ✅ Validation Rules

### Critical Validations

#### Income / Expense
- `amount` > 0
- If `recurring` = true, then `day_income`/`day_expense` must be 1-31
- `received`/`paid` can only be true if `date` <= current_date
- If `currency` ≠ `account.currency`, then `exchange_rate` is required
- `converted_amount` = `amount` × `exchange_rate`

#### Transfer
- `from_account_id` ≠ `to_account_id`
- Both accounts must belong to same `user_id`
- `amount` > 0
- If `from_currency` ≠ `to_currency`, then `exchange_rate` is required
- `from_account.balance` >= `amount` + `fee` (for completed transfers)

#### Debt
- `current_balance` <= `principal`
- `installments_paid` <= `installments`
- `next_due_date` > `last_payment_date`
- If `status` = 'paid', then `current_balance` = 0
- `min_payment` <= `installment_amount`

#### DebtPayment
- `principal_paid` + `interest_paid` + `fees_paid` = `amount_paid`
- `payment_number` <= `debt.installments`
- `remaining_balance` = previous `remaining_balance` - `principal_paid`

#### Account (Credit Card)
- `balance` <= `credit_limit`
- `statement_day` must be 1-31
- `due_day` must be 1-31
- `min_payment_percentage` should be 0-100

#### Budget
- `amount` > 0
- `end_date` > `start_date` (if provided)
- `alert_threshold` should be 0-100
- `spent_amount` <= `amount` × (`alert_threshold` / 100) triggers notification

#### FinancialGoal
- `target_amount` > 0
- `current_amount` >= 0
- `current_amount` <= `target_amount`
- `deadline` > `start_date`
- If `status` = 'achieved', then `current_amount` >= `target_amount`

#### InvestmentTransaction
- `quantity` > 0 for 'buy'
- `quantity` <= `holding.quantity` for 'sell'
- `total_amount` = `quantity` × `price_per_unit`
- `net_amount` = `total_amount` + `fees` + `tax`

#### User
- `email` must be unique and valid format
- `password_hash` length >= 60 characters (bcrypt)
- `default_currency` must be in CURRENCIES enum

---

## 🔍 Database Indexes

Recommended indexes for performance:

### Primary Indexes
- All `id` fields (primary key, auto-indexed)
- `user_id` on ALL models (composite indexes with date fields)
- `email` on User (unique index)

### Composite Indexes
- `(user_id, date)` on Income, Expense
- `(user_id, type, is_active)` on Account
- `(user_id, transaction_type)` on Category
- `(user_id, status)` on Debt
- `(user_id, portfolio_id, asset_id)` on InvestmentHolding
- `(from_currency, to_currency, date)` on ExchangeRate
- `(tag_id, entity_type, entity_id)` on TagRelation

### Performance Indexes
- `created_at` on ActivityLog (for cleanup)
- `next_occurrence` on RecurringTemplate (for automation)
- `next_due_date` on Debt (for notifications)
- `sent_at` on Notification (for cleanup)

---

## 💡 Implementation Considerations

### Data Types
- **Money amounts**: Use `DECIMAL(19,4)` instead of `FLOAT` for precision
- **Store in smallest unit**: Consider storing amounts in cents (integer) to avoid floating point errors
- **Dates**: Use timezone-aware datetime for all timestamps
- **JSON fields**: For flexible data like `target_allocation`, `parameters`, etc.

### Soft Deletes
- All models include `is_active` for soft deletion
- Never hard delete financial records (audit/legal requirements)
- Implement `deleted_at` timestamp if needed for compliance

### Audit Trail
- `created_at` and `updated_at` on all models
- ActivityLog for sensitive operations
- Consider immutable transaction logs

### Multi-Currency
- Always store original currency and amount
- Calculate conversions at query time when possible
- Cache exchange rates but allow manual override
- Consider using base currency for reporting

### Security
- Hash passwords with bcrypt (min 12 rounds)
- Encrypt sensitive data (account numbers, etc.)
- Use JWT/OAuth for API authentication
- Implement row-level security (RLS) for user_id filtering

### Performance
- Denormalize when necessary (e.g., `current_balance` on Account)
- Use calculated fields for frequently accessed data
- Implement caching for exchange rates, asset prices
- Consider partitioning large tables (transactions) by date

### Scalability
- Use database migrations for schema changes
- Version your API endpoints
- Implement pagination for all list endpoints
- Use job queues for heavy tasks (report generation, notifications)

---

## 🚀 Next Steps

### Phase 1: MVP (Core Functionality)
1. Implement User authentication
2. Create Income/Expense/Transfer models
3. Basic Account management
4. Simple Category system
5. Basic dashboard

### Phase 2: Financial Management
1. Debt tracking and payments
2. Budget system with alerts
3. Financial goals
4. Recurring transactions
5. Reports (basic)

### Phase 3: Advanced Features
1. Investment tracking
2. Multi-currency support with live rates
3. Advanced reports and analytics
4. Notification system
5. Mobile app sync

### Phase 4: Intelligence
1. AI-powered categorization
2. Spending insights and recommendations
3. Budget suggestions
4. Financial forecasting
5. Anomaly detection

---

## 📖 Additional Resources

### Related Documentation
- API Endpoints: `/docs/api.md`
- Database Schema: `/docs/schema.md`
- Business Logic: `/docs/business-rules.md`
- Security: `/docs/security.md`

### External References
- [ISO 4217 Currency Codes](https://www.iso.org/iso-4217-currency-codes.html)
- [ISO 3166 Country Codes](https://www.iso.org/iso-3166-country-codes.html)
- [IBAN Validation](https://www.iban.com/)

---

**Version**: 2.0  
**Last Updated**: 2025-01-20  
**Maintainer**: Development Team