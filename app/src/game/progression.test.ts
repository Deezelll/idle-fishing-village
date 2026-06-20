import { describe, expect, it } from 'vitest';
import { buyBoat, claimEventReward, claimMilestoneReward, claimRegattaGoalReward, createInitialState, sellFish } from './state';
import {
  getAvailableEventRewards,
  getAquariumSetBonus,
  getAvailableMilestones,
  getChapterGoals,
  getDailyRewardStatus,
  getMilestoneBonus,
  getPearlTreeBonus,
  getRegattaGoals,
  getTutorialSteps,
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

  it('exposes claimable milestone rewards for upgraded boats and buildings', () => {
    const state = createInitialState();
    state.boats.rowboat = 5;
    state.buildings.market = 5;

    const milestones = getAvailableMilestones(state);

    expect(milestones.map((milestone) => milestone.id)).toContain('boat-rowboat-5');
    expect(milestones.map((milestone) => milestone.id)).toContain('building-market-5');
    expect(milestones.every((milestone) => milestone.claimed === false)).toBe(true);
  });

  it('claims a milestone once and records the reward', () => {
    const state = createInitialState();
    state.boats.rowboat = 5;

    const claimed = claimMilestoneReward(state, 'boat-rowboat-5');
    const claimedAgain = claimMilestoneReward(claimed, 'boat-rowboat-5');

    expect(claimed.claimedMilestones).toContain('boat-rowboat-5');
    expect(claimed.stars).toBeGreaterThan(state.stars);
    expect(claimed.eventTokens).toBeGreaterThan(state.eventTokens);
    expect(claimedAgain.stars).toBe(claimed.stars);
    expect(claimedAgain.eventTokens).toBe(claimed.eventTokens);
  });

  it('turns claimed milestone count into a small passive production bonus', () => {
    const state = createInitialState();
    state.claimedMilestones = ['boat-rowboat-5', 'building-market-5', 'boat-motorboat-10'];

    const bonus = getMilestoneBonus(state);

    expect(bonus.claimedCount).toBe(3);
    expect(bonus.productionMultiplier).toBeGreaterThan(1);
    expect(bonus.priceMultiplier).toBeGreaterThan(1);
  });

  it('exposes event rewards that can be bought with event tokens', () => {
    const state = createInitialState();
    state.eventTokens = 80;

    const rewards = getAvailableEventRewards(state);

    expect(rewards.length).toBeGreaterThan(0);
    expect(rewards.some((reward) => reward.id === 'regatta_supply_chest')).toBe(true);
    expect(rewards.every((reward) => reward.claimed === false)).toBe(true);
  });

  it('spends event tokens and prevents duplicate event reward claims', () => {
    const state = createInitialState();
    state.eventTokens = 80;

    const claimed = claimEventReward(state, 'regatta_supply_chest');
    const claimedAgain = claimEventReward(claimed, 'regatta_supply_chest');

    expect(claimed.claimedEventRewards).toContain('regatta_supply_chest');
    expect(claimed.eventTokens).toBeLessThan(state.eventTokens);
    expect(claimed.coins).toBeGreaterThan(state.coins);
    expect(claimedAgain.eventTokens).toBe(claimed.eventTokens);
    expect(claimedAgain.coins).toBe(claimed.coins);
  });

  it('tracks sold fish and purchased upgrades for long term goals', () => {
    const state = createInitialState();
    state.fish = 30;

    const sold = sellFish(state);
    const upgraded = buyBoat({ ...sold, coins: 500 }, 'rowboat');

    expect(sold.lifetimeFishSold).toBe(30);
    expect(upgraded.totalUpgradesPurchased).toBe(1);
  });

  it('exposes weekly regatta goals from player progress', () => {
    const state = createInitialState();
    state.completedOrders = 3;
    state.lifetimeFishSold = 600;
    state.totalUpgradesPurchased = 4;

    const goals = getRegattaGoals(state);

    expect(goals.map((goal) => goal.id)).toEqual(['regatta_orders', 'regatta_sales', 'regatta_upgrades']);
    expect(goals.every((goal) => goal.ready)).toBe(true);
    expect(goals.every((goal) => goal.claimed === false)).toBe(true);
  });

  it('claims a weekly regatta goal once and pays event tokens', () => {
    const state = createInitialState();
    state.completedOrders = 3;

    const claimed = claimRegattaGoalReward(state, 'regatta_orders');
    const claimedAgain = claimRegattaGoalReward(claimed, 'regatta_orders');

    expect(claimed.claimedRegattaGoals).toContain('regatta_orders');
    expect(claimed.eventTokens).toBeGreaterThan(state.eventTokens);
    expect(claimedAgain.eventTokens).toBe(claimed.eventTokens);
  });

  it('returns a first-session tutorial checklist with completed state', () => {
    const state = createInitialState();
    state.lifetimeFishSold = 10;
    state.boats.rowboat = 2;
    state.dailyReward.streak = 1;

    const steps = getTutorialSteps(state);

    expect(steps.length).toBeGreaterThan(4);
    expect(steps.find((step) => step.id === 'sell_fish')?.completed).toBe(true);
    expect(steps.find((step) => step.id === 'upgrade_boat')?.completed).toBe(true);
    expect(steps.find((step) => step.id === 'claim_daily')?.completed).toBe(true);
    expect(steps.find((step) => step.id === 'complete_order')?.completed).toBe(false);
  });
});
