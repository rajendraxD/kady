import mongoose from 'mongoose'
import { mongoUri as MONGO_URI } from './config/env.js'
import User from './models/User.js'

async function seed() {
  try {
    await mongoose.connect(MONGO_URI)
    console.log('✅ Connected to MongoDB')

    // Check if admin already exists
    const existing = await User.findOne({ email: 'izhanpinjari@gmail.com' })
    if (existing) {
      console.log('ℹ️  Admin user already exists, updating password...')
      existing.password = 'Izhan'
      existing.name = 'Izhan'
      existing.mobile = '7058177607'
      await existing.save()
      console.log('✅ Admin user updated')
    } else {
      await User.create({
        name: 'Izhan',
        email: 'izhanpinjari@gmail.com',
        password: 'Izhan',
        mobile: '7058177607'
      })
      console.log('✅ Admin user created')
    }

    console.log('\n📋 Admin credentials:')
    console.log('   Email:    izhanpinjari@gmail.com')
    console.log('   Password: Izhan')
    console.log('   Name:     Izhan')
    console.log('   Mobile:   7058177607')

    await mongoose.disconnect()
    console.log('\n✨ Seed complete')
  } catch (err) {
    console.error('❌ Seed error:', err.message)
    process.exit(1)
  }
}

seed()
