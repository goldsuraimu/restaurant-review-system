const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

module.exports = async function seedUsers(prisma) {
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();

  const users = []

  users.push({
    uuid: uuidv4(),
    username: `admin_0`,
    email: `admin_0@biz.com`,
    passwordHash: bcrypt.hashSync("12345678", 12),
    role: "admin",
  })

  // 👉 2~3 個 owner
  for (let i = 0; i < 3; i++) {
    users.push({
      uuid: uuidv4(),
      username: `owner_${i}`,
      email: `owner${i}@biz.com`,
      passwordHash: bcrypt.hashSync("12345678", 12),
      role: "owner",
    })
  }

  // 👉 25+ 一般使用者
  for (let i = 0; i < 30; i++) {
    users.push({
      uuid: uuidv4(),
      username: `user_${i}`,
      email: `user${i}@test.com`,
      passwordHash: bcrypt.hashSync("12345678", 12),
      role: "user",
    })
  }

  await prisma.user.createMany({ data: users })

};