/**
 * questions.js — Question bank loader and randomizer
 * Loads from data/questions.json, shuffles safely
 */

import { QUESTION_BANK } from '../data/questions_data.js';

let _bank = null;

export async function loadQuestionBank() {
  if (_bank) return _bank;
  try {
    const resp = await fetch('data/questions.json');
    if (resp.ok) {
      _bank = await resp.json();
      return _bank;
    }
  } catch (err) {
    console.warn('Fetch failed, using local bundled questions data:', err);
  }
  _bank = QUESTION_BANK;
  return _bank;
}

export function getAllQuestions() {
  return _bank ? _bank.questions : [];
}

export function getQuestionsByCategory(category) {
  if (!_bank) return [];
  return _bank.questions.filter(q => q.category === category);
}

export function getCategories() {
  return [
    { name: 'English Proficiency',                    range: [1,  20], icon: '📖', color: '#3b82f6' },
    { name: 'Mathematics',                            range: [21, 40], icon: '🔢', color: '#8b5cf6' },
    { name: 'Logical and Abstract Reasoning',         range: [41, 60], icon: '🧠', color: '#06b6d4' },
    { name: 'Philippine History and General Knowledge', range: [61,80], icon: '🇵🇭', color: '#f59e0b' },
    { name: 'ROTC and Military Fundamentals',         range: [81,100], icon: '⭐', color: '#22c55e' },
  ];
}

/**
 * Fisher-Yates shuffle — returns a NEW array, never mutates original
 */
export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Build a playable question set.
 * By default, questions are kept in steady sequential order (1 to 100)
 * and choices are kept in steady order (A, B, C, D) as requested.
 */
export function buildSessionQuestions(sourceQuestions, shouldShuffle = false) {
  const list = shouldShuffle
    ? shuffle(sourceQuestions)
    : sourceQuestions.slice().sort((a, b) => a.number - b.number);

  return list.map(q => {
    const choices = shouldShuffle
      ? shuffle(q.choices)
      : q.choices.slice().sort((a, b) => a.id.localeCompare(b.id));

    return {
      ...q,
      choices,
    };
  });
}

/**
 * Given a session question and a selectedId (letter from original bank),
 * check if the answer is correct
 */
export function isCorrect(question, selectedId) {
  return selectedId === question.correctAnswer;
}

/**
 * Get the text of the correct answer for a question
 */
export function getCorrectText(question) {
  const c = question.choices.find(ch => ch.id === question.correctAnswer);
  return c ? c.text : question.correctText || '';
}

