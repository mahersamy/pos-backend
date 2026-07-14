import 'dotenv/config';
import mongoose from 'mongoose';
import argon2 from 'argon2';
import { UserSchema } from '../Modules/users/models/users.model';
import { Role } from '../common/Enums/role.enum';

async function seedAdmin() {
    await mongoose.connect(process.env.DATABASE_URI!);

    const User = mongoose.model('User', UserSchema);

    const existing = await User.findOne({ email: process.env.ADMIN_EMAIL });
    if (existing) {
        console.log('Admin already exists, skipping.');
        await mongoose.disconnect();
        return;
    }

    const password = await argon2.hash(process.env.ADMIN_PASSWORD!, {
        type: argon2.argon2id,
        memoryCost: 2 ** 16,
        timeCost: 3,
        parallelism: 2,
    });

    // Only change needed from what I gave you —
    // add gender since your new model requires it
    await User.create({
        firstName: 'super',
        lastName: 'admin',
        email: process.env.ADMIN_EMAIL,
        password,
        role: 'ADMIN',
        age: 30,
        active: 'active',
        permissions: {},       // ← flat boolean map, default empty
    });

    console.log('✅ Admin created:', process.env.ADMIN_EMAIL);
    await mongoose.disconnect();
}

seedAdmin().catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
});