import { isMongoConnected } from '../config/database.js';
import { UserModel } from '../models/User.js';
import { ClubModel } from '../models/Club.js';
import { EventModel } from '../models/Event.js';
import { AnnouncementModel } from '../models/Announcement.js';
import { GalleryItemModel } from '../models/GalleryItem.js';
import { MemberRequestModel } from '../models/MemberRequest.js';
import { ControllerApplicationModel } from '../models/ControllerApplication.js';
import {
  INITIAL_USERS,
  INITIAL_CLUBS,
  INITIAL_EVENTS,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_GALLERY,
  INITIAL_APPLICATIONS,
  INITIAL_MEMBER_REQUESTS
} from '../utils/seedData.js';

// In-memory store initialized with official seed data (used automatically when MongoDB daemon is not present)
let memUsers = JSON.parse(JSON.stringify(INITIAL_USERS));
let memClubs = JSON.parse(JSON.stringify(INITIAL_CLUBS));
let memEvents = JSON.parse(JSON.stringify(INITIAL_EVENTS));
let memAnnouncements = JSON.parse(JSON.stringify(INITIAL_ANNOUNCEMENTS));
let memGallery = JSON.parse(JSON.stringify(INITIAL_GALLERY));
let memApplications = JSON.parse(JSON.stringify(INITIAL_APPLICATIONS));
let memMemberRequests = JSON.parse(JSON.stringify(INITIAL_MEMBER_REQUESTS));

function cleanDoc(doc) {
  if (!doc) return doc;
  const obj = typeof doc.toObject === 'function' ? doc.toObject() : { ...doc };
  delete obj._id;
  delete obj.__v;
  delete obj.createdAt;
  delete obj.updatedAt;
  return obj;
}

export async function ensureMongoSeeded() {
  if (!isMongoConnected()) return;
  const clubCount = await ClubModel.countDocuments();
  if (clubCount === 0) {
    await Promise.all([
      UserModel.insertMany(INITIAL_USERS),
      ClubModel.insertMany(INITIAL_CLUBS),
      EventModel.insertMany(INITIAL_EVENTS),
      AnnouncementModel.insertMany(INITIAL_ANNOUNCEMENTS),
      GalleryItemModel.insertMany(INITIAL_GALLERY),
      ControllerApplicationModel.insertMany(INITIAL_APPLICATIONS),
      MemberRequestModel.insertMany(INITIAL_MEMBER_REQUESTS)
    ]);
    console.log('[CUEC DB] Seeded MongoDB collections with initial portal records.');
  }
}

export const dataService = {
  async getStats() {
    const clubs = await this.getClubs();
    const events = await this.getEvents({});
    const announcements = await this.getAnnouncements({});
    const applications = await this.getApplications();
    const memberRequests = await this.getMemberRequests();
    const users = await this.getUsers();

    return {
      totalClubs: clubs.length,
      totalWings: clubs.reduce((acc, c) => acc + (c.wings ? c.wings.length : 0), 0),
      totalMembers: clubs.reduce((acc, c) => acc + (c.totalMembers || 0), 0),
      activeEvents: events.filter((e) => e.status === 'upcoming').length,
      totalAnnouncements: announcements.length,
      pendingApplications: applications.filter((a) => a.status === 'pending').length,
      pendingMemberRequests: memberRequests.filter((r) => r.status === 'pending').length,
      registeredUsers: users.length
    };
  },

  // Users
  async getUsers() {
    if (isMongoConnected()) {
      const docs = await UserModel.find().lean();
      return docs.map(cleanDoc);
    }
    return [...memUsers];
  },

  async findUserById(id) {
    if (typeof id !== 'string' || !id) return undefined;
    if (isMongoConnected()) {
      const doc = await UserModel.findOne({ id }).lean();
      return cleanDoc(doc) || undefined;
    }
    return memUsers.find((u) => u.id === id);
  },

  async findUserByEmail(email) {
    if (typeof email !== 'string' || !email) return undefined;
    const normalized = email.trim().toLowerCase();
    if (isMongoConnected()) {
      const doc = await UserModel.findOne({ email: normalized }).lean();
      return cleanDoc(doc) || undefined;
    }
    return memUsers.find((u) => u.email.toLowerCase() === normalized);
  },

  async findUserByEmailOrStudentId(email, studentId) {
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const sid = typeof studentId === 'string' ? studentId.trim() : '';
    if (isMongoConnected()) {
      const doc = await UserModel.findOne({
        $or: [{ email: normalizedEmail }, { studentId: sid }]
      }).lean();
      return cleanDoc(doc) || undefined;
    }
    return memUsers.find((u) => u.email.toLowerCase() === normalizedEmail || u.studentId === sid);
  },

  async createUser(userObj) {
    if (isMongoConnected()) {
      const doc = await UserModel.create(userObj);
      return cleanDoc(doc);
    }
    memUsers.push(userObj);
    return userObj;
  },

  async updateUser(id, updates) {
    if (isMongoConnected()) {
      const doc = await UserModel.findOneAndUpdate({ id }, { $set: updates }, { new: true }).lean();
      return cleanDoc(doc);
    }
    const idx = memUsers.findIndex((u) => u.id === id);
    if (idx === -1) return null;
    memUsers[idx] = { ...memUsers[idx], ...updates, id };
    return memUsers[idx];
  },

  async deleteUser(id) {
    if (isMongoConnected()) {
      const res = await UserModel.deleteOne({ id });
      return res.deletedCount > 0;
    }
    const before = memUsers.length;
    memUsers = memUsers.filter((u) => u.id !== id);
    return memUsers.length < before;
  },

  // Clubs
  async getClubs() {
    if (isMongoConnected()) {
      const docs = await ClubModel.find().lean();
      return docs.map(cleanDoc);
    }
    return memClubs;
  },

  async getClubById(id) {
    if (typeof id !== 'string') return null;
    if (isMongoConnected()) {
      const doc = await ClubModel.findOne({ id }).lean();
      return cleanDoc(doc);
    }
    return memClubs.find((c) => c.id === id) || null;
  },

  async updateClub(id, updates) {
    if (isMongoConnected()) {
      const doc = await ClubModel.findOneAndUpdate({ id }, { $set: updates }, { new: true }).lean();
      return cleanDoc(doc);
    }
    const idx = memClubs.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    memClubs[idx] = { ...memClubs[idx], ...updates, id };
    return memClubs[idx];
  },

  async incrementClubMembers(clubId, delta) {
    if (isMongoConnected()) {
      await ClubModel.updateOne({ id: clubId }, { $inc: { totalMembers: delta } });
      return;
    }
    const club = memClubs.find((c) => c.id === clubId);
    if (club) {
      club.totalMembers = Math.max(0, (club.totalMembers || 0) + delta);
    }
  },

  // Events
  async getEvents({ clubId, wingSlug, status, search }) {
    let result;
    if (isMongoConnected()) {
      const filter = {};
      if (typeof clubId === 'string' && clubId !== 'all') filter.clubId = clubId;
      if (typeof wingSlug === 'string' && wingSlug !== 'all') filter.wingSlug = wingSlug;
      if (typeof status === 'string' && status !== 'all') filter.status = status;
      const docs = await EventModel.find(filter).lean();
      result = docs.map(cleanDoc);
    } else {
      result = [...memEvents];
      if (typeof clubId === 'string' && clubId !== 'all') {
        result = result.filter((e) => e.clubId === clubId);
      }
      if (typeof wingSlug === 'string' && wingSlug !== 'all') {
        result = result.filter((e) => e.wingSlug === wingSlug);
      }
      if (typeof status === 'string' && status !== 'all') {
        result = result.filter((e) => e.status === status);
      }
    }

    if (typeof search === 'string' && search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (e) =>
          (e.title || '').toLowerCase().includes(q) ||
          (e.description || '').toLowerCase().includes(q) ||
          (e.venue || '').toLowerCase().includes(q)
      );
    }
    return result;
  },

  async getEventById(id) {
    if (typeof id !== 'string') return null;
    if (isMongoConnected()) {
      const doc = await EventModel.findOne({ id }).lean();
      return cleanDoc(doc);
    }
    return memEvents.find((e) => e.id === id) || null;
  },

  async createEvent(evt) {
    if (isMongoConnected()) {
      const doc = await EventModel.create(evt);
      return cleanDoc(doc);
    }
    memEvents.unshift(evt);
    return evt;
  },

  async updateEvent(id, updates) {
    if (isMongoConnected()) {
      const doc = await EventModel.findOneAndUpdate({ id }, { $set: updates }, { new: true }).lean();
      return cleanDoc(doc);
    }
    const idx = memEvents.findIndex((e) => e.id === id);
    if (idx === -1) return null;
    memEvents[idx] = { ...memEvents[idx], ...updates, id };
    return memEvents[idx];
  },

  async deleteEvent(id) {
    if (isMongoConnected()) {
      const res = await EventModel.deleteOne({ id });
      return res.deletedCount > 0;
    }
    const before = memEvents.length;
    memEvents = memEvents.filter((e) => e.id !== id);
    return memEvents.length < before;
  },

  // Announcements
  async getAnnouncements({ clubId, priority }) {
    let result;
    if (isMongoConnected()) {
      const filter = {};
      if (typeof clubId === 'string' && clubId !== 'all') {
        filter.$or = [{ clubId }, { clubId: 'all' }];
      }
      if (typeof priority === 'string' && priority !== 'all') {
        filter.priority = priority;
      }
      const docs = await AnnouncementModel.find(filter).lean();
      result = docs.map(cleanDoc);
    } else {
      result = [...memAnnouncements];
      if (typeof clubId === 'string' && clubId !== 'all') {
        result = result.filter((a) => a.clubId === clubId || a.clubId === 'all');
      }
      if (typeof priority === 'string' && priority !== 'all') {
        result = result.filter((a) => a.priority === priority);
      }
    }

    result.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    });
    return result;
  },

  async getAnnouncementById(id) {
    if (typeof id !== 'string') return null;
    if (isMongoConnected()) {
      const doc = await AnnouncementModel.findOne({ id }).lean();
      return cleanDoc(doc);
    }
    return memAnnouncements.find((a) => a.id === id) || null;
  },

  async createAnnouncement(ann) {
    if (isMongoConnected()) {
      const doc = await AnnouncementModel.create(ann);
      return cleanDoc(doc);
    }
    memAnnouncements.unshift(ann);
    return ann;
  },

  async updateAnnouncement(id, updates) {
    if (isMongoConnected()) {
      const doc = await AnnouncementModel.findOneAndUpdate({ id }, { $set: updates }, { new: true }).lean();
      return cleanDoc(doc);
    }
    const idx = memAnnouncements.findIndex((a) => a.id === id);
    if (idx === -1) return null;
    memAnnouncements[idx] = { ...memAnnouncements[idx], ...updates, id };
    return memAnnouncements[idx];
  },

  async deleteAnnouncement(id) {
    if (isMongoConnected()) {
      const res = await AnnouncementModel.deleteOne({ id });
      return res.deletedCount > 0;
    }
    const before = memAnnouncements.length;
    memAnnouncements = memAnnouncements.filter((a) => a.id !== id);
    return memAnnouncements.length < before;
  },

  // Gallery
  async getGallery({ clubId, wingSlug }) {
    if (isMongoConnected()) {
      const filter = {};
      if (typeof clubId === 'string' && clubId !== 'all') filter.clubId = clubId;
      if (typeof wingSlug === 'string' && wingSlug !== 'all') filter.wingSlug = wingSlug;
      const docs = await GalleryItemModel.find(filter).sort({ createdAt: -1 }).lean();
      return docs.map(cleanDoc);
    }
    let result = [...memGallery];
    if (typeof clubId === 'string' && clubId !== 'all') {
      result = result.filter((g) => g.clubId === clubId);
    }
    if (typeof wingSlug === 'string' && wingSlug !== 'all') {
      result = result.filter((g) => g.wingSlug === wingSlug);
    }
    return result;
  },

  async getGalleryById(id) {
    if (typeof id !== 'string') return null;
    if (isMongoConnected()) {
      const doc = await GalleryItemModel.findOne({ id }).lean();
      return cleanDoc(doc);
    }
    return memGallery.find((g) => g.id === id) || null;
  },

  async createGalleryItem(item) {
    if (isMongoConnected()) {
      const doc = await GalleryItemModel.create(item);
      return cleanDoc(doc);
    }
    memGallery.unshift(item);
    return item;
  },

  async likeGalleryItem(id) {
    if (isMongoConnected()) {
      const doc = await GalleryItemModel.findOneAndUpdate(
        { id },
        { $inc: { likes: 1 } },
        { new: true }
      ).lean();
      return cleanDoc(doc);
    }
    const item = memGallery.find((g) => g.id === id);
    if (!item) return null;
    item.likes += 1;
    return item;
  },

  async updateGalleryItem(id, updates) {
    if (isMongoConnected()) {
      const doc = await GalleryItemModel.findOneAndUpdate({ id }, { $set: updates }, { new: true }).lean();
      return cleanDoc(doc);
    }
    const idx = memGallery.findIndex((g) => g.id === id);
    if (idx === -1) return null;
    memGallery[idx] = { ...memGallery[idx], ...updates, id };
    return memGallery[idx];
  },

  async deleteGalleryItem(id) {
    if (isMongoConnected()) {
      const res = await GalleryItemModel.deleteOne({ id });
      return res.deletedCount > 0;
    }
    const before = memGallery.length;
    memGallery = memGallery.filter((g) => g.id !== id);
    return memGallery.length < before;
  },

  // Member Requests
  async getMemberRequests() {
    if (isMongoConnected()) {
      const docs = await MemberRequestModel.find().lean();
      return docs.map(cleanDoc);
    }
    return [...memMemberRequests];
  },

  async getMemberRequestById(id) {
    if (typeof id !== 'string') return null;
    if (isMongoConnected()) {
      const doc = await MemberRequestModel.findOne({ id }).lean();
      return cleanDoc(doc);
    }
    return memMemberRequests.find((r) => r.id === id) || null;
  },

  async createMemberRequest(reqObj) {
    if (isMongoConnected()) {
      const doc = await MemberRequestModel.create(reqObj);
      return cleanDoc(doc);
    }
    memMemberRequests.unshift(reqObj);
    return reqObj;
  },

  async updateMemberRequest(id, updates) {
    if (isMongoConnected()) {
      const doc = await MemberRequestModel.findOneAndUpdate({ id }, { $set: updates }, { new: true }).lean();
      return cleanDoc(doc);
    }
    const idx = memMemberRequests.findIndex((r) => r.id === id);
    if (idx === -1) return null;
    memMemberRequests[idx] = { ...memMemberRequests[idx], ...updates, id };
    return memMemberRequests[idx];
  },

  // Controller Applications
  async getApplications() {
    if (isMongoConnected()) {
      const docs = await ControllerApplicationModel.find().lean();
      return docs.map(cleanDoc);
    }
    return [...memApplications];
  },

  async getApplicationById(id) {
    if (typeof id !== 'string') return null;
    if (isMongoConnected()) {
      const doc = await ControllerApplicationModel.findOne({ id }).lean();
      return cleanDoc(doc);
    }
    return memApplications.find((a) => a.id === id) || null;
  },

  async createApplication(appObj) {
    if (isMongoConnected()) {
      const doc = await ControllerApplicationModel.create(appObj);
      return cleanDoc(doc);
    }
    memApplications.unshift(appObj);
    return appObj;
  },

  async updateApplication(id, updates) {
    if (isMongoConnected()) {
      const doc = await ControllerApplicationModel.findOneAndUpdate({ id }, { $set: updates }, { new: true }).lean();
      return cleanDoc(doc);
    }
    const idx = memApplications.findIndex((a) => a.id === id);
    if (idx === -1) return null;
    memApplications[idx] = { ...memApplications[idx], ...updates, id };
    return memApplications[idx];
  },

  async deleteApplication(id) {
    if (isMongoConnected()) {
      const res = await ControllerApplicationModel.deleteOne({ id });
      return res.deletedCount > 0;
    }
    const before = memApplications.length;
    memApplications = memApplications.filter((a) => a.id !== id);
    return memApplications.length < before;
  }
};
