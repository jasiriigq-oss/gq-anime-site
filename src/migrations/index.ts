import * as migration_20261013_220821_initial from './20261013_220821_initial';
import * as migration_20261013_231242_add_supabase_user_id from './20261013_231242_add_supabase_user_id';

export const migrations = [
  {
    up: migration_20261013_220821_initial.up,
    down: migration_20261013_220821_initial.down,
    name: '20261013_220821_initial',
  },
  {
    up: migration_20261013_231242_add_supabase_user_id.up,
    down: migration_20261013_231242_add_supabase_user_id.down,
    name: '20261013_231242_add_supabase_user_id'
  },
];
