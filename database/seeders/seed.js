import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDatabase, disconnectDatabase, isMongoConnected } from '../../backend/src/config/database.js';
import { UserModel } from '../../backend/src/models/User.js';
import { ClubModel } from '../../backend/src/models/Club.js';
import { EventModel } from '../../backend/src/models/Event.js';
import { AnnouncementModel } from '../../backend/src/models/Announcement.js';
import { GalleryItemModel } from '../../backend/src/models/GalleryItem.js';
import { MemberRequestModel } from '../../backend/src/models/MemberRequest.js';
import { ControllerApplicationModel } from '../../backend/src/models/ControllerApplication.js';
import {
  INITIAL_USERS,
  INITIAL_CLUBS,
  INITIAL_EVENTS,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_GALLERY,
  INITIAL_APPLICATIONS,
  INITIAL_MEMBER_REQUESTS
} from '../../backend/src/utils/seedData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

dotenv.config({ path: path.resolve(projectRoot, 'backend/.env') });

async function seed() {
  await connectDatabase();
  if (!isMongoConnected()) {
    console.log('[CUEC Seeder] MongoDB daemon not active. Skipping remote write (in-memory fallback already pre-seeded).');
    return;
  }

  await Promise.all([
    UserModel.deleteMany({}),
    ClubModel.deleteMany({}),
    EventModel.deleteMany({}),
    AnnouncementModel.deleteMany({}),
    GalleryItemModel.deleteMany({}),
    ControllerApplicationModel.deleteMany({}),
    MemberRequestModel.deleteMany({})
  ]);

  await Promise.all([
    UserModel.insertMany(INITIAL_USERS),
    ClubModel.insertMany(INITIAL_CLUBS),
    EventModel.insertMany(INITIAL_EVENTS),
    AnnouncementModel.insertMany(INITIAL_ANNOUNCEMENTS),
    GalleryItemModel.insertMany(INITIAL_GALLERY),
    ControllerApplicationModel.insertMany(INITIAL_APPLICATIONS),
    MemberRequestModel.insertMany(INITIAL_MEMBER_REQUESTS)
  ]);

  console.log('[CUEC Seeder] Seeded all MongoDB collections cleanly.');
  await disconnectDatabase();
}

seed().catch((err) => {
  console.error('[CUEC Seeder] Failed:', err);
  process.exit(1);
});
