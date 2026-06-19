import { describe, expect, it } from 'vitest';
import { createInitialState } from './state';
import {
  getAquariumSetBonus,
  getChapterGoals,
  getDailyRewardStatus,
  getPearlTreeBonus,
  getZoneMastery
} from './progression';

describe('progression systems', () => {
  it('marks the daily reward as claimable before the current date is claimed', () => {
    const state = createInitialState(1_719_000_000_000);
    const status = getDailyRewardStatus(state, Date.UTC(2026, 5, 19, 9));

    expect(status.claimed).toBe(false);
    expect(status.reward.coins).toBeGreaterThan(0);
    expect(status.dateKey).toBe('2026-06-19');
  });

  it('computes zone mastery from discovered fish and upgraded local boats', () => {
    const state = createInitialState();
    state.collection.bluefish = 1;
    state.collection.herring = 2;
    state.boats.rowboat = 4;
    state.boats.motorboat = 2;

    const mastery = getZoneMastery(state, 'quiet_bay');

    expect(mastery.percent).toBeGreaterThan(30);
    expect(mastery.discoveredFish).toBe(2);
    expect(mastery.totalFish).toBe(5);
  });

  it('returns aquarium set bonuses when all fish in a set are discovered', () => {
    const state = createInitialState();
    state.collection.bluefish = 1;
    state.collection.herring = 1;
    state.collection.sardine = 1;
    state.collection.salmon_trout = 1;
    state.collection.red_crab = 1;

    const bonus = getAquariumSetBonus(state);

    expect(bonus.completedSets.map((set) => set.id)).toContain('quiet_bay_starters');
    expect(bonus.productionMultiplier).toBeGreaterThan(1);
  });

  it('converts pearls into passive tree bonuses without spending them', () => {
    const state = createInitialState();
    state.pearls = 8;

    const bonus = getPearlTreeBonus(state);

    expect(bonus.productionMultiplier).toBeGreaterThan(1);
    expect(bonus.offlineHoursBonus).toBeGreaterThan(0);
  });

  it('exposes a next chapter goal that changes with state progress', () => {
    const state = createInitialState();
    const goals = getChapterGoals(state);

    expect(goals.length).toBeGreaterThan(0);
    expect(goals[0].current).toBeLessThanOrEqual(goals[0].target);
    expect(goals.some((goal) => goal.id === 'unlock_coral_reef')).toBe(true);
  });
});
