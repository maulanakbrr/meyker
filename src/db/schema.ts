import {
  pgTable,
  uuid,
  text,
  timestamp,
  numeric,
  boolean,
  pgEnum,
  index,
} from 'drizzle-orm/pg-core'

// Enums
export const transactionTypeEnum = pgEnum('transaction_type', ['INCOME', 'EXPENSE'])
export const transactionSourceEnum = pgEnum('transaction_source', ['WEB', 'WHATSAPP', 'IMPORT'])
export const paymentMethodEnum = pgEnum('payment_method', [
  'CASH',
  'BANK_TRANSFER',
  'CREDIT_CARD',
  'E_WALLET',
])

// Profiles table (linked to auth.users)
export const profiles = pgTable(
  'profiles',
  {
    id: uuid('id').primaryKey(), // maps to auth.users.id
    email: text('email').notNull(),
    fullName: text('full_name'),
    avatarUrl: text('avatar_url'),
    phoneNumber: text('phone_number').unique(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_profiles_phone').on(table.phoneNumber),
  ]
)

// Categories table (global defaults have null user_id)
export const categories = pgTable(
  'categories',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id'), // null for global default categories
    name: text('name').notNull(),
    type: transactionTypeEnum('type').notNull(), // INCOME | EXPENSE
    icon: text('icon').notNull().default('Tag'),
    color: text('color').notNull().default('#6366f1'),
    isDefault: boolean('is_default').default(false).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_categories_user').on(table.userId),
  ]
)

// Transactions table
export const transactions = pgTable(
  'transactions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').notNull(),
    categoryId: uuid('category_id').references(() => categories.id, { onDelete: 'set null' }),
    amount: numeric('amount', { precision: 14, scale: 2 }).notNull(),
    type: transactionTypeEnum('type').notNull(), // INCOME | EXPENSE
    transactionDate: timestamp('transaction_date', { withTimezone: true }).notNull(),
    paymentMethod: paymentMethodEnum('payment_method').default('CASH').notNull(),
    note: text('note'),
    source: transactionSourceEnum('source').default('WEB').notNull(), // WEB | WHATSAPP | IMPORT
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    // Requirement 3: Index on (user_id, transaction_date DESC)
    index('idx_transactions_user_date').on(table.userId, table.transactionDate.desc()),
  ]
)

// Default System Categories Seed Data
export const DEFAULT_CATEGORIES = [
  { name: 'Food & Dining', type: 'EXPENSE', icon: 'Utensils', color: '#f59e0b', isDefault: true },
  { name: 'Housing & Rent', type: 'EXPENSE', icon: 'Home', color: '#ef4444', isDefault: true },
  { name: 'Transport & Fuel', type: 'EXPENSE', icon: 'Car', color: '#3b82f6', isDefault: true },
  { name: 'Utilities & Bills', type: 'EXPENSE', icon: 'Zap', color: '#8b5cf6', isDefault: true },
  { name: 'Shopping', type: 'EXPENSE', icon: 'ShoppingBag', color: '#ec4899', isDefault: true },
  { name: 'Entertainment', type: 'EXPENSE', icon: 'Film', color: '#06b6d4', isDefault: true },
  { name: 'Health & Medical', type: 'EXPENSE', icon: 'HeartPulse', color: '#10b981', isDefault: true },
  { name: 'Salary & Wages', type: 'INCOME', icon: 'Wallet', color: '#10b981', isDefault: true },
  { name: 'Freelance & Business', type: 'INCOME', icon: 'Briefcase', color: '#6366f1', isDefault: true },
  { name: 'Investments', type: 'INCOME', icon: 'TrendingUp', color: '#84cc16', isDefault: true },
  { name: 'Other Income', type: 'INCOME', icon: 'CirclePlus', color: '#14b8a6', isDefault: true },
  { name: 'Miscellaneous', type: 'EXPENSE', icon: 'MoreHorizontal', color: '#64748b', isDefault: true },
] as const

/*
  SQL setup script for Supabase SQL Editor (Row Level Security & Triggers):
  --------------------------------------------------------------------------
  -- Enable RLS
  ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

  -- Profiles Policies
  CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
  CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

  -- Categories Policies
  CREATE POLICY "Users can view default categories and custom categories"
    ON public.categories FOR SELECT
    USING (user_id IS NULL OR user_id = auth.uid());
  CREATE POLICY "Users can insert their custom categories"
    ON public.categories FOR INSERT
    WITH CHECK (auth.uid() = user_id);
  CREATE POLICY "Users can update their custom categories"
    ON public.categories FOR UPDATE
    USING (auth.uid() = user_id);
  CREATE POLICY "Users can delete their custom categories"
    ON public.categories FOR DELETE
    USING (auth.uid() = user_id AND is_default = false);

  -- Transactions Policies
  CREATE POLICY "Users can view their own transactions"
    ON public.transactions FOR SELECT
    USING (auth.uid() = user_id);
  CREATE POLICY "Users can insert their own transactions"
    ON public.transactions FOR INSERT
    WITH CHECK (auth.uid() = user_id);
  CREATE POLICY "Users can update their own transactions"
    ON public.transactions FOR UPDATE
    USING (auth.uid() = user_id);
  CREATE POLICY "Users can delete their own transactions"
    ON public.transactions FOR DELETE
    USING (auth.uid() = user_id);

  -- Automatic Profile Creation Trigger on Auth Sign Up
  CREATE OR REPLACE FUNCTION public.handle_new_user()
  RETURNS TRIGGER AS $$
  BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
      NEW.id,
      NEW.email,
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;

  CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
*/
