/**
 * questions.js — Multi-reviewer question bank loader and randomizer
 * Supports separate PAARCQE 2026 and AFPSAT 2026 question banks
 */

import { QUESTION_BANK as PAARCQE_BANK } from '../data/questions_data.js';
import { AFPSAT_BANK } from '../data/afpsat_questions_data.js';

let _activeReviewer = localStorage.getItem('examprac_reviewer') || 'paarcqe';
let _banks = {
  paarcqe: PAARCQE_BANK,
  afpsat: AFPSAT_BANK,
};

export function getActiveReviewer() {
  return _activeReviewer;
}

export function setActiveReviewer(id) {
  _activeReviewer = id === 'afpsat' ? 'afpsat' : 'paarcqe';
  localStorage.setItem('examprac_reviewer', _activeReviewer);
  return _activeReviewer;
}

export async function loadQuestionBank(reviewerId = _activeReviewer) {
  const targetId = reviewerId === 'afpsat' ? 'afpsat' : 'paarcqe';
  const jsonFile = targetId === 'afpsat' ? 'data/afpsat_questions.json' : 'data/questions.json';
  const fallback = targetId === 'afpsat' ? AFPSAT_BANK : PAARCQE_BANK;

  try {
    const resp = await fetch(jsonFile);
    if (resp.ok) {
      const data = await resp.json();
      _banks[targetId] = data;
      return data;
    }
  } catch (err) {
    console.warn(`Fetch ${jsonFile} failed, using local bundled data:`, err);
  }

  _banks[targetId] = fallback;
  return fallback;
  
}

export function getAllQuestions(reviewerId = _activeReviewer) {
  const targetId = reviewerId === 'afpsat' ? 'afpsat' : 'paarcqe';
  const bank = _banks[targetId] || (targetId === 'afpsat' ? AFPSAT_BANK : PAARCQE_BANK);
  return bank ? bank.questions : [];
}

export function getQuestionsByCategory(category, reviewerId = _activeReviewer) {
  const qs = getAllQuestions(reviewerId);
  return qs.filter(q => q.category === category);
}

export function getCategories(reviewerId = _activeReviewer) {
  if (reviewerId === 'afpsat') {
    return [
      { name: 'Abstract Reasoning',  range: [1,  50], icon: '🔷', color: '#06b6d4', desc: '50 pattern & figure series' },
      { name: 'Numerical Reasoning', range: [51, 70], icon: '🔢', color: '#8b5cf6', desc: '20 math & algebra problems' },
      { name: 'Verbal Reasoning',    range: [71, 100], icon: '📖', color: '#3b82f6', desc: '30 grammar, analogy & vocab' },
    ];
  }

  return [
    { name: 'English Proficiency',                    range: [1,  20], icon: '📖', color: '#3b82f6', desc: 'Grammar, vocab, idioms' },
    { name: 'Mathematics',                            range: [21, 40], icon: '🔢', color: '#8b5cf6', desc: 'Arithmetic, algebra, geometry' },
    { name: 'Logical and Abstract Reasoning',         range: [41, 60], icon: '🧠', color: '#06b6d4', desc: 'Pattern, deduction, sequences' },
    { name: 'Philippine History and General Knowledge', range: [61, 80], icon: '🇵🇭', color: '#f59e0b', desc: 'Constitution, heroes, events' },
    { name: 'ROTC and Military Fundamentals',         range: [81, 100], icon: '⭐', color: '#22c55e', desc: 'AFP history, ranks, customs' },
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
    : sourceQuestions.slice().sort((a, b) => (a.number || a.qnum || 0) - (b.number || b.qnum || 0));

  return list.map(q => {
    const choices = shouldShuffle
      ? shuffle(q.choices)
      : q.choices.slice().sort((a, b) => String(a.id).localeCompare(String(b.id)));

    return {
      ...q,
      choices,
    };
  });
}

/**
 * Given a session question and a selectedId, check if the answer is correct
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

