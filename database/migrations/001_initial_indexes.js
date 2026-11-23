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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

dotenv.config({ path: path.resolve(projectRoot, 'backend/.env') });

export async function runMigration() {
  await connectDatabase();
  if (!isMongoConnected()) {
    console.log('[CUEC Migration 001] MongoDB daemon not active. Index sync skipped.');
    return;
  }

  await Promise.all([
    UserModel.syncIndexes(),
    ClubModel.syncIndexes(),
    EventModel.syncIndexes(),
    AnnouncementModel.syncIndexes(),
    GalleryItemModel.syncIndexes(),
    MemberRequestModel.syncIndexes(),
    ControllerApplicationModel.syncIndexes()
  ]);

  console.log('[CUEC Migration 001] Synchronized MongoDB indexes for all collections.');
  await disconnectDatabase();
}

runMigration().catch((err) => {
  console.error('[CUEC Migration 001] Failed:', err);
  process.exit(1);
});
