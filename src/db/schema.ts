import { pgTable, serial, text, integer, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  displayName: text('display_name'),
  classGrade: text('class_grade'),
  targetExam: text('target_exam'),
  xp: integer('xp').default(0),
  streakDays: integer('streak_days').default(1),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const testAttempts = pgTable('test_attempts', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  testId: text('test_id').notNull(),
  testTitle: text('test_title').notNull(),
  classGrade: text('class_grade').notNull(),
  subject: text('subject').notNull(),
  chapter: text('chapter').notNull(),
  score: integer('score').notNull(),
  maxScore: integer('max_score').notNull(),
  percentage: integer('percentage').notNull(),
  correctCount: integer('correct_count').notNull(),
  wrongCount: integer('wrong_count').notNull(),
  unattemptedCount: integer('unattempted_count').notNull(),
  examPattern: text('exam_pattern'),
  percentile: text('percentile'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const mistakes = pgTable('mistakes', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  question: text('question').notNull(),
  userAnswer: text('user_answer').notNull(),
  correctAnswer: text('correct_answer').notNull(),
  explanation: text('explanation').notNull(),
  classGrade: text('class_grade').notNull(),
  subject: text('subject').notNull(),
  chapter: text('chapter').notNull(),
  topic: text('topic'),
  resolved: text('resolved').default('false'),
  createdAt: timestamp('created_at').defaultNow(),
});
