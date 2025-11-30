/**
 * models.js - Core Transaction Models for FinanceTrack
 * 
 * Models for Income, Expense, and Transfer transactions.
 * Transformed from Python dataclasses to JavaScript ES6 classes.
 */

// ==================== ENUMS & CONSTANTS ====================

/**
 * Supported currencies
 * En JS no hay enums nativos, usamos Object.freeze() para hacerlo inmutable
 */
export const Currency = Object.freeze({
    USD: 'USD',
    COP: 'COP',
    EUR: 'EUR',
    MXN: 'MXN',
    GBP: 'GBP',
    JPY: 'JPY',
    CAD: 'CAD',
    AUD: 'AUD',
    CHF: 'CHF',
    CNY: 'CNY',
    BRL: 'BRL',
    ARS: 'ARS'
});

/**
 * Payment methods
 */
export const PaymentMethod = Object.freeze({
    CASH: 'cash',
    TRANSFER: 'transfer',
    CREDIT_CARD: 'credit_card',
    DEBIT_CARD: 'debit_card',
    CHECK: 'check',
    PAYPAL: 'paypal',
    CRYPTO: 'crypto',
    MOBILE_PAYMENT: 'mobile_payment'
});

/**
 * Transaction status
 */
export const TransactionStatus = Object.freeze({
    PENDING: 'pending',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
    FAILED: 'failed',
    REFUNDED: 'refunded',
    PROCESSING: 'processing'
});


// ==================== CORE TRANSACTION MODELS ====================

/**
 * Tracks all income sources and receipts.
 */
export class Income {
    /**
     * @param {Object} data - Income data
     * @param {number} data.id - Unique identifier
     * @param {number} data.userId - Owner of this income record
     * @param {Date|string} data.date - Date received or expected
     * @param {number} data.amount - Total amount
     * @param {string} data.name - Descriptive name of income source
     * @param {number} data.categoryId - Foreign key to Category
     * @param {number} data.accountId - Foreign key to Account
     * @param {string} [data.description=''] - Additional details
     * @param {boolean} [data.recurring=false] - Whether this income repeats
     * @param {number|null} [data.dayIncome=null] - Day of month (1-31)
     * @param {string} [data.paymentMethod='transfer'] - How income was received
     * @param {string} [data.currency='USD'] - Currency code
     * @param {boolean} [data.received=false] - Whether confirmed vs pending
     * @param {number|null} [data.exchangeRate=null] - Conversion rate
     * @param {number|null} [data.convertedAmount=null] - Amount in account's currency
     * @param {string|null} [data.attachmentUrl=null] - Link to receipt
     * @param {string[]} [data.tags=[]] - Custom tags for filtering
     * @param {string} [data.notes=''] - Internal notes
     * @param {number|null} [data.recurringTemplateId=null] - Template FK
     */
    constructor(data) {
        // Required fields
        this.id = data.id;
        this.userId = data.userId;
        this.date = data.date instanceof Date ? data.date : new Date(data.date);
        this.amount = data.amount;
        this.name = data.name;
        this.categoryId = data.categoryId;
        this.accountId = data.accountId;

        // Optional fields with defaults
        this.description = data.description ?? '';
        this.recurring = data.recurring ?? false;
        this.dayIncome = data.dayIncome ?? null;
        this.paymentMethod = data.paymentMethod ?? PaymentMethod.TRANSFER;
        this.currency = data.currency ?? Currency.USD;
        this.received = data.received ?? false;

        // Currency conversion
        this.exchangeRate = data.exchangeRate ?? null;
        this.convertedAmount = data.convertedAmount ?? null;

        // Additional metadata
        this.attachmentUrl = data.attachmentUrl ?? null;
        this.tags = data.tags ?? [];
        this.notes = data.notes ?? '';
        this.recurringTemplateId = data.recurringTemplateId ?? null;

        // Audit fields
        this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
        this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date();
        this.isActive = data.isActive ?? true;

        // Validate after setting all fields
        this.#validate();
    }

    /**
     * Private validation method
     * El # hace el método privado (solo accesible dentro de la clase)
     */
    #validate() {
        if (this.amount <= 0) {
            throw new Error('Income amount must be greater than 0');
        }
        if (this.dayIncome !== null && (this.dayIncome < 1 || this.dayIncome > 31)) {
            throw new Error('dayIncome must be between 1 and 31');
        }
        if (this.recurring && this.dayIncome === null) {
            throw new Error('dayIncome is required for recurring income');
        }
    }

    /**
     * Calculate amount in account's currency
     * @param {number} rate - Exchange rate
     * @returns {number} Converted amount
     */
    calculateConvertedAmount(rate) {
        this.exchangeRate = rate;
        this.convertedAmount = this.amount * rate;
        return this.convertedAmount;
    }

    /**
     * Mark income as received
     */
    markAsReceived() {
        this.received = true;
        this.updatedAt = new Date();
    }

    /**
     * Convert to plain object (useful for localStorage)
     * @returns {Object}
     */
    toJSON() {
        return {
            id: this.id,
            userId: this.userId,
            date: this.date.toISOString(),
            amount: this.amount,
            name: this.name,
            categoryId: this.categoryId,
            accountId: this.accountId,
            description: this.description,
            recurring: this.recurring,
            dayIncome: this.dayIncome,
            paymentMethod: this.paymentMethod,
            currency: this.currency,
            received: this.received,
            exchangeRate: this.exchangeRate,
            convertedAmount: this.convertedAmount,
            attachmentUrl: this.attachmentUrl,
            tags: this.tags,
            notes: this.notes,
            recurringTemplateId: this.recurringTemplateId,
            createdAt: this.createdAt.toISOString(),
            updatedAt: this.updatedAt.toISOString(),
            isActive: this.isActive
        };
    }

    /**
     * Create Income from plain object (useful when loading from localStorage)
     * @param {Object} obj - Plain object
     * @returns {Income}
     */
    static fromJSON(obj) {
        return new Income(obj);
    }
}


/**
 * Tracks all expenses and purchases.
 */
export class Expense {
    /**
     * @param {Object} data - Expense data
     * @param {number} data.id - Unique identifier
     * @param {number} data.userId - Owner of this expense record
     * @param {Date|string} data.date - Date of expense
     * @param {number} data.amount - Total amount
     * @param {string} data.name - Descriptive name
     * @param {number} data.categoryId - Foreign key to Category
     * @param {number} data.accountId - Foreign key to Account
     * @param {string} [data.description=''] - Additional details
     * @param {boolean} [data.recurring=false] - Whether repeats
     * @param {number|null} [data.dayExpense=null] - Day of month (1-31)
     * @param {string} [data.paymentMethod='credit_card'] - Payment method
     * @param {string} [data.currency='USD'] - Currency code
     * @param {Date|string|null} [data.dueDate=null] - Maximum date to pay
     * @param {boolean} [data.paid=false] - Whether payment confirmed
     * @param {number|null} [data.exchangeRate=null] - Conversion rate
     * @param {number|null} [data.convertedAmount=null] - Converted amount
     * @param {string|null} [data.attachmentUrl=null] - Link to receipt
     * @param {string[]} [data.tags=[]] - Custom tags
     * @param {string} [data.notes=''] - Internal notes
     * @param {number|null} [data.recurringTemplateId=null] - Template FK
     * @param {number|null} [data.budgetId=null] - Budget FK
     */
    constructor(data) {
        // Required fields
        this.id = data.id;
        this.userId = data.userId;
        this.date = data.date instanceof Date ? data.date : new Date(data.date);
        this.amount = data.amount;
        this.name = data.name;
        this.categoryId = data.categoryId;
        this.accountId = data.accountId;

        // Optional fields with defaults
        this.description = data.description ?? '';
        this.recurring = data.recurring ?? false;
        this.dayExpense = data.dayExpense ?? null;
        this.paymentMethod = data.paymentMethod ?? PaymentMethod.CREDIT_CARD;
        this.currency = data.currency ?? Currency.USD;
        this.dueDate = data.dueDate ? (data.dueDate instanceof Date ? data.dueDate : new Date(data.dueDate)) : null;
        this.paid = data.paid ?? false;

        // Currency conversion
        this.exchangeRate = data.exchangeRate ?? null;
        this.convertedAmount = data.convertedAmount ?? null;

        // Additional metadata
        this.attachmentUrl = data.attachmentUrl ?? null;
        this.tags = data.tags ?? [];
        this.notes = data.notes ?? '';
        this.recurringTemplateId = data.recurringTemplateId ?? null;
        this.budgetId = data.budgetId ?? null;

        // Audit fields
        this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
        this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date();
        this.isActive = data.isActive ?? true;

        // Validate
        this.#validate();
    }

    #validate() {
        if (this.amount <= 0) {
            throw new Error('Expense amount must be greater than 0');
        }
        if (this.dayExpense !== null && (this.dayExpense < 1 || this.dayExpense > 31)) {
            throw new Error('dayExpense must be between 1 and 31');
        }
        if (this.recurring && this.dayExpense === null) {
            throw new Error('dayExpense is required for recurring expenses');
        }
        if (this.dueDate && this.date > this.dueDate) {
            throw new Error('Expense date cannot be after dueDate');
        }
    }

    /**
     * Calculate amount in account's currency
     * @param {number} rate - Exchange rate
     * @returns {number}
     */
    calculateConvertedAmount(rate) {
        this.exchangeRate = rate;
        this.convertedAmount = this.amount * rate;
        return this.convertedAmount;
    }

    /**
     * Mark expense as paid
     */
    markAsPaid() {
        this.paid = true;
        this.updatedAt = new Date();
    }

    /**
     * Check if expense is overdue
     * @returns {boolean}
     */
    isOverdue() {
        if (!this.dueDate || this.paid) return false;
        return new Date() > this.dueDate;
    }

    /**
     * Get days until due date
     * @returns {number|null}
     */
    getDaysUntilDue() {
        if (!this.dueDate) return null;
        const today = new Date();
        const diffTime = this.dueDate.getTime() - today.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    toJSON() {
        return {
            id: this.id,
            userId: this.userId,
            date: this.date.toISOString(),
            amount: this.amount,
            name: this.name,
            categoryId: this.categoryId,
            accountId: this.accountId,
            description: this.description,
            recurring: this.recurring,
            dayExpense: this.dayExpense,
            paymentMethod: this.paymentMethod,
            currency: this.currency,
            dueDate: this.dueDate?.toISOString() ?? null,
            paid: this.paid,
            exchangeRate: this.exchangeRate,
            convertedAmount: this.convertedAmount,
            attachmentUrl: this.attachmentUrl,
            tags: this.tags,
            notes: this.notes,
            recurringTemplateId: this.recurringTemplateId,
            budgetId: this.budgetId,
            createdAt: this.createdAt.toISOString(),
            updatedAt: this.updatedAt.toISOString(),
            isActive: this.isActive
        };
    }

    static fromJSON(obj) {
        return new Expense(obj);
    }
}


/**
 * Transfers between user's own accounts.
 */
export class Transfer {
    /**
     * @param {Object} data - Transfer data
     * @param {number} data.id - Unique identifier
     * @param {number} data.userId - Owner of both accounts
     * @param {number} data.fromAccountId - Source account
     * @param {number} data.toAccountId - Destination account
     * @param {number} data.amount - Amount transferred
     * @param {string} data.fromCurrency - Source currency
     * @param {string} data.toCurrency - Destination currency
     * @param {Date|string} [data.date] - Transfer date
     * @param {number} [data.exchangeRate=1.0] - Conversion rate
     * @param {number|null} [data.convertedAmount=null] - Amount received
     * @param {number} [data.fee=0.0] - Transfer fee
     * @param {string} [data.description=''] - Transfer purpose
     * @param {string|null} [data.referenceNumber=null] - Bank reference
     * @param {string} [data.status='pending'] - Transfer status
     * @param {string} [data.notes=''] - Internal notes
     */
    constructor(data) {
        // Required fields
        this.id = data.id;
        this.userId = data.userId;
        this.fromAccountId = data.fromAccountId;
        this.toAccountId = data.toAccountId;
        this.amount = data.amount;
        this.fromCurrency = data.fromCurrency;
        this.toCurrency = data.toCurrency;

        // Transfer details
        this.date = data.date ? (data.date instanceof Date ? data.date : new Date(data.date)) : new Date();
        this.exchangeRate = data.exchangeRate ?? 1.0;
        this.convertedAmount = data.convertedAmount ?? null;
        this.fee = data.fee ?? 0.0;
        this.description = data.description ?? '';
        this.referenceNumber = data.referenceNumber ?? null;
        this.status = data.status ?? TransactionStatus.PENDING;
        this.notes = data.notes ?? '';

        // Audit fields
        this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
        this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date();
        this.isActive = data.isActive ?? true;

        // Validate and calculate
        this.#validate();
    }

    #validate() {
        if (this.amount <= 0) {
            throw new Error('Transfer amount must be greater than 0');
        }
        if (this.fromAccountId === this.toAccountId) {
            throw new Error('Cannot transfer to the same account');
        }
        if (this.exchangeRate <= 0) {
            throw new Error('Exchange rate must be greater than 0');
        }

        // Calculate converted amount if not provided
        if (this.convertedAmount === null) {
            this.convertedAmount = this.amount * this.exchangeRate;
        }
    }

    /**
     * Mark transfer as completed
     */
    complete() {
        this.status = TransactionStatus.COMPLETED;
        this.updatedAt = new Date();
    }

    /**
     * Cancel the transfer
     */
    cancel() {
        this.status = TransactionStatus.CANCELLED;
        this.updatedAt = new Date();
    }

    /**
     * Get amount after fees
     * @returns {number}
     */
    getNetAmount() {
        return this.amount - this.fee;
    }

    /**
     * Check if transfer is pending
     * @returns {boolean}
     */
    isPending() {
        return this.status === TransactionStatus.PENDING;
    }

    toJSON() {
        return {
            id: this.id,
            userId: this.userId,
            fromAccountId: this.fromAccountId,
            toAccountId: this.toAccountId,
            amount: this.amount,
            fromCurrency: this.fromCurrency,
            toCurrency: this.toCurrency,
            date: this.date.toISOString(),
            exchangeRate: this.exchangeRate,
            convertedAmount: this.convertedAmount,
            fee: this.fee,
            description: this.description,
            referenceNumber: this.referenceNumber,
            status: this.status,
            notes: this.notes,
            createdAt: this.createdAt.toISOString(),
            updatedAt: this.updatedAt.toISOString(),
            isActive: this.isActive
        };
    }

    static fromJSON(obj) {
        return new Transfer(obj);
    }
}


// ==================== HELPER FUNCTIONS ====================

/**
 * Validate if currency code is supported
 * @param {string} currency 
 * @returns {boolean}
 */
export function validateCurrency(currency) {
    return Object.values(Currency).includes(currency);
}

/**
 * Validate if payment method is supported
 * @param {string} method 
 * @returns {boolean}
 */
export function validatePaymentMethod(method) {
    return Object.values(PaymentMethod).includes(method);
}

/**
 * Generate a unique ID (simple version for localStorage)
 * En producción usarías UUID o IDs del servidor
 * @returns {number}
 */
export function generateId() {
    return Date.now() + Math.floor(Math.random() * 1000);
}


// ==================== EXAMPLE USAGE ====================

// Descomenta para probar en consola del navegador:
/*
const income = new Income({
    id: generateId(),
    userId: 1,
    date: new Date('2025-01-15'),
    amount: 5000.00,
    name: 'Monthly Salary',
    categoryId: 1,
    accountId: 1,
    recurring: true,
    dayIncome: 15,
    paymentMethod: PaymentMethod.TRANSFER,
    currency: Currency.USD,
    received: true,
    tags: ['salary', 'main-job']
});
console.log('Income created:', income);

const expense = new Expense({
    id: generateId(),
    userId: 1,
    date: new Date('2025-01-20'),
    amount: 150.00,
    name: 'Grocery Shopping',
    categoryId: 2,
    accountId: 1,
    paymentMethod: PaymentMethod.DEBIT_CARD,
    currency: Currency.USD,
    paid: true,
    tags: ['food', 'essential']
});
console.log('Expense created:', expense);

const transfer = new Transfer({
    id: generateId(),
    userId: 1,
    fromAccountId: 1,
    toAccountId: 2,
    amount: 1000.00,
    fromCurrency: Currency.USD,
    toCurrency: Currency.USD,
    description: 'Moving to savings',
    fee: 5.00
});
console.log('Transfer created:', transfer);
console.log('Net amount:', transfer.getNetAmount());
*/