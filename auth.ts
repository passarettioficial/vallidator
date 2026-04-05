import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import Credentials from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Sem PrismaAdapter — gerenciamos usuários manualmente no callback
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [Google({
          clientId:     process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        })]
      : []),

    Credentials({
      name: 'credentials',
      credentials: {
        email:    { label: 'Email',    type: 'email' },
        password: { label: 'Senha',    type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email as string },
          })
          if (!user?.password) return null
          const valid = await bcrypt.compare(
            credentials.password as string,
            user.password
          )
          if (!valid) return null
          return { id: user.id, email: user.email, name: user.name, image: user.image }
        } catch { return null }
      },
    }),
  ],

  session: { strategy: 'jwt' },
  pages:   { signIn: '/login', newUser: '/welcome' },

  callbacks: {
    async signIn({ user, account }) {
      // Para OAuth (Google), cria o usuário no banco se não existir
      if (account?.provider === 'google' && user.email) {
        try {
          const exists = await prisma.user.findUnique({ where: { email: user.email } })
          if (!exists) {
            await prisma.user.create({
              data: {
                email: user.email,
                name:  user.name ?? '',
                image: user.image ?? '',
              },
            })
          }
        } catch {
          // Falha silenciosa — usuário ainda entra via JWT
        }
      }
      return true
    },

    async jwt({ token, user }) {
      if (user?.id) token.id = user.id
      // Para OAuth, busca o ID do banco
      if (!token.id && token.email) {
        try {
          const dbUser = await prisma.user.findUnique({ where: { email: token.email as string } })
          if (dbUser) token.id = dbUser.id
        } catch { /* sem DB disponível */ }
      }
      return token
    },

    async session({ session, token }) {
      if (token.id) session.user.id = token.id as string
      return session
    },
  },
})
