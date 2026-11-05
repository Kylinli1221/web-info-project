import 'dotenv/config'
import { createInterface } from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'
import { hash } from 'argon2'
import { prisma } from '../server/utils/prisma'

class AdminInputError extends Error {}

function createHiddenPrompt() {
  return async (question: string): Promise<string> => {
    if (!input.isTTY) throw new AdminInputError('Interactive input requires a TTY')

    return await new Promise<string>((resolve, reject) => {
      const wasRaw = input.isRaw
      let value = ''
      output.write(question)

      const finish = (result: string | Error) => {
        input.removeListener('data', onData)
        input.setRawMode(wasRaw ?? false)
        input.pause()
        output.write('\n')
        if (result instanceof Error) reject(result)
        else resolve(result)
      }

      const onData = (data: Buffer) => {
        for (const char of data.toString('utf8')) {
          if (char === '\r' || char === '\n') {
            finish(value)
            return
          }
          if (char === '\u0003') {
            finish(new AdminInputError('Cancelled'))
            return
          }
          if (char === '\u007f') {
            value = value.slice(0, -1)
            continue
          }
          value += char
        }
      }

      input.setRawMode(true)
      input.resume()
      input.on('data', onData)
    })
  }
}

async function main() {
  const rl = createInterface({ input, output })
  try {
    output.write('Create or update a NEXORA administrator.\n\n')
    const email = (await rl.question('Email: ')).trim().toLowerCase()
    const name = (await rl.question('Name: ')).trim()

    const hidden = createHiddenPrompt()
    const password = await hidden('Password (min 16 chars, input hidden): ')
    const confirm = await hidden('Confirm password: ')

    if (!email || !email.includes('@')) throw new AdminInputError('A valid email is required')
    if (!name) throw new AdminInputError('Name is required')
    if (password.length < 16) throw new AdminInputError('Password must be at least 16 characters long')
    if (password !== confirm) throw new AdminInputError('Passwords do not match')

    const passwordHash = await hash(password)
    const admin = await prisma.adminUser.upsert({
      where: { email },
      create: { email, name, passwordHash },
      update: { name, passwordHash },
      select: { email: true },
    })

    output.write(`\nAdministrator created or updated: ${admin.email}\n`)
  } finally {
    rl.close()
  }
}

main()
  .catch((error: unknown) => {
    const message = error instanceof AdminInputError ? error.message : 'Administrator creation failed'
    console.error(message)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
