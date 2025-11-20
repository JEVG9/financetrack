"""
core_models.py - Core Transaction Models for FinanceTrack

Models for Income, Expense, and Transfer transactions.
"""

from dataclasses import dataclass, field
from typing import List, Optional
from datetime import date, datetime
from enum import Enum


# ==================== ENUMS & CONSTANTS ====================

class Currency(Enum):
    """Supported currencies"""
    USD = "USD"
    COP = "COP"
    EUR = "EUR"
    MXN = "MXN"
    GBP = "GBP"
    JPY = "JPY"
    CAD = "CAD"
    AUD = "AUD"
    CHF = "CHF"
    CNY = "CNY"
    BRL = "BRL"
    ARS = "ARS"


class PaymentMethod(Enum):
    """Payment methods"""
    CASH = "cash"
    TRANSFER = "transfer"
    CREDIT_CARD = "credit_card"
    DEBIT_CARD = "debit_card"
    CHECK = "check"
    PAYPAL = "paypal"
    CRYPTO = "crypto"
    MOBILE_PAYMENT = "mobile_payment"


class TransactionStatus(Enum):
    """Transaction status"""
    PENDING = "pending"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    FAILED = "failed"
    REFUNDED = "refunded"
    PROCESSING = "processing"


# ==================== CORE TRANSACTION MODELS ====================

@dataclass
class Income:

    """
    Tracks all income sources and receipts.
    
    Attributes:
        id: Unique identifier
        user_id: Owner of this income record
        date: Date received or expected
        amount: Total amount (consider storing in cents for precision)
        name: Descriptive name of income source
        category_id: Foreign key to Category
        description: Additional details
        recurring: Whether this income repeats automatically
        day_income: Day of month when income arrives (1-31)
        payment_method: How income was received
        currency: Currency code
        account_id: Foreign key to Account where received
        received: Whether income has been confirmed vs pending 
        exchange_rate: Conversion rate if currency differs from account
        converted_amount: Amount in account's currency
        attachment_url: Link to receipt/proof document
        tags: Custom tags for filtering
        notes: Internal notes
        recurring_template_id: Foreign key if auto-generated from template
        created_at: Record creation timestamp
        updated_at: Last modification timestamp
        is_active: Soft delete flag
    """
    id: int
    user_id: int
    date: date
    amount: float
    name: str
    category_id: int
    account_id: int
    
    # Optional fields with defaults
    description: str = ""
    recurring: bool = False
    day_income: Optional[int] = None  # 1-31
    payment_method: str = PaymentMethod.TRANSFER.value
    currency: str = Currency.USD.value
    received: bool = False
    
    # Currency conversion
    exchange_rate: Optional[float] = None
    converted_amount: Optional[float] = None
    
    # Additional metadata
    attachment_url: Optional[str] = None
    tags: List[str] = field(default_factory=list)
    notes: str = ""
    recurring_template_id: Optional[int] = None
    
    # Audit fields
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)
    is_active: bool = True
    
    def __post_init__(self):
        """Validate data after initialization"""
        if self.amount <= 0:
            raise ValueError("Income amount must be greater than 0")
        if self.day_income is not None and not (1 <= self.day_income <= 31):
            raise ValueError("day_income must be between 1 and 31")
        if self.recurring and self.day_income is None:
            raise ValueError("day_income is required for recurring income")
    
    def calculate_converted_amount(self, rate: float) -> float:
        """Calculate amount in account's currency"""
        self.exchange_rate = rate
        self.converted_amount = self.amount * rate
        return self.converted_amount


@dataclass
class Expense:
    """
    Tracks all expenses and purchases.
    
    Attributes:
        id: Unique identifier
        user_id: Owner of this expense record
        date: Date of expense
        amount: Total amount (consider storing in cents for precision)
        name: Descriptive name of expense
        category_id: Foreign key to Category
        description: Additional details
        recurring: Whether this expense repeats automatically
        day_expense: Day of month when payment is due (1-31)
        payment_method: How payment was made
        currency: Currency code
        account_id: Foreign key to Account used for payment
        due_date: Maximum date to pay (for pending expenses)
        paid: Whether payment has been confirmed
        exchange_rate: Conversion rate if currency differs from account
        converted_amount: Amount in account's currency
        attachment_url: Link to receipt/invoice
        tags: Custom tags for filtering
        notes: Internal notes
        recurring_template_id: Foreign key if auto-generated from template
        budget_id: Foreign key to Budget (optional)
        created_at: Record creation timestamp
        updated_at: Last modification timestamp
        is_active: Soft delete flag
    """
    id: int
    user_id: int
    date: date
    amount: float
    name: str
    category_id: int
    account_id: int
    
    # Optional fields with defaults
    description: str = ""
    recurring: bool = False
    day_expense: Optional[int] = None  # 1-31
    payment_method: str = PaymentMethod.CREDIT_CARD.value
    currency: str = Currency.USD.value
    due_date: Optional[date] = None
    paid: bool = False
    
    # Currency conversion
    exchange_rate: Optional[float] = None
    converted_amount: Optional[float] = None
    
    # Additional metadata
    attachment_url: Optional[str] = None
    tags: List[str] = field(default_factory=list)
    notes: str = ""
    recurring_template_id: Optional[int] = None
    budget_id: Optional[int] = None
    
    # Audit fields
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)
    is_active: bool = True
    
    def __post_init__(self):
        """Validate data after initialization"""
        if self.amount <= 0:
            raise ValueError("Expense amount must be greater than 0")
        if self.day_expense is not None and not (1 <= self.day_expense <= 31):
            raise ValueError("day_expense must be between 1 and 31")
        if self.recurring and self.day_expense is None:
            raise ValueError("day_expense is required for recurring expenses")
        if self.due_date and self.date > self.due_date:
            raise ValueError("expense date cannot be after due_date")
    
    def calculate_converted_amount(self, rate: float) -> float:
        """Calculate amount in account's currency"""
        self.exchange_rate = rate
        self.converted_amount = self.amount * rate
        return self.converted_amount
    
    def mark_as_paid(self):
        """Mark expense as paid"""
        self.paid = True
        self.updated_at = datetime.now()


@dataclass
class Transfer:
    """
    Transfers between user's own accounts.
    
    Attributes:
        id: Unique identifier
        user_id: Owner of both accounts
        date: Transfer date and time
        from_account_id: Source account
        to_account_id: Destination account
        amount: Amount transferred from source
        from_currency: Source account currency
        to_currency: Destination account currency
        exchange_rate: Conversion rate used
        converted_amount: Amount received in destination
        fee: Transfer fee/commission
        description: Transfer purpose
        reference_number: Bank reference number
        status: Transfer status (pending, completed, etc.)
        notes: Internal notes
        created_at: Record creation timestamp
        updated_at: Last modification timestamp
        is_active: Soft delete flag
    """
    id: int
    user_id: int
    from_account_id: int
    to_account_id: int
    amount: float
    from_currency: str
    to_currency: str
    
    # Transfer details
    date: datetime = field(default_factory=datetime.now)
    exchange_rate: float = 1.0
    converted_amount: Optional[float] = None
    fee: float = 0.0
    description: str = ""
    reference_number: Optional[str] = None
    status: str = TransactionStatus.PENDING.value
    notes: str = ""
    
    # Audit fields
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)
    is_active: bool = True
    
    def __post_init__(self):
        """Validate data after initialization"""
        if self.amount <= 0:
            raise ValueError("Transfer amount must be greater than 0")
        if self.from_account_id == self.to_account_id:
            raise ValueError("Cannot transfer to the same account")
        if self.exchange_rate <= 0:
            raise ValueError("Exchange rate must be greater than 0")
        
        # Calculate converted amount if not provided
        if self.converted_amount is None:
            self.converted_amount = self.amount * self.exchange_rate
    
    def complete_transfer(self):
        """Mark transfer as completed"""
        self.status = TransactionStatus.COMPLETED.value
        self.updated_at = datetime.now()
    
    def cancel_transfer(self):
        """Cancel the transfer"""
        self.status = TransactionStatus.CANCELLED.value
        self.updated_at = datetime.now()
    
    def get_net_amount(self) -> float:
        """Get amount after fees"""
        return self.amount - self.fee


# ==================== HELPER FUNCTIONS ====================

def validate_currency(currency: str) -> bool:
    """Validate if currency code is supported"""
    return currency in [c.value for c in Currency]


def validate_payment_method(method: str) -> bool:
    """Validate if payment method is supported"""
    return method in [m.value for m in PaymentMethod]


# ==================== EXAMPLE USAGE ====================

if __name__ == "__main__":
    # Example: Creating an income record
    income = Income(
        id=1,
        user_id=1,
        date=date(2025, 1, 15),
        amount=5000.00,
        name="Monthly Salary",
        category_id=1,
        account_id=1,
        recurring=True,
        day_income=15,
        payment_method=PaymentMethod.TRANSFER.value,
        currency=Currency.USD.value,
        received=True,
        tags=["salary", "main-job"]
    )
    print(f"Income created: {income.name} - ${income.amount}")
    
    # Example: Creating an expense
    expense = Expense(
        id=1,
        user_id=1,
        date=date(2025, 1, 20),
        amount=150.00,
        name="Grocery Shopping",
        category_id=2,
        account_id=1,
        payment_method=PaymentMethod.DEBIT_CARD.value,
        currency=Currency.USD.value,
        paid=True,
        tags=["food", "essential"]
    )
    print(f"Expense created: {expense.name} - ${expense.amount}")
    
    # Example: Creating a transfer
    transfer = Transfer(
        id=1,
        user_id=1,
        from_account_id=1,
        to_account_id=2,
        amount=1000.00,
        from_currency=Currency.USD.value,
        to_currency=Currency.USD.value,
        description="Moving to savings",
        fee=5.00
    )
    print(f"Transfer created: ${transfer.amount} (net: ${transfer.get_net_amount()})")
    transfer.complete_transfer()
    print(f"Transfer status: {transfer.status}")