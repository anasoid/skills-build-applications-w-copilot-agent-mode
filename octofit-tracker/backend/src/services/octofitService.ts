import { Types } from 'mongoose';
import { Activity, Team, User, Workout } from '../models/index.js';

export async function listActivities() {
  return Activity.find().lean();
}

function isRecord(input: unknown): input is Record<string, unknown> {
  return typeof input === 'object' && input !== null && !Array.isArray(input);
}

export async function createActivity(input: unknown) {
  if (!isRecord(input)) {
    throw Object.assign(new Error('Activity input must be an object'), { status: 400 });
  }

  const { userId, teamId, type, minutes } = input;
  if (typeof userId !== 'string' || !Types.ObjectId.isValid(userId)
    || typeof teamId !== 'string' || !Types.ObjectId.isValid(teamId)) {
    throw Object.assign(new Error('userId and teamId must be valid IDs'), { status: 400 });
  }
  if (typeof type !== 'string' || !type.trim()) {
    throw Object.assign(new Error('type is required'), { status: 400 });
  }
  if (typeof minutes !== 'number' || !Number.isFinite(minutes) || minutes <= 0) {
    throw Object.assign(new Error('minutes must be a positive number'), { status: 400 });
  }

  const [user, team] = await Promise.all([
    User.exists({ _id: userId }),
    Team.exists({ _id: teamId }),
  ]);
  if (!user || !team) {
    throw Object.assign(new Error('Referenced user or team was not found'), { status: 404 });
  }

  return Activity.create({
    user: userId,
    team: teamId,
    type: type.trim(),
    minutes,
    points: minutes,
    occurredAt: new Date(),
  });
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(input: unknown) {
  if (!isRecord(input)) {
    throw Object.assign(new Error('Team input must be an object'), { status: 400 });
  }

  const { name, mascot } = input;
  if (typeof name !== 'string' || !name.trim()) {
    throw Object.assign(new Error('name is required'), { status: 400 });
  }
  if (typeof mascot !== 'string' || !mascot.trim()) {
    throw Object.assign(new Error('mascot is required'), { status: 400 });
  }
  if (input.members !== undefined && !Array.isArray(input.members)) {
    throw Object.assign(new Error('members must be an array of user IDs'), { status: 400 });
  }

  const memberIds: string[] = [];
  for (const memberId of input.members ?? []) {
    if (typeof memberId !== 'string' || !Types.ObjectId.isValid(memberId)) {
      throw Object.assign(new Error('members must contain valid user IDs'), { status: 400 });
    }
    memberIds.push(memberId);
  }

  if (memberIds.length > 0) {
    const existingMembers = await User.countDocuments({ _id: { $in: memberIds } });
    if (existingMembers !== new Set(memberIds).size) {
      throw Object.assign(new Error('One or more members were not found'), { status: 404 });
    }
  }

  return Team.create({
    name: name.trim(),
    mascot: mascot.trim(),
    members: memberIds,
  });
}

export async function getLeaderboard() {
  const teams = await Team.aggregate<{ teamName: string; totalPoints: number }>([
    {
      $lookup: {
        from: Activity.collection.name,
        localField: '_id',
        foreignField: 'team',
        as: 'activities',
      },
    },
    {
      $project: {
        _id: 0,
        teamName: '$name',
        totalPoints: { $sum: '$activities.points' },
      },
    },
    { $sort: { totalPoints: -1, teamName: 1 } },
  ]);
  return teams.map((team, index) => ({ ...team, rank: index + 1 }));
}

function focusForActivity(type: string) {
  const normalizedType = type.trim().toLowerCase();
  if (['run', 'cycle', 'walk', 'swim'].includes(normalizedType)) return 'endurance';
  return normalizedType;
}

export async function suggestWorkouts(userEmail: string) {
  const normalizedEmail = userEmail.trim().toLowerCase();
  if (!normalizedEmail) {
    throw Object.assign(new Error('userEmail is required'), { status: 400 });
  }

  const user = await User.findOne({ email: normalizedEmail }).lean();
  if (!user) {
    throw Object.assign(new Error('User was not found'), { status: 404 });
  }

  const recentActivity = await Activity.findOne({ user: user._id })
    .sort({ occurredAt: -1, _id: -1 })
    .lean();
  const goalFocus = user.fitnessGoal?.trim().toLowerCase();
  const recentFocus = recentActivity ? focusForActivity(recentActivity.type) : undefined;
  const focuses = [...new Set([goalFocus, recentFocus].filter((focus): focus is string => Boolean(focus)))];

  for (const focus of focuses) {
    const workouts = await Workout.find({ focus }).sort({ title: 1 }).lean();
    if (workouts.length > 0) {
      const reason = focus === goalFocus
        ? `Recommended for your ${focus} goal.`
        : `Recommended based on your recent ${recentActivity?.type} activity.`;
      return workouts.map((workout) => ({ ...workout, reason }));
    }
  }

  return [];
}

export { User };
